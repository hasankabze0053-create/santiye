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
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Keyboard,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GOLD   = '#D4AF37';
const ORANGE = '#E8890C';
const BG     = '#080808';
const DANGER = '#EF4444';
const GREEN  = '#10B981';

// ─── MOCK PRICES (replace with real API) ────────────────────────────────────
const PRICES = [
    { label: 'Nervürlü Demir', value: '₺28.40', unit: '/kg', trend: 'up' },
    { label: 'Beton C30',      value: '₺3.850', unit: '/m³', trend: 'up' },
    { label: 'Çimento (50kg)', value: '₺285',   unit: '/torba', trend: 'down' },
    { label: 'Hazır Beton',    value: '₺3.650', unit: '/m³', trend: 'up' },
];

// ─── SERVICES ───────────────────────────────────────────────────────────────
const SERVICES = [
    { id: 's1', icon: 'file-document-edit-outline', label: 'Hakediş\nHazırlama',  desc: 'Mevcut verilerle hakediş dosyası' },
    { id: 's2', icon: 'draw',                       label: 'Mimari Proje\nÇizimi', desc: 'Teknik çizim ve revizyon' },
    { id: 's3', icon: 'map-search-outline',         label: 'Saha\nKeşfi',          desc: 'Uzman saha inceleme raporu' },
    { id: 's4', icon: 'calculator-variant-outline', label: 'Metraj\nÇıkarma',      desc: 'Proje bazlı ölçüm analizi' },
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


// ─── PRICE TICKER ────────────────────────────────────────────────────────────
function PriceTicker() {
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

    const items = [...PRICES, ...PRICES]; // duplicate for seamless loop

    return (
        <View style={t.tickerWrap}>
            <View style={t.tickerDot} />
            <Text allowFontScaling={false} style={t.tickerLive}>CANLI</Text>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: scrollX }] }}>
                    {items.map((p, i) => (
                        <View key={i} style={t.tickerItem}>
                            <Text allowFontScaling={false} style={t.tickerLabel}>{p.label}</Text>
                            <Text allowFontScaling={false} style={[t.tickerValue, { color: p.trend === 'up' ? '#F97316' : GREEN }]}>
                                {p.value}<Text style={t.tickerUnit}>{p.unit}</Text>
                            </Text>
                            {p.trend === 'up'
                                ? <MaterialCommunityIcons name="trending-up" size={12} color="#F97316" />
                                : <MaterialCommunityIcons name="trending-down" size={12} color={GREEN} />}
                        </View>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
}

// ─── WIREFRAME ANIMATION ─────────────────────────────────────────────────────
function WireframeOrb() {
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
            {/* Glow halos */}
            <Animated.View style={[w.halo, w.halo1, { opacity: glow }]} />
            <Animated.View style={[w.halo, w.halo2, { opacity: Animated.multiply(glow, 0.6) }]} />

            {/* Outer ring */}
            <Animated.View style={[w.ring, w.ringOuter, { transform: [{ rotate: spin1 }] }]} />
            {/* Mid ring */}
            <Animated.View style={[w.ring, w.ringMid, { transform: [{ rotate: spin2 }] }]} />
            {/* Inner ring */}
            <Animated.View style={[w.ring, w.ringInner, { transform: [{ rotate: spin1 }] }]} />

            {/* Core sphere */}
            <View style={w.core}>
                <LinearGradient colors={[GOLD + 'CC', ORANGE + 'AA', '#80400022']} style={w.coreGrad} />
                <MaterialCommunityIcons name="office-building-cog" size={28} color={GOLD} />
            </View>

            {/* Orbit dots */}
            {[0, 90, 180, 270].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const r = 72;
                return (
                    <View key={i} style={[w.orbitDot, { left: 90 + r * Math.cos(rad) - 4, top: 90 + r * Math.sin(rad) - 4 }]} />
                );
            })}
        </Animated.View>
    );
}

// ─── ANALYSIS LOADING OVERLAY ────────────────────────────────────────────────
function AnalyzingOverlay({ visible }) {
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
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity, backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 99, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, transform: [{ translateY }] }}>
                <LinearGradient colors={['transparent', GOLD + 'CC', GOLD, GOLD + 'CC', 'transparent']} style={{ height: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </Animated.View>
            <MaterialCommunityIcons name="cog-sync-outline" size={52} color={GOLD} />
            <Text allowFontScaling={false} style={{ color: GOLD, fontSize: 14, fontWeight: '800', marginTop: 20, letterSpacing: 2 }}>TEKNİK ANALİZ YAPILIYOR</Text>
            <Text allowFontScaling={false} style={{ color: '#666', fontSize: 12, marginTop: 8 }}>AI Mühendislik Motoru · Lütfen Bekleyin...</Text>
        </Animated.View>
    );
}

