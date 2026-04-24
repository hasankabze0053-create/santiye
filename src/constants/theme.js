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
// Felsefe: "Güneş altındaki şantiye" — Sıcak beton, doğal taş ve altın aksan
export const COLORS_LIGHT = {
    // Backgrounds
    background: '#F4F1EB',       // Sıcak beton beyazı (ham beton hissi)
    surface: '#FFFFFF',          // Kart yüzeyi (parlak)
    surfaceSecondary: '#EDE8DC', // İkincil yüzey (krem)
    surfaceElevated: '#F9F7F2',  // Yükseltilmiş yüzey

    // Accents (Aydınlıkta altını daha koyu tutuyoruz — kontrast için)
    accent: '#9A6F00',           // Koyu Altın (aydınlık üzerinde okunabilir)
    accentBright: '#C8930A',     // Parlak Altın (vurgu)
    accentSecondary: '#7A5500',  // Bronz

    // Status
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',

    // Text
    text: '#1A1A1A',             // Neredeyse siyah (okunabilirlik)
    textSecondary: '#5C5C5C',    // Orta gri
    textTertiary: '#8A8A8A',     // Açık gri
    textGold: '#9A6F00',         // Koyu altın metin

    // UI Elements
    border: '#D6CEBC',           // Sıcak gri/bej kenarlık
    borderLight: 'rgba(0,0,0,0.06)',
    iconBg: '#EDE8DC',           // Krem ikon arka planı
    placeholder: '#F0ECE4',
    shadow: '#A09070',           // Sıcak kahverengi gölge (beton tonu)

    // Glass (aydınlık glass efekti)
    glassBorder: 'rgba(154, 111, 0, 0.2)',
    glassBackground: 'rgba(255, 252, 245, 0.85)',
    glassHighlight: 'rgba(255, 255, 255, 0.6)',

    // Gradients
    gradientStart: '#F4F1EB',
    gradientEnd: '#E8E1D3',

    // Tab Bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5DFD3',
    tabBarActive: '#9A6F00',
    tabBarInactive: '#8A8A8A',
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
