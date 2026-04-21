/**
 * LawScreen.js — Ultra-Premium AI Legal Shield
 * "The Zero-Friction Interface" — Kategori seçtirmiyoruz, sorunu anlıyoruz.
 */
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
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
import AiOraclePulse from './components/AiOraclePulse';
import InsightPanel from './components/InsightPanel';
import SOSBanner from './components/SOSBanner';
import { PermissionService } from '../../services/PermissionService';

const { width, height } = Dimensions.get('window');

const GOLD      = '#D4AF37';
const GOLD_DARK = '#FF9100';
const DANGER    = '#EF4444';
const ORANGE    = '#F97316';
const GREEN     = '#10B981';

// ─── ANALYZING OVERLAY ───────────────────────────────────────────────────────
function AnalyzingOverlay({ visible }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const ring1   = useRef(new Animated.Value(0.7)).current;
    const ring2   = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
            Animated.loop(Animated.sequence([
                Animated.timing(ring1, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                Animated.timing(ring1, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
            ])).start();
            Animated.loop(Animated.sequence([
                Animated.delay(500),
                Animated.timing(ring2, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                Animated.timing(ring2, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
            ])).start();
        } else {
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[s.overlayBg, { opacity }]}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={s.overlayInner}>
                <Animated.View style={[s.ring, s.ring1, { transform: [{ scale: ring1 }] }]} />
                <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: ring2 }] }]} />
                <MaterialCommunityIcons name="scale-balance" size={42} color={GOLD} />
                <Text allowFontScaling={false} style={s.overlayTitle}>Analiz Ediliyor…</Text>
                <Text allowFontScaling={false} style={s.overlaySub}>Şantiye dili → Hukuki vaka</Text>
            </View>
        </Animated.View>
    );
}

// ─── WAVE BARS (voice) ───────────────────────────────────────────────────────
function WaveBar({ delay }) {
    const h = useRef(new Animated.Value(4)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(h, { toValue: 4 + Math.random() * 20, duration: 300 + delay, useNativeDriver: false }),
            Animated.timing(h, { toValue: 4, duration: 300 + delay, useNativeDriver: false }),
        ])).start();
    }, []);
    return <Animated.View style={[s.waveBar, { height: h }]} />;
}

