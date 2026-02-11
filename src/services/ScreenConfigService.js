import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const ScreenConfigService = {
    // Fetch configuration for a specific screen with Caching (Stale-while-revalidate)
    async fetchConfig(screenId) {
        const CACHE_KEY = `screen_config_${screenId}`;

        try {
            // 1. Try to get from Cache immediately for instant load
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            let cachedData = null;

            if (cached) {
                cachedData = JSON.parse(cached);
            }

            // 2. Fetch fresh data from Supabase
            const { data, error } = await supabase
                .from('screen_section_config')
                .select('*')
                .eq('screen_id', screenId)
                .order('sort_order', { ascending: true });

            if (error) {
                console.warn('ScreenConfigService: Failed to fetch fresh config, using cache or defaults.', error.message);
                return cachedData; // Return cache if network fails
            }

            if (data && data.length > 0) {
                // 3. Update Cache with fresh data
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
                return data;
            }

            return cachedData; // Return cache if DB is empty
        } catch (e) {
            console.warn('ScreenConfigService: Exception during fetch, using defaults.', e);
            return null;
        }
    },

    // Update specific section configuration (Admin Only)
    async updateSectionConfig(id, updates) {
        const { data, error } = await supabase
            .from('screen_section_config')
            .update(updates) // e.g. { sort_order: 1, is_visible: false }
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Bulk update approach if needed strictly for reordering
    async updateOrder(screenId, reorderedItems) {
        // reorderedItems: [{ id: 'urban_expert_qa', sort_order: 10 }, ...]

        // Upsert is efficient for bulk updates if we have the IDs
        const { data, error } = await supabase
            .from('screen_section_config')
            .upsert(reorderedItems.map(item => ({
                id: item.id,
                screen_id: screenId, // Ensure screen_id is included for upsert constraint
                sort_order: item.sort_order,
                title: item.title, // Required if upsert inserts, but here we update. 
                // NOTE: Upsert requires all non-null columns if inserting. 
                // For updating existing rows, separate updates might be safer or ensuring we have all data.
            })));

        // Better approach for just order updates to avoid overwriting titles accidentally if not passed:
        // Use Promise.all for independent updates (safe for small lists like 3-5 sections)
        /*
        const updates = reorderedItems.map(item => 
            this.updateSectionConfig(item.id, { sort_order: item.sort_order })
        );
        await Promise.all(updates);
        */

        // For now, let's stick to updateSectionConfig for individual changes or a loop in the UI. 
        // We will implement bulk update if UI sends a full list.

        for (const item of reorderedItems) {
            await this.updateSectionConfig(item.id, { sort_order: item.sort_order });
        }
    }
};
