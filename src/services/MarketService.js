import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const CACHE_KEY = 'market_categories_cache';

export const MarketService = {
    // 1. Önbellekten Hızlı Getir (İnternet yoksa bile çalışır)
    getLocalCategories: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(CACHE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Cache read error', e);
            return null;
        }
    },

    // 2. Sunucudan Güncel Getir ve Kaydet
    getRemoteCategories: async () => {
        try {
            let { data, error } = await supabase
                .from('market_categories')
                .select(`
                    *,
                    subcategories:market_subcategories(*),
                    items:market_products(*)
                `)
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (data) {
                // Alt kategorileri sırala
                data.forEach(cat => {
                    if (cat.subcategories) {
                        cat.subcategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                    }
                });

                // Önbelleğe kaydet
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
            }

            return data || [];
        } catch (error) {
            console.error('MarketService Remote Error:', error);
            throw error;
        }
    },

    // 3. Eski metodu destekle (Direkt sunucuya gider)
    getAllCategories: async () => {
        return MarketService.getRemoteCategories();
    },

    // 4. Talep Oluştur (RFQ)
    createRequest: async ({ title, items, location, delivery_time, notes, payment_method, image_url }) => {
        try {
            // 1. Kullanıcıyı al
            const { data: { user } } = await supabase.auth.getUser();

            // NOT: Eğer kullanıcı oturum açmamışsa RLS hatası verebilir.
            // Bu demo için user_id'yi opsiyonel bırakıyoruz veya auth.users'dan bir ID lazım.
            // Şimdilik oturum açık varsayıyoruz.

            // 2. Talebi Oluştur
            const { data: requestData, error: requestError } = await supabase
                .from('market_requests')
                .insert([{
                    title,
                    user_id: user ? user.id : undefined, // Anonim ise null gider (tabloda allow null ise)
                    status: 'OPEN',
                    location,
                    delivery_time,
                    notes,
                    payment_method,
                    image_url // Yeni alan
                }])
                .select()
                .single();

            if (requestError) throw requestError;

            // 3. Kalemleri Ekle
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    request_id: requestData.id,
                    product_name: item.product_name,
                    quantity: item.quantity
                }));

                const { error: itemsError } = await supabase
                    .from('market_request_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            return { success: true, id: requestData.id };
        } catch (error) {
            console.error('Create Request Error:', error);
            return { success: false, error };
        }
    },


    // 5. Açık Talepleri Getir (Satıcılar İçin)
    getOpenRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('market_requests')
                .select(`
                    *,
                    items:market_request_items(*)
                `)
                .eq('status', 'OPEN')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get Requests Error:', error);
            return [];
        }
    },

    // 6. Teklif Ver
    submitBid: async ({ request_id, price, notes, payment_terms, shipping_included, pump_fee, shipping_cost, shipping_type, delivery_date, stock_status, validity_duration, vat_included }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Format extra fields into notes to avoid schema cache errors
            let enrichedNotes = notes ? notes.trim() : '';
            
            if (vat_included !== undefined) enrichedNotes += `\nKDV: ${vat_included ? 'Dahil' : 'Hariç (+KDV)'}`;
            if (pump_fee) enrichedNotes += `\nPompa Ücreti: ${pump_fee} TL`;
            if (shipping_type) {
                const fType = shipping_type === 'buyer_pays' ? 'Alıcı Öder' : shipping_type === 'included' ? 'Dahil' : shipping_type;
                enrichedNotes += `\nNakliye Durumu: ${fType}`;
            }
            if (shipping_cost) enrichedNotes += `\n+ ${shipping_cost} TL Nakliye Ücreti`;
            if (delivery_date) enrichedNotes += `\nTeslimat/Döküm: ${delivery_date}`;
            if (stock_status) enrichedNotes += `\nStok Durumu: ${stock_status === 'immediate' ? 'Hemen Teslim' : stock_status === 'wait' ? '2-3 Gün' : stock_status}`;
            if (validity_duration) enrichedNotes += `\nTeklif Geçerlilik: ${validity_duration} Saat`;

            const { error } = await supabase
                .from('market_bids')
                .insert([{
                    request_id,
                    provider_id: user ? user.id : undefined,
                    price,
                    notes: enrichedNotes.trim(),
                    payment_terms,
                    shipping_included, // Keep for backward compatibility or UI logic
                    status: 'PENDING'
                }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Submit Bid Error:', error);
            return { success: false, error };
        }
    },

    // 6.5 Kullanıcının Kendi Verdiği Teklifleri Getir
    getMyBids: async (category = null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            let query = supabase
                .from('market_bids')
                .select(`
                    *,
                    request:market_requests(
                        *,
                        items:market_request_items(*)
                    )
                `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            // If we wanted to filter bids by category of the request, we could do it here
            // but PostgREST filter on nested foreign table requires inner join explicitly 
            // or filtering client-side. For now, we'll fetch all and filter client-side if needed 
            // or not filter at all if 'Tekliflerim' implies ALL bids across all categories.

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get My Bids Error:', error);
            return [];
        }
    },

    // 7. Kullanıcının Taleplerini Getir (Tekliflerle)
    getUserRequests: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('market_requests')
                .select(`
                    *,
                    bids:market_bids(*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('User Requests Error:', error);
            return [];
        }
    },

    // 8. Gelen Kutusu İçin Teklifleri Getir
    getIncomingOffers: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Kullanıcının taleplerine gelen teklifleri çekiyoruz
            // Not: Supabase'de iç içe filtreleme biraz tricky olabilir. 
            // Önce kullanıcının talep ID'lerini alıp sonra o ID'lere gelen teklifleri çekmek daha güvenli olabilir.

            // 1. Kullanıcının talep ID'lerini al
            const { data: userRequests } = await supabase
                .from('market_requests')
                .select('id, title')
                .eq('user_id', user.id);

            if (!userRequests || userRequests.length === 0) return [];

            const requestIds = userRequests.map(r => r.id);

            // 2. Bu taleplere gelen teklifleri al (Provider bilgisiyle)
            const { data, error } = await supabase
                .from('market_bids')
                .select(`
                    *,
                    provider:profiles(full_name, avatar_url, company_name),
                    request:market_requests(*, items:market_request_items(*))
                `)
                .in('request_id', requestIds)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Incoming Offers Error:', error);
            return [];
        }
    },

    // 9. Talebi Sil (Kullanıcı)
    deleteRequest: async (requestId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum gerekli');

            // Ana talebi sil (Database Cascade sayesinde bağlı teklifler ve kalemler otomatik silinecek)
            const { error } = await supabase
                .from('market_requests')
                .delete()
                .eq('id', requestId)
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('MarketService.deleteRequest Error:', error);
            return { success: false, error };
        }
    },

    // 10. Resim Yükle
    uploadImage: async (uri) => {
        try {
            const fetchResponse = await fetch(uri);
            const blob = await fetchResponse.blob();

            const fileExt = uri.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('market-images')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('market-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Image Upload Error:', error);
            return null;
        }
    },

    // 11. Kategori Yönetimi (Admin)
    toggleCategoryVisibility: async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('market_categories')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('toggleCategoryVisibility error:', error);
            return { success: false, error };
        }
    },

    updateCategorySortOrder: async (id, newSortOrder) => {
        try {
            const { error } = await supabase
                .from('market_categories')
                .update({ sort_order: newSortOrder })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('updateCategorySortOrder error:', error);
            return { success: false, error };
        }
    },

    // 12. Alt Kategori Yönetimi (Admin)
    toggleSubCategoryVisibility: async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('market_subcategories')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('toggleSubCategoryVisibility error:', error);
            return { success: false, error };
        }
    },

    updateSubCategorySortOrder: async (id, newSortOrder) => {
        try {
            const { error } = await supabase
                .from('market_subcategories')
                .update({ sort_order: newSortOrder })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('updateSubCategorySortOrder error:', error);
            return { success: false, error };
        }
    },

    updateCategoryName: async (id, newTitle) => {
        try {
            const { error } = await supabase
                .from('market_categories')
                .update({ title: newTitle })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('updateCategoryName error:', error);
            return { success: false, error };
        }
    },

    updateSubCategoryName: async (id, newName) => {
        try {
            const { error } = await supabase
                .from('market_subcategories')
                .update({ name: newName })
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('updateSubCategoryName error:', error);
            return { success: false, error };
        }
    },

    getShowcaseItems: async () => {
        try {
            const { data, error } = await supabase
                .from('market_showcase')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('getShowcaseItems error:', error);
            return [];
        }
    },

    addShowcaseItem: async (item) => {
        try {
            const { data, error } = await supabase
                .from('market_showcase')
                .insert([item])
                .select()
                .single();
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('addShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    updateShowcaseItem: async (id, data) => {
        try {
            const { error } = await supabase
                .from('market_showcase')
                .update(data)
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('updateShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    deleteShowcaseItem: async (id) => {
        try {
            const { error } = await supabase
                .from('market_showcase')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('deleteShowcaseItem error:', error);
            return { success: false, error };
        }
    }
};
