import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function GlassCard({ children, style, onPress, variant = 'dark' }) {
    const Container = onPress ? TouchableOpacity : View;

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

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',

        // Deep Shadow for "Floating" effect
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
        height: 2, // Fine highlight line
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
        borderColor: 'rgba(255, 215, 0, 0.1)', // Very subtle gold outline
    }
});
