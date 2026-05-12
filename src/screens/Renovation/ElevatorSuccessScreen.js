import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { useTheme } from '../../context/ThemeContext';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F7E5A8';
const GOLD_DARK = '#8C6A30';

const BTN_GRADIENT = [GOLD_DARK, GOLD, GOLD_LIGHT, GOLD, GOLD_DARK];

export default function ElevatorSuccessScreen({ navigation, route }) {
    const { city, district } = route?.params || {};
    const { isDarkMode } = useTheme();

    const T = {
        text: isDarkMode ? '#FFF' : '#1C1208',
        textSub: isDarkMode ? '#BBB' : '#4A3D28',
        cardBg: isDarkMode ? '#111' : 'rgba(255,255,255,0.05)',
        cardBorder: isDarkMode ? 'rgba(212,175,55,0.2)' : '#D4C4A8',
        divider: isDarkMode ? '#1E1E1E' : '#D4C4A8',
        tagText: isDarkMode ? '#000' : '#FFFFFF',
        tagBg: isDarkMode ? GOLD : '#8C6200',
        glow: isDarkMode ? GOLD : '#8C6200',
        btnText: isDarkMode ? '#1a1a1a' : '#FFFFFF',
        btnStart: isDarkMode ? GOLD_DARK : '#8C6200',
        btnEnd: isDarkMode ? GOLD_DARK : '#B8820F',
        iconColor: isDarkMode ? GOLD : '#8C6200',
    };

    // Animated scale for the icon
    const scaleAnim = new Animated.Value(0.5);
    const opacityAnim = new Animated.Value(0);
    const glowAnim = new Animated.Value(0.15);

    // Kick off animations (use useEffect pattern via ref trick for function component)
    Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 0.35, duration: 1200, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.12, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    });

    return (
        <PremiumBackground>
            {/* Ambient glow */}
            <Animated.View style={[styles.ambientGlow, { opacity: glowAnim, backgroundColor: T.glow }]} />

            <SafeAreaView style={styles.content}>
                {/* Icon */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                    <View style={[styles.glow, { backgroundColor: T.glow, shadowColor: T.glow }]} />
                    <View style={[styles.iconRing, { borderColor: isDarkMode ? 'rgba(212,175,55,0.3)' : 'rgba(140,98,0,0.3)', backgroundColor: isDarkMode ? 'rgba(212,175,55,0.08)' : 'rgba(140,98,0,0.08)' }]}>
                        <MaterialCommunityIcons name="check-decagram" size={96} color={T.iconColor} />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
                    <View style={[styles.tagRow, { backgroundColor: T.tagBg }]}>
                        <MaterialCommunityIcons name="elevator-passenger" size={14} color={T.tagText} />
                        <Text allowFontScaling={false} style={[styles.tag, { color: T.tagText }]}>ASANSÖR ARIZA BAKIM</Text>
                    </View>

                    <Text allowFontScaling={false} style={[styles.title, { color: T.text }]}>Talebiniz Alındı!</Text>

                    <Text allowFontScaling={false} style={[styles.subtitle, { color: T.textSub }]}>
                        <Text style={{ color: T.iconColor, fontWeight: '700' }}>{city}{district ? ` / ${district}` : ''}</Text>
                        {' '}bölgenizdeki sertifikalı asansör bakım uzmanlarımıza talebiniz başarıyla iletildi.
                    </Text>

                    <View style={[styles.infoCard, { backgroundColor: T.cardBg, borderColor: T.cardBorder }]}>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="clock-fast" size={18} color={T.iconColor} />
                            <Text allowFontScaling={false} style={[styles.infoText, { color: T.textSub }]}>Ortalama yanıt süresi: <Text style={{ color: T.iconColor, fontWeight: '700' }}>30 dakika</Text></Text>
                        </View>
                        <View style={[styles.infoDivider, { backgroundColor: T.divider }]} />
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="phone-check" size={18} color={T.iconColor} />
                            <Text allowFontScaling={false} style={[styles.infoText, { color: T.textSub }]}>Uzmanımız kayıtlı numaranızı arayacaktır.</Text>
                        </View>
                        <View style={[styles.infoDivider, { backgroundColor: T.divider }]} />
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="shield-check" size={18} color={T.iconColor} />
                            <Text allowFontScaling={false} style={[styles.infoText, { color: T.textSub }]}>Tüm teknisyenlerimiz sertifikalı ve sigortalıdır.</Text>
                        </View>
                    </View>
                </Animated.View>
            </SafeAreaView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { shadowColor: T.iconColor }]}
                    onPress={() => navigation.navigate('MainTabs')}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[T.btnStart, T.btnEnd]}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                        style={styles.gradientButton}
                    >
                        <Ionicons name="home" size={20} color={T.btnText} style={{ marginRight: 10 }} />
                        <Text allowFontScaling={false} style={[styles.buttonText, { color: T.btnText }]}>ANA SAYFAYA DÖN</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({

    ambientGlow: {
        position: 'absolute',
        top: '20%',
        alignSelf: 'center',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: GOLD,
        opacity: 0.15,
        transform: [{ scaleY: 0.5 }],
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },

    // Icon
    iconContainer: { marginBottom: 28, alignItems: 'center', justifyContent: 'center' },
    glow: {
        position: 'absolute',
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: GOLD, opacity: 0.12,
        shadowColor: GOLD, shadowRadius: 40, shadowOpacity: 1, elevation: 30,
    },
    iconRing: {
        width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderWidth: 2, borderColor: 'rgba(212,175,55,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Tag
    tagRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: GOLD, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 5,
        marginBottom: 16,
    },
    tag: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },

    // Text
    title: { fontSize: 30, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 14, letterSpacing: 0.5 },
    subtitle: { fontSize: 15, color: '#BBB', textAlign: 'center', lineHeight: 24, marginBottom: 24 },

    // Info Card
    infoCard: {
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
        padding: 16,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    infoText: { color: '#AAA', fontSize: 13, flex: 1, lineHeight: 18 },
    infoDivider: { height: 1, backgroundColor: '#1E1E1E', marginVertical: 2 },

    // Footer
    footer: { paddingHorizontal: 24, paddingBottom: 40 },
    button: { borderRadius: 30, overflow: 'hidden', elevation: 8, shadowColor: GOLD, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    gradientButton: { height: 58, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1.2 },
});
