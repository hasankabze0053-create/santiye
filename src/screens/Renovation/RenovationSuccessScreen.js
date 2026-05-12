import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { useTheme } from '../../context/ThemeContext';

const THEME = {
    goldPrimary: '#D4AF37',
    goldHighlight: '#F7E5A8',
};

const GOLD_DARK = '#8C6A30';
const GOLD = '#D4AF37';

export default function RenovationSuccessScreen({ navigation, route }) {
    const { isDarkMode } = useTheme();

    const T = {
        text: isDarkMode ? '#FFF' : '#1C1208',
        textSub: isDarkMode ? '#CCC' : '#4A3D28',
        textInfo: isDarkMode ? '#888' : '#665A48',
        glow: isDarkMode ? THEME.goldPrimary : '#8C6200',
        btnText: isDarkMode ? '#1a1a1a' : '#FFFFFF',
        btnStart: isDarkMode ? GOLD_DARK : '#8C6200',
        btnEnd: isDarkMode ? GOLD_DARK : '#B8820F',
        iconColor: isDarkMode ? THEME.goldPrimary : '#8C6200',
    };

    const category = route?.params?.category || '';
    const isGarage = category === 'Garaj & Kapı Sistemleri';
    
    const expertText = isGarage ? 'Otomatik Kapı & Garaj Sistemleri' : 'Mimarlık & Tadilat';
    const targetText = isGarage ? 'uzmanlarına' : 'ofislerine';
    const contactText = isGarage ? 'Uzman firmalar talebinizi' : 'Ofisler projeni';

    return (
        <PremiumBackground>
            <SafeAreaView style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={[styles.glow, { backgroundColor: T.glow, shadowColor: T.glow }]} />
                    <MaterialCommunityIcons name="check-decagram" size={120} color={T.iconColor} />
                </View>

                <Text allowFontScaling={false} style={[styles.title, { color: T.text }]}>Talebiniz Alındı!</Text>
                <Text allowFontScaling={false} style={[styles.subtitle, { color: T.textSub }]}>
                    Keşif detaylarınız ve hayalinizdeki tasarım talebi, bölgenizdeki en iyi <Text allowFontScaling={false} style={{ color: T.iconColor }}>{expertText}</Text> {targetText} başarıyla iletildi.
                </Text>
                <Text allowFontScaling={false} style={[styles.info, { color: T.textInfo }]}>
                    {contactText} inceleyip en kısa sürede sizinle iletişime geçecekler.
                </Text>
            </SafeAreaView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { shadowColor: T.iconColor }]}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <LinearGradient
                        colors={[T.btnStart, T.btnEnd]}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                        style={styles.gradientButton}
                    >
                        <Text allowFontScaling={false} style={[styles.buttonText, { color: T.btnText }]}>ANA SAYFAYA DÖN</Text>
                        <Ionicons name="home" size={18} color={T.btnText} style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },

    iconContainer: { marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
    glow: {
        position: 'absolute',
        width: 150, height: 150,
        borderRadius: 75,
        backgroundColor: THEME.goldPrimary,
        opacity: 0.2,
        shadowColor: THEME.goldPrimary,
        shadowRadius: 30,
        shadowOpacity: 0.8,
        elevation: 20
    },

    title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
    subtitle: { fontSize: 16, color: '#CCC', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
    info: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

    footer: { padding: 30, paddingBottom: 50 },
    button: { width: '100%', borderRadius: 30, overflow: 'hidden', elevation: 5 },
    gradientButton: { height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
