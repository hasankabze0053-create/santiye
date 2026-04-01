import { supabase } from '../lib/supabase';

export const TransformationService = {
    getShowcaseItems: async () => {
        try {
            const { data, error } = await supabase
                .from('transformation_showcase')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('TransformationService.getShowcaseItems error:', error);
            return [];
        }
    },

    addShowcaseItem: async (item) => {
        try {
            const { data, error } = await supabase
                .from('transformation_showcase')
                .insert([item])
                .select()
                .single();
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('TransformationService.addShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    updateShowcaseItem: async (id, data) => {
        try {
            const { error } = await supabase
                .from('transformation_showcase')
                .update(data)
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('TransformationService.updateShowcaseItem error:', error);
            return { success: false, error };
        }
    },

    deleteShowcaseItem: async (id) => {
        try {
            const { error } = await supabase
                .from('transformation_showcase')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('TransformationService.deleteShowcaseItem error:', error);
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

            // Bucket: transformation-images
            const { data, error } = await supabase.storage
                .from('transformation-images')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('transformation-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('TransformationService.uploadImage Error:', error);
            return null;
        }
    }
};
