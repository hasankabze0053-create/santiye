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
    submitBid: async ({ request_id, price, notes, payment_terms, shipping_included, pump_fee, shipping_cost, shipping_type, delivery_date, stock_status, validity_duration }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            // Provider ID check needed in real app, strictly assuming user.id is provider.id for now

            const { error } = await supabase
                .from('market_bids')
                .insert([{
                    request_id,
                    provider_id: user ? user.id : undefined,
                    price,
                    notes,
                    payment_terms,
                    shipping_included, // Keep for backward compatibility or UI logic
                    // New Fields
                    pump_fee,
                    shipping_cost,
                    shipping_type,
                    delivery_date,
                    stock_status,
                    validity_duration,
                    status: 'PENDING'
                }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Submit Bid Error:', error);
            return { success: false, error };
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
                    request:market_requests(title)
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

    // 9. Resim Yükle
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

    getShowcaseItems: async () => {
        // Şu anlık statik, istenirse bunu da 'market_showcase' tablosuna taşıyabiliriz.
        return [
            { id: '1', title: '', subtitle: '', image_ref: 'showcase_concrete', tag: 'EN İYİ FİYAT', is_local: true },
            { id: '2', title: 'TUĞLA KAMPANYASI', subtitle: 'Yüksek kaliteli yığma tuğla toplu alımda avantaj', image_url: 'https://images.unsplash.com/photo-1588011930968-748435e16ee9?q=80&w=800', tag: 'KARGO BEDAVA', is_local: false },
            { id: '3', title: 'YALITIM ÇÖZÜMLERİ', subtitle: 'Kışa hazırlık için mantolama paketlerinde fırsat', image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800', tag: 'YENİ SEZON', is_local: false },
        ];
    }
};
