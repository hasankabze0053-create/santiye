import { supabase } from '../lib/supabase';

export const AppAssetService = {
    // Fetch all highlight configs
    async getAllHighlightConfigs() {
        try {
            const { data, error } = await supabase
                .from('screen_section_config')
                .select('*')
                .like('id', 'highlight_card_%')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            // If DB is empty, return default array
            if (!data || data.length === 0) {
                const defaults = [
                    { id: 'highlight_card_urban', metadata: { type: 'urban', linkedModule: 'KentselDonusum', title: 'KENTSEL DÖNÜŞÜM', description: 'Arsa veya binanız için müteahhitlerden teklif toplayın.', buttonText: 'Teklif Al', pills: [], themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F' }, textAlignment: 'flex-start', textPositionVertical: 'center', scale: 1, translateX: 20 } },
                    { id: 'highlight_card_renovation', metadata: { type: 'renovation', linkedModule: 'Renovation', title: 'TADİLAT', description: 'Evinizin ruhunu mimari dokunuşlarla baştan yaratın.', buttonText: 'Teklif Al', pills: ['Ev', 'Dükkan', 'Ofis', 'Bakım'], themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F' }, textAlignment: 'flex-start', textPositionVertical: 'center', scale: 1, translateX: 20 } },
                    { id: 'highlight_card_market', metadata: { type: 'market', linkedModule: 'Market', title: 'MARKET', description: 'İnşaat malzemeleri ve yapı ürünlerinde ihtiyacınıza özel; tedarikçilerden rekabetçi teklifler alın.', buttonText: 'Talep Oluştur', pills: ['Beton', 'Demir', 'Seramik', 'Tesisat'], themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F' }, textAlignment: 'flex-start', textPositionVertical: 'center', scale: 1, translateX: 20 } },
                    { id: 'highlight_card_law', metadata: { type: 'law', linkedModule: 'Hukuk', title: 'HUKUK', description: 'İnşaat süreçleriniz için yapay zekâ destekli ön analiz ile doğru hukuk hizmetine ulaşın.', buttonText: 'Danışmanlık Al', pills: ['Sözleşme', 'Tapu', 'İmar', 'Uyuşmazlık'], themeColors: { title: '#FFFFFF', pillsBorder: '#B8820F', pillsText: '#B8820F' }, textAlignment: 'flex-start', textPositionVertical: 'center', scale: 1, translateX: 20 } }
                ];
                return defaults;
            }

            return data;
        } catch (error) {
            console.error('AppAssetService.getAllHighlightConfigs error:', error);
            return [];
        }
    },

    // Fetch single Highlight Card Config (kept for compatibility)
    async getHighlightConfig(type = 'urban') {
        const configId = `highlight_card_${type}`;
        try {
            const { data, error } = await supabase
                .from('screen_section_config')
                .select('*')
                .eq('id', configId)
                .maybeSingle();

            if (error) throw error;
            
            // Default fallbacks for each type
            if (!data) {
                const defaults = {
                    urban: { type: 'urban', linkedModule: 'KentselDonusum', title: 'KENTSEL DÖNÜŞÜM', description: 'Arsa veya binanız için müteahhitlerden teklif toplayın.', scale: 1, translateX: 20 },
                    renovation: { type: 'renovation', linkedModule: 'Renovation', title: 'TADİLAT', description: 'Evinizin ruhunu mimari dokunuşlarla baştan yaratın.', scale: 1, translateX: 20 },
                    market: { type: 'market', linkedModule: 'Market', title: 'MARKET', description: 'İnşaat malzemeleri ve yapı ürünlerinde ihtiyacınıza özel; tedarikçilerden rekabetçi teklifler alın.', scale: 1, translateX: 20 },
                    law: { type: 'law', linkedModule: 'Hukuk', title: 'HUKUK', description: 'İnşaat süreçleriniz için yapay zekâ destekli ön analiz ile doğru hukuk hizmetine ulaşın.', scale: 1, translateX: 20 }
                };
                return defaults[type] || defaults.urban;
            }

            return data.metadata || {};
        } catch (error) {
            console.error(`AppAssetService.getHighlightConfig (${type}) error:`, error);
            return null;
        }
    },

    // Update or Create Highlight Card Config (Admin Only)
    async updateHighlightConfig(type, updates, isNew = false, sortOrder = 1) {
        const configId = `highlight_card_${type}`;
        try {
            const { data: existing } = await supabase
                .from('screen_section_config')
                .select('*')
                .eq('id', configId)
                .maybeSingle();

            const newMetadata = { ...(existing?.metadata || {}), ...updates };

            const { error } = await supabase
                .from('screen_section_config')
                .upsert({
                    id: configId,
                    screen_id: 'HomeScreen',
                    title: `${type.toUpperCase()} Highlight Card`,
                    metadata: newMetadata,
                    is_visible: true,
                    sort_order: isNew ? sortOrder : (existing?.sort_order || 1)
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`AppAssetService.updateHighlightConfig (${type}) error:`, error);
            return { success: false, error };
        }
    },

    // Upload Image specifically for Highlight Card
    async uploadHighlightImage(uri, theme = 'dark') {
        try {
            const fetchResponse = await fetch(uri);
            const blob = await fetchResponse.blob();

            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `highlight_${theme}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('transformation-images')
                .upload(filePath, blob, { contentType: `image/${fileExt}`, upsert: true });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('transformation-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('AppAssetService.uploadHighlightImage error:', error);
            return null;
        }
    }
};
