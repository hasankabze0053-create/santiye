import { supabase } from '../lib/supabase';

export const LogisticsService = {
    // 1. Nakliye Talebi Oluştur
    createRequest: async ({ from, to, load_type, weight, vehicle_type, phone, notes }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('transport_requests')
                .insert([{
                    user_id: user ? user.id : undefined,
                    from_location: from,
                    to_location: to,
                    load_type,
                    weight,
                    vehicle_type,
                    load_details: notes, // notes mapped to load_details
                    contact_phone: phone, // Assuming column exists or I add it
                    status: 'OPEN'
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, id: data.id };
        } catch (error) {
            console.error('Logistics Create Error:', error);
            return { success: false, error };
        }
    },

    // 2. Kullanıcının Talepleri (Tekliflerle)
    getUserRequests: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('transport_requests')
                .select(`
                    *,
                    bids:transport_bids(*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Logistics User Req Error:', error);
            return [];
        }
    }
};
