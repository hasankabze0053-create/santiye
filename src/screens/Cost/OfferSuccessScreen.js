import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

export default function OfferSuccessScreen() {
    const navigation = useNavigation();

    const handleContinue = () => {
        // Navigate back to the contractor dashboard (as seen in screenshot)
        navigation.navigate('ContractorProvider');
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>

                    {/* Success Icon Animation */}
                    <Animated.View 
                        entering={FadeInUp.delay(200).duration(1000)} 
                        style={styles.iconContainer}
                    >
                        <LinearGradient
                            colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0)']}
                            style={styles.glow}
                        />
                        <MaterialCommunityIcons name="check-decagram" size={140} color="#D4AF37" />
                    </Animated.View>

                    {/* Main Title */}
                    <Animated.Text 
                        entering={FadeInDown.delay(500).duration(800)} 
                        style={styles.title}
                    >
                        TEKLİFİNİZ{'\n'}BAŞARIYLA İLETİLDİ!
                    </Animated.Text>

                    {/* Message Box */}
                    <Animated.View 
                        entering={FadeInDown.delay(800).duration(800)} 
                        style={styles.messageBox}
                    >
                        <Text allowFontScaling={false} style={styles.messageText}>
                            Teklifiniz mülk sahibine ulaştırıldı. İnceleme sonrası projenizle ilgili sizinle iletişime geçilecektir.
                        </Text>
                        
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="shield-check" size={20} color="#D4AF37" />
                            <Text allowFontScaling={false} style={styles.infoText}>
                                Güvenli ve profesyonel teklif süreci
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Action Button */}
                    <Animated.View 
                        entering={FadeInDown.delay(1100).duration(800)} 
                        style={styles.footer}
                    >
                        <TouchableOpacity
                            style={styles.continueButton}
                            activeOpacity={0.8}
                            onPress={handleContinue}
                        >
                            <LinearGradient
                                colors={['#D4AF37', '#B8860B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text allowFontScaling={false} style={styles.buttonText}>
                                    DİĞER TALEPLERİ İNCELE
                                </Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
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
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#D4AF37',
        textAlign: 'center',
        letterSpacing: 1.5,
        lineHeight: 38,
        marginBottom: 24,
    },
    messageBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        width: '100%',
        marginBottom: 40,
    },
    messageText: {
        color: '#DDD',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.8,
    },
    infoText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        width: '100%',
    },
    continueButton: {
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 12,
    },
    buttonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
