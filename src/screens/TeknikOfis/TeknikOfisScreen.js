/**
 * TeknikOfisScreen.js
 * Ultra-Premium AI Teknik Ofis Asistanı
 * Wireframe Animation · Fiyat Ticker · Hizmet Grid · Mühendis Eşleşme
 */
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PermissionService } from '../../services/PermissionService';
import {
    ActivityIndicator, Alert, Animated, Dimensions, Modal, Easing, Keyboard, ScrollView,
    StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// ─── MOCK PRICES (replace with real API) ────────────────────────────────────
const PRICES = [
    { label: 'Nervürlü Demir', value: '₺28.40', unit: '/kg', trend: 'up' },
    { label: 'Beton C30',      value: '₺3.850', unit: '/m³', trend: 'up' },
    { label: 'Çimento (50kg)', value: '₺285',   unit: '/torba', trend: 'down' },
    { label: 'Hazır Beton',    value: '₺3.650', unit: '/m³', trend: 'up' },
];

// ─── TEKNIK_ICON_POOL ───────────────────────────────────────────────────
const TEKNIK_ICON_POOL = [
    'hammer-wrench', 'ruler-square', 'ruler-square-compass', 'compass-outline', 'calculator-variant-outline',
    'math-compass', 'cog-outline', 'cogs', 'engine-outline', 'factory',
    'draw', 'draw-pen', 'pencil-ruler', 'floor-plan', 'office-building',
    'city', 'home-city-outline', 'home-modern', 'wall', 'stairs',
    'file-document-edit-outline', 'file-table-outline', 'clipboard-list-outline', 'clipboard-check-outline',
    'chart-gantt', 'chart-timeline', 'calendar-clock-outline', 'account-hard-hat', 'worker',
    'map-search-outline', 'map-marker-radius', 'crosshairs-gps', 'tape-measure', 'ruler',
    'crane', 'excavator', 'truck-flatbed', 'drone', 'camera-metering-center',
    'water-pump', 'pipe-wrench', 'lightning-bolt-outline', 'flash-outline', 'solar-power',
    'car-battery', 'wifi-strength-4', 'router-wireless', 'server-network'
];

// ─── EXPERTS (8 specialties) ────────────────────────────────────────────────
const ALL_EXPERTS = [
    { id: 'e1', name: 'Müh. Ahmet Yılmaz',  title: 'İnşaat Mühendisi',    color: '#92400E', initials: 'AY', icon: 'hammer-wrench',
      tags: ['insaat', 'yapi', 'beton', 'demir', 'statik', 'betonarme', 'deprem'] },
    { id: 'e2', name: 'Mim. Selin Arslan',  title: 'Mimar',                color: '#065F46', initials: 'SA', icon: 'home-city-outline',
      tags: ['mimar', 'mimari', 'proje', 'cizim', 'ruhsat', 'iskan', 'bina', 'konut', 'kentsel', 'plan'] },
    { id: 'e3', name: 'Müh. Kemal Demir',   title: 'Harita Mühendisi',    color: '#1E3A5F', initials: 'KD', icon: 'map-marker-radius',
      tags: ['harita', 'arsa', 'parsel', 'imar', 'tapu', 'kadastro', 'koordinat', 'ada'] },
    { id: 'e4', name: 'Uz. Elif Çelik',     title: 'Hakediş Uzmanı',      color: '#4A1D96', initials: 'EÇ', icon: 'file-sign',
      tags: ['hakedis', 'metraj', 'poz', 'maliyet', 'teklif', 'yaklasik'] },
    { id: 'e5', name: 'Müh. Can Aydoğan',   title: 'Hidrolik Müh.',       color: '#0C4A6E', initials: 'CA', icon: 'water-pump',
      tags: ['su', 'kanal', 'drenaj', 'hidrolik', 'boru', 'pompa', 'atiksu', 'yagmur'] },
    { id: 'e6', name: 'Müh. Deniz Şahin',   title: 'Jeoteknik Müh.',      color: '#422006', initials: 'DŞ', icon: 'terrain',
      tags: ['zemin', 'jeoteknik', 'sondaj', 'kazik', 'temel', 'sivi', 'deprem'] },
    { id: 'e7', name: 'Müh. Orhan Kılıç',   title: 'Makina Mühendisi',    color: '#1A3A1A', initials: 'OK', icon: 'cog-outline',
      tags: ['mekanik', 'makina', 'hvac', 'iklimlendirme', 'yangin', 'tesisat'] },
    { id: 'e8', name: 'Müh. Mert Koç',      title: 'Elektrik Mühendisi',  color: '#1E1B4B', initials: 'MK', icon: 'lightning-bolt',
      tags: ['elektrik', 'trafo', 'panel', 'aydinlatma', 'enerji', 'otomasyon'] },
];

function detectExpertType(text) {
    if (!text) return [ALL_EXPERTS[0], ALL_EXPERTS[1]];
    const lower = text.toLowerCase();
    const scores = {};
    ALL_EXPERTS.forEach(e => { scores[e.id] = e.tags.filter(t => lower.includes(t)).length; });
    const sorted = ALL_EXPERTS.slice().sort((a, b) => scores[b.id] - scores[a.id]);
    const top = sorted.filter(e => scores[e.id] > 0).slice(0, 2);
    return top.length >= 1 ? top : [ALL_EXPERTS[1], ALL_EXPERTS[0]];
}

function generateAISummary(text) {
    if (!text || text.trim().length < 5) return { title: 'Genel Teknik Danışmanlık', bullets: ['Projeniz analiz edildi', 'Uzman desteği önerilmektedir'], urgency: 'normal' };
    const l = text.toLowerCase();
    if (l.includes('kentsel') || l.includes('dönüşüm')) return { title: 'Kentsel Dönüşüm & Mimari Proje', bullets: ['Kentsel dönüşüm kapsamı analiz edildi', 'Ruhsat ve iskan süreci tespiti gerekli', 'Bölge imar durumu kontrolü önerildi'], urgency: 'high' };
    if (l.includes('zemin') || l.includes('temel') || l.includes('kazık')) return { title: 'Zemin & Temel Problemi', bullets: ['Zemin oturma riski tespit edildi', 'Jeoteknik rapor incelemesi şart', 'Sondaj verisi değerlendirmesi önerildi'], urgency: 'high' };
    if (l.includes('hakedis') || l.includes('poz') || l.includes('metraj')) return { title: 'Hakediş & Metraj Analizi', bullets: ['Poz uyumsuzlukları tespit edildi', '%12 metraj sapması gözlemlendi', 'Revize hakediş hazırlanması önerildi'], urgency: 'normal' };
    if (l.includes('su') || l.includes('drenaj') || l.includes('boru')) return { title: 'Hidrolik & Drenaj Sorunu', bullets: ['Su tahliye yetersizliği tespit edildi', 'Drenaj sistemi analizi gerekli', 'Boru çapı hesabı yeniden yapılmalı'], urgency: 'normal' };
    if (l.includes('mimar') || l.includes('proje') || l.includes('cizim') || l.includes('çizim')) return { title: 'Mimari Proje & Çizim', bullets: ['Proje kapsamı incelendi', 'Teknik çizim revizyonu gerekli', 'Röleve ve restorasyon analizi yapıldı'], urgency: 'normal' };
    return { title: 'Teknik Proje Analizi', bullets: ['Problem alanı tespit edildi', 'Uzman mühendis incelemesi gerekli', 'Detaylı rapor hazırlanacak'], urgency: 'normal' };
}

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
        engCardBg: isDark ? '#111111' : theme.surfaceSecondary || '#F9F6F0',
        engCardBorder: isDark ? '#222222' : theme.border,
        infoFieldBg: isDark ? '#111111' : theme.surfaceSecondary || '#F9F6F0',
        infoFieldBorder: isDark ? '#222222' : theme.border,
        summaryCardBg: isDark ? '#111111' : theme.surfaceSecondary || '#F9F6F0',
        summaryCardBorder: isDark ? '#222222' : theme.border,
        projNoCardBg: isDark ? '#111111' : theme.surfaceElevated || '#FFFFFF',
        projNoCardBorder: isDark ? '#222222' : theme.border,
        tickerWrap: isDark ? '#0e0e0e' : theme.background,
        tickerBorder: isDark ? '#1a1a1a' : theme.border,
        handleBg: isDark ? '#333333' : '#DDDDDD',
        iconBoxBg: isDark ? '#181818' : theme.iconBg || '#F9F6F0',
        overlayBg: isDark ? 'rgba(0,0,0,0.88)' : 'rgba(253,251,247,0.95)',
        goldTint: isDark ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.05)',
        white: '#FFFFFF',
        black: '#000000',
    };
}

