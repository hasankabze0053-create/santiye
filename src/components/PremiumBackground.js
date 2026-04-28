import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function PremiumBackground({ children }) {
    const { isDarkMode } = useTheme();

    if (!isDarkMode) {
        // ── LIGHT MODE ──────────────────────────────────────────────
        // Palette: "Güneş altındaki şantiye" — sıcak taş + kum + fildişi
        // #E8DFD0 → #F2EDE3 → #FAF7F2  (koyu kumtaşından açık fildişiye)
        return (
            <View style={styles.container_light}>

                {/* 1. Ana zemin: dikey sıcak kum gradyanı */}
                <LinearGradient
                    colors={['#E8DFD0', '#EFE9DC', '#F5F1E9', '#FAF8F3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* 2. Çapraz sıcak altın tarama — tekstür hissi */}
                <LinearGradient
                    colors={['rgba(180, 130, 40, 0.07)', 'transparent', 'rgba(180, 130, 40, 0.04)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* 3. Üst vignette — derinlik ve başlık ayrımı */}
                <LinearGradient
                    colors={['rgba(160, 110, 20, 0.06)', 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.25 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.content}>{children}</View>
            </View>
        );
    }

    // ── DARK MODE (değişmedi) ──────────────────────────────────────
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F0F0F', '#181818', '#0A0A0A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <LinearGradient
                colors={['rgba(191, 149, 63, 0.04)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.7, y: 0.7 }}
                style={[StyleSheet.absoluteFill, { width, height }]}
            />
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    container_light: {
        flex: 1,
        backgroundColor: '#E8DFD0',
    },
    content: {
        flex: 1,
    },
});
