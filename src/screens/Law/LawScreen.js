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
    ActivityIndicator,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { analyzeLegalCase } from '../../services/legalAiService';
import { LegalHistoryService } from '../../services/legalHistoryService';
import InsightPanel from './components/InsightPanel';
import { PermissionService } from '../../services/PermissionService';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// SERVICES moved to Supabase law_services table

const LAW_ICON_POOL = [
    // Hukuk & Adalet (Justice & Law)
    'scale-balance', 'gavel', 'book-open-page-variant', 'police-badge', 'handcuffs',
    'bank', 'town-hall', 'pillar', 'shield-account', 'shield-check',
    
    // Kurumsal & Profesyonel (Corporate & Professional)
    'briefcase', 'briefcase-variant', 'account-tie', 'account-tie-voice', 'tie',
    'office-building', 'domain', 'handshake', 'handshake-outline', 'badge-account',
    
    // Belgeler & Sözleşmeler (Documents & Contracts)
    'certificate', 'script', 'script-text', 'file-sign', 'signature',
    'file-document', 'folder-alert', 'text-box-search', 'clipboard-text', 'file-chart',
    
    // Gayrimenkul & İhtilaf (Real Estate & Disputes)
    'home-city', 'home-group', 'home-alert', 'key', 'scale-bathroom',
    
    // Ticari & Finans (Commercial & Finance)
    'currency-try', 'cash-multiple', 'chart-bar', 'chart-line', 'chart-pie',
    'percent', 'calculator', 'scale', 'magnify-scan', 'eye-check', 'fingerprint'
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

    // CMS States
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [adminModalVisible, setAdminModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editService, setEditService] = useState(null);
    const [formData, setFormData] = useState({ icon: '', label: '', desc_text: '', order_index: 0 });
    const [currentServicePage, setCurrentServicePage] = useState(0);

    // Input glow aura
    const auraOpacity = useRef(new Animated.Value(0)).current;
    const auraScale   = useRef(new Animated.Value(0.97)).current;

    useEffect(() => { 
        checkUserStatus(); 
        loadHistory();
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoadingServices(true);
        const { data, error } = await supabase.from('law_services').select('*').order('order_index', { ascending: true });
        if (!error && data) setServices(data);
        setLoadingServices(false);
    };

    const handleSaveService = async () => {
        if (!formData.label || !formData.icon || !formData.sample) {
            Alert.alert('Eksik', 'Lütfen başlık, ikon ve örnek prompt girin.');
            return;
        }
        try {
            if (editService) {
                const { error } = await supabase.from('law_services').update({
                    icon: formData.icon, label: formData.label, desc_text: formData.desc_text, sample: formData.sample, order_index: formData.order_index
                }).eq('id', editService.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('law_services').insert([{
                    icon: formData.icon, label: formData.label, desc_text: formData.desc_text, sample: formData.sample, order_index: formData.order_index
                }]);
                if (error) throw error;
            }
            setAdminModalVisible(false);
            loadServices();
        } catch (e) {
            Alert.alert('Hata', 'Kaydedilirken hata oluştu: ' + e.message);
        }
    };

    
    const moveService = async (index, direction) => {
        const newServices = [...services];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newServices.length) return;
        
        const temp = newServices[index];
        newServices[index] = newServices[targetIndex];
        newServices[targetIndex] = temp;
        setServices(newServices);
        
        try {
            await supabase.from('law_services').update({ order_index: index + 1 }).eq('id', newServices[index].id);
            await supabase.from('law_services').update({ order_index: targetIndex + 1 }).eq('id', newServices[targetIndex].id);
        } catch (e) {
            loadServices();
        }
    };

    const toggleServiceVisibility = async (service) => {
        const newStatus = !service.is_active;
        setServices(services.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s));
        await supabase.from('law_services').update({ is_active: newStatus }).eq('id', service.id);
    };

    const handleDeleteService = async (id) => {
        Alert.alert('Emin misiniz?', 'Hizmet kalıcı olarak silinecek.', [
            { text: 'Vazgeç', style: 'cancel' },
            { 
                text: 'Sil', 
                style: 'destructive',
                onPress: async () => {
                    await supabase.from('law_services').delete().eq('id', id);
                    setAdminModalVisible(false);
                    loadServices();
                }
            }
        ]);
    };

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
        if (srv.id === 'NEW') {
            setFormData({ icon: LAW_ICON_POOL[0], label: '', desc_text: '', order_index: services.length });
            setEditService(null);
            setAdminModalVisible(true);
            return;
        }
        if (!isEditMode) {
            navigation.navigate('ServiceRequest', { serviceTitle: srv.label, tableName: 'law_requests' });
        }
    };

    const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    const filteredServices = isEditMode ? services : services.filter(s => s.is_active !== false);
    let serviceChunks = chunkArray(filteredServices, 4);
    if (isEditMode && (filteredServices.length === 0 || filteredServices.length % 4 === 0)) {
        serviceChunks.push([]);
    }

    const handleServiceScroll = (e) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentServicePage(page);
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
                    {isAdmin && (
                        <TouchableOpacity 
                            style={[s.headerBtn, isEditMode && { borderColor: T.goldPrimary, backgroundColor: 'rgba(212,175,55,0.1)' }]}
                            onPress={() => setIsEditMode(!isEditMode)}
                        >
                            <MaterialCommunityIcons name={isEditMode ? "check-circle" : "cog-outline"} size={18} color={T.goldPrimary} />
                        </TouchableOpacity>
                    )}
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
                                <Text allowFontScaling={false} style={s.servSubtitle}>Hızlı erişim · {services.length} uzmanlık alanı</Text>
                            </View>
                            {isEditMode && <Text allowFontScaling={false} style={{ color: T.goldPrimary, fontSize: 10, fontWeight: 'bold' }}>DÜZENLEME MODU AKTİF</Text>}
                        </View>
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleServiceScroll} scrollEventThrottle={16} style={{ marginHorizontal: -16 }}>
                            {loadingServices ? (
                                <View style={{ width, alignItems: 'center', paddingVertical: 20 }}>
                                    <ActivityIndicator color={T.goldPrimary} />
                                </View>
                            ) : (
                                serviceChunks.map((chunk, chunkIndex) => (
                                    <View key={chunkIndex} style={s.servGridPage}>
                                        {chunk.map((srv, idxInPage) => {
                                            const globalIdx = chunkIndex * 4 + idxInPage;
                                            return (
                                            <TouchableOpacity 
                                                key={srv.id} 
                                                onPress={() => isEditMode ? (setEditService(srv), setFormData(srv), setAdminModalVisible(true)) : handleServicePress(srv)} 
                                                activeOpacity={0.82} 
                                                style={[s.servCard, isEditMode && srv.is_active === false && { opacity: 0.5 }]}
                                            >
                                                <LinearGradient colors={T.servCardBg} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                                                {isEditMode && (
                                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, zIndex: 10, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
                                                            <TouchableOpacity onPress={() => moveService(globalIdx, 'up')} disabled={globalIdx === 0}>
                                                                <MaterialCommunityIcons name="chevron-up" size={26} color={globalIdx === 0 ? '#666' : T.goldPrimary} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => moveService(globalIdx, 'down')} disabled={globalIdx === filteredServices.length - 1}>
                                                                <MaterialCommunityIcons name="chevron-down" size={26} color={globalIdx === filteredServices.length - 1 ? '#666' : T.goldPrimary} />
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', gap: 15 }}>
                                                            <TouchableOpacity onPress={() => toggleServiceVisibility(srv)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name={srv.is_active === false ? "eye-off" : "eye"} size={20} color={srv.is_active === false ? "#ef4444" : T.goldPrimary} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => handleDeleteService(srv.id)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                                <View style={s.servIconBox}>
                                                    <MaterialCommunityIcons name={srv.icon} size={26} color={T.goldPrimary} />
                                                </View>
                                                <Text allowFontScaling={false} style={s.servLabel}>{srv.label}</Text>
                                                <Text allowFontScaling={false} style={s.servDesc}>{srv.desc_text}</Text>
                                            </TouchableOpacity>
                                        )})}
                                        {isEditMode && chunkIndex === serviceChunks.length - 1 && chunk.length < 4 && (
                                            <TouchableOpacity 
                                                style={[s.servCard, { borderWidth: 2, borderColor: T.goldPrimary, borderStyle: 'dashed', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }]}
                                                onPress={() => { setEditService(null); setFormData({ icon: 'scale-balance', label: '', desc_text: '', sample: '', order_index: services.length + 1 }); setAdminModalVisible(true); }}
                                            >
                                                <MaterialCommunityIcons name="plus" size={32} color={T.goldPrimary} />
                                                <Text allowFontScaling={false} style={{ color: T.goldPrimary, fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>YENİ EKLE</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </ScrollView>
                        {serviceChunks.length > 1 && (
                            <View style={s.paginationContainer}>
                                {serviceChunks.map((_, idx) => (
                                    <View key={idx} style={[s.dot, idx === currentServicePage && { backgroundColor: T.goldPrimary, width: 20 }]} />
                                ))}
                            </View>
                        )}
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

            {/* ADMIN MODAL */}
            <Modal visible={adminModalVisible} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <LinearGradient colors={T.sheetBg} style={StyleSheet.absoluteFillObject} />
                        <View style={s.modalHeader}>
                            <Text allowFontScaling={false} style={s.modalTitle}>{editService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</Text>
                            <TouchableOpacity onPress={() => setAdminModalVisible(false)}>
                                <Ionicons name="close" size={24} color={T.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={s.modalScroll} keyboardShouldPersistTaps="handled">
                            <Text allowFontScaling={false} style={s.inputLabel}>İKON SEÇİN</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                contentContainerStyle={{ paddingVertical: 10, gap: 12, paddingHorizontal: 4 }}
                                style={{ marginBottom: 15 }}
                            >
                                {LAW_ICON_POOL.map(iconName => (
                                    <TouchableOpacity 
                                        key={iconName}
                                        style={[
                                            { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 }, 
                                            { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5', borderColor: formData.icon === iconName ? T.goldPrimary : 'transparent' }
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                                    >
                                        <MaterialCommunityIcons name={iconName} size={24} color={formData.icon === iconName ? T.goldPrimary : T.textMuted} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            
                            <Text allowFontScaling={false} style={s.inputLabel}>Başlık</Text>
                            <TextInput style={s.adminInput} value={formData.label} onChangeText={t => setFormData({...formData, label: t})} placeholder="Sözleşme Kontrolü" placeholderTextColor={T.textMuted} />
                            
                            <Text allowFontScaling={false} style={s.inputLabel}>Alt Açıklama</Text>
                            <TextInput style={s.adminInput} value={formData.desc_text} onChangeText={t => setFormData({...formData, desc_text: t})} placeholder="Taşeron ve tedarikçi sözleşmeleri" placeholderTextColor={T.textMuted} />
                            

                            <Text allowFontScaling={false} style={s.inputLabel}>Sıralama İndeksi</Text>
                            <TextInput style={s.adminInput} keyboardType="numeric" value={String(formData.order_index)} onChangeText={t => setFormData({...formData, order_index: parseInt(t)||0})} />

                            <TouchableOpacity onPress={handleSaveService} style={s.saveBtn}>
                                <Text allowFontScaling={false} style={s.saveBtnText}>KAYDET</Text>
                            </TouchableOpacity>

                            {editService && (
                                <TouchableOpacity onPress={() => handleDeleteService(editService.id)} style={s.deleteAdminBtn}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={T.danger} />
                                    <Text allowFontScaling={false} style={s.deleteAdminBtnText}>HİZMETİ SİL</Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            
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

        // CMS Styles
        adminEditBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.goldPrimary + '22', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: T.goldPrimary + '44' },
        adminEditBtnText: { color: T.goldPrimary, fontSize: 11, fontWeight: '800', marginLeft: 4 },
        servGridPage: { width: width, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
        paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.goldPrimary + '44' },
        adminInlineEditBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContent: { height: height * 0.75, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: T.goldPrimary + '44' },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: T.goldPrimary + '22' },
        modalTitle: { color: T.goldPrimary, fontSize: 18, fontWeight: '900' },
        modalScroll: { padding: 20 },
        inputLabel: { color: T.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6, marginLeft: 4 },
        adminInput: { backgroundColor: T.inputBg, color: T.textPrimary, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: T.cardBorder },
        saveBtn: { backgroundColor: T.goldPrimary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
        saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
        deleteAdminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: T.danger + '44', backgroundColor: T.danger + '11' },
        deleteAdminBtnText: { color: T.danger, fontSize: 13, fontWeight: '800', marginLeft: 6 },
    });
}
