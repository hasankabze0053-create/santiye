export const COLORS = {
    // "Cyber/Premium" Theme: Deep Black, Rich Gold, Carbon Fiber Gray

    // Backgrounds
    primary: '#1A1A1A',      // Dark Concrete Base
    secondary: '#252525',    // Lighter Concrete (Cards)
    surface: '#303030',      // Elevated

    // Accents
    accent: '#FFD700',           // Pure Gold (Main Action)
    accentSecondary: '#FDB931',  // Warm Gold
    warning: '#F59E0B',          // Amber
    success: '#10B981',          // Emerald
    danger: '#EF4444',           // Red
    neon: '#CCFF00',             // Neon Green (High Visibility)

    // Text
    text: '#E0E0E0',             // Off-White (Better on gray)
    textSecondary: '#A0A0A0',    // Light Gray
    textGold: '#FFD700',         // Gold Text
    textNeon: '#CCFF00',         // Neon Text

    // Gradients (Concrete / Stone)
    gradientStart: '#232526', // Titanium
    gradientEnd: '#414345',   // Gunmetal
    goldGradientStart: '#FFD700',
    goldGradientEnd: '#FDB931',
    amberGradientStart: '#FFBF00', // Amber Start
    amberGradientEnd: '#FF9100',   // Amber End (Deep Orange-ish)

    // Glass effect colors
    glassBorder: 'rgba(255, 215, 0, 0.15)',
    glassBackground: 'rgba(30, 30, 30, 0.80)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',
};

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
    }
};

export const LAYOUT = {
    padding: 20,
    radius: 24,
};
