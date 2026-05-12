import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ConstructionSuccessScreen({ route }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const adNo = route.params?.ad_no;

    const T = {
        gold: isDarkMode ? '#FFD700' : '#8C6200',
        goldGlow: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(140,98,0,0.15)',
        goldShadow: isDarkMode ? 'rgba(255, 215, 0, 0.5)' : 'rgba(140,98,0, 0.2)',
        surface: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FAF8F3',
        border: isDarkMode ? 'rgba(255,255,255,0.1)' : '#D4C4A8',
        text: isDarkMode ? '#ccc' : '#4A3D28',
        badgeBg: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(140,98,0,0.08)',
        badgeBorder: isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(140,98,0,0.2)',
        badgeValue: isDarkMode ? '#FFF' : '#1C1208',
        btnStart: isDarkMode ? '#D6A023' : '#8C6200',
        btnEnd: isDarkMode ? '#D6A023' : '#B8820F',
        btnText: isDarkMode ? '#000' : '#FFF',
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    {/* Success Icon Animation */}
                    <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.iconContainer}>
                        <LinearGradient
                            colors={[T.goldGlow, 'rgba(255, 215, 0, 0)']}
                            style={styles.glow}
                        />
                        <MaterialCommunityIcons name="check-decagram" size={120} color={T.gold} />
                    </Animated.View>

                    {/* Main Title */}
                    <Animated.Text entering={FadeInDown.delay(500).duration(800)} style={[styles.title, { color: T.gold, textShadowColor: T.goldShadow }]}>
                        BAŞARILI!
                    </Animated.Text>

                    {/* Description Text */}
                    <Animated.View entering={FadeInDown.delay(800).duration(800)} style={[styles.messageContainer, { backgroundColor: T.surface, borderColor: T.border }]}>
                        {adNo && (
                            <View style={[styles.adNoBadge, { backgroundColor: T.badgeBg, borderColor: T.badgeBorder }]}>
                                <Text allowFontScaling={false} style={[styles.adNoLabel, { color: T.gold }]}>İLAN NO</Text>
                                <Text allowFontScaling={false} style={[styles.adNoValue, { color: T.badgeValue }]}>{adNo.toString().padStart(7, '0')}</Text>
                            </View>
                        )}
                        <Text allowFontScaling={false} style={[styles.messageText, { color: T.text }]}>
                            Projeniz <Text allowFontScaling={false} style={[styles.highlight, { color: T.gold }]}>Seçilmiş Müteahhitlere</Text> başarıyla sunulmuştur.
                        </Text>
                        <View style={[styles.divider, { backgroundColor: T.border }]} />
                        <Text allowFontScaling={false} style={[styles.subMessageText, { color: T.text }]}>
                            En kısa sürede <Text allowFontScaling={false} style={[styles.highlight, { color: T.gold }]}>Teklif Havuzunuz</Text> oluşturulacaktır.
                        </Text>
                    </Animated.View>

                    {/* Return Button */}
                    <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.homeButton, { shadowColor: T.gold }]}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Ana Sayfa' })}
                        >
                            <LinearGradient
                                colors={[T.btnStart, T.btnEnd]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.homeButtonGradient}
                            >
                                <Ionicons name="home" size={20} color={T.btnText} style={{ marginRight: 8 }} />
                                <Text allowFontScaling={false} style={[styles.homeButtonText, { color: T.btnText }]}>ANA SAYFAYA DÖN</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        paddingHorizontal: 30,
        alignItems: 'center',
        marginTop: -50, // Slight visual centering adjustment
    },
    iconContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
    },
    glow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        top: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 24,
        textAlign: 'center',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    messageContainer: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    subMessageText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    highlight: {
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '40%',
        marginVertical: 16,
    },
    buttonContainer: {
        width: '100%',
    },
    homeButton: {
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    homeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    adNoBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 20,
    },
    adNoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    adNoValue: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: 2,
        letterSpacing: 2,
    },
});