// ─── RESULT BOTTOM SHEET (3-Phase: summary → matched → done) ─────────────────
function ResultSheet({ visible, onClose, onGoHome, inputText }) {
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
            <LinearGradient colors={['#0e0e0e', '#090909']} style={StyleSheet.absoluteFillObject} borderTopLeftRadius={28} borderTopRightRadius={28} />
            <View style={r.handle} />
            <LinearGradient colors={[GOLD + '00', GOLD + '88', GOLD + '00']} style={r.topBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

                {/* ── PHASE 1: AI SUMMARY CONFIRMATION ── */}
                {phase === 'summary' && (
                    <>
                        {/* 98% badge row */}
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

                        {/* AI Summary */}
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
                            <LinearGradient colors={[GOLD, ORANGE]} style={r.phaseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
                            <MaterialCommunityIcons name="account-search-outline" size={26} color={GOLD} />
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text allowFontScaling={false} style={r.phaseTitle}>En Uygun Uzmanlar</Text>
                                <Text allowFontScaling={false} style={r.phaseSubtitle}>Analizinize göre eşleştirilen profesyoneller</Text>
                            </View>
                        </View>

                        <View style={r.summaryChip}>
                            <MaterialCommunityIcons name="robot-outline" size={13} color={GOLD} />
                            <Text allowFontScaling={false} style={r.summaryChipText} numberOfLines={1}>{aiSummary.title}</Text>
                        </View>

                        <Text allowFontScaling={false} style={r.sectionLabel}>👷 EŞLEŞTİRİLEN UZMANLAR</Text>
                        {matchedExperts.map(eng => (
                            <TouchableOpacity key={eng.id} onPress={() => handleConnect(eng)} activeOpacity={0.85}>
                                <View style={r.engCard}>
                                    <LinearGradient colors={[eng.color, '#0a0a0a']} style={r.engAvatar}>
                                        <Text allowFontScaling={false} style={r.engInitials}>{eng.initials}</Text>
                                    </LinearGradient>
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text allowFontScaling={false} style={r.engName}>{eng.name}</Text>
                                        <View style={r.engSpecRow}>
                                            <MaterialCommunityIcons name={eng.icon} size={12} color={GOLD} />
                                            <Text allowFontScaling={false} style={r.engSpec}>{eng.title}</Text>
                                        </View>
                                    </View>
                                    <LinearGradient colors={[GOLD, ORANGE]} style={r.engBtn}>
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
                        {/* Success icon */}
                        <View style={r.doneIconWrap}>
                            <LinearGradient colors={[GOLD + '33', GOLD + '11']} style={r.doneIconCircle} />
                            <MaterialCommunityIcons name="check-circle" size={64} color={GOLD} />
                        </View>
                        <Text allowFontScaling={false} style={r.doneTitle}>Talep Oluşturuldu</Text>
                        <Text allowFontScaling={false} style={r.doneSubtitle}>Yapay Zeka analizi tamamlandı ve uzmanınıza iletildi.</Text>

                        {/* Proje No */}
                        <View style={r.projNoCard}>
                            <Text allowFontScaling={false} style={r.projNoLabel}>PROJE NUMARASI</Text>
                            <Text allowFontScaling={false} style={r.projNo}>{projNo}</Text>
                            <Text allowFontScaling={false} style={r.projNoHint}>Bu numara ile durumunuzu takip edebilirsiniz</Text>
                        </View>

                        {/* Matched expert */}
                        <View style={r.doneExpertCard}>
                            <Text allowFontScaling={false} style={r.doneExpertLabel}>+ EŞLEŞTİRİLEN UZMAN</Text>
                            <View style={r.doneExpertRow}>
                                <LinearGradient colors={[selectedExpert.color, '#111']} style={r.doneAvatar}>
                                    <Text allowFontScaling={false} style={r.doneAvatarText}>{selectedExpert.initials}</Text>
                                </LinearGradient>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text allowFontScaling={false} style={r.doneExpertName}>{selectedExpert.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <MaterialCommunityIcons name={selectedExpert.icon} size={12} color={GOLD} />
                                        <Text allowFontScaling={false} style={r.doneExpertSpec}>{selectedExpert.title}</Text>
                                    </View>
                                </View>
                                <View style={r.onlineDot} />
                            </View>
                        </View>

                        {/* AI Summary chip */}
                        <View style={r.doneAiWrap}>
                            <MaterialCommunityIcons name="robot-outline" size={16} color={GOLD} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text allowFontScaling={false} style={r.doneAiLabel}>AI ÖZETİ</Text>
                                <Text allowFontScaling={false} style={r.doneAiText}>{aiSummary.title}</Text>
                            </View>
                        </View>

                        {/* Process steps */}
                        <View style={r.stepsWrap}>
                            {[
                                { icon: 'check-circle', color: GREEN,  label: 'Yapay Zeka Analizi Tamamlandı' },
                                { icon: 'clock-outline', color: GOLD,   label: 'Uzman en kısa sürede dönüş yapacak' },
                                { icon: 'message-outline', color: '#888', label: 'Mesaj kanalı açılacak' },
                            ].map((step, i) => (
                                <View key={i} style={r.stepRow}>
                                    <MaterialCommunityIcons name={step.icon} size={18} color={step.color} />
                                    <Text allowFontScaling={false} style={r.stepText}>{step.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* CTA */}
                        <TouchableOpacity onPress={onGoHome} activeOpacity={0.88} style={r.phaseBtn}>
                            <LinearGradient colors={[GOLD, ORANGE]} style={r.phaseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
    const navigation  = useNavigation();
    const scrollRef   = useRef(null);
    const inputWrapRef = useRef(null);

    const [inputText, setInputText]     = useState('');
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
        // Simulate AI analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResult(true);
        }, 3500);
    };

    const handleServicePress = (service) => {
        Alert.alert(service.label.replace('\n', ' '), service.desc + '\n\nBu özellik yakında aktif olacak.', [{ text: 'Tamam' }]);
    };

    const handleGoHome = () => {
        setShowResult(false);
        setInputText('');
        navigation.goBack();
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <LinearGradient colors={['rgba(212,175,55,0.05)', 'transparent']} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.3 }} pointerEvents="none" />

            <AnalyzingOverlay visible={isAnalyzing} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
                        <Ionicons name="arrow-back" size={18} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={s.headerEye}>⚙  CEPTEŞEF</Text>
                        <Text allowFontScaling={false} style={s.headerSub}>Teknik Ofis Merkezi</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('TechnicalProvider')} style={s.headerBtn}>
                        <MaterialCommunityIcons name="office-building-cog-outline" size={18} color={GOLD} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Wireframe Orb + Title */}
                    <View style={s.orbSection}>
                        <WireframeOrb />
                        <Text allowFontScaling={false} style={s.heroEye}>YAPAY ZEKA DESTEKLİ</Text>
                        <Text allowFontScaling={false} style={s.heroTitle}>Teknik Ofis{'\n'}Asistanı</Text>
                    </View>

                    {/* Input Card */}
                    <View ref={inputWrapRef} style={s.inputWrap}>
                        <Animated.View style={[s.inputGlow, { opacity: auraOpacity, transform: [{ scale: auraScale }] }]} pointerEvents="none" />
                        <View style={s.glassCard}>
                            <LinearGradient colors={[GOLD + '00', GOLD + 'AA', GOLD + '00']} style={s.glassBorderTop} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                            <TextInput
                                allowFontScaling={false}
                                style={s.input}
                                placeholder="Projenizi, verinizi (Excel, CAD) yükleyin veya sesli anlatın, analizi biz yapalım..."
                                placeholderTextColor="rgba(255,255,255,0.22)"
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
                                selectionColor={GOLD}
                                cursorColor={GOLD}
                            />
                            {/* Attached file chip */}
                            {attachedFile && (
                                <View style={s.fileChip}>
                                    <MaterialCommunityIcons name="file-check-outline" size={14} color={GOLD} />
                                    <Text allowFontScaling={false} style={s.fileChipText} numberOfLines={1}>{attachedFile.name}</Text>
                                    <TouchableOpacity onPress={() => setAttachedFile(null)}>
                                        <Ionicons name="close-circle" size={14} color="#555" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {/* Footer row */}
                            <View style={s.inputFooter}>
                                <Text allowFontScaling={false} style={s.charCount}>{inputText.length > 0 ? `${inputText.length} karakter` : 'Metin, ses veya belge'}</Text>
                                <View style={s.footerBtns}>
                                    <TouchableOpacity style={s.iconBtn} onPress={handlePickFile}>
                                        <FontAwesome5 name="paperclip" size={14} color={attachedFile ? GOLD : 'rgba(255,255,255,0.4)'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Ses', 'Ses kaydı yakında aktif olacak.')}>
                                        <Ionicons name="mic-outline" size={16} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Kamera', 'Canlı tarama yakında aktif olacak.')}>
                                        <MaterialCommunityIcons name="camera-outline" size={16} color="rgba(255,255,255,0.4)" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Analyze Button */}
                    <TouchableOpacity onPress={handleAnalyze} activeOpacity={0.88} style={s.ctaWrap}>
                        <LinearGradient colors={[GOLD, ORANGE]} style={s.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <MaterialCommunityIcons name="cog-sync-outline" size={20} color="#000" />
                            <Text allowFontScaling={false} style={s.ctaText}>ANALİZ ET VE UZMANA BAĞLAN</Text>
                        </LinearGradient>
                        {/* Glow */}
                        <View style={s.ctaGlow} pointerEvents="none" />
                    </TouchableOpacity>

                    {/* Services Grid */}
                    <View style={s.servSection}>
                        <View style={s.servHeaderWrap}>
                            <LinearGradient
                                colors={['#1a1400', '#0e0e0e']}
                                style={StyleSheet.absoluteFillObject}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            />
                            <LinearGradient
                                colors={[GOLD, ORANGE]}
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
                                    <LinearGradient colors={['#181818', '#111']} style={StyleSheet.absoluteFillObject} borderRadius={18} />
                                    <View style={s.servIconBox}>
                                        <MaterialCommunityIcons name={srv.icon} size={26} color={GOLD} />
                                    </View>
                                    <Text allowFontScaling={false} style={s.servLabel}>{srv.label}</Text>
                                    <Text allowFontScaling={false} style={s.servDesc}>{srv.desc}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            {/* Result Bottom Sheet */}
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

// ─── WIREFRAME STYLES ────────────────────────────────────────────────────────
const w = StyleSheet.create({
    orbContainer: { width: 200, height: 200, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
    halo: { position: 'absolute', borderRadius: 999 },
    halo1: { width: 200, height: 200, backgroundColor: GOLD + '10' },
    halo2: { width: 160, height: 160, backgroundColor: GOLD + '18' },
    ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
    ringOuter: { width: 180, height: 180, borderColor: GOLD + '44' },
    ringMid:   { width: 140, height: 140, borderColor: GOLD + '66', borderStyle: 'dashed' },
    ringInner: { width: 100, height: 100, borderColor: GOLD + '88' },
    core: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: GOLD + '88' },
    coreGrad: { ...StyleSheet.absoluteFillObject },
    orbitDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD },
});

// ─── TICKER STYLES ───────────────────────────────────────────────────────────
const t = StyleSheet.create({
    tickerWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#0e0e0e', borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 8 },
    tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DANGER },
    tickerLive: { color: DANGER, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
    tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 20, width: 140 },
    tickerLabel: { color: '#666', fontSize: 10 },
    tickerValue: { fontSize: 11, fontWeight: '700' },
    tickerUnit: { fontSize: 9, fontWeight: '400', color: '#555' },
});

// ─── RESULT SHEET STYLES ─────────────────────────────────────────────────────
const r = StyleSheet.create({
    sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.93, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 20, zIndex: 50 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 20 },
    topBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
    scoreBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: GOLD + '22', borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center' },
    scoreNum: { color: GOLD, fontSize: 18, fontWeight: '900' },
    scoreLabel: { color: GOLD, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
    scoreTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 6 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
    typeBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
    sectionLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10, marginTop: 8 },
    riskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e' },
    riskText: { color: '#bbb', fontSize: 13, flex: 1 },
    actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
    actionNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    actionNumText: { color: '#000', fontSize: 11, fontWeight: '900' },
    actionText: { color: '#aaa', fontSize: 13, lineHeight: 19, flex: 1 },
    engCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
    engAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    engInitials: { color: '#fff', fontSize: 16, fontWeight: '900' },
    engSpecRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    engSpec: { color: GOLD, fontSize: 11, fontWeight: '600' },
    engName: { color: '#fff', fontSize: 14, fontWeight: '800' },
    engBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    engBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
    closeBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
    closeBtnText: { color: '#555', fontSize: 13 },
    // Info Collection phase
    phaseHeader: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#141414', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: GOLD + '33' },
    phaseTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    phaseSubtitle: { color: '#888', fontSize: 12, lineHeight: 18 },
    infoField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#222', padding: 12, marginBottom: 10 },
    infoFieldIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: GOLD + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    infoFieldLabel: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
    infoFieldInput: { color: '#fff', fontSize: 14, padding: 0 },
    phaseBtn: { marginTop: 16, borderRadius: 16, overflow: 'hidden', height: 52 },
    phaseBtnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    phaseBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
    // Confirm phase
    confirmRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e' },
    confirmLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    confirmValue: { color: '#ddd', fontSize: 13, lineHeight: 18, marginTop: 2 },
    confirmBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    confirmBack: { width: 90, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
    confirmBackText: { color: '#888', fontSize: 13, fontWeight: '600' },
    // Location chip
    locationChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16 },
    locationChipText: { color: GOLD, fontSize: 12, fontWeight: '600', flex: 1 },
    // Summary phase
    urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: DANGER, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
    urgencyText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    summaryCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#222' },
    summaryTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 12 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, marginTop: 6, flexShrink: 0 },
    bulletText: { color: '#aaa', fontSize: 13, lineHeight: 19, flex: 1 },
    confirmHint: { color: '#666', fontSize: 12, lineHeight: 18, marginBottom: 6 },
    retryBtn: { alignItems: 'center', paddingVertical: 14 },
    retryText: { color: '#555', fontSize: 13 },
    // Expert matched phase
    summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
    summaryChipText: { color: GOLD, fontSize: 12, fontWeight: '600', flex: 1 },
    // Done screen
    doneIconWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 14, position: 'relative' },
    doneIconCircle: { position: 'absolute', width: 110, height: 110, borderRadius: 55 },
    doneTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
    doneSubtitle: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
    projNoCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
    projNoLabel: { color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
    projNo: { color: GOLD, fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    projNoHint: { color: '#555', fontSize: 11 },
    doneExpertCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
    doneExpertLabel: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
    doneExpertRow: { flexDirection: 'row', alignItems: 'center' },
    doneAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    doneAvatarText: { color: '#fff', fontSize: 15, fontWeight: '900' },
    doneExpertName: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 3 },
    doneExpertSpec: { color: GOLD, fontSize: 11, fontWeight: '600' },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN, borderWidth: 2, borderColor: '#111' },
    doneAiWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
    doneAiLabel: { color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
    doneAiText: { color: '#ddd', fontSize: 13, fontWeight: '600' },
    stepsWrap: { backgroundColor: '#111', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#222' },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    stepText: { color: '#bbb', fontSize: 13, flex: 1 },
});

// ─── MAIN STYLES ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
    headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
    headerEye: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },

    scroll: { paddingHorizontal: 16, paddingBottom: 20 },

    orbSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 4 },
    heroEye: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
    heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 24 },

    inputWrap: { marginBottom: 14, position: 'relative' },
    inputGlow: { position: 'absolute', inset: -12, borderRadius: 32, backgroundColor: GOLD + '18', zIndex: 0 },
    glassCard: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', overflow: 'hidden', backgroundColor: '#141414' },
    glassBorderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, opacity: 0.6 },
    input: { color: '#FFFFFF', fontSize: 14, lineHeight: 22, padding: 18, paddingTop: 16, paddingBottom: 8, minHeight: 100, textAlignVertical: 'top' },
    fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD + '18', margin: 12, marginTop: 0, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    fileChipText: { color: GOLD, fontSize: 12, flex: 1 },
    inputFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4 },
    charCount: { color: 'rgba(255,255,255,0.2)', fontSize: 11, flex: 1 },
    footerBtns: { flexDirection: 'row', gap: 8 },
    iconBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },

    ctaWrap: { marginBottom: 28, position: 'relative' },
    ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 18, gap: 10 },
    ctaText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
    ctaGlow: { position: 'absolute', bottom: -8, left: 20, right: 20, height: 20, backgroundColor: GOLD + '30', borderRadius: 10, zIndex: -1 },

    servSection: { marginBottom: 8 },
    servHeaderWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, overflow: 'hidden', gap: 12, borderWidth: 1, borderColor: GOLD + '44' },
    servHeaderBar: { width: 3, height: 30, borderRadius: 2, marginRight: 2 },
    servTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
    servSubtitle: { color: GOLD + 'AA', fontSize: 10, marginTop: 2, fontWeight: '500' },
    servHeaderBadge: { display: 'none' },
    servHeaderBadgeText: { display: 'none' },
    servGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    servCard: { width: (width - 42) / 2, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#222', overflow: 'hidden', minHeight: 130 },
    servIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: GOLD + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    servLabel: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 4 },
    servDesc: { color: '#666', fontSize: 11, lineHeight: 15 },
});
