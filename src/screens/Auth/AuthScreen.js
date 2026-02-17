import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/AuthService';

const { width } = Dimensions.get('window');

// --- THEME CONSTANTS ---
// Premium Palette
const GOLD_MAIN = '#D4AF37';         // Metallic Gold
const GOLD_LIGHT = '#FDB931';        // Light Gold Reflection
const GOLD_DARK = '#AA8C2C';         // Deep Gold Shadow
const BG_DARK_START = '#000000';     // Pure Black
const BG_DARK_END = '#111111';       // Subtle Gradient End
const INPUT_BG = '#1A1A1A';          // Dark Grey Fill
const INPUT_BORDER = 'rgba(212, 175, 55, 0.5)'; // Subtle Gold Border
const TEXT_WHITE = '#FFFFFF';
const TEXT_GREY = '#B3B3B3';

// Custom Styled Input Component (Defined outside to prevent re-renders)
const PremiumInput = ({ label, placeholder, value, onChangeText, isPassword, togglePass, secureTextEntry }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#666"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
                selectionColor={GOLD_MAIN}
            />
            {isPassword && (
                <TouchableOpacity onPress={togglePass} style={styles.eyeIcon}>
                    <Ionicons name={!secureTextEntry ? "eye-off" : "eye"} size={20} color={TEXT_GREY} />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

export default function AuthScreen() {
    const navigation = useNavigation();
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- AUTH ACTIONS ---
    const handleAuthAction = async () => {
        console.log('[AuthScreen] handleAuthAction triggered. isLogin:', isLogin);
        if (!email || !password) {
            Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi giriniz.');
            return;
        }

        setLoading(true);
        console.log('[AuthScreen] setLoading(true)');
        try {
            if (isLogin) {
                // LOGIN
                console.log('[AuthScreen] Attempting signIn...');
                const { user } = await AuthService.signIn(email, password);
                console.log('[AuthScreen] signIn successful, user:', user?.id);

                // Get Profile to redirect correctly
                console.log('[AuthScreen] Fetching profile...');
                const profile = await AuthService.getProfile(user.id);
                console.log('[AuthScreen] Profile fetched:', profile);

                // If no profile (rare), or individual -> Home
                // If corporate && pending -> ProviderDashboard (locked view? or just dashboard)
                if (!profile) {
                    console.log('[AuthScreen] No profile, Navigating to ProfileMain');
                    navigation.navigate('ProfileMain');
                } else if (profile.is_admin) {
                    // ADMIN CHECK FIRST
                    console.log('[AuthScreen] User is Admin, Navigating to AdminDashboard');
                    navigation.navigate('AdminDashboard');
                } else if (!profile.user_type || profile.user_type === 'individual') {
                    console.log('[AuthScreen] Individual, Navigating to Ana Sayfa');
                    // Navigate to the "Ana Sayfa" TAB specifically
                    navigation.navigate('Ana Sayfa');
                } else {
                    // Corporate
                    if (profile.approval_status === 'approved') {
                        console.log('[AuthScreen] Corporate Approved, Navigating to ProviderDashboard');
                        navigation.navigate('ProviderDashboard');
                    } else {
                        console.log(`[AuthScreen] Corporate ${profile.approval_status}, Navigating to ProfileMain`);
                        navigation.navigate('ProfileMain');
                    }
                }

            } else {
                // REGISTER
                if (!fullName) {
                    Alert.alert('Eksik Bilgi', 'Lütfen adınızı giriniz.');
                    setLoading(false);
                    return;
                }

                console.log('[AuthScreen] Attempting signUp...');
                // Create Auth User
                const { session, user } = await AuthService.signUp(email, password, fullName);
                console.log('[AuthScreen] signUp result - session:', !!session, 'user:', user?.id);

                if (!session) {
                    Alert.alert('Kayıt Başarılı', 'Lütfen e-posta adresinizi doğrulayın, ardından giriş yapın.');
                    setIsLogin(true); // Switch to login mode
                    return;
                }

                // Redirect to Onboarding
                console.log('[AuthScreen] Navigating to Onboarding');
                navigation.navigate('Onboarding');
            }
        } catch (error) {
            console.error('[AuthScreen] Error in handleAuthAction:', error);
            Alert.alert('İşlem Başarısız', getFriendlyErrorMessage(error));
        } finally {
            console.log('[AuthScreen] Finally block - setLoading(false)');
            setLoading(false);
        }
    };

    const getFriendlyErrorMessage = (error) => {
        const msg = error.message || error.toString();
        if (msg.includes('rate limit')) return 'Çok fazla istek gönderdiniz. Lütfen e-postanızı kontrol edin veya biraz bekleyip tekrar deneyin.';
        if (msg.includes('already registered')) return 'Bu e-posta adresi zaten kayıtlı. Lütfen Giriş Yap sekmesine geçiniz.';
        if (msg.includes('Invalid login')) return 'Hatalı e-posta veya şifre.';
        return msg;
    };

    const handleSocialLogin = (platform) => {
        Alert.alert('Bilgi', `${platform} ile giriş şu anda bakım aşamasındadır. Lütfen e-posta ile devam ediniz.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={BG_DARK_START} />

            {/* 1. BACKGROUND: Smooth Dark Gradient */}
            <LinearGradient
                colors={[BG_DARK_START, BG_DARK_END]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} // Vertical gradient
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* 2. LOGO: Coded Typography */}
                        <View style={styles.logoSection}>
                            <Text style={styles.logoTextBase}>
                                Cepte<Text style={styles.logoTextHighlight}>Şef</Text>
                            </Text>
                        </View>

                        {/* 3. FORM SECTION */}
                        <View style={styles.formSection}>

                            {!isLogin && (
                                <PremiumInput
                                    label="Ad Soyad"
                                    placeholder="Adınız ve Soyadınız"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            )}

                            <PremiumInput
                                label="E-Posta"
                                placeholder="E-Posta"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <PremiumInput
                                label="Şifre"
                                placeholder="Şifre"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                                secureTextEntry={!showPassword}
                                togglePass={() => setShowPassword(!showPassword)}
                            />

                            {/* Options Row: Forgot Password & Remember Me */}
                            <View style={styles.optionsRow}>
                                <TouchableOpacity style={styles.optionButton}>
                                    <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
                                </TouchableOpacity>

                                {/* Fully Clickable Remember Me Area */}
                                <TouchableOpacity
                                    style={[styles.rememberRow, styles.optionButton]}
                                    onPress={() => setRememberMe(!rememberMe)}
                                    activeOpacity={0.6}
                                >
                                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                        {rememberMe && <Ionicons name="checkmark" size={10} color="#000" />}
                                    </View>
                                    <Text style={styles.rememberText}>Beni Hatırla</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 32 }} />

                            {/* 4. MAIN BUTTON: Rich Gold Gradient + Glow */}
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleAuthAction}
                                style={styles.shadowWrapper}
                            >
                                <LinearGradient
                                    colors={[GOLD_LIGHT, GOLD_MAIN, GOLD_DARK]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.loginBtn}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <Text style={styles.loginBtnText}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Toggle Sign Up Text */}
                            <TouchableOpacity style={styles.footerToggle} onPress={() => setIsLogin(!isLogin)}>
                                <Text style={styles.footerText}>
                                    {isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
                                    <Text style={styles.signUpText}>{isLogin ? 'Kayıt Ol' : 'Giriş Yap'}</Text>
                                </Text>
                            </TouchableOpacity>

                            {/* 5. FOOTER: Divider & Socials */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>VEYA</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialStack}>
                                {/* Google Button: Pure White with Authentic 'G' Icon */}
                                <TouchableOpacity style={styles.googleBtn} onPress={() => handleSocialLogin('Google')}>
                                    <View style={{ marginRight: 12 }}>
                                        {/* Authentic Google Logo from CDN */}
                                        <Image
                                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                                            style={{ width: 24, height: 24 }}
                                        />
                                    </View>
                                    <Text style={styles.googleText}>Google ile Giriş Yap</Text>
                                </TouchableOpacity>

                                {/* Apple Button: Deep Black with White Logo */}
                                <TouchableOpacity style={styles.appleBtn} onPress={() => handleSocialLogin('Apple')}>
                                    <FontAwesome name="apple" size={24} color="#FFF" style={{ marginRight: 12 }} />
                                    <Text style={styles.appleText}>Apple ile Giriş Yap</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111' },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingBottom: 40,
    },

    // Logo
    logoSection: {
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 40,
    },
    logoTextBase: {
        fontSize: 52,
        fontWeight: '800', // Slightly lighter than 900 for elegance
        color: '#FFFFFF',
        letterSpacing: 2, // More breathable spacing
        fontStyle: 'normal',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    logoTextHighlight: {
        color: GOLD_MAIN,
        fontStyle: 'italic',
        fontWeight: '900', // Contrast weight
        letterSpacing: 0, // Tighten up the highlight
        textShadowColor: 'rgba(212, 175, 55, 0.6)', // Gold glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },

    // Form
    formSection: { width: '100%' },

    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    inputContainer: {
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: INPUT_BORDER, // Thin gold border
        height: 54, // Comfortable touch target
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    input: {
        color: '#FFF',
        fontSize: 15,
        flex: 1,
        height: '100%',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
    },

    // Options Row
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    optionButton: {
        padding: 8, // Increase touch area
    },
    forgotText: {
        color: GOLD_MAIN,
        fontSize: 13,
        fontWeight: '600',
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: GOLD_MAIN,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        backgroundColor: GOLD_MAIN,
    },
    rememberText: {
        color: GOLD_MAIN,
        fontSize: 13,
        fontWeight: '600',
    },

    // Main Button
    shadowWrapper: {
        // Glow effect for the button
        shadowColor: GOLD_MAIN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    loginBtn: {
        height: 56,
        borderRadius: 16, // Softer roundness
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginBtnText: {
        color: '#000', // Black text on Gold background for contrast
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    footerToggle: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '400',
    },
    signUpText: {
        color: GOLD_MAIN,
        fontWeight: 'bold',
    },

    // Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#444', // Thin grey line
    },
    dividerText: {
        color: '#888',
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        letterSpacing: 1,
    },

    // Social Buttons
    socialStack: {
        gap: 16, // Space between social buttons
    },
    googleBtn: {
        backgroundColor: '#FFFFFF', // Pure White
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 12,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleText: {
        color: 'rgba(0,0,0,0.54)', // Google's standard grey for text, slightly better than full black
        fontSize: 16,
        fontWeight: '600',
    },
    appleBtn: {
        backgroundColor: '#000000', // Deep Black
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333', // Subtle border
    },
    appleText: {
        color: '#FFFFFF', // White Text
        fontSize: 16,
        fontWeight: '600',
    },
});
