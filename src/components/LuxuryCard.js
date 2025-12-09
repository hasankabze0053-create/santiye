import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LuxuryCard({ children, style, onPress, variant = 'standard' }) {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.wrapper, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* 1. Border Gradient (Brushed Metal Effect) - High Contrast */}
            <LinearGradient
                colors={['#FFD700', '#FDB931', '#FFFFE0', '#D4AF37', '#C5A028']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.borderGradient}
            >
                {/* 2. Inner Content Surface */}
                <View style={[styles.innerSurface, variant === 'dark' && styles.darkSurface]}>

                    {/* 3. Subtle Inner Gradient for Embossed Depth */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0.03)', 'transparent', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Content */}
                    <View style={styles.content}>
                        {children}
                    </View>
                </View>
            </LinearGradient>
        </Container>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 18,
        // Deepest shadow for architectural 'floating' feel
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 16,
    },
    borderGradient: {
        padding: 1.5, // Thickness of the gold border
        borderRadius: 18,
    },
    innerSurface: {
        flex: 1,
        backgroundColor: '#161618', // Standard Anthracite Surface
        borderRadius: 17, // Slightly less than wrapper to fit inside padding
        overflow: 'hidden',
    },
    darkSurface: {
        backgroundColor: '#0F0F0F', // Darker Matte Surface
    },
    content: {
        padding: 18,
        zIndex: 10,
    }
});
