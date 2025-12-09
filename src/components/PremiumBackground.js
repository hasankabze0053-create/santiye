import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PremiumBackground({ children }) {
    return (
        <View style={styles.container}>
            {/* Base Anthracite Background */}
            <LinearGradient
                colors={['#0F0F0F', '#181818', '#0A0A0A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Architectural Spot Light (Bronze/Gold Hint) */}
            <LinearGradient
                colors={['rgba(191, 149, 63, 0.04)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.7, y: 0.7 }}
                style={[StyleSheet.absoluteFill, { width, height }]}
            />

            {/* Content Layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    content: {
        flex: 1,
    }
});
