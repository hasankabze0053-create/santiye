import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, InputAccessoryView, Keyboard, KeyboardAvoidingView, Platform, Modal as ReactModal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { supabase } from '../../lib/supabase'; // Handled in replace content above

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const GOLD_DARK = '#FF9100';      // Deep Amber
const GOLD_MAIN = '#D4AF37';      // Safety Yellow / Standard Gold
const GOLD_LIGHT = '#FFE57F';     // Light Amber
const DANGER_RED = '#EF4444';     // Emergency Red
const SUCCESS_GREEN = '#10B981';  // Emerald Green

// Blinking Icon Component
const BlinkingIcon = ({ name, size, color }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);
    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <MaterialCommunityIcons name={name} size={size} color={color} />
        </Animated.View>
    );
};

// Standard Gold Card
const GoldCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[GOLD_MAIN, 'rgba(197, 160, 89, 0.1)', GOLD_MAIN]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={styles.cardContent}>
            {children}
        </View>
    </TouchableOpacity>
);

// Emergency Card (Red) - Used for İş Kazası
const HighlightCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style, styles.emergencyShadow]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[DANGER_RED, 'rgba(239, 68, 68, 0.1)', DANGER_RED]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={[styles.cardContent, styles.redCardBg]}>
            {children}
        </View>
    </TouchableOpacity>
);

// Wizard Configuration
const LAW_WIZARD_CONFIG = {
    'SÖZLEŞME': {
        title: 'Sözleşme & Hakediş',
        steps: [
            {
                id: 'subject',
                type: 'radio',
                question: 'Konu nedir?',
                options: ['Sözleşme İnceletmek İstiyorum', 'Hakedişimi Alamıyorum / Eksik Aldım', 'Taşeron Sözleşmeye Uymadı / İşi Bıraktı']
            },
            {
                id: 'file',
                type: 'file',
                question: 'Sözleşme taslağını veya Hakediş Raporunu yükle (PDF/Foto)'
            }
        ]
    },
    'TAŞERON': {
        title: 'Taşeron & İşçi',
        steps: [
            {
                id: 'who',
                type: 'radio',
                question: 'Sorunlu personel kim?',
                options: ['SGK\'lı İşçi (Usta/Kalfa)', 'Taşeron Firma']
            },
            {
                id: 'event',
                type: 'radio',
                question: 'Ne oldu?',
                options: ['İşe gelmedi (Tutanak lazım)', 'İstifa etti / İşten ben çıkardım', 'Tazminat / Maaş kavgası']
            }
        ]
    },
    'İMAR': {
        title: 'İmar & Ceza',
        steps: [
            {
                id: 'institution',
                type: 'radio',
                question: 'Kurum hangisi?',
                options: ['Belediye / Zabıta', 'Çevre Şehircilik / Yapı Denetim', 'SGK Müfettişi']
            },
            {
                id: 'file',
                type: 'file',
                question: 'Ceza makbuzunu veya Mühürleme Tutanığını yükle.'
            }
        ]
    },
    'KENTSEL DÖNÜŞÜM': {
        title: 'Kentsel Dönüşüm',
        steps: [
            {
                id: 'stage',
                type: 'radio',
                question: 'Hangi aşamadasınız?',
                options: ['Riskli Yapı Tespiti Yapıldı mı?', '%51 Çoğunluk Sağlandı mı?', 'Arsa Sahibi İmza Atmıyor']
            }
        ]
    },
    'MALZEME': {
        title: 'Malzeme & Tedarikçi',
        steps: [
            {
                id: 'problem_item',
                type: 'radio',
                question: 'Sorunlu Malzeme/Hizmet?',
                options: ['Hazır Beton / Demir', 'İnce İşçilik Malzemesi (Seramik, Kapı vb.)']
            },
            {
                id: 'demand',
                type: 'radio',
                question: 'Ne istiyorsun?',
                options: ['Malın İadesi / Değişimi', 'Zararın Tazmini (Para İadesi)']
            },
            {
                id: 'proof',
                type: 'file',
                question: 'Fatura ve Ayıplı Malın Fotoğrafını Yükle.'
            }
        ]
    },
    'ŞİRKET': {
        title: 'Şirket & SGK',
        steps: [
            {
                id: 'topic',
                type: 'radio',
                question: 'Konu Başlığı?',
                options: ['Vergi Cezasına İtiraz', 'İş Kazası Rücu Davası (SGK Ceza kesti)', 'Şirket Devri / Ortaklık Sözleşmesi']
            }
        ]
    },
    'EMLAK': {
        title: 'Emlak Hukuku',
        steps: [
            {
                id: 'action_type',
                type: 'radio',
                question: 'İşlem Türü?',
                options: ['Kira Sözleşmesi Hazırla (Sağlam)', 'Kiracı Tahliyesi / Kira Tespit', 'Satış Vaadi Sözleşmesi', 'Tapu İptal / Tescil Sorunu']
            }
        ]
    }
};

