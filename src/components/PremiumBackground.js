import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function PremiumBackground({ children }) {
    const { isDarkMode } = useTheme();

    if (!isDarkMode) {
        // LIGHT MODE: Sıcak beton/krem arka plan
        return (
            <View style={[styles.container, { backgroundColor: '#F4F1EB' }]}>
                <LinearGradient
                    colors={['#F4F1EB', '#EDE8DC', '#F4F1EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                {/* Subtle warm gold accent */}
                <LinearGradient
                    colors={['rgba(154, 111, 0, 0.04)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={[StyleSheet.absoluteFill, { width, height }]}
                />
                <View style={styles.content}>
                    {children}
                </View>
            </View>
        );
    }

    // DARK MODE: Mevcut premium karanlık arka plan (hiç değişmedi)
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