// ─── RECENT CASE CARD ────────────────────────────────────────────────────────
function RecentCard({ cat, score, time, onPress, onDelete }) {
    const c = score >= 8 ? DANGER : score >= 5 ? ORANGE : GREEN;
    return (
        <TouchableOpacity style={s.recentCard} onPress={onPress} activeOpacity={0.85}>
            <LinearGradient 
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']} 
                style={StyleSheet.absoluteFillObject} 
                borderRadius={18} 
            />
            <View style={s.recentIconBox}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={GOLD} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text allowFontScaling={false} style={s.recentCat} numberOfLines={1}>{cat}</Text>
                <Text allowFontScaling={false} style={s.recentTime}>{time}</Text>
            </View>
            {/* Score box */}
            <View style={[s.scoreTag, { borderColor: c + '44' }]}>
                <Text allowFontScaling={false} style={[s.scoreTagNum, { color: c }]}>{score}</Text>
                <Text allowFontScaling={false} style={[s.scoreTagDen, { color: c + '88' }]}>/10</Text>
            </View>
            {/* Delete btn */}
            <TouchableOpacity style={s.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
                <MaterialCommunityIcons name="trash-can-outline" size={19} color="#EF4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function LawScreen() {
    const navigation = useNavigation();
    const scrollRef    = useRef(null);
    const inputWrapRef = useRef(null);

    const [inputText, setInputText]           = useState('');
    const [isRecording, setIsRecording]       = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [attachedFile, setAttachedFile]     = useState(null);
    const [isAnalyzing, setIsAnalyzing]       = useState(false);
    const [caseData, setCaseData]             = useState(null);
    const [panelVisible, setPanelVisible]     = useState(false);
    const [isAdmin, setIsAdmin]               = useState(false);
    const [isLawyer, setIsLawyer]             = useState(false);
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

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

    const [hasLawAccess, setHasLawAccess] = useState(false);

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

    const handleVoice = () => {
        if (isRecording) { setIsRecording(false); return; }
        setIsRecording(true);
        setTimeout(() => {
            setInputText(t => (t ? t + ' ' : '') + 'Hakediş 3 aydır yatmıyor, üstelik kesinti de yapıyorlar.');
            setIsRecording(false);
        }, 3000);
    };

    const handleSOS = () => {
        const sosText = 'ACİL: Şantiyede iş kazası gerçekleşti, işçi yaralı ve SGK baskını var, mühürlendi.';
        setInputText(sosText);
        setTimeout(() => triggerAnalysis(sosText), 300);
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
                // Dosyayı base64 olarak oku
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
                fileData // Yeni multimodal veri
            });

            if (result.success) {
                // Veritabanına kaydet
                await LegalHistoryService.saveAnalysis(result.data, text || inputText);
                loadHistory(); // Listeyi tazele

                setCaseData(result.data);
                setIsAnalyzing(false);
                // Sonuç ekranına yönlendir
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


    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" backgroundColor="#070707" />

            {/* Deep background */}
            <View style={s.bgBase} />
            {/* Subtle gold ambient top */}
            <LinearGradient
                colors={['rgba(212,175,55,0.06)', 'transparent']}
                style={s.bgAmbient}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                pointerEvents="none"
            />

            <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={s.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={true}
                    >
                        {/* ── HEADER ── */}
                        <View style={s.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
                                <Ionicons name="arrow-back" size={18} color="#fff" />
                            </TouchableOpacity>
                            <View style={s.headerCenter}>
                                <Text allowFontScaling={false} style={s.headerEye}>⚖️  CEFTE ŞEF</Text>
                                <Text allowFontScaling={false} style={s.headerSub}>Hukuki Çözüm Merkezi</Text>
                            </View>
                            <TouchableOpacity
                                style={[s.headerBtn, (hasLawAccess || isAdmin) && s.headerBtnActive]}
                                onPress={() => {
                                    if (isAdmin || hasLawAccess) navigation.navigate('LawProvider');
                                    else Alert.alert('Yetkisiz Erişim', 'Yalnızca onaylı avukat hesapları bu panele erişebilir.');
                                }}
                            >
                                <MaterialCommunityIcons name="scale-balance" size={18} color={isAdmin || hasLawAccess ? GOLD : '#555'} />
                            </TouchableOpacity>
                        </View>

                        {/* ── SOS BANNER ── */}
                        <SOSBanner onPress={handleSOS} />

                        {/* ── HERO ── */}
                        <View style={s.heroBlock}>
                            <Text allowFontScaling={false} style={s.heroEye}>YAPAY ZEKA DESTEKLİ</Text>
                            <Text allowFontScaling={false} style={s.heroTitle} numberOfLines={1} adjustsFontSizeToFit>Hukuki Kalkanınız</Text>
                        </View>

                        {/* ── AI ORACLE PULSE ── */}
                        <View style={s.oracleWrap}>
                            <AiOraclePulse />
                            <Text allowFontScaling={false} style={s.oracleLabel}>AI Analiz Motoru — Aktif</Text>
                        </View>

                        {/* ── GLASSMORPHISM INPUT ── */}
                        <View ref={inputWrapRef} style={s.inputWrap}>
                            {/* Glow aura behind card */}
                            <Animated.View
                                style={[s.inputGlow, { opacity: auraOpacity, transform: [{ scale: auraScale }] }]}
                                pointerEvents="none"
                            />

                            <View style={s.glassCard}>
                                {/* Gold hairline top border */}
                                <LinearGradient
                                    colors={[GOLD + '00', GOLD + 'AA', GOLD + '00']}
                                    style={s.glassBorderTop}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                />

                                <TextInput allowFontScaling={false}
                                    style={s.input}
                                    placeholder={'Probleminizi buraya yazın, ses veya belge yükleyin…'}
                                    placeholderTextColor="rgba(255,255,255,0.25)"
                                    multiline
                                    value={inputText}
                                    onChangeText={setInputText}
                                    onFocus={() => {
                                        setIsInputFocused(true);
                                        // Scroll to bring input into view above the keyboard
                                        setTimeout(() => {
                                            scrollRef.current?.scrollTo({ y: 320, animated: true });
                                        }, 100);
                                    }}
                                    onBlur={() => setIsInputFocused(false)}
                                    inputAccessoryViewID="LawDone"
                                    textAlignVertical="top"
                                    selectionColor={GOLD}
                                    cursorColor={GOLD}
                                />

                                {/* Bottom action row */}
                                <View style={s.inputFooter}>
                                    {/* Wave / char */}
                                    {isRecording ? (
                                        <View style={s.waveRow}>
                                            <WaveBar delay={0} />
                                            <WaveBar delay={100} />
                                            <WaveBar delay={200} />
                                            <WaveBar delay={150} />
                                            <WaveBar delay={80} />
                                            <Text allowFontScaling={false} style={s.recLabel}>Kaydediliyor…</Text>
                                        </View>
                                    ) : (
                                        <Text allowFontScaling={false} style={s.charCount}>{inputText.length > 0 ? `${inputText.length} karakter` : 'Metin, ses veya belge'}</Text>
                                    )}
                                    <View style={s.footerBtns}>
                                        {/* Attach */}
                                        <TouchableOpacity style={[s.iconBtn, attachedFile && s.iconBtnActive]} onPress={handlePickFile}>
                                            <FontAwesome5 name="paperclip" size={15} color={attachedFile ? GOLD : 'rgba(255,255,255,0.4)'} />
                                        </TouchableOpacity>
                                        {/* Mic */}
                                        <TouchableOpacity
                                            style={[s.iconBtn, s.micBtn, isRecording && s.micActive]}
                                            onPress={handleVoice}
                                        >
                                            <Ionicons
                                                name={isRecording ? 'stop' : 'mic'}
                                                size={16}
                                                color={isRecording ? '#000' : GOLD}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Attached file chip */}
                            {attachedFile && (
                                <View style={s.fileChip}>
                                    <FontAwesome5 name="file-pdf" size={11} color={GOLD} />
                                    <Text allowFontScaling={false} style={s.fileChipText} numberOfLines={1}>{attachedFile.name}</Text>
                                    <TouchableOpacity onPress={() => setAttachedFile(null)}>
                                        <Ionicons name="close-circle" size={15} color="#555" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* ── CTA BUTTON ── */}
                        <View style={s.ctaWrap}>
                            <TouchableOpacity style={s.ctaBtn} activeOpacity={0.87} onPress={() => triggerAnalysis(inputText)}>
                                <LinearGradient
                                    colors={[GOLD, GOLD_DARK]}
                                    style={s.ctaGrad}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <MaterialCommunityIcons name="magnify-scan" size={20} color="#000" style={{ opacity: 0.85 }} />
                                    <Text allowFontScaling={false} style={s.ctaText}>ANALİZ ET VE AVUKATA BAĞLAN</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* ── RECENT CASES ── */}
                        <View style={s.recentSection}>
                            <View style={s.premiumHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.premiumTitle}>SON ANALİZLERİM</Text>
                                    <Text allowFontScaling={false} style={s.premiumSub}>Hukuki vaka geçmişiniz ve raporlarınız</Text>
                                </View>
                                <MaterialCommunityIcons name="history" size={24} color={GOLD + '66'} />
                            </View>

                            {loadingHistory ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <ActivityIndicator color={GOLD} />
                                </View>
                            ) : recentAnalyses.length === 0 ? (
                                <View style={s.emptyHistory}>
                                    <MaterialCommunityIcons name="text-box-search-outline" size={32} color="#222" />
                                    <Text allowFontScaling={false} style={s.emptyHistoryText}>Henüz bir analiziniz bulunmuyor.</Text>
                                </View>
                            ) : (
                                <>
                                    {recentAnalyses.map((item) => (
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
                                    ))}
                                    
                                    <TouchableOpacity style={s.viewAllBtn} onPress={() => Alert.alert('Çok Yakında', 'Tüm analizlerinizin listelendiği gelişmiş geçmiş sayfası yakında aktif edilecek.')}>
                                        <Text allowFontScaling={false} style={s.viewAllText}>TÜMÜNÜ GÖR</Text>
                                        <LinearGradient 
                                            colors={['transparent', GOLD + '22', 'transparent']} 
                                            style={StyleSheet.absoluteFillObject} 
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>


            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="LawDone">
                    <View style={s.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss}>
                            <Text allowFontScaling={false} style={s.accessoryText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}

            <AnalyzingOverlay visible={isAnalyzing} />
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
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#070707' },
    bgBase: { ...StyleSheet.absoluteFillObject, backgroundColor: '#070707' },
    bgAmbient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 },
    scrollContent: { paddingBottom: 48 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18,
    },
    headerBtn: {
        width: 40, height: 40, borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerBtnActive: { borderColor: GOLD + '55' },
    headerCenter: { alignItems: 'center' },
    headerEye: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },
    headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2, letterSpacing: 0.3 },

    // Hero
    heroBlock: { paddingHorizontal: 24, marginBottom: 0 },
    heroEye: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
    heroTitle: {
        color: '#ffffff',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: -0.5,
        lineHeight: 44,
    },

    // Oracle
    oracleWrap: { alignItems: 'center', marginVertical: 10, paddingBottom: 8 },
    oracleLabel: { color: 'rgba(212,175,55,0.5)', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 8 },

    // Input
    inputWrap: { paddingHorizontal: 20, marginBottom: 16 },
    inputGlow: {
        position: 'absolute',
        top: -10, left: 10, right: 10, bottom: -10,
        borderRadius: 24,
        backgroundColor: 'transparent',
        shadowColor: GOLD,
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 15,
    },
    glassCard: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.20)',
        overflow: 'hidden',
        backgroundColor: '#141414',
        minHeight: 170,
    },
    glassBorderTop: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 1,
        opacity: 0.6,
    },
    input: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 24,
        padding: 18,
        paddingTop: 16,
        paddingBottom: 8,
        minHeight: 130,
        textAlignVertical: 'top',
        letterSpacing: 0.2,
    },
    inputFooter: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4, gap: 8,
    },
    charCount: { color: 'rgba(255,255,255,0.2)', fontSize: 11, flex: 1 },
    waveRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
    waveBar: { width: 3, borderRadius: 2, backgroundColor: GOLD },
    recLabel: { color: DANGER, fontSize: 11, fontWeight: '700', marginLeft: 4 },
    footerBtns: { flexDirection: 'row', gap: 8 },
    iconBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
        alignItems: 'center', justifyContent: 'center',
    },
    iconBtnActive: { borderColor: GOLD + '66' },
    micBtn: { borderColor: 'rgba(212,175,55,0.3)' },
    micActive: { backgroundColor: GOLD, borderColor: GOLD },

    // File chip
    fileChip: {
        flexDirection: 'row', alignItems: 'center', gap: 7,
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
        borderWidth: 1, borderColor: GOLD + '33', marginTop: 10,
    },
    fileChipText: { color: 'rgba(212,175,55,0.9)', fontSize: 12, flex: 1 },

    // CTA
    ctaWrap: { paddingHorizontal: 20, marginBottom: 32 },
    ctaBtn: {
        borderRadius: 18, overflow: 'hidden', height: 60,
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
    },
    ctaGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    ctaText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },

    // Recent section
    recentSection: { paddingHorizontal: 20, marginTop: 10 },
    premiumHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: GOLD,
        paddingLeft: 12
    },
    premiumTitle: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: '900', 
        letterSpacing: 1.5,
        textShadowColor: GOLD + '44',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10
    },
    premiumSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, fontWeight: '500' },

    recentCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 18, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden'
    },
    recentIconBox: {
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: GOLD + '15',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: GOLD + '33'
    },
    recentCat: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
    recentTime: { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
    
    scoreTag: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, borderWidth: 1,
        marginRight: 8
    },
    scoreTagNum: { fontSize: 13, fontWeight: '900' },
    scoreTagDen: { fontSize: 8, fontWeight: '600', marginLeft: 1 },
    
    deleteBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 8
    },

    viewAllBtn: {
        height: 48, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 8, marginBottom: 40,
        overflow: 'hidden'
    },
    viewAllText: { color: GOLD, fontSize: 11, fontWeight: '900', letterSpacing: 2 },

    emptyHistory: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyHistoryText: { color: '#333', fontSize: 13, fontWeight: '600' },

    // Analyzing overlay
    overlayBg: { ...StyleSheet.absoluteFillObject, zIndex: 999, alignItems: 'center', justifyContent: 'center' },
    overlayInner: { alignItems: 'center' },
    ring: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1 },
    ring1: { borderColor: GOLD + '55' },
    ring2: { borderColor: GOLD + '30', width: 140, height: 140, borderRadius: 70 },
    overlayTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 70, letterSpacing: 0.5 },
    overlaySub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 },

    // Accessory
    accessory: { backgroundColor: '#111', padding: 10, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#222' },
    accessoryText: { color: GOLD, fontWeight: '700', fontSize: 14 },
});
