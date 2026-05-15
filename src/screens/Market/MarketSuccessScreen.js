import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, BackHandler, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function MarketSuccessScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const T = {
        bg: isDarkMode ? '#000000' : '#FDFBF7',
        bgSecondary: isDarkMode ? '#121212' : '#F7F1E4',
        textPrimary: isDarkMode ? '#FFFFFF' : '#111111',
        textSecondary: isDarkMode ? '#CCCCCC' : '#555555',
        card: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        border: isDarkMode ? '#333333' : '#E8E0D0',
        goldPrimary: isDarkMode ? '#D4AF37' : '#B8820F',
        goldShadow: isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 130, 15, 0.2)',
        iconCircleBg1: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 130, 15, 0.15)',
        iconCircleBg2: isDarkMode ? 'rgba(212, 175, 55, 0.05)' : 'rgba(184, 130, 15, 0.02)',
    };

    const styles = getStyles(T, isDarkMode);

    useEffect(() => {
        // Disable back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Entrance Animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();

        return () => backHandler.remove();
    }, []);

    const handleGoHome = () => {
        // Reset navigation stack and go to Home
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'MainTabs' },
                ],
            })
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <LinearGradient colors={[T.bg, T.bgSecondary]} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.content}>

                {/* Success Icon */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={[T.iconCircleBg1, T.iconCircleBg2]}
                        style={styles.iconCircle}
                    >
                        <MaterialCommunityIcons name="check-decagram" size={120} color={T.goldPrimary} />
                    </LinearGradient>
                </Animated.View>

                {/* Text Content */}
                <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
                    <Text allowFontScaling={false} style={styles.title}>TEKLİF HAVUZU{'\n'}OLUŞTURULUYOR!</Text>
                    <Text allowFontScaling={false} style={styles.subtitle}>
                        Talebiniz başarıyla alındı. Yapay zeka destekli sistemimiz, en uygun tedarikçilerden fiyatları toplayıp size sunacak.
                    </Text>

                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="clock-fast" size={24} color={T.goldPrimary} />
                        <Text allowFontScaling={false} style={styles.infoText}>Ortalama 15-30 dakika içinde teklifler panelinize düşecektir.</Text>
                    </View>
                </Animated.View>

                {/* Bottom Action */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome} activeOpacity={0.8}>
                        <Text allowFontScaling={false} style={styles.homeBtnText}>ANA SAYFAYA DÖN</Text>
                        <MaterialCommunityIcons name="home" size={20} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

export function getStyles(T, isDarkMode) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: T.bg },
        content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

        iconContainer: { marginBottom: 40 },
        iconCircle: {
            width: 200, height: 200, borderRadius: 100,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: T.goldShadow,
            shadowColor: T.goldPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: isDarkMode ? 0.4 : 0.2, shadowRadius: 20, elevation: 10
        },

        textContainer: { alignItems: 'center', width: '100%' },
        title: {
            fontSize: 28, fontWeight: '900', color: T.goldPrimary,
            textAlign: 'center', marginBottom: 16, letterSpacing: 1
        },
        subtitle: {
            fontSize: 16, color: T.textSecondary, textAlign: 'center',
            lineHeight: 24, marginBottom: 32, fontWeight: '300'
        },

        infoBox: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: T.card, padding: 16, borderRadius: 12,
            borderWidth: 1, borderColor: T.border, gap: 12,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDarkMode ? 0.2 : 0.05, shadowRadius: 8, elevation: 2
        },
        infoText: { flex: 1, color: T.textSecondary, fontSize: 13, lineHeight: 18 },

        footer: { position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: 20 },
        homeBtn: {
            backgroundColor: T.goldPrimary, padding: 18, borderRadius: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: T.goldPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkMode ? 0.3 : 0.2, shadowRadius: 10, elevation: 5
        },
        homeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
    });
}
