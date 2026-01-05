import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, BackHandler, Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MarketSuccessScreen() {
    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.content}>

                {/* Success Icon */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
                        style={styles.iconCircle}
                    >
                        <MaterialCommunityIcons name="check-decagram" size={120} color="#D4AF37" />
                    </LinearGradient>
                </Animated.View>

                {/* Text Content */}
                <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>TEKLİF HAVUZU{'\n'}OLUŞTURULUYOR!</Text>
                    <Text style={styles.subtitle}>
                        Talebiniz başarıyla alındı. Yapay zeka destekli sistemimiz, en uygun tedarikçilerden fiyatları toplayıp size sunacak.
                    </Text>

                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="clock-fast" size={24} color="#D4AF37" />
                        <Text style={styles.infoText}>Ortalama 15-30 dakika içinde teklifler panelinize düşecektir.</Text>
                    </View>
                </Animated.View>

                {/* Bottom Action */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome} activeOpacity={0.8}>
                        <Text style={styles.homeBtnText}>ANA SAYFAYA DÖN</Text>
                        <MaterialCommunityIcons name="home" size={20} color="#000" />
                    </TouchableOpacity>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

    iconContainer: { marginBottom: 40 },
    iconCircle: {
        width: 200, height: 200, borderRadius: 100,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)',
        shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10
    },

    textContainer: { alignItems: 'center', width: '100%' },
    title: {
        fontSize: 28, fontWeight: '900', color: '#D4AF37',
        textAlign: 'center', marginBottom: 16, letterSpacing: 1
    },
    subtitle: {
        fontSize: 16, color: '#CCC', textAlign: 'center',
        lineHeight: 24, marginBottom: 32, fontWeight: '300'
    },

    infoBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12,
        borderWidth: 1, borderColor: '#333', gap: 12
    },
    infoText: { flex: 1, color: '#888', fontSize: 13, lineHeight: 18 },

    footer: { position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: 20 },
    homeBtn: {
        backgroundColor: '#D4AF37', padding: 18, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10
    },
    homeBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
