import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function OfferSuccessScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

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
                            colors={isDarkMode ? ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0)'] : ['rgba(184, 134, 11, 0.15)', 'rgba(184, 134, 11, 0.02)']}
                            style={styles.glow}
                        />
                        <View style={styles.iconBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={140} color={isDarkMode ? "#D4AF37" : "#B8860B"} />
                        </View>
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
                            <MaterialCommunityIcons name="shield-check" size={20} color={isDarkMode ? "#D4AF37" : "#8C6200"} />
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
                                colors={isDarkMode ? ['#D4AF37', '#B8860B'] : ['#B8860B', '#8C6200']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text allowFontScaling={false} style={[styles.buttonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                                    DİĞER TALEPLERİ İNCELE
                                </Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={isDarkMode ? '#000' : '#FFF'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </SafeAreaView>
        </PremiumBackground>
    );
}

const getStyles = (isDarkMode) => StyleSheet.create({
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
        width: 220,
        height: 220,
        borderRadius: 110,
    },
    iconBadge: {
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: isDarkMode ? '#D4AF37' : '#B8860B',
        textAlign: 'center',
        letterSpacing: 1.5,
        lineHeight: 38,
        marginBottom: 24,
    },
    messageBox: {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(212, 175, 55, 0.04)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.4)',
        width: '100%',
        marginBottom: 40,
        shadowColor: isDarkMode ? "#000" : "#D4AF37",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDarkMode ? 0.5 : 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    messageText: {
        color: isDarkMode ? '#DDD' : '#444',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
        fontWeight: isDarkMode ? 'normal' : '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.9,
    },
    infoText: {
        color: isDarkMode ? '#888' : '#666',
        fontSize: 13,
        fontWeight: '600',
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
