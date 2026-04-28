import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function GlassCard({ children, style, onPress }) {
    const { isDarkMode } = useTheme();
    const Container = onPress ? TouchableOpacity : View;

    if (!isDarkMode) {
        // ---- LIGHT MODE: Sıcak beyaz kart, bej kenarlık, yumuşak gölge ----
        return (
            <Container
                style={[stylesLight.wrapper, style]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {/* Warm white surface */}
                <LinearGradient
                    colors={['#FAF8F3', '#F4EFE5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Warm bronze top highlight */}
                <LinearGradient
                    colors={['rgba(140, 98, 0, 0.10)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={stylesLight.rimLight}
                />
                <View style={styles.content}>
                    {children}
                </View>
                {/* Light border stroke */}
                <View style={stylesLight.borderStroke} />
            </Container>
        );
    }

    // ---- DARK MODE: Orijinal premium karanlık kart (değişmedi) ----
    return (
        <Container
            style={[styles.wrapper, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* 1. Main Surface Gradient (Simulates Matte Material) */}
            <LinearGradient
                colors={['#2A2A2A', '#1C1C1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 2. Top Rim Light (Simulates Light hitting top edge) */}
            <LinearGradient
                colors={['rgba(255, 215, 0, 0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={styles.rimLight}
            />

            {/* 3. Content */}
            <View style={styles.content}>
                {children}
            </View>

            {/* 4. Gold Border Stroke */}
            <View style={styles.borderStroke} />
        </Container>
    );
}

// Dark mode styles (unchanged)
const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 12,
    },
    rimLight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        opacity: 0.8,
    },
    content: {
        padding: 16,
        zIndex: 10,
    },
    borderStroke: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
    }
});

// Light mode styles
const stylesLight = StyleSheet.create({
    wrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        // Warm stone shadow
        shadowColor: "#8C7050",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    rimLight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        opacity: 1,
    },
    borderStroke: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(140, 98, 0, 0.12)',
    }
});
