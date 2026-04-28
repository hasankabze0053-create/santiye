// ============================================================
// SANTIYEPRO DESIGN SYSTEM — THEME TOKENS
// ============================================================

// ---- DARK MODE PALETTE (Mevcut Premium Karanlık Tema) ----
export const COLORS_DARK = {
    // Backgrounds
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    surfaceElevated: '#3A3A3C',

    // Accents
    accent: '#D4AF37',          // Metallic Gold
    accentBright: '#FDCB58',    // Bright Gold
    accentSecondary: '#C5A059', // Vega Gold

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',

    // Text
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    textGold: '#D4AF37',

    // UI Elements
    border: '#333333',
    borderLight: 'rgba(255,255,255,0.08)',
    iconBg: '#2C2C2E',
    placeholder: '#2C2C2E',
    shadow: '#000000',

    // Glass
    glassBorder: 'rgba(255, 215, 0, 0.15)',
    glassBackground: 'rgba(30, 30, 30, 0.80)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',

    // Gradients
    gradientStart: '#232526',
    gradientEnd: '#414345',

    // Tab Bar
    tabBar: '#000000',
    tabBarBorder: '#1C1C1E',
    tabBarActive: '#FDCB58',
    tabBarInactive: '#636366',
};

// ---- LIGHT MODE PALETTE (Premium İnşaat Aydınlık Teması) ----
// Felsefe: "Güneş altındaki şantiye" — Sıcak kum taşı, bronz altın, taş beyazı
export const COLORS_LIGHT = {
    // Backgrounds  (arka plan: #E8DFD0 → #FAF8F3 gradyanı)
    background: '#EDE5D5',       // Sıcak kum — ana zemin
    surface: '#FAF8F3',          // Kart yüzeyi — fildişi beyaz
    surfaceSecondary: '#F2EBE0', // İkincil kart — sıcak bej
    surfaceElevated: '#FFFDF9',  // Yüksek yüzey — neredeyse saf beyaz

    // Accents
    accent: '#8C6200',           // Koyu bronz altın — yüksek kontrast
    accentBright: '#B8820F',     // Sıcak altın parlama
    accentSecondary: '#6B4C00',  // Derin bronz

    // Status
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',

    // Text
    text: '#1C1208',             // Sıcak siyah (soğuk değil)
    textSecondary: '#4A3D28',    // Koyu kahve-gri
    textTertiary: '#8A7A65',     // Sıcak orta ton
    textGold: '#8C6200',         // Bronz altın metin

    // UI Elements
    border: '#D4C4A8',           // Sıcak kumlu kenarlık
    borderLight: 'rgba(140,98,0,0.08)',
    iconBg: '#EDE0CA',           // Kum ikonu zemin
    placeholder: '#F0E8D8',
    shadow: '#8C7050',           // Sıcak taş gölgesi

    // Glass
    glassBorder: 'rgba(140, 98, 0, 0.18)',
    glassBackground: 'rgba(255, 252, 244, 0.90)',
    glassHighlight: 'rgba(255, 255, 255, 0.65)',

    // Gradients
    gradientStart: '#EDE5D5',
    gradientEnd: '#E0D4BF',

    // Tab Bar
    tabBar: '#F8F3EA',
    tabBarBorder: '#D4C4A8',
    tabBarActive: '#8C6200',
    tabBarInactive: '#8A7A65',
};

// ---- LEGACY (Geriye dönük uyumluluk — eski COLORS importlarını kırmamak için) ----
export const COLORS = COLORS_DARK;

// ---- SPACING & TYPOGRAPHY ----
export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 20,
    xl: 24,
    xxl: 32,
    radius: 20,
    tabHeight: 80,
};

// ---- SHADOWS ----
export const SHADOWS = {
    light: {
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    warmLight: {
        shadowColor: "#A09070",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
};

// ---- LAYOUT ----
export const LAYOUT = {
    padding: 20,
    radius: 24,
};
