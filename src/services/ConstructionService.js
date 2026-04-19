import { supabase } from '../lib/supabase';

export const ConstructionService = {
    // 1. Kullanıcının kendi oluşturduğu inşaat taleplerini getir
    getUserRequests: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('construction_requests')
                .select('*, bids:construction_offers(*)')
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
                .neq('offer_type', 'anahtar_teslim_tadilat') // EXCLUDE TADILAT
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

            // Fetch offers with the related request details, filtering for requests that are NOT tadilat
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests(*)')
                .eq('contractor_id', user.id)
                .neq('request.offer_type', 'anahtar_teslim_tadilat') // EXCLUDE TADILAT
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
                .select('*, request:construction_requests!inner(id, district, neighborhood, city, user_id, is_campaign_active, campaign_unit_count, campaign_commercial_count, offer_type, description), profiles:contractor_id(full_name, avatar_url, company_name)')
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

    // 4. Mimarlar için açık talepleri getir (Teklif VERMEDİKLERİ)
    getOpenRequestsForArchitect: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 1. Get IDs of requests this architect has already bid on
            const { data: existingBids, error: bidsError } = await supabase
                .from('construction_offers')
                .select('request_id')
                .eq('contractor_id', user.id);

            if (bidsError) throw bidsError;

            const bidRequestIds = existingBids.map(b => b.request_id);

            // 2. Fetch tadilat requests from construction_requests
            let query1 = supabase
                .from('construction_requests')
                .select('*')
                .eq('offer_type', 'anahtar_teslim_tadilat') // ONLY TADILAT
                .in('status', ['pending', 'offers_received'])
                .order('created_at', { ascending: false });

            if (bidRequestIds.length > 0) {
                query1 = query1.not('id', 'in', `(${bidRequestIds.join(',')})`);
            }

            // 3. Fetch from elevator_requests
            // Since there is no bidding process yet for elevator_requests, just fetch those assigned to the provider
            let query2 = supabase
                .from('elevator_requests')
                .select('*')
                .in('status', ['pending', 'offers_received'])
                .order('created_at', { ascending: false });

            const [res1, res2] = await Promise.all([query1, query2]);

            if (res1.error) throw res1.error;
            if (res2.error) throw res2.error;

            const tadilatData = (res1.data || []).map(r => ({...r, _tableName: 'construction_requests'}));
            const elevatorData = (res2.data || []).map(r => ({...r, _tableName: 'elevator_requests'}));

            const merged = [...tadilatData, ...elevatorData];
            merged.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

            return merged;
        } catch (error) {
            console.error('ConstructionService.getOpenRequestsForArchitect Error:', error);
            return [];
        }
    },

    // 5. Mimarın teklif verdiği talepleri getir
    getArchitectBids: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests!inner(*)')
                .eq('contractor_id', user.id)
                .eq('request.offer_type', 'anahtar_teslim_tadilat') // ONLY TADILAT
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by request_id
            const grouped = {};
            data.forEach(offer => {
                const reqId = offer.request_id;
                if (!grouped[reqId]) {
                    grouped[reqId] = {
                        id: reqId,
                        ...offer.request,
                        my_offers: []
                    };
                }
                grouped[reqId].my_offers.push(offer);
            });

            return Object.values(grouped);
        } catch (error) {
            console.error('ConstructionService.getArchitectBids Error:', error);
            return [];
        }
    },

    // 6. Talebi sil (Kullanıcı)
    deleteRequest: async (requestId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum gerekli');

            // Ana talebi sil (Database Cascade sayesinde bağlı teklifler otomatik silinecek)
            const { error } = await supabase
                .from('construction_requests')
                .delete()
                .eq('id', requestId)
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('ConstructionService.deleteRequest Error:', error);
            return { success: false, error };
        }
    }
};
