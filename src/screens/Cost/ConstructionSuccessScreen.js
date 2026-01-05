import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

export default function ConstructionSuccessScreen() {
    const navigation = useNavigation();

    return (
        <PremiumBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    {/* Success Icon Animation */}
                    <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.iconContainer}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0)']}
                            style={styles.glow}
                        />
                        <MaterialCommunityIcons name="check-decagram" size={120} color="#FFD700" />
                    </Animated.View>

                    {/* Main Title */}
                    <Animated.Text entering={FadeInDown.delay(500).duration(800)} style={styles.title}>
                        BAŞARILI!
                    </Animated.Text>

                    {/* Description Text */}
                    <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.messageContainer}>
                        <Text style={styles.messageText}>
                            Projeniz <Text style={styles.highlight}>Seçilmiş Müteahhitlere</Text> başarıyla sunulmuştur.
                        </Text>
                        <View style={styles.divider} />
                        <Text style={styles.subMessageText}>
                            En kısa sürede <Text style={styles.highlight}>Teklif Havuzunuz</Text> oluşturulacaktır.
                        </Text>
                    </Animated.View>

                    {/* Return Button */}
                    <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.homeButton}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Ana Sayfa' })}
                        >
                            <LinearGradient
                                colors={['#D6A023', '#D6A023']} // Consistent Matte Gold
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.homeButtonGradient}
                            >
                                <Ionicons name="home" size={20} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.homeButtonText}>ANA SAYFAYA DÖN</Text>
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
        color: '#FFD700',
        letterSpacing: 2,
        marginBottom: 24,
        textAlign: 'center',
        textShadowColor: 'rgba(255, 215, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    messageContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    messageText: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    subMessageText: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    highlight: {
        color: '#FFD700',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '40%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    buttonContainer: {
        width: '100%',
    },
    homeButton: {
        shadowColor: "#FFD700",
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
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
