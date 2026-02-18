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

    // 2. Müteahhitler için açık talepleri getir (Teklif VERMEDİKLERİ)
    getOpenRequestsForContractor: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 1. Get IDs of requests this contractor has already bid on
            const { data: existingBids, error: bidsError } = await supabase
                .from('construction_offers')
                .select('request_id')
                .eq('contractor_id', user.id);

            if (bidsError) throw bidsError;

            const bidRequestIds = existingBids.map(b => b.request_id);

            // 2. Fetch requests that are pending/offers_received AND NOT in the bid list
            let query = supabase
                .from('construction_requests')
                .select('*')
                .in('status', ['pending', 'offers_received'])
                .order('created_at', { ascending: false });

            if (bidRequestIds.length > 0) {
                query = query.not('id', 'in', `(${bidRequestIds.join(',')})`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ConstructionService.getOpenRequestsForContractor Error:', error);
            return [];
        }
    },

    // 2.5. Müteahhitin teklif verdiği talepleri getir
    getContractorBids: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Fetch offers with the related request details
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests(*)')
                .eq('contractor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by request_id
            const grouped = {};
            data.forEach(offer => {
                const reqId = offer.request_id;
                if (!grouped[reqId]) {
                    // Initialize with the request details from the first offer found
                    // (Since we order by created_at desc, the first one is the latest)
                    grouped[reqId] = {
                        id: reqId,
                        ...offer.request,
                        my_offers: [] // Array to store all offers for this request
                    };
                }
                grouped[reqId].my_offers.push(offer);
            });

            // Convert object back to array
            return Object.values(grouped);

        } catch (error) {
            console.error('ConstructionService.getContractorBids Error:', error);
            return [];
        }
    },

    // 2.5. Kullanıcıya gelen teklifleri getir (Gelen Kutusu İçin)
    getIncomingOffers: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Supabase join syntax: Fetch offers where the related request's user_id is the current user
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests!inner(id, district, neighborhood, city, user_id, is_campaign_active, campaign_unit_count, campaign_commercial_count), profiles:contractor_id(full_name, avatar_url)')
                .eq('request.user_id', user.id)
                .neq('status', 'draft') // Filter drafts
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ConstructionService.getIncomingOffers Error:', error);
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
