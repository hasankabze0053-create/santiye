import { supabase } from '../lib/supabase';

export const ElevatorService = {
    /**
     * Asansör arıza/bakım talebi oluştur
     */
    createRequest: async ({ city, district, phone, faultType = 'Asansör Arıza Bakım' }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                user_id: user?.id || null,
                city,
                district,
                phone,
                fault_type: faultType,
                status: 'pending',
            };

            const { data, error } = await supabase
                .from('elevator_requests')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('ElevatorService.createRequest error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Kullanıcının kendi taleplerini getir
     */
    getUserRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('elevator_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ElevatorService.getUserRequests error:', error);
            return [];
        }
    },

    /**
     * Talebi sil
     */
    deleteRequest: async (requestId) => {
        try {
            const { error } = await supabase
                .from('elevator_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('ElevatorService.deleteRequest error:', error);
            return { success: false, error: error.message };
        }
    },
};
