export const COLORS = {
    // Red/Black/White "Power" Theme
    primary: '#000000',   // Pure Black background
    secondary: '#1A1A1A', // Dark Gray for cards
    accent: '#DC2626',    // Bold Red (Main Action)
    accentGradientStart: '#DC2626', // Red
    accentGradientEnd: '#991B1B',   // Darker Red

    white: '#FFFFFF',
    text: '#FFFFFF',      // Pure White text
    textSecondary: '#A3A3A3', // Light Gray

    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Glass effect colors
    glassBorder: 'rgba(220, 38, 38, 0.3)', // Red tinted border
    glassBackground: 'rgba(20, 20, 20, 0.8)',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 20,
    extraLarge: 28,
    xxl: 34,
    radius: 16,
};

export const SHADOWS = {
    light: {
        shadowColor: "#DC2626", // Red shadow hint
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    glow: {
        shadowColor: "#DC2626", // Red glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
    }
};
