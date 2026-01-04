import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME = {
    goldPrimary: '#D4AF37',
    goldHighlight: '#F7E5A8',
};

const BTN_GRADIENT = ['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30'];

export default function RenovationSuccessScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.glow} />
                    <MaterialCommunityIcons name="check-decagram" size={120} color={THEME.goldPrimary} />
                </View>

                <Text style={styles.title}>Talebiniz Alındı!</Text>
                <Text style={styles.subtitle}>
                    Keşif detaylarınız ve hayalinizdeki tasarım talebi, bölgenizdeki en iyi <Text style={{ color: THEME.goldPrimary }}>Mimarlık & Tadilat</Text> ofislerine başarıyla iletildi.
                </Text>
                <Text style={styles.info}>
                    Ofisler projeni inceleyip en kısa sürede seninle iletişime geçecekler.
                </Text>
            </SafeAreaView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <LinearGradient
                        colors={BTN_GRADIENT}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonText}>ANA SAYFAYA DÖN</Text>
                        <Ionicons name="home" size={18} color="#1a1a1a" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
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