// ─── PRICE TICKER ────────────────────────────────────────────────────────────
function PriceTicker() {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const t = getTStyles(T, isDarkMode);
    const scrollX = useRef(new Animated.Value(0)).current;
    const totalWidth = PRICES.length * 160;

    useEffect(() => {
        Animated.loop(
            Animated.timing(scrollX, {
                toValue: -totalWidth,
                duration: PRICES.length * 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const items = [...PRICES, ...PRICES];

    return (
        <View style={t.tickerWrap}>
            <View style={t.tickerDot} />
            <Text allowFontScaling={false} style={t.tickerLive}>CANLI</Text>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: scrollX }] }}>
                    {items.map((p, i) => (
                        <View key={i} style={t.tickerItem}>
                            <Text allowFontScaling={false} style={t.tickerLabel}>{p.label}</Text>
                            <Text allowFontScaling={false} style={[t.tickerValue, { color: p.trend === 'up' ? '#F97316' : T.green }]}>
                                {p.value}<Text style={t.tickerUnit}>{p.unit}</Text>
                            </Text>
                            {p.trend === 'up'
                                ? <MaterialCommunityIcons name="trending-up" size={12} color="#F97316" />
                                : <MaterialCommunityIcons name="trending-down" size={12} color={T.green} />}
                        </View>
                    ))}
                </Animated.View>
            </View>

            
        </View>
    );
}

// ─── WIREFRAME ANIMATION ─────────────────────────────────────────────────────
function WireframeOrb() {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const w = getWStyles(T, isDarkMode);
    
    const rotate  = useRef(new Animated.Value(0)).current;
    const rotate2 = useRef(new Animated.Value(0)).current;
    const pulse   = useRef(new Animated.Value(0.95)).current;
    const glow    = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(Animated.timing(rotate,  { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })).start();
        Animated.loop(Animated.timing(rotate2, { toValue: 1, duration: 8000,  easing: Easing.linear, useNativeDriver: true })).start();
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0.95, duration: 2000, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
        ])).start();
    }, []);

    const spin1 = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const spin2 = rotate2.interpolate({ inputRange: [0, 1], outputRange: ['60deg', '420deg'] });

    return (
        <Animated.View style={[w.orbContainer, { transform: [{ scale: pulse }] }]}>
            <Animated.View style={[w.halo, w.halo1, { opacity: glow }]} />
            <Animated.View style={[w.halo, w.halo2, { opacity: Animated.multiply(glow, 0.6) }]} />
            <Animated.View style={[w.ring, w.ringOuter, { transform: [{ rotate: spin1 }] }]} />
            <Animated.View style={[w.ring, w.ringMid, { transform: [{ rotate: spin2 }] }]} />
            <Animated.View style={[w.ring, w.ringInner, { transform: [{ rotate: spin1 }] }]} />
            <View style={w.core}>
                <LinearGradient colors={[T.goldPrimary + 'CC', T.orange + 'AA', '#80400022']} style={w.coreGrad} />
                <MaterialCommunityIcons name="office-building-cog" size={28} color={T.goldPrimary} />
            </View>
            {[0, 90, 180, 270].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const center = 62.5; // Half of orbContainer (125/2)
                const r = 57.5; // ringOuter radius / 2 (115/2)
                return (
                    <View key={i} style={[w.orbitDot, { left: center + r * Math.cos(rad) - 3.5, top: center + r * Math.sin(rad) - 3.5 }]} />
                );
            })}
        </Animated.View>
    );
}

