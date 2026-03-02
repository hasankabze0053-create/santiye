import { supabase } from '../lib/supabase';

export const uploadImageToSupabase = async (uri) => {
    try {
        const ext = uri.substring(uri.lastIndexOf('.') + 1);
        const fileName = `renovation_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const formData = new FormData();
        formData.append('file', {
            uri: uri,
            name: fileName,
            type: `image/${ext}`
        });

        const { data, error } = await supabase.storage
            .from('construction-documents')
            .upload(fileName, formData, { contentType: `image/${ext}` });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('construction-documents')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};