const WizardModal = ({ visible, onClose, config }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [note, setNote] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const modalScrollRef = useRef(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    if (!visible || !config) return null;

    const currentStep = config.steps[step];
    const isLastStep = step === config.steps.length - 1;

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [currentStep.id]: option });
    };

    const handleNext = () => {
        if (isLastStep) {
            onClose();
            setStep(0);
            setAnswers({});
            setNote('');
            // Navigate to Success Screen
            // Note: need to access navigation from parent or pass it down. 
            // Since WizardModal is inside LawScreen, we can pass a callback
            if (config.onComplete) {
                config.onComplete();
            }
        } else {
            setStep(step + 1);
        }
    };

    return (
        <ReactModal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                {/* Disable auto-avoiding to prevent button jump, handle scroll manually */}
                <View style={styles.modalContent}>

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{config.title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                        {config.steps.map((_, index) => (
                            <View key={index} style={[styles.progressStep, index <= step ? styles.progressActive : styles.progressInactive]} />
                        ))}
                    </View>

                    {/* Step Content */}
                    <ScrollView
                        ref={modalScrollRef}
                        contentContainerStyle={[styles.stepContainer, { paddingBottom: 300 }]} // Add padding for keyboard
                    >
                        <Text style={styles.questionText}>{currentStep.question}</Text>

                        {currentStep.type === 'radio' && (
                            <View style={styles.optionsContainer}>
                                {currentStep.options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.optionBtn, answers[currentStep.id] === option && styles.optionBtnActive]}
                                        onPress={() => handleOptionSelect(option)}
                                    >
                                        <Text style={[styles.optionText, answers[currentStep.id] === option && styles.optionTextActive]}>{option}</Text>
                                        {answers[currentStep.id] === option && <Ionicons name="checkmark-circle" size={20} color={GOLD_MAIN} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {currentStep.type === 'file' && (
                            <View>
                                <View style={styles.fileUploadContainer}>
                                    <TouchableOpacity style={styles.uploadBtn}>
                                        <FontAwesome5 name="file-upload" size={32} color={GOLD_MAIN} />
                                        <Text style={styles.uploadText}>Dosya Seçin veya Fotoğraf Çekin</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.fileNote}>PDF, JPG, PNG (Max 10MB)</Text>
                                </View>

                                <View style={{ marginTop: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.inputLabel}>Açıklama / Notlar</Text>
                                    </View>
                                    <TextInput
                                        style={styles.noteInput}
                                        placeholder="Örn: 5. maddedeki cezai şart oranını kontrol eder misiniz?"
                                        placeholderTextColor="#666"
                                        multiline
                                        value={note}
                                        onChangeText={setNote}
                                        inputAccessoryViewID="NoteInputDone"
                                        onFocus={() => {
                                            // Instant scroll to bottom
                                            modalScrollRef.current?.scrollToEnd({ animated: true });
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Trigger Button - Always visible */}
                    <TouchableOpacity
                        style={[styles.nextBtn, (!answers[currentStep.id] && currentStep.type === 'radio') && styles.disabledBtn]}
                        onPress={handleNext}
                        disabled={!answers[currentStep.id] && currentStep.type === 'radio'}
                    >
                        <Text style={styles.nextBtnText}>{isLastStep ? 'GÖNDER' : 'DEVAM ET'}</Text>
                        <Ionicons name={isLastStep ? "checkmark-done" : "arrow-forward"} size={20} color="#000" />
                    </TouchableOpacity>

                </View>

                {/* Keyboard Spacer for TextInput visibility */}
                {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 220 : 0 }} />}
            </View>

            {/* Keyboard Done Button for iOS */}
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="NoteInputDone">
                    <View style={styles.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryBtn}>
                            <Text style={styles.accessoryText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </ReactModal>
    );
};

import { supabase } from '../../lib/supabase';

export default function LawScreen() {
    const navigation = useNavigation();
    const [expertMatchInput, setExpertMatchInput] = useState('');
    const [activePage, setActivePage] = useState(0);
    const [wizardVisible, setWizardVisible] = useState(false);
    const [selectedWizardTool, setSelectedWizardTool] = useState(null);
    const scrollViewRef = useRef(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLawyer, setIsLawyer] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin, is_lawyer')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsLawyer(data?.is_lawyer || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const handleQuickTool = (toolName) => {
        const config = LAW_WIZARD_CONFIG[toolName];
        if (config) {
            setSelectedWizardTool(toolName);
            setWizardVisible(true);
        } else {
            // Fallback for items without wizard (e.g., ACİL)
            Alert.alert("Hızlı İşlem", `${toolName} modülü başlatılıyor...`);
        }
    };

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActivePage(roundIndex);
    };

    const handleStartAnalysis = () => {
        if (!expertMatchInput.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen sorununuzu detaylıca yazın.");
            return;
        }
        Alert.alert("Talep Alındı", "Hukuki danışmanlık talebiniz avukatlara iletiliyor...");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            {/* Background */}
            <LinearGradient
                colors={['#1c1c1c', '#000000']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >

                        {/* HEADER */}
                        <View style={styles.header}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                                </TouchableOpacity>
                                <View>
                                    <Text style={styles.headerTitle}>HUKUKİ ÇÖZÜM</Text>
                                    <Text style={styles.headerSubtitle}>MERKEZİ</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.headerIconBtn, !isLawyer && !isAdmin && { opacity: 0.5 }]}
                                onPress={() => {
                                    if (isAdmin || isLawyer) {
                                        navigation.navigate('LawProvider');
                                    } else {
                                        Alert.alert("Yetkisiz Erişim", "Bu panele sadece hukuk yetkisi tanımlanmış kurumsal hesaplar erişebilir.");
                                    }
                                }}
                                activeOpacity={isAdmin || isLawyer ? 0.7 : 1}
                            >
                                <MaterialCommunityIcons name="scale-balance" size={24} color={isAdmin || isLawyer ? GOLD_MAIN : "#666"} />
                            </TouchableOpacity>
                        </View>

                        {/* 1. SECTION: QUICK TOOLS PAGER */}
                        <Text style={styles.sectionHeader}>HIZLI İŞLEMLER</Text>

                        <View style={styles.pagerContainer}>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                                style={styles.pagerScroll}
                            >
                                {/* PAGE 1: SITE & EMERGENCY */}
                                <View style={styles.page}>
                                    <View style={styles.gridContainer}>
                                        {/* 1. ACİL (RED/BLINK) */}
                                        <HighlightCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('ACİL İŞ KAZASI')}
                                        >
                                            <View style={styles.iconBox}>
                                                <BlinkingIcon name="ambulance" size={32} color={DANGER_RED} />
                                            </View>
                                            <Text style={[styles.gridTitle, { color: '#FFF', fontWeight: 'bold' }]}>🚨 İŞ KAZASI{'\n'}& BASKIN</Text>
                                        </HighlightCard>

                                        {/* 2. SÖZLEŞME (GOLD) */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('SÖZLEŞME')}
                                        >
                                            <View style={styles.iconBox}>
                                                <FontAwesome5 name="file-contract" size={24} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>📄 SÖZLEŞME{'\n'}& HAKEDİŞ</Text>
                                        </GoldCard>

                                        {/* 3. TAŞERON (GOLD) */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('TAŞERON')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="account-hard-hat" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>👷‍♂️ TAŞERON{'\n'}& İŞÇİ</Text>
                                        </GoldCard>

                                        {/* 4. İMAR (GOLD) */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('İMAR')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="bank-outline" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>🏛️ İMAR &{'\n'}CEZA</Text>
                                        </GoldCard>
                                    </View>
                                </View>

                                {/* PAGE 2: OFFICE & TRADE */}
                                <View style={styles.page}>
                                    <View style={styles.gridContainer}>
                                        {/* 5. KENTSEL DÖNÜŞÜM */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('KENTSEL DÖNÜŞÜM')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="crane" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>🏗️ KENTSEL{'\n'}DÖNÜŞÜM</Text>
                                        </GoldCard>

                                        {/* 6. MALZEME & TEDARİKÇİ */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('MALZEME')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="wall" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>🧱 MALZEME &{'\n'}TEDARİKÇİ</Text>
                                        </GoldCard>

                                        {/* 7. ŞİRKET & SGK */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('ŞİRKET')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="briefcase-variant-outline" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>💼 ŞİRKET{'\n'}& SGK</Text>
                                        </GoldCard>

                                        {/* 8. EMLAK HUKUKU */}
                                        <GoldCard
                                            style={styles.gridItem}
                                            onPress={() => handleQuickTool('EMLAK')}
                                        >
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="home-city-outline" size={28} color={GOLD_MAIN} />
                                            </View>
                                            <Text style={styles.gridTitle}>🏠 EMLAK{'\n'}HUKUKU</Text>
                                        </GoldCard>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* PAGINATION DOTS */}
                            <View style={styles.pagination}>
                                <View style={[styles.dot, activePage === 0 ? styles.activeDot : styles.inactiveDot]} />
                                <View style={[styles.dot, activePage === 1 ? styles.activeDot : styles.inactiveDot]} />
                            </View>
                        </View>

                        {/* 2. SECTION: PREMIUM HUKUKI INPUT (Updated to match Engineering) */}
                        <View style={styles.aiSection}>
                            {/* Glow Behind */}
                            <LinearGradient
                                colors={['rgba(255, 191, 0, 0.1)', 'transparent']}
                                style={styles.heroGlow}
                            />

                            <Text style={styles.aiTitle}>HUKUKİ DANIŞMANLIK & ÇÖZÜM</Text>
                            <View style={styles.aiInputContainer}>
                                <TextInput
                                    style={styles.aiInput}
                                    placeholder="Sorununuzu, taraf bilgilerini ve beklentinizi detaylıca buraya yazın veya sesli anlatın. Alanında uzman kadromuza iletin."
                                    placeholderTextColor="#999"
                                    value={expertMatchInput}
                                    onChangeText={setExpertMatchInput}
                                    multiline
                                    onFocus={() => {
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollToEnd({ animated: true });
                                        }, 100);
                                    }}
                                    inputAccessoryViewID="DoneButton"
                                />
                                <TouchableOpacity style={styles.micBtn}>
                                    <Ionicons name="mic" size={22} color={GOLD_MAIN} />
                                </TouchableOpacity>
                            </View>

                            {/* BIG GOLD ACTION BUTTON */}
                            <TouchableOpacity style={styles.bigActionBtn} activeOpacity={0.9} onPress={handleStartAnalysis}>
                                <LinearGradient
                                    colors={[GOLD_MAIN, GOLD_DARK]}
                                    style={styles.bigBtnGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.bigBtnText}>İNCELEME BAŞLAT</Text>
                                    <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#000" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>

                </SafeAreaView>
            </KeyboardAvoidingView>

            {
                Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="DoneButton">
                        <View style={styles.accessory}>
                            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryBtn}>
                                <Text style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )
            }


            <WizardModal
                visible={wizardVisible}
                onClose={() => setWizardVisible(false)}
                config={{
                    ...LAW_WIZARD_CONFIG[selectedWizardTool],
                    onComplete: () => {
                        setWizardVisible(false);
                        navigation.navigate('LawSuccess');
                    }
                }}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 150 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingHorizontal: 20, marginTop: 20 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '300', letterSpacing: 2 },
    headerSubtitle: { color: GOLD_MAIN, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: GOLD_MAIN,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: GOLD_MAIN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },

    sectionHeader: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15, marginTop: 10, paddingHorizontal: 20 },

    // Pager System
    pagerContainer: { marginBottom: 30 },
    pagerScroll: {},
    page: { width: width, paddingHorizontal: 20 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    gridItem: { width: '48%', height: 120, borderRadius: 20 },

    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
    activeDot: { backgroundColor: GOLD_MAIN },
    inactiveDot: { backgroundColor: '#333' },

    // Card Styles (Premium)
    goldCardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#111',
        borderWidth: 1, borderColor: '#333'
    },
    emergencyShadow: {
        shadowColor: DANGER_RED, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
        borderColor: DANGER_RED
    },

    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.8 },

    cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
    redCardBg: { backgroundColor: 'rgba(239, 68, 68, 0.05)' },

    iconBox: { marginBottom: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    gridTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: '600', textAlign: 'center', letterSpacing: 0.5, lineHeight: 16 },

    // AI Section (Premium)
    aiSection: { paddingHorizontal: 20, marginTop: 10, position: 'relative' },
    heroGlow: { position: 'absolute', top: -50, left: 0, right: 0, height: 200, opacity: 0.5 },
    aiTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    aiSubtitle: { color: '#888', fontSize: 13, marginTop: 6, marginBottom: 20, lineHeight: 20 },

    aiInputContainer: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 5, borderWidth: 1, borderColor: '#333', marginBottom: 20, height: 120 },
    aiInput: { flex: 1, color: '#fff', padding: 15, fontSize: 14, textAlignVertical: 'top' },
    micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', margin: 10 },

    bigActionBtn: { borderRadius: 16, overflow: 'hidden', height: 60, shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    bigBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    bigBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    accessory: { backgroundColor: '#222', padding: 10, alignItems: 'flex-end' },
    accessoryBtn: { padding: 10 },
    accessoryText: { color: GOLD_MAIN, fontWeight: 'bold' },

    // Wizard Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { height: '92%', backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 100 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: GOLD_MAIN, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
    closeBtn: { padding: 5 },

    progressBar: { flexDirection: 'row', gap: 5, marginBottom: 30 },
    progressStep: { flex: 1, height: 4, borderRadius: 2 },
    progressActive: { backgroundColor: GOLD_MAIN },
    progressInactive: { backgroundColor: '#333' },

    stepContainer: { flex: 1 },
    questionText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 20, lineHeight: 28 },

    optionsContainer: { gap: 12 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', marginBottom: 8 },
    optionBtnActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(255, 215, 0, 0.1)' },
    optionText: { color: '#ccc', fontSize: 16 },
    optionTextActive: { color: GOLD_MAIN, fontWeight: 'bold' },

    fileUploadContainer: { alignItems: 'center', justifyContent: 'center', padding: 15, borderWidth: 2, borderColor: '#333', borderStyle: 'dashed', borderRadius: 20, marginTop: 10 },
    uploadBtn: { alignItems: 'center', gap: 10 },
    uploadText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 10 },
    fileNote: { color: '#666', fontSize: 12, marginTop: 15 },

    nextBtn: { backgroundColor: GOLD_MAIN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 28, gap: 10, marginTop: 20, marginBottom: 60, shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
    nextBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    inputLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginLeft: 4, marginBottom: 8 },
    noteInput: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: GOLD_MAIN,
        color: '#fff',
        padding: 15,
        minHeight: 180, // Enlarged height
        textAlignVertical: 'top'
    }
});