// ─── ANALYSIS LOADING OVERLAY ────────────────────────────────────────────────
function AnalyzingOverlay({ visible }) {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const opacity = useRef(new Animated.Value(0)).current;
    const scanY   = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            Animated.loop(Animated.sequence([
                Animated.timing(scanY, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(scanY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])).start();
        } else {
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    }, [visible]);

    const translateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.6] });

    if (!visible) return null;
    return (
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity, backgroundColor: T.overlayBg, zIndex: 99, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, transform: [{ translateY }] }}>
                <LinearGradient colors={['transparent', T.goldPrimary + 'CC', T.goldPrimary, T.goldPrimary + 'CC', 'transparent']} style={{ height: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </Animated.View>
            <MaterialCommunityIcons name="cog-sync-outline" size={52} color={T.goldPrimary} />
            <Text allowFontScaling={false} style={{ color: T.goldPrimary, fontSize: 14, fontWeight: '800', marginTop: 20, letterSpacing: 2 }}>TEKNİK ANALİZ YAPILIYOR</Text>
            <Text allowFontScaling={false} style={{ color: T.textSecondary, fontSize: 12, marginTop: 8 }}>AI Mühendislik Motoru · Lütfen Bekleyin...</Text>
        </Animated.View>
    );
}

// ─── RESULT BOTTOM SHEET (3-Phase: summary → matched → done) ─────────────────
function ResultSheet({ visible, onClose, onGoHome, inputText }) {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const r = getRStyles(T, isDarkMode);
    const slideY = useRef(new Animated.Value(height)).current;
    const aiSummary      = generateAISummary(inputText);
    const matchedExperts = detectExpertType(inputText);

    const [phase, setPhase]           = useState('summary');
    const [selectedExpert, setExpert] = useState(null);
    const projNo = `#TK-${Math.floor(10000 + Math.random() * 89999)}`;

    useEffect(() => { if (visible) setPhase('summary'); }, [visible]);

    useEffect(() => {
        Animated.spring(slideY, {
            toValue: visible ? 0 : height,
            friction: 8, tension: 60,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const handleConnect = (expert) => {
        setExpert(expert);
        setPhase('done');
    };

    return (
        <Animated.View style={[r.sheet, { transform: [{ translateY: slideY }] }]}>
            <LinearGradient colors={T.sheetBg} style={StyleSheet.absoluteFillObject} borderTopLeftRadius={28} borderTopRightRadius={28} />
            <View style={r.handle} />
            <LinearGradient colors={T.sheetTopBorder} style={r.topBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                {/* ── PHASE 1: AI SUMMARY CONFIRMATION ── */}
                {phase === 'summary' && (
                    <>
                        <View style={r.scoreRow}>
                            <View style={r.scoreBadge}>
                                <Text allowFontScaling={false} style={r.scoreNum}>98%</Text>
                                <Text allowFontScaling={false} style={r.scoreLabel}>DOĞRULUK</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text allowFontScaling={false} style={r.scoreTitle}>AI Analiz Tamamlandı</Text>
                                {aiSummary.urgency === 'high' && (
                                    <View style={r.urgencyBadge}>
                                        <MaterialCommunityIcons name="alert" size={10} color="#000" />
                                        <Text allowFontScaling={false} style={r.urgencyText}>ÖNCELİKLİ</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Text allowFontScaling={false} style={r.sectionLabel}>🤖 ANALİZ ÖZETİ</Text>
                        <View style={r.summaryCard}>
                            <Text allowFontScaling={false} style={r.summaryTitle}>{aiSummary.title}</Text>
                            {aiSummary.bullets.map((b, i) => (
                                <View key={i} style={r.bulletRow}>
                                    <View style={r.bulletDot} />
                                    <Text allowFontScaling={false} style={r.bulletText}>{b}</Text>
                                </View>
                            ))}
                        </View>

                        <Text allowFontScaling={false} style={[r.sectionLabel, { marginTop: 20 }]}>✅ ANALİZİ DOĞRU ANLADIK MI?</Text>
                        <Text allowFontScaling={false} style={r.confirmHint}>Evet diyorsanız sizin için en uygun uzmanı eşleştireceğiz.</Text>

                        <TouchableOpacity onPress={() => setPhase('matched')} activeOpacity={0.88} style={r.phaseBtn}>
                            <LinearGradient colors={[T.goldPrimary, T.orange]} style={r.phaseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#000" />
                                <Text allowFontScaling={false} style={r.phaseBtnText}>EVET, UZMAN EŞLEŞTİR</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={r.retryBtn}>
                            <Text allowFontScaling={false} style={r.retryText}>Hayır, yeniden anlat</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* ── PHASE 2: EXPERT MATCHING ── */}
                {phase === 'matched' && (
                    <>
                        <View style={r.phaseHeader}>
                            <MaterialCommunityIcons name="account-search-outline" size={26} color={T.goldPrimary} />
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text allowFontScaling={false} style={r.phaseTitle}>En Uygun Uzmanlar</Text>
                                <Text allowFontScaling={false} style={r.phaseSubtitle}>Analizinize göre eşleştirilen profesyoneller</Text>
                            </View>
                        </View>

                        <View style={r.summaryChip}>
                            <MaterialCommunityIcons name="robot-outline" size={13} color={T.goldPrimary} />
                            <Text allowFontScaling={false} style={r.summaryChipText} numberOfLines={1}>{aiSummary.title}</Text>
                        </View>

                        <Text allowFontScaling={false} style={r.sectionLabel}>👷 EŞLEŞTİRİLEN UZMANLAR</Text>
                        {matchedExperts.map(eng => (
                            <TouchableOpacity key={eng.id} onPress={() => handleConnect(eng)} activeOpacity={0.85}>
                                <View style={r.engCard}>
                                    <LinearGradient colors={[eng.color, T.engCardBg]} style={r.engAvatar}>
                                        <Text allowFontScaling={false} style={r.engInitials}>{eng.initials}</Text>
                                    </LinearGradient>
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text allowFontScaling={false} style={r.engName}>{eng.name}</Text>
                                        <View style={r.engSpecRow}>
                                            <MaterialCommunityIcons name={eng.icon} size={12} color={T.goldPrimary} />
                                            <Text allowFontScaling={false} style={r.engSpec}>{eng.title}</Text>
                                        </View>
                                    </View>
                                    <LinearGradient colors={[T.goldPrimary, T.orange]} style={r.engBtn}>
                                        <Text allowFontScaling={false} style={r.engBtnText}>Bağlan</Text>
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {/* ── PHASE 3: DONE SCREEN ── */}
                {phase === 'done' && selectedExpert && (
                    <>
                        <View style={r.doneIconWrap}>
                            <LinearGradient colors={[T.goldPrimary + '33', T.goldPrimary + '11']} style={r.doneIconCircle} />
                            <MaterialCommunityIcons name="check-circle" size={64} color={T.goldPrimary} />
                        </View>
                        <Text allowFontScaling={false} style={r.doneTitle}>Talep Oluşturuldu</Text>
                        <Text allowFontScaling={false} style={r.doneSubtitle}>Yapay Zeka analizi tamamlandı ve uzmanınıza iletildi.</Text>

                        <View style={r.projNoCard}>
                            <Text allowFontScaling={false} style={r.projNoLabel}>PROJE NUMARASI</Text>
                            <Text allowFontScaling={false} style={r.projNo}>{projNo}</Text>
                            <Text allowFontScaling={false} style={r.projNoHint}>Bu numara ile durumunuzu takip edebilirsiniz</Text>
                        </View>

                        <View style={r.doneExpertCard}>
                            <Text allowFontScaling={false} style={r.doneExpertLabel}>+ EŞLEŞTİRİLEN UZMAN</Text>
                            <View style={r.doneExpertRow}>
                                <LinearGradient colors={[selectedExpert.color, T.engCardBg]} style={r.doneAvatar}>
                                    <Text allowFontScaling={false} style={r.doneAvatarText}>{selectedExpert.initials}</Text>
                                </LinearGradient>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text allowFontScaling={false} style={r.doneExpertName}>{selectedExpert.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <MaterialCommunityIcons name={selectedExpert.icon} size={12} color={T.goldPrimary} />
                                        <Text allowFontScaling={false} style={r.doneExpertSpec}>{selectedExpert.title}</Text>
                                    </View>
                                </View>
                                <View style={r.onlineDot} />
                            </View>
                        </View>

                        <View style={r.doneAiWrap}>
                            <MaterialCommunityIcons name="robot-outline" size={16} color={T.goldPrimary} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text allowFontScaling={false} style={r.doneAiLabel}>AI ÖZETİ</Text>
                                <Text allowFontScaling={false} style={r.doneAiText}>{aiSummary.title}</Text>
                            </View>
                        </View>

                        <View style={r.stepsWrap}>
                            {[
                                { icon: 'check-circle', color: T.green,  label: 'Yapay Zeka Analizi Tamamlandı' },
                                { icon: 'clock-outline', color: T.goldPrimary,   label: 'Uzman en kısa sürede dönüş yapacak' },
                                { icon: 'message-outline', color: T.textSecondary, label: 'Mesaj kanalı açılacak' },
                            ].map((step, i) => (
                                <View key={i} style={r.stepRow}>
                                    <MaterialCommunityIcons name={step.icon} size={18} color={step.color} />
                                    <Text allowFontScaling={false} style={r.stepText}>{step.label}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity onPress={onGoHome} activeOpacity={0.88} style={r.phaseBtn}>
                            <LinearGradient colors={[T.goldPrimary, T.orange]} style={r.phaseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <MaterialCommunityIcons name="home-outline" size={18} color="#000" />
                                <Text allowFontScaling={false} style={r.phaseBtnText}>ANA SAYFAYA DÖN</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={r.retryBtn}>
                            <Text allowFontScaling={false} style={r.retryText}>Yeni Analiz Başlat</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {phase !== 'done' && (
                <TouchableOpacity onPress={onClose} style={r.closeBtn}>
                    <Text allowFontScaling={false} style={r.closeBtnText}>Kapat</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function TeknikOfisScreen() {
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    const s = getSStyles(T, isDarkMode);

    const navigation  = useNavigation();
    const scrollRef   = useRef(null);
    const inputWrapRef = useRef(null);

    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [adminModalVisible, setAdminModalVisible] = useState(false);
    const [editService, setEditService] = useState(null);
    const [formData, setFormData] = useState({ icon: 'hammer-wrench', label: '', desc_text: '', sample: '', order_index: 0, is_active: true });
    const [currentServicePage, setCurrentServicePage] = useState(0);

    const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    const filteredServices = isEditMode ? services : services.filter(s => s.is_active !== false);
    let serviceChunks = chunkArray(filteredServices, 4);
    if (isEditMode && (filteredServices.length === 0 || filteredServices.length % 4 === 0)) {
        serviceChunks.push([]);
    }

    useEffect(() => {
        loadServices();
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const roles = await PermissionService.getUserRoles();
            setIsAdmin(roles.isAdmin);
        } catch (e) {
            console.error(e);
        }
    };

    const loadServices = async () => {
        try {
            setLoadingServices(true);
            const { data, error } = await supabase.from('technical_services').select('*').order('order_index', { ascending: true });
            if (!error && data) setServices(data);
        } catch (e) {
            console.error('loadServices error:', e);
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSaveService = async () => {
        try {
            if (editService) {
                await supabase.from('technical_services').update(formData).eq('id', editService.id);
            } else {
                await supabase.from('technical_services').insert([formData]);
            }
            setAdminModalVisible(false);
            loadServices();
        } catch (e) {
            Alert.alert('Hata', 'Hizmet kaydedilemedi.');
        }
    };

    const handleDeleteService = async (id) => {
        Alert.alert('Emin misiniz?', 'Hizmet kalıcı olarak silinecek.', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => {
                await supabase.from('technical_services').delete().eq('id', id);
                loadServices();
            }}
        ]);
    };

    const moveService = async (index, direction) => {
        const newServices = [...services];
        if (direction === 'up' && index > 0) {
            const temp = newServices[index].order_index;
            newServices[index].order_index = newServices[index - 1].order_index;
            newServices[index - 1].order_index = temp;
            const tempItem = newServices[index];
            newServices[index] = newServices[index - 1];
            newServices[index - 1] = tempItem;
            setServices(newServices);
            await supabase.from('technical_services').update({ order_index: newServices[index].order_index }).eq('id', newServices[index].id);
            await supabase.from('technical_services').update({ order_index: newServices[index - 1].order_index }).eq('id', newServices[index - 1].id);
            loadServices();
        } else if (direction === 'down' && index < newServices.length - 1) {
            const temp = newServices[index].order_index;
            newServices[index].order_index = newServices[index + 1].order_index;
            newServices[index + 1].order_index = temp;
            const tempItem = newServices[index];
            newServices[index] = newServices[index + 1];
            newServices[index + 1] = tempItem;
            setServices(newServices);
            await supabase.from('technical_services').update({ order_index: newServices[index].order_index }).eq('id', newServices[index].id);
            await supabase.from('technical_services').update({ order_index: newServices[index + 1].order_index }).eq('id', newServices[index + 1].id);
            loadServices();
        }
    };

    const toggleServiceVisibility = async (srv) => {
        const newStatus = srv.is_active === false ? true : false;
        setServices(services.map(s => s.id === srv.id ? { ...s, is_active: newStatus } : s));
        await supabase.from('technical_services').update({ is_active: newStatus }).eq('id', srv.id);
        loadServices();
    };

    const handleServiceScroll = (e) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentServicePage(page);
    };

    const [inputText, setInputText] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult]   = useState(false);
    const [isInputFocused, setInputFocused] = useState(false);

    const auraOpacity = useRef(new Animated.Value(0)).current;
    const auraScale   = useRef(new Animated.Value(0.97)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(auraOpacity, { toValue: isInputFocused ? 1 : 0, duration: 300, useNativeDriver: true }),
            Animated.timing(auraScale,   { toValue: isInputFocused ? 1 : 0.97, duration: 300, useNativeDriver: true }),
        ]).start();
    }, [isInputFocused]);

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/*', '*/*'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets?.[0]) setAttachedFile(result.assets[0]);
        } catch { Alert.alert('Hata', 'Dosya seçilemedi.'); }
    };

    const handleAnalyze = async () => {
        if (!inputText.trim() && !attachedFile) {
            Alert.alert('Eksik Bilgi', 'Lütfen projenizi anlatın veya belge yükleyin.');
            return;
        }
        Keyboard.dismiss();
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResult(true);
        }, 3500);
    };

    const handleServicePress = (srv) => {
        if (srv.id === 'NEW') {
            setFormData({ icon: TEKNIK_ICON_POOL[0], label: '', desc_text: '', order_index: services.length });
            setEditService(null);
            setAdminModalVisible(true);
            return;
        }
        if (!isEditMode) {
            navigation.navigate('ServiceRequest', { serviceTitle: srv.label, tableName: 'technical_requests' });
        }
    };

    const handleGoHome = () => {
        setShowResult(false);
        setInputText('');
        navigation.goBack();
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
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={s.headerEye}>TEKNİK OFİS</Text>
                        <Text allowFontScaling={false} style={s.headerSub}>Projelerinizi Hızlandırın</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isAdmin && (
                            <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={[s.headerBtn, isEditMode && { backgroundColor: T.goldPrimary + '33' }]}>
                                <MaterialCommunityIcons name={isEditMode ? "check" : "cog"} size={18} color={T.goldPrimary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => navigation.navigate('TechnicalProvider')} style={[s.headerBtn, { marginLeft: 8 }]}>
                            <MaterialCommunityIcons name="office-building-cog-outline" size={18} color={T.goldPrimary} />
                        </TouchableOpacity>
                    </View>
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
                        <Text allowFontScaling={false} style={s.heroTitle}>Teknik Ofis Asistanı</Text>
                    </View>

                    <View ref={inputWrapRef} style={s.inputWrap}>
                        <Animated.View style={[s.inputGlow, { opacity: auraOpacity, transform: [{ scale: auraScale }] }]} pointerEvents="none" />
                        <View style={s.glassCard}>
                            <LinearGradient colors={[T.goldPrimary + '00', T.goldPrimary + 'AA', T.goldPrimary + '00']} style={s.glassBorderTop} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                            <TextInput
                                allowFontScaling={false}
                                style={s.input}
                                placeholder="Projenizi, verinizi (Excel, CAD) yükleyin veya sesli anlatın, analizi biz yapalım..."
                                placeholderTextColor={T.textMuted}
                                multiline
                                value={inputText}
                                onChangeText={setInputText}
                                onFocus={() => {
                                    setInputFocused(true);
                                    setTimeout(() => {
                                        inputWrapRef.current?.measureLayout(
                                            scrollRef.current,
                                            (x, y) => scrollRef.current?.scrollTo({ y: y - 20, animated: true }),
                                            () => {}
                                        );
                                    }, 250);
                                }}
                                onBlur={() => setInputFocused(false)}
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
                                    <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Kamera', 'Canlı tarama yakında aktif olacak.')}>
                                        <MaterialCommunityIcons name="camera-outline" size={16} color={T.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleAnalyze} activeOpacity={0.88} style={s.ctaWrap}>
                        <View style={[s.ctaBtn, { backgroundColor: '#C89B1E' }]}>
                            <MaterialCommunityIcons name="cog-sync-outline" size={20} color="#fff" />
                            <Text allowFontScaling={false} style={s.ctaText}>ANALİZ ET VE UZMANA BAĞLAN</Text>
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
                                {isEditMode ? (
                                    <Text allowFontScaling={false} style={[s.servSubtitle, { color: T.goldPrimary, fontWeight: 'bold' }]}>DÜZENLEME MODU AKTİF</Text>
                                ) : (
                                    <Text allowFontScaling={false} style={s.servSubtitle}>Hızlı erişim · {services.length} uzmanlık alanı</Text>
                                )}
                            </View>
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
                                                    <Text allowFontScaling={false} style={s.servDesc}>{srv.desc_text || srv.desc}</Text>
                                                </TouchableOpacity>
                                            )})}
                                            {isEditMode && chunkIndex === serviceChunks.length - 1 && chunk.length < 4 && (
                                                <TouchableOpacity 
                                                    style={[s.servCard, { borderWidth: 2, borderColor: T.goldPrimary, borderStyle: 'dashed', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }]}
                                                    onPress={() => { setEditService(null); setFormData({ icon: 'hammer-wrench', label: '', desc_text: '', sample: '', order_index: services.length + 1, is_active: true }); setAdminModalVisible(true); }}
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

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            {showResult && (
                <ResultSheet
                    visible={showResult}
                    onClose={() => setShowResult(false)}
                    onGoHome={handleGoHome}
                    inputText={inputText}
                />
            )}
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

function getTStyles(T, isDarkMode) {
    return StyleSheet.create({
        tickerWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, backgroundColor: T.tickerWrap, borderBottomWidth: 1, borderBottomColor: T.tickerBorder, gap: 8 },
        tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.danger },
        tickerLive: { color: T.danger, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
        tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 20, width: 140 },
        tickerLabel: { color: T.textSecondary, fontSize: 10 },
        tickerValue: { fontSize: 11, fontWeight: '700' },
        tickerUnit: { fontSize: 9, fontWeight: '400', color: T.textSecondary },
    });
}

function getRStyles(T, isDarkMode) {
    return StyleSheet.create({
        sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.93, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 20, zIndex: 50 },
        handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: T.handleBg, alignSelf: 'center', marginBottom: 20 },
        topBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
        scoreRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.scoreRowBg, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: T.scoreRowBorder },
        scoreBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.goldPrimary + '22', borderWidth: 2, borderColor: T.goldPrimary, alignItems: 'center', justifyContent: 'center' },
        scoreNum: { color: T.goldPrimary, fontSize: 18, fontWeight: '900' },
        scoreLabel: { color: T.goldPrimary, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
        scoreTitle: { color: T.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 6 },
        typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.goldPrimary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
        typeBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
        sectionLabel: { color: T.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10, marginTop: 8 },
        riskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.engCardBg, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: T.scoreRowBorder },
        riskText: { color: T.textSecondary, fontSize: 13, flex: 1 },
        actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
        actionNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
        actionNumText: { color: '#000', fontSize: 11, fontWeight: '900' },
        actionText: { color: T.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
        engCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.engCardBg, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.scoreRowBorder },
        engAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
        engInitials: { color: T.textPrimary, fontSize: 16, fontWeight: '900' },
        engSpecRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
        engSpec: { color: T.goldPrimary, fontSize: 11, fontWeight: '600' },
        engName: { color: T.textPrimary, fontSize: 14, fontWeight: '800' },
        engBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
        engBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
        closeBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: T.tickerBorder },
        closeBtnText: { color: T.textSecondary, fontSize: 13 },
        phaseHeader: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: T.scoreRowBg, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: T.goldPrimary + '33' },
        phaseTitle: { color: T.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 4 },
        phaseSubtitle: { color: T.textSecondary, fontSize: 12, lineHeight: 18 },
        infoField: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.engCardBg, borderRadius: 14, borderWidth: 1, borderColor: T.scoreRowBorder, padding: 12, marginBottom: 10 },
        infoFieldIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: T.goldPrimary + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
        infoFieldLabel: { color: T.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
        infoFieldInput: { color: T.textPrimary, fontSize: 14, padding: 0 },
        phaseBtn: { marginTop: 16, borderRadius: 16, overflow: 'hidden', height: 52 },
        phaseBtnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
        phaseBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
        confirmRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: T.engCardBg, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: T.scoreRowBorder },
        confirmLabel: { color: T.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
        confirmValue: { color: T.textPrimary, fontSize: 13, lineHeight: 18, marginTop: 2 },
        confirmBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
        confirmBack: { width: 90, height: 52, borderRadius: 14, borderWidth: 1, borderColor: T.handleBg, alignItems: 'center', justifyContent: 'center' },
        confirmBackText: { color: T.textSecondary, fontSize: 13, fontWeight: '600' },
        locationChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.goldPrimary + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16 },
        locationChipText: { color: T.goldPrimary, fontSize: 12, fontWeight: '600', flex: 1 },
        urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
        urgencyText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
        summaryCard: { backgroundColor: T.engCardBg, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: T.scoreRowBorder },
        summaryTitle: { color: T.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 12 },
        bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
        bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.goldPrimary, marginTop: 6, flexShrink: 0 },
        bulletText: { color: T.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
        confirmHint: { color: T.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 6 },
        retryBtn: { alignItems: 'center', paddingVertical: 14 },
        retryText: { color: T.textSecondary, fontSize: 13 },
        summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.tickerBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
        summaryChipText: { color: T.goldPrimary, fontSize: 12, fontWeight: '600', flex: 1 },
        doneIconWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 14, position: 'relative' },
        doneIconCircle: { position: 'absolute', width: 110, height: 110, borderRadius: 55 },
        doneTitle: { color: T.textPrimary, fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
        doneSubtitle: { color: T.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
        projNoCard: { backgroundColor: T.engCardBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.scoreRowBorder, alignItems: 'center' },
        projNoLabel: { color: T.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
        projNo: { color: T.goldPrimary, fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
        projNoHint: { color: T.textSecondary, fontSize: 11 },
        doneExpertCard: { backgroundColor: T.engCardBg, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: T.scoreRowBorder },
        doneExpertLabel: { color: T.goldPrimary, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
        doneExpertRow: { flexDirection: 'row', alignItems: 'center' },
        doneAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
        doneAvatarText: { color: T.textPrimary, fontSize: 15, fontWeight: '900' },
        doneExpertName: { color: T.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 3 },
        doneExpertSpec: { color: T.goldPrimary, fontSize: 11, fontWeight: '600' },
        onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.green, borderWidth: 2, borderColor: T.engCardBg },
        doneAiWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.engCardBg, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: T.scoreRowBorder },
        doneAiLabel: { color: T.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
        doneAiText: { color: T.textPrimary, fontSize: 13, fontWeight: '600' },
        stepsWrap: { backgroundColor: T.engCardBg, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: T.scoreRowBorder },
        stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
        stepText: { color: T.textSecondary, fontSize: 13, flex: 1 },
    });
}

function getSStyles(T, isDarkMode) {
    return StyleSheet.create({
        root: { flex: 1, backgroundColor: T.bg },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 6 },
        headerBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkMode ? 0.3 : 0.08, shadowRadius: 8, elevation: 3 },
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
        servHeaderBadge: { display: 'none' },
        servHeaderBadgeText: { display: 'none' },
        servGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },

    servGridPage: { width: width, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
    paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 5, gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.textMuted },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: T.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: T.cardBorder },
    modalTitle: { color: T.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalLabel: { color: T.textSecondary, fontSize: 12, marginBottom: 5, fontWeight: '600' },
    modalInput: { backgroundColor: T.inputBg, color: T.textPrimary, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 14 },
    iconSelectBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: T.inputBg, alignItems: 'center' },
    modalCancelText: { color: T.textPrimary, fontWeight: 'bold' },
    modalSaveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: T.goldPrimary, alignItems: 'center' },
    modalSaveText: { color: '#000', fontWeight: 'bold' },

        servCard: { 
            width: (width - 42) / 2, 
            borderRadius: 16, 
            padding: 14, 
            marginBottom: 10,
            backgroundColor: isDarkMode ? '#141414' : '#FDFDFD', // Fallback
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
        servIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: isDarkMode ? 'rgba(212,175,55,0.15)' : '#FFF6E5', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
        servLabel: { color: T.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
        servDesc: { color: T.textSecondary, fontSize: 11, lineHeight: 14, textAlign: 'center' },
    });
}
