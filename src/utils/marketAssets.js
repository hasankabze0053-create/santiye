export const MARKET_ASSETS_DARK = {
    // Categories
    'cat_kaba_yapi': require('../assets/market/kaba_yapi.png'),
    'cat_yalitim_cati': require('../assets/market/yalitim_cati.png'),
    'cat_kuru_yapi': require('../assets/market/kuru_yapi.png'),
    'cat_zemin_duvar': require('../assets/market/zemin_duvar.png'),
    'cat_boya_kimyasal': require('../assets/market/boya_kimyasal.png'),
    'cat_sihhi_tesisat': require('../assets/market/sihhi_tesisat.png'),
    'cat_isitma_dogalgaz': require('../assets/market/isitma_dogalgaz.png'),
    'cat_elektrik': require('../assets/market/elektrik.png'),
    'cat_hirdavat': require('../assets/market/hirdavat.png'),
    'cat_kapi_pencere': require('../assets/market/kapi_pencere.png'),
    'cat_is_guvenligi': require('../assets/market/is_guvenligi.png'),
    'cat_peyzaj_bahce': require('../assets/market/peyzaj_bahce.png'),

    // Operations / Showcase
    'showcase_concrete': require('../assets/market/concrete_showcase.png'),
    'showcase_brick': require('../assets/market/brick_showcase.png'),
    'showcase_ceramic': require('../assets/market/ceramic_showcase.png'),
};

export const MARKET_ASSETS_LIGHT = {
    // Categories
    'cat_kaba_yapi': require('../assets/market/kaba_yapi_light.png'),
    'cat_yalitim_cati': require('../assets/market/yalitim_cati_light.png'),
    'cat_kuru_yapi': require('../assets/market/kuru_yapi_light.png'),
    'cat_zemin_duvar': require('../assets/market/zemin_duvar_light.png'),
    'cat_boya_kimyasal': require('../assets/market/boya_kimyasal_light.png'),
    'cat_sihhi_tesisat': require('../assets/market/sihhi_tesisat_light.png'),
    'cat_isitma_dogalgaz': require('../assets/market/isitma_dogalgaz_light.png'),
    'cat_elektrik': require('../assets/market/elektrik_light.png'),
    'cat_hirdavat': require('../assets/market/hirdavat_light.png'),
    'cat_kapi_pencere': require('../assets/market/kapi_pencere_light.png'),
    'cat_is_guvenligi': require('../assets/market/is_guvenligi_light.png'),
    'cat_peyzaj_bahce': require('../assets/market/peyzaj_bahce_light.png'),

    // Operations / Showcase (fallback to dark versions for now if no light ones)
    'showcase_concrete': require('../assets/market/concrete_showcase.png'),
    'showcase_brick': require('../assets/market/brick_showcase.png'),
    'showcase_ceramic': require('../assets/market/ceramic_showcase.png'),
};

export const getMarketImage = (key, isDarkMode = true) => {
    const assets = isDarkMode ? MARKET_ASSETS_DARK : MARKET_ASSETS_LIGHT;
    return assets[key] || null;
};
