import { supabase } from '../lib/supabase';

export const ConstructionService = {
    // 1. Kullanıcının kendi oluşturduğu inşaat taleplerini getir
    getUserRequests: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('construction_requests')
                .select('*') // JOIN'i kaldırdım, şimdilik sadece talebin kendisini çekelim.
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ConstructionService.getUserRequests Error:', error);
            return [];
        }
    },

    // 2. Müteahhitler için açık talepleri getir (Müteahhit Paneli)
    // Şimdilik RLS policy'de herkese açık olmayabilir, ama tabloyu sorguluyoruz.
    // Eğer RLS sadece owner'a izin veriyorsa bu boş dönecektir.
    // Çözüm: RLS policy'de "status = pending" olanları auth.users'a açmak lazım (construction_offer_setup.sql'de belirtilmişti).
    getOpenRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('construction_requests')
                .select('*')
                .in('status', ['pending', 'offers_received'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ConstructionService.getOpenRequests Error:', error);
            return [];
        }
    },

    // 3. Talebe teklif ver (Müteahhit)
    submitOffer: async ({ requestId, offerDetails, priceEstimate }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum gerekli');

            const { error } = await supabase
                .from('construction_offers')
                .insert({
                    request_id: requestId,
                    contractor_id: user.id,
                    offer_details: offerDetails,
                    price_estimate: priceEstimate,
                    status: 'pending'
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('ConstructionService.submitOffer Error:', error);
            return { success: false, error };
        }
    },

    // 4. Talebi sil (Kullanıcı)
    deleteRequest: async (requestId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum gerekli');

            const { error } = await supabase
                .from('construction_requests')
                .delete()
                .eq('id', requestId)
                .eq('user_id', user.id); // Güvenlik: Sadece kendi talebini silebilir

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('ConstructionService.deleteRequest Error:', error);
            return { success: false, error };
        }
    }
};
