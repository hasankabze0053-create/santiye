import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, InputAccessoryView, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// Engineering Specific "Emergency" or Highlight Card (e.g., Yapı Sağlığı)
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

// Green Highlight Card (Blinking/Active)
const GreenHighlightCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style, styles.greenShadow]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[SUCCESS_GREEN, 'rgba(16, 185, 129, 0.1)', SUCCESS_GREEN]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={[styles.cardContent, styles.greenCardBg]}>
            {children}
        </View>
    </TouchableOpacity>
);

import { supabase } from '../../lib/supabase';

export default function EngineeringScreen() {
    const navigation = useNavigation();
    const [projectInput, setProjectInput] = useState('');
    const scrollViewRef = useRef(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isEngineer, setIsEngineer] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin, is_engineer')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsEngineer(data?.is_engineer || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    // Mock Handle Tool - In reality this could open the Wizard or just Navigate
    const handleQuickTool = (toolId) => {
        if (toolId === 'ONLINE_KESIF') {
            navigation.navigate('OnlineDiscovery');
            return;
        }
        Alert.alert("Hızlı İşlem", `${toolId} modülü başlatılıyor...`);
        // Here we can re-integrate the Wizard Logic later if needed, 
        // essentially triggering the Wizard Step 1 for the selected category.
    };

    const handleStartAnalysis = () => {
        if (!projectInput.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen projenizle ilgili detayları yazın.");
            return;
        }
        Alert.alert("Talep Alındı", "Proje danışmanlık talebiniz uzmanlara iletiliyor...");
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
                            <View>
                                <Text style={styles.headerTitle}>PROJE & TEKNİK</Text>
                                <Text style={styles.headerSubtitle}>DANIŞMANLIK OFİSİ</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.headerIconBtn, !isEngineer && !isAdmin && { opacity: 0.5 }]}
                                onPress={() => {
                                    if (isAdmin || isEngineer) {
                                        navigation.navigate('TechnicalProvider');
                                    } else {
                                        Alert.alert("Yetkisiz Erişim", "Bu panele sadece 'Mühendis' yetkisi olan hesaplar erişebilir.");
                                    }
                                }}
                                activeOpacity={isAdmin || isEngineer ? 0.7 : 1}
                            >
                                <MaterialCommunityIcons name="ruler-square" size={24} color={isAdmin || isEngineer ? GOLD_MAIN : "#666"} />
                            </TouchableOpacity>
                        </View>

                        {/* 1. SECTION: PREMIUM SERVICES (Reference: Quick Tools) */}
                        <Text style={styles.sectionHeader}>PROFESYONEL DESTEK</Text>

                        <View style={styles.gridContainer}>

                            {/* 1. SORU & CEVAP (Green Blinking) - Updated */}
                            <GreenHighlightCard style={styles.gridItem} onPress={() => handleQuickTool('ONLINE_KESIF')}>
                                <View style={styles.iconBox}>
                                    <BlinkingIcon name="message-text-clock-outline" size={32} color={SUCCESS_GREEN} />
                                </View>
                                <Text style={[styles.gridTitle, { color: '#FFF', fontWeight: 'bold' }]}>💬 SORU & CEVAP</Text>
                            </GreenHighlightCard>

                            {/* 2. RUHSAT & RESMİ (Gold) */}
                            <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('RUHSAT')}>
                                <View style={styles.iconBox}>
                                    <FontAwesome5 name="file-signature" size={24} color={GOLD_MAIN} />
                                </View>
                                <Text style={styles.gridTitle}>🏛️ RUHSAT &{'\n'}RESMİ PROJE</Text>
                            </GoldCard>

                            {/* 3. MALİYET ANALİZİ (Gold) */}
                            <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('MALİYET')}>
                                <View style={styles.iconBox}>
                                    <FontAwesome5 name="calculator" size={24} color={GOLD_MAIN} />
                                </View>
                                <Text style={styles.gridTitle}>📐 MALİYET &{'\n'}METRAJ</Text>
                            </GoldCard>

                            {/* 4. MİMARİ TASARIM (Gold) */}
                            <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('MİMARİ')}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="cube-outline" size={28} color={GOLD_MAIN} />
                                </View>
                                <Text style={styles.gridTitle}>🧊 MİMARİ &{'\n'}3D VİZYON</Text>
                            </GoldCard>

                            {/* 5. YAPI SAĞLIĞI & DENETİM (Standard Gold) - Swapped */}
                            <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('YAPI SAĞLIĞI')}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={28} color={GOLD_MAIN} />
                                </View>
                                <Text style={[styles.gridTitle, { color: GOLD_MAIN, fontWeight: '600' }]}>🛡️ YAPI SAĞLIĞI{'\n'}& DENETİM</Text>
                            </GoldCard>

                            {/* 6. YERİNDE KEŞİF (Gold) */}
                            <GoldCard style={styles.gridItem} onPress={() => handleQuickTool('YERINDE_KESIF')}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="map-marker-radius-outline" size={28} color={GOLD_MAIN} />
                                </View>
                                <Text style={styles.gridTitle}>📍 YERİNDE{'\n'}TEKNİK KEŞİF</Text>
                            </GoldCard>

                        </View>

                        {/* 2. SECTION: SMART PROJECT CONSULTANT (Reference: AI Smart Match) */}
                        <View style={styles.aiSection}>
                            {/* Glow Behind */}
                            <LinearGradient
                                colors={['rgba(255, 191, 0, 0.1)', 'transparent']}
                                style={styles.heroGlow}
                            />

                            <Text style={styles.aiTitle}>PROJE DANIŞMANLIK & ÇÖZÜM</Text>
                            <Text style={styles.aiSubtitle}>Aklınızdaki projeyi, arsanızı veya sorununuzu detaylıca anlatın, uzman teknik kadromuz size dönüş yapsın.</Text>

                            <View style={styles.aiInputContainer}>
                                <TextInput
                                    style={styles.aiInput}
                                    placeholder="Proje konumu, m2, yapı türü ve beklentilerinizi buraya yazın veya sesli anlatın..."
                                    placeholderTextColor="#999"
                                    value={projectInput}
                                    onChangeText={setProjectInput}
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

                            {/* Action Buttons Row */}
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <FontAwesome5 name="paperclip" size={14} color="#aaa" />
                                    <Text style={styles.actionBtnText}>Dosya Yükle</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionBtn}>
                                    <FontAwesome5 name="camera" size={14} color="#aaa" />
                                    <Text style={styles.actionBtnText}>Fotoğraf Çek</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionBtn}>
                                    <FontAwesome5 name="map-marker-alt" size={14} color="#aaa" />
                                    <Text style={styles.actionBtnText}>Konum Paylaş</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D4AF37',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },

    sectionHeader: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 15, marginTop: 10, paddingHorizontal: 20 },

    // Grid System
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, marginBottom: 30 },
    gridItem: { width: '48%', height: 120, borderRadius: 20 },

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
    greenShadow: {
        shadowColor: SUCCESS_GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
        borderColor: SUCCESS_GREEN
    },

    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.8 },

    cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
    redCardBg: { backgroundColor: 'rgba(239, 68, 68, 0.05)' },
    greenCardBg: { backgroundColor: 'rgba(16, 185, 129, 0.05)' },

    iconBox: { marginBottom: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    gridTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: '600', textAlign: 'center', letterSpacing: 0.5, lineHeight: 16 },

    // AI Section
    aiSection: { paddingHorizontal: 20, marginTop: 10, position: 'relative' },
    heroGlow: { position: 'absolute', top: -50, left: 0, right: 0, height: 200, opacity: 0.5 },
    aiTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    aiSubtitle: { color: '#888', fontSize: 13, marginTop: 6, marginBottom: 20, lineHeight: 20 },

    aiInputContainer: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 5, borderWidth: 1, borderColor: '#333', marginBottom: 20, height: 120 },
    aiInput: { flex: 1, color: '#fff', padding: 15, fontSize: 14, textAlignVertical: 'top' },
    aiInput: { flex: 1, color: '#fff', padding: 15, fontSize: 14, textAlignVertical: 'top' },
    micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', margin: 10 },

    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181818', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333', gap: 8 },
    actionBtnText: { color: '#aaa', fontSize: 12, fontWeight: '600' },

    bigActionBtn: { borderRadius: 16, overflow: 'hidden', height: 60, shadowColor: GOLD_MAIN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    bigBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    bigBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    accessory: { backgroundColor: '#222', padding: 10, alignItems: 'flex-end' },
    accessoryBtn: { padding: 10 },
    accessoryText: { color: GOLD_MAIN, fontWeight: 'bold' }
});
