import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    InputAccessoryView,
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { analyzeLegalCase } from '../../services/legalAiService';
import { LegalHistoryService } from '../../services/legalHistoryService';
import InsightPanel from './components/InsightPanel';
import { PermissionService } from '../../services/PermissionService';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SERVICES = [
    { id: 'contract', icon: 'file-sign', label: 'Sözleşme Kontrolü', desc: 'Taşeron ve tedarikçi sözleşmeleri', sample: 'Taşeronla aramızdaki alt yüklenici sözleşmesinin cezai şart maddelerini incele.' },
    { id: 'progress', icon: 'scale-balance', label: 'Hakediş İhtilafı', desc: 'Kesinti ve ödeme gecikmeleri', sample: 'Ana firma 3 aydır hakediş ödemiyor, %10 teminat kesintisini bahane ediyor.' },
    { id: 'accident', icon: 'alert-octagon', label: 'İş Kazası (İSG)', desc: 'Acil durum ve yasal süreç', sample: 'Şantiyede iskeleden düşme kazası oldu, tutanak tutuldu, ne yapmalıyım?' },
    { id: 'hr', icon: 'account-hard-hat', label: 'Personel & Özlük', desc: 'İhbar, kıdem ve mesai', sample: 'Şantiye şefi istifa etti, ihbar süresine uymak istemiyor.' }
];

function getTheme(theme) {
    const isDark = theme.isDarkMode;
    return {
        bg: theme.background,
        textPrimary: theme.text,
        textSecondary: theme.textSecondary,
        textMuted: theme.textTertiary || (isDark ? '#555555' : '#999999'),
        goldPrimary: theme.accentBright || '#D4AF37',
        orange: theme.accent || '#E8890C',
        danger: theme.danger || '#EF4444',
        green: theme.success || '#10B981',
        card: theme.surface,
        cardBorder: isDark ? 'rgba(212,175,55,0.22)' : theme.border,
        inputBg: theme.surface,
        btnBg: isDark ? '#1a1a1a' : '#FFFFFF',
        btnBorder: isDark ? '#2a2a2a' : theme.border,
        servCardBg: isDark ? ['#181818', '#111111'] : ['#FFFFFF', '#F4EBE0'],
        servCardBorder: isDark ? '#222222' : 'rgba(255, 255, 255, 0.9)',
        sheetBg: isDark ? ['#0e0e0e', '#090909'] : [theme.surfaceElevated || '#FFFFFF', theme.background],
        sheetTopBorder: isDark ? ['#D4AF3700', '#D4AF3788', '#D4AF3700'] : ['#D4AF3700', '#D4AF3788', '#D4AF3700'],
        scoreRowBg: theme.surface,
        scoreRowBorder: isDark ? '#222222' : theme.border,
        iconBoxBg: isDark ? 'rgba(212,175,55,0.15)' : '#FFF6E5',
        overlayBg: isDark ? 'rgba(0,0,0,0.88)' : 'rgba(253,251,247,0.95)',
        goldTint: isDark ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.05)',
        white: '#FFFFFF',
        black: '#000000',
    };
}

// ─── WIREFRAME ANIMATION ─────────────────────────────────────────────────────
function WireframeOrb() {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const w = getWStyles(T, isDarkMode);
    
    const rotate  = useRef(new Animated.Value(0)).current;
    const pulse   = useRef(new Animated.Value(1)).current;
    const pulse2  = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(Animated.timing(rotate, { toValue: 1, duration: 25000, useNativeDriver: true })).start();
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.delay(1000),
            Animated.timing(pulse2, { toValue: 1.1, duration: 2500, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ])).start();
    }, []);

    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const spinRev = rotate.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

    return (
        <Animated.View style={[w.orbContainer, { transform: [{ scale: pulse }] }]}>
            <Animated.View style={[w.halo, w.halo1, { transform: [{ scale: pulse2 }] }]} />
            <Animated.View style={[w.halo, w.halo2]} />
            <Animated.View style={[w.ring, w.ringOuter, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[w.ring, w.ringMid, { transform: [{ rotate: spinRev }] }]} />
            <Animated.View style={[w.ring, w.ringInner, { transform: [{ rotate: spin }] }]} />
            
            <View style={w.core}>
                <LinearGradient colors={[T.goldPrimary + '33', T.goldPrimary + '00']} style={w.coreGrad} />
                <MaterialCommunityIcons name="scale-balance" size={18} color={T.goldPrimary} />
            </View>
            {[0, 90, 180, 270].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const center = 62.5; 
                const r = 57.5; 
                return (
                    <View key={i} style={[w.orbitDot, { left: center + r * Math.cos(rad) - 3.5, top: center + r * Math.sin(rad) - 3.5 }]} />
                );
            })}
        </Animated.View>
    );
}

