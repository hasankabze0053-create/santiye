import { supabase } from '../lib/supabase';

export const RenovationService = {
    getShowcaseItems: async () => {
        try {
            const { data, error } = await supabase
                .from('renovation_showcase')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('RenovationService.getShowcaseItems error:', error);
            return [];
        }
    },

    addShowcaseItem: async (item) => {
        try {
            const { data, error } = await supabase
                .from('renovation_showcase')
                .insert([item])
                .select()
                .single();
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('RenovationService.addShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    updateShowcaseItem: async (id, data) => {
        try {
            const { error } = await supabase
                .from('renovation_showcase')
                .update(data)
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('RenovationService.updateShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    deleteShowcaseItem: async (id) => {
        try {
            const { error } = await supabase
                .from('renovation_showcase')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('RenovationService.deleteShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    uploadImage: async (uri) => {
        try {
            const fetchResponse = await fetch(uri);
            const blob = await fetchResponse.blob();

            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Bucket: renovation-images
            const { data, error } = await supabase.storage
                .from('renovation-images')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('renovation-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('RenovationService.uploadImage Error:', error);
            return null;
        }
    }
};
