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
            const processedData = (data || []).map(item => {
                if (item.id === 'highlight_card_urban' && item.metadata) {
                    const currentPills = item.metadata.pills || [];
                    if (currentPills.length === 0 || (currentPills.length === 1 && currentPills[0] === 'Ada')) {
                        return {
                            ...item,
                            metadata: {
                                ...item.metadata,
                                pills: ['Ada Parsel Adres']
                            }
                        };
                    }
                }
                return item;
            });
            return processedData;
        } catch (error) {
            return [];
        }
    },

    // Fetch all category chips
    async getAllCategoryChips() {
        try {
            const { data, error } = await supabase
                .from('screen_section_config')
                .select('*')
                .like('id', 'category_chip_%')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                const defaults = [
                    { id: 'category_chip_urban', title: 'KENTSEL DÖNÜŞÜM', metadata: { route: 'KentselDonusum' }, is_visible: true, sort_order: 1 },
                    { id: 'category_chip_renovation', title: 'TADİLAT', metadata: { route: 'Renovation' }, is_visible: true, sort_order: 2 },
                    { id: 'category_chip_market', title: 'MARKET', metadata: { route: 'Market' }, is_visible: true, sort_order: 3 },
                    { id: 'category_chip_law', title: 'HUKUK', metadata: { route: 'Hukuk' }, is_visible: true, sort_order: 4 }
                ];
                return defaults;
            }

            return data;
        } catch (error) {
            console.error('AppAssetService.getAllCategoryChips error:', error);
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
        const configId = type.startsWith('highlight_card_') ? type : `highlight_card_${type}`;
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
            const fileExt = uri.split('.').pop() || 'jpg';
            const fileName = `highlight_${theme}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: fileName,
                type: `image/${fileExt}`
            });

            const { data, error } = await supabase.storage
                .from('construction-documents')
                .upload(filePath, formData, { contentType: `image/${fileExt}` });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('construction-documents')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('AppAssetService.uploadHighlightImage error:', error);
            return null;
        }
    },

    // Update Category Chip
    async updateCategoryChip(id, title, route, isVisible, isNew = false, sortOrder = 10) {
        try {
            const payload = {
                id: id,
                screen_id: 'HomeScreen',
                title: title,
                metadata: { route },
                is_visible: isVisible
            };
            if (isNew) payload.sort_order = sortOrder;

            const { error } = await supabase
                .from('screen_section_config')
                .upsert(payload);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`AppAssetService.updateCategoryChip error:`, error);
            return { success: false, error };
        }
    },

    // Delete Category Chip (Admin Only)
    async deleteCategoryChip(id) {
        try {
            const { error } = await supabase
                .from('screen_section_config')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`AppAssetService.deleteCategoryChip error:`, error);
            return { success: false, error };
        }
    },

    // Update Module Config (Admin Only)
    async updateModuleConfig(id, updates) {
        try {
            const { error } = await supabase
                .from('app_module_config')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`AppAssetService.updateModuleConfig error:`, error);
            return { success: false, error };
        }
    }
};