// ─── ANALYZING OVERLAY ───────────────────────────────────────────────────────
function AnalyzingOverlay({ visible }) {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const s = getSStyles(T, isDarkMode);
    const opacity = useRef(new Animated.Value(0)).current;
    const scanY   = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
            Animated.loop(Animated.sequence([
                Animated.timing(scanY, { toValue: 100, duration: 1500, useNativeDriver: true }),
                Animated.timing(scanY, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])).start();
        } else {
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[s.overlayBg, { opacity }]}>
            <BlurView intensity={isDarkMode ? 80 : 40} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="scale-balance" size={48} color={T.goldPrimary} />
                <Animated.View style={[s.scanLine, { transform: [{ translateY: scanY }, { translateY: -50 }] }]} />
                <Text allowFontScaling={false} style={s.overlayTitle}>Hukuki Zeka Analiz Ediyor...</Text>
                <Text allowFontScaling={false} style={s.overlaySub}>İçtihatlar ve yasal süreçler taranıyor</Text>
            </View>
        </Animated.View>
    );
}

// ─── RECENT CASE CARD ────────────────────────────────────────────────────────
function RecentCard({ cat, score, time, onPress, onDelete }) {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const s = getSStyles(T, isDarkMode);
    const c = score >= 8 ? T.danger : score >= 5 ? T.orange : T.green;
    return (
        <TouchableOpacity style={s.recentCard} onPress={onPress} activeOpacity={0.85}>
            <LinearGradient 
                colors={isDarkMode ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)']} 
                style={StyleSheet.absoluteFillObject} 
                borderRadius={18} 
            />
            <View style={s.recentIconBox}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={T.goldPrimary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text allowFontScaling={false} style={s.recentCat} numberOfLines={1}>{cat}</Text>
                <Text allowFontScaling={false} style={s.recentTime}>{time}</Text>
            </View>
            <View style={[s.scoreTag, { borderColor: c + '44' }]}>
                <Text allowFontScaling={false} style={[s.scoreTagNum, { color: c }]}>{score}</Text>
                <Text allowFontScaling={false} style={[s.scoreTagDen, { color: c + '88' }]}>/10</Text>
            </View>
            <TouchableOpacity style={s.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
                <MaterialCommunityIcons name="trash-can-outline" size={19} color={T.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function LawScreen() {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const s = getSStyles(T, isDarkMode);

    const navigation = useNavigation();
    const scrollRef    = useRef(null);
    const inputWrapRef = useRef(null);

    const [inputText, setInputText]           = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [attachedFile, setAttachedFile]     = useState(null);
    const [isAnalyzing, setIsAnalyzing]       = useState(false);
    const [caseData, setCaseData]             = useState(null);
    const [panelVisible, setPanelVisible]     = useState(false);
    const [isAdmin, setIsAdmin]               = useState(false);
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showHistory, setShowHistory]       = useState(false);
    const [hasLawAccess, setHasLawAccess]     = useState(false);

    // Input glow aura
    const auraOpacity = useRef(new Animated.Value(0)).current;
    const auraScale   = useRef(new Animated.Value(0.97)).current;

    useEffect(() => { 
        checkUserStatus(); 
        loadHistory();
    }, []);

    useEffect(() => {
        const focused = isInputFocused || inputText.length > 0;
        Animated.parallel([
            Animated.timing(auraOpacity, { toValue: focused ? 1 : 0, duration: 400, useNativeDriver: true }),
            Animated.timing(auraScale, { toValue: focused ? 1 : 0.97, duration: 400, useNativeDriver: true }),
        ]).start();
    }, [isInputFocused, inputText]);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const roles = await PermissionService.getUserRoles();
                setIsAdmin(roles.isAdmin);
                const hasAccess = await PermissionService.checkAccess('lawyer');
                setHasLawAccess(hasAccess);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        const data = await LegalHistoryService.getRecentAnalyses(5);
        setRecentAnalyses(data);
        setLoadingHistory(false);
    };

    const handleDeleteAnalysis = async (id) => {
        Alert.alert('Silinecek', 'Bu analiz geçmişten kalıcı olarak silinecek. Emin misiniz?', [
            { text: 'Vazgeç', style: 'cancel' },
            { 
                text: 'Sil', 
                style: 'destructive',
                onPress: async () => {
                    const res = await LegalHistoryService.deleteAnalysis(id);
                    if (res.success) loadHistory();
                }
            }
        ]);
    };

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets?.[0]) setAttachedFile(result.assets[0]);
        } catch { Alert.alert('Hata', 'Dosya seçilemedi.'); }
    };

    const triggerAnalysis = async (text) => {
        if (!text?.trim() && !attachedFile) {
            Alert.alert('Eksik Bilgi', 'Lütfen sorununuzu anlatın veya belge yükleyin.');
            return;
        }
        Keyboard.dismiss();
        setIsAnalyzing(true);
        try {
            let fileData = null;
            if (attachedFile) {
                const base64Data = await FileSystem.readAsStringAsync(attachedFile.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                fileData = {
                    data: base64Data,
                    mimeType: attachedFile.mimeType || 'application/pdf',
                };
            }

            const result = await analyzeLegalCase({ 
                text: text || inputText, 
                userId: 'user_demo',
                fileData 
            });

            if (result.success) {
                await LegalHistoryService.saveAnalysis(result.data, text || inputText);
                loadHistory(); 

                setCaseData(result.data);
                setIsAnalyzing(false);
                navigation.navigate('LawAnalysisResult', {
                    analysisData: result.data,
                    caseText: text || inputText,
                    hasFile: !!attachedFile,
                    fileName: attachedFile?.name,
                    isHistorical: false
                });
            }
        } catch (e) {
            console.error('Analysis failed:', e);
            setIsAnalyzing(false);
            Alert.alert('Hata', 'Analiz yapılamadı. İnternet bağlantınızı veya dosya boyutunu kontrol edin.');
        }
    };

    const handleLawyerConnect = (lawyer) => {
        navigation.navigate('LawSuccess', { lawyer, caseData });
    };

    const handleServicePress = (srv) => {
        setInputText(srv.sample);
        setTimeout(() => triggerAnalysis(srv.sample), 300);
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={T.bg} />
            <LinearGradient colors={[T.goldTint, 'transparent']} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.3 }} pointerEvents="none" />

            <AnalyzingOverlay visible={isAnalyzing} />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
                        <Ionicons name="arrow-back" size={18} color={T.textPrimary} />
                    </TouchableOpacity>
                    <View style={s.headerCenter}>
                        <Text allowFontScaling={false} style={s.headerEye}>HUKUK OFİSİ</Text>
                        <Text allowFontScaling={false} style={s.headerSub}>Hukuki Çözüm Merkezi</Text>
                    </View>
                    <TouchableOpacity
                        style={[s.headerBtn, (hasLawAccess || isAdmin) && s.headerBtnActive]}
                        onPress={() => {
                            if (isAdmin || hasLawAccess) navigation.navigate('LawProvider');
                            else Alert.alert('Yetkisiz Erişim', 'Yalnızca onaylı avukat hesapları bu panele erişebilir.');
                        }}
                    >
                        <MaterialCommunityIcons name="scale-balance" size={18} color={isAdmin || hasLawAccess ? T.goldPrimary : T.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={s.orbSection}>
                        <WireframeOrb />
                        <Text allowFontScaling={false} style={s.heroEye}>YAPAY ZEKA DESTEKLİ</Text>
                        <Text allowFontScaling={false} style={s.heroTitle}>Hukuki Kalkanınız</Text>
                    </View>

                    <View ref={inputWrapRef} style={s.inputWrap}>
                        <Animated.View style={[s.inputGlow, { opacity: auraOpacity, transform: [{ scale: auraScale }] }]} pointerEvents="none" />
                        <View style={s.glassCard}>
                            <LinearGradient colors={[T.goldPrimary + '00', T.goldPrimary + 'AA', T.goldPrimary + '00']} style={s.glassBorderTop} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                            <TextInput
                                allowFontScaling={false}
                                style={s.input}
                                placeholder="Probleminizi buraya yazın, ses veya belge yükleyin..."
                                placeholderTextColor={T.textMuted}
                                multiline
                                value={inputText}
                                onChangeText={setInputText}
                                onFocus={() => {
                                    setIsInputFocused(true);
                                    setTimeout(() => {
                                        inputWrapRef.current?.measureLayout(
                                            scrollRef.current,
                                            (x, y) => scrollRef.current?.scrollTo({ y: y - 20, animated: true }),
                                            () => {}
                                        );
                                    }, 250);
                                }}
                                onBlur={() => setIsInputFocused(false)}
                                textAlignVertical="top"
                                selectionColor={T.goldPrimary}
                                cursorColor={T.goldPrimary}
                            />
                            {attachedFile && (
                                <View style={s.fileChip}>
                                    <MaterialCommunityIcons name="file-check-outline" size={14} color={T.goldPrimary} />
                                    <Text allowFontScaling={false} style={s.fileChipText} numberOfLines={1}>{attachedFile.name}</Text>
                                    <TouchableOpacity onPress={() => setAttachedFile(null)}>
                                        <Ionicons name="close-circle" size={14} color={T.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={s.inputFooter}>
                                <Text allowFontScaling={false} style={s.charCount}>{inputText.length > 0 ? `${inputText.length} karakter` : 'Metin, ses veya belge'}</Text>
                                <View style={s.footerBtns}>
                                    <TouchableOpacity style={s.iconBtn} onPress={handlePickFile}>
                                        <FontAwesome5 name="paperclip" size={14} color={attachedFile ? T.goldPrimary : T.textSecondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Ses', 'Ses kaydı yakında aktif olacak.')}>
                                        <Ionicons name="mic-outline" size={16} color={T.textMuted} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Kamera', 'Canlı belge tarama yakında aktif olacak.')}>
                                        <MaterialCommunityIcons name="camera-outline" size={16} color={T.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => triggerAnalysis(inputText)} activeOpacity={0.88} style={s.ctaWrap}>
                        <View style={[s.ctaBtn, { backgroundColor: '#C89B1E' }]}>
                            <MaterialCommunityIcons name="magnify-scan" size={20} color="#fff" />
                            <Text allowFontScaling={false} style={s.ctaText}>ANALİZ ET VE AVUKATA BAĞLAN</Text>
                        </View>
                        <View style={s.ctaGlow} pointerEvents="none" />
                    </TouchableOpacity>

                    <View style={s.servSection}>
                        <View style={s.servHeaderWrap}>
                            <LinearGradient
                                colors={T.sheetBg}
                                style={StyleSheet.absoluteFillObject}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            />
                            <LinearGradient
                                colors={[T.goldPrimary, T.orange]}
                                style={s.servHeaderBar}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={s.servTitle}>DOĞRUDAN HİZMETLER</Text>
                                <Text allowFontScaling={false} style={s.servSubtitle}>Hızlı erişim · 4 uzmanlık alanı</Text>
                            </View>
                        </View>
                        <View style={s.servGrid}>
                            {SERVICES.map(srv => (
                                <TouchableOpacity key={srv.id} onPress={() => handleServicePress(srv)} activeOpacity={0.82} style={s.servCard}>
                                    <LinearGradient colors={T.servCardBg} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                                    <View style={s.servIconBox}>
                                        <MaterialCommunityIcons name={srv.icon} size={26} color={T.goldPrimary} />
                                    </View>
                                    <Text allowFontScaling={false} style={s.servLabel}>{srv.label}</Text>
                                    <Text allowFontScaling={false} style={s.servDesc}>{srv.desc}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* HISTORY TOGGLE BUTTON */}
                    <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={s.historyToggleBtn}>
                        <MaterialCommunityIcons name="history" size={20} color={T.goldPrimary} />
                        <Text allowFontScaling={false} style={s.historyToggleText}>GEÇMİŞ ANALİZLERİM</Text>
                        <MaterialCommunityIcons name={showHistory ? "chevron-up" : "chevron-down"} size={20} color={T.goldPrimary} />
                    </TouchableOpacity>

                    {/* HISTORY LIST */}
                    {showHistory && (
                        <View style={s.historyContainer}>
                            {loadingHistory ? (
                                <ActivityIndicator color={T.goldPrimary} style={{ marginVertical: 20 }} />
                            ) : recentAnalyses.length === 0 ? (
                                <Text allowFontScaling={false} style={s.emptyHistoryText}>Henüz bir analiziniz bulunmuyor.</Text>
                            ) : (
                                recentAnalyses.map((item) => (
                                    <RecentCard 
                                        key={item.id}
                                        cat={item.case_title || item.kategori} 
                                        score={item.aciliyet_skoru} 
                                        time={new Date(item.created_at).toLocaleDateString('tr-TR')} 
                                        onPress={() => {
                                            navigation.navigate('LawAnalysisResult', {
                                                analysisData: item.full_data,
                                                caseText: item.search_text,
                                                isHistorical: true
                                            });
                                        }}
                                        onDelete={() => handleDeleteAnalysis(item.id)}
                                    />
                                ))
                            )}
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            <InsightPanel
                visible={panelVisible}
                data={caseData}
                onClose={() => setPanelVisible(false)}
                onConfirm={handleLawyerConnect}
                onReAnalyze={(editedText) => {
                    setPanelVisible(false);
                    setInputText(editedText);
                    setTimeout(() => triggerAnalysis(editedText), 350);
                }}
            />
        </View>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
function getWStyles(T, isDarkMode) {
    return StyleSheet.create({
        orbContainer: { width: 125, height: 125, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative' },
        halo: { position: 'absolute', borderRadius: 999 },
        halo1: { width: 125, height: 125, backgroundColor: T.goldPrimary + '10' },
        halo2: { width: 102, height: 102, backgroundColor: T.goldPrimary + '18' },
        ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
        ringOuter: { width: 115, height: 115, borderColor: T.goldPrimary + '44' },
        ringMid:   { width: 88, height: 88, borderColor: T.goldPrimary + '66', borderStyle: 'dashed' },
        ringInner: { width: 62, height: 62, borderColor: T.goldPrimary + '88' },
        core: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: T.goldPrimary + '88' },
        coreGrad: { ...StyleSheet.absoluteFillObject },
        orbitDot: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: T.goldPrimary },
    });
}

function getSStyles(T, isDarkMode) {
    return StyleSheet.create({
        root: { flex: 1, backgroundColor: T.bg },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6 },
        headerBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkMode ? 0.3 : 0.08, shadowRadius: 8, elevation: 3 },
        headerBtnActive: { borderColor: T.goldPrimary + '55', borderWidth: 1 },
        headerCenter: { flex: 1, alignItems: 'center' },
        headerEye: { color: T.goldPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
        headerSub: { color: T.textPrimary, fontSize: 13, marginTop: 2, fontWeight: '600' },
        scroll: { paddingHorizontal: 16, paddingBottom: 20 },
        orbSection: { alignItems: 'center', paddingTop: 6, paddingBottom: 4 },
        heroEye: { color: T.goldPrimary, fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
        heroTitle: { color: T.textPrimary, fontSize: 24, fontWeight: '900', textAlign: 'center', lineHeight: 28, marginBottom: 12 },
        inputWrap: { marginBottom: 12, position: 'relative' },
        inputGlow: { position: 'absolute', inset: -12, borderRadius: 32, backgroundColor: T.goldPrimary + '18', zIndex: 0 },
        glassCard: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', overflow: 'hidden', backgroundColor: T.scoreRowBg },
        glassBorderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, opacity: 0.6 },
        input: { color: T.textPrimary, fontSize: 14, lineHeight: 22, padding: 16, paddingTop: 16, paddingBottom: 8, minHeight: 65, textAlignVertical: 'top' },
        fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.goldPrimary + '18', margin: 12, marginTop: 0, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
        fileChipText: { color: T.goldPrimary, fontSize: 12, flex: 1 },
        inputFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4 },
        charCount: { color: T.textSecondary, fontSize: 11, flex: 1 },
        footerBtns: { flexDirection: 'row', gap: 8 },
        iconBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: (isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), borderWidth: 1, borderColor: (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), alignItems: 'center', justifyContent: 'center' },
        ctaWrap: { marginBottom: 20, position: 'relative' },
        ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 18, gap: 10 },
        ctaText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
        ctaGlow: { position: 'absolute', bottom: -8, left: 20, right: 20, height: 20, backgroundColor: T.goldPrimary + '30', borderRadius: 10, zIndex: -1 },
        servSection: { marginBottom: 8 },
        servHeaderWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, overflow: 'hidden', gap: 12, borderWidth: 1, borderColor: T.goldPrimary + '44' },
        servHeaderBar: { width: 3, height: 30, borderRadius: 2, marginRight: 2 },
        servTitle: { color: T.textPrimary, fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
        servSubtitle: { color: T.goldPrimary + 'AA', fontSize: 10, marginTop: 2, fontWeight: '500' },
        servGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        servCard: { 
            width: (width - 42) / 2, 
            borderRadius: 16, 
            padding: 14, 
            backgroundColor: isDarkMode ? '#141414' : '#FDFDFD', 
            borderWidth: 1, 
            borderColor: T.servCardBorder, 
            overflow: 'hidden', 
            minHeight: 110, 
            alignItems: 'center',
            shadowColor: isDarkMode ? '#000000' : '#8C7050',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDarkMode ? 0.3 : 0.12,
            shadowRadius: 10,
            elevation: 4
        },
        servIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: T.iconBoxBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
        servLabel: { color: T.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
        servDesc: { color: T.textSecondary, fontSize: 11, lineHeight: 14, textAlign: 'center' },

        historyToggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 10, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.goldPrimary + '33' },
        historyToggleText: { color: T.goldPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 1, marginHorizontal: 8 },
        historyContainer: { marginTop: 10, padding: 10, backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.scoreRowBorder },
        emptyHistoryText: { color: T.textSecondary, fontSize: 13, textAlign: 'center', marginVertical: 16 },

        recentCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : T.scoreRowBorder, overflow: 'hidden' },
        recentIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.goldPrimary + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.goldPrimary + '33' },
        recentCat: { color: T.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 2 },
        recentTime: { color: T.textSecondary, fontSize: 11 },
        scoreTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginRight: 8 },
        scoreTagNum: { fontSize: 13, fontWeight: '900' },
        scoreTagDen: { fontSize: 8, fontWeight: '600', marginLeft: 1 },
        deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

        overlayBg: { ...StyleSheet.absoluteFillObject, zIndex: 999, alignItems: 'center', justifyContent: 'center' },
        scanLine: { width: width * 0.8, height: 3, backgroundColor: T.goldPrimary, borderRadius: 2, shadowColor: T.goldPrimary, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5, marginVertical: 20 },
        overlayTitle: { color: T.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 20, letterSpacing: 0.5 },
        overlaySub: { color: T.textSecondary, fontSize: 12, marginTop: 6 },
    });
}
