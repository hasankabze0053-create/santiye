import { supabase } from '../lib/supabase';

/**
 * LegalHistoryService
 * Hukuki analiz geçmişi yönetimi (Supabase CRUD)
 */
export const LegalHistoryService = {
    /**
     * Yeni bir analizi veritabanına kaydeder
     */
    async saveAnalysis(analysisData, originalText, userId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false, error: 'Oturum açılmamış' };

            const { data, error } = await supabase
                .from('legal_analyses')
                .insert([{
                    user_id: user.id,
                    kategori: analysisData.kategori,
                    case_title: analysisData.caseTitle || analysisData.kategori,
                    aciliyet_skoru: analysisData.aciliyet_skoru,
                    full_data: analysisData,
                    search_text: originalText
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('SaveAnalysis Error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Kullanıcının geçmiş analizlerini getirir
     */
    async getRecentAnalyses(limit = 5) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('legal_analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('GetRecentAnalyses Error:', error.message);
            return [];
        }
    },

    /**
     * Belirli bir analizi siler
     */
    async deleteAnalysis(id) {
        try {
            const { error } = await supabase
                .from('legal_analyses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('DeleteAnalysis Error:', error.message);
            return { success: false, error: error.message };
        }
    }
};
