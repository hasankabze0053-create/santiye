/**
 * LawAnalysisResultScreen.js
 * Premium AI Vaka Analiz Sonuçları Ekranı
 * Dinamik Risk Skoru · Hukuki Bulgular · Avukat Eşleşme
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GOLD    = '#D4AF37';
const ORANGE  = '#F97316';
const DANGER  = '#EF4444';
const GREEN   = '#10B981';
const BG      = '#080808';

// ─── MOCK LAWYERS (replace with real DB query later) ─────────────────────────
const MOCK_LAWYERS = [
    {
        id: 'l1',
        name: 'Av. Seda Kaya',
        specialty: 'İnşaat & Sözleşme Hukuku',
        specialtyIcon: 'hammer-wrench',
        experience: '14 Yıl Deneyim',
        initials: 'SK',
        color: '#B45309',
    },
    {
        id: 'l2',
        name: 'Av. Murat Demir',
        specialty: 'Bina & İmar Hukuku',
        specialtyIcon: 'city-variant-outline',
        experience: '9 Yıl Deneyim',
        initials: 'MD',
        color: '#047857',
    },
];

// ─── SCANNER OVERLAY ──────────────────────────────────────────────────────────
function ScannerOverlay({ visible, onComplete }) {
    const scanY   = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scanY, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(scanY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ]),
            { iterations: 2 }
        ).start(() => {
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(onComplete);
        });
    }, [visible]);

    const translateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, 500] });

    if (!visible) return null;
    return (
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity, backgroundColor: 'rgba(0,0,0,0.82)', zIndex: 99 }]}>
            {/* Grid lines */}
            {[...Array(10)].map((_, i) => (
                <View key={i} style={{ position: 'absolute', top: i * 60, left: 0, right: 0, height: 1, backgroundColor: 'rgba(212,175,55,0.08)' }} />
            ))}
            {[...Array(5)].map((_, i) => (
                <View key={i} style={{ position: 'absolute', left: i * (width / 4), top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(212,175,55,0.08)' }} />
            ))}
            {/* Laser line */}
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, transform: [{ translateY }] }}>
                <LinearGradient colors={['transparent', GOLD + 'CC', GOLD, GOLD + 'CC', 'transparent']} style={{ height: 3 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <View style={{ height: 40, backgroundColor: 'rgba(212,175,55,0.04)' }} />
            </Animated.View>
            {/* Center text */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="text-search" size={44} color={GOLD} />
                <Text allowFontScaling={false} style={{ color: GOLD, fontSize: 14, fontWeight: 'bold', marginTop: 16, letterSpacing: 2 }}>BELGELER ANALİZ EDİLİYOR</Text>
                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 11, marginTop: 6 }}>Yapay Zeka Vaka Taraması · Lütfen Bekleyin...</Text>
            </View>
        </Animated.View>
    );
}

// ─── RISK GAUGE ───────────────────────────────────────────────────────────────
function RiskGauge({ score }) {
    const size = 110;
    const strokeWidth = 9;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim     = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.timing(progressAnim, { toValue: score / 10, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
        Animated.loop(Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1.12, duration: 1500, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.9, duration: 1500, useNativeDriver: true }),
        ])).start();
    }, []);

    const riskColor = score >= 8 ? DANGER : score >= 5 ? ORANGE : GREEN;
    const riskLabel = score >= 8 ? 'Yüksek' : score >= 5 ? 'Orta' : 'Düşük';

    return (
        <Animated.View style={{ transform: [{ scale: glowAnim }], alignItems: 'center' }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                {/* Glow halo */}
                <View style={{ position: 'absolute', width: size + 14, height: size + 14, borderRadius: (size + 14) / 2, backgroundColor: riskColor + '22' }} />
                {/* SVG-like circle via borders */}
                <View style={{
                    position: 'absolute', width: size, height: size, borderRadius: size / 2,
                    borderWidth: strokeWidth, borderColor: '#1e1e1e',
                }} />
                {/* Score text */}
                <View style={{ alignItems: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: riskColor, fontSize: 28, fontWeight: '900', lineHeight: 30 }}>{score}</Text>
                    <Text allowFontScaling={false} style={{ color: '#555', fontSize: 9, fontWeight: '600' }}>/10</Text>
                    <Text allowFontScaling={false} style={{ color: riskColor, fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>{riskLabel}</Text>
                </View>
                {/* Arc indicator - rendered as colored border segment */}
                <View style={{
                    position: 'absolute', width: size, height: size, borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderTopColor: riskColor,
                    borderRightColor: score >= 3 ? riskColor : '#1e1e1e',
                    borderBottomColor: score >= 6 ? riskColor : '#1e1e1e',
                    borderLeftColor: score >= 8 ? riskColor : '#1e1e1e',
                    transform: [{ rotate: '-45deg' }],
                }} />
            </View>
            <Text allowFontScaling={false} style={{ color: '#666', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>RİSK SKORU</Text>
        </Animated.View>
    );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function LawAnalysisResultScreen() {
    const navigation = useNavigation();
    const route      = useRoute();

    const analysisData = route?.params?.analysisData;
    const caseText     = route?.params?.caseText || '';

    // Parse AI result
    const riskScore  = analysisData?.riskScore  ?? 7;
    const caseTitle  = analysisData?.caseTitle  ?? 'Kritik Hakediş Uyuşmazlığı ve Sözleşme İhlali';
    const findings   = analysisData?.findings   ?? [
        { type: 'law',     icon: 'book-open-outline', color: GOLD,   text: 'TBK Madde 470 uyarınca eser sözleşmesi kapsamında değerlendirildi.' },
        { type: 'risk',    icon: 'alert-circle',      color: DANGER, text: 'Sözleşmedeki 5. madde gecikme faizi hakkınızı kısıtlıyor olabilir.' },
        { type: 'risk',    icon: 'clock-alert',       color: ORANGE, text: 'Hakediş ödemesi 30 günü aşmış. Temerrüt faizi hakkı doğmuş olabilir.' },
        { type: 'missing', icon: 'file-document',     color: '#888', text: 'Analizi derinleştirmek için imzalı sözleşmeyi yükleyin.' },
    ];
    const legalArticles = analysisData?.legalArticles ?? ['TBK Md.470', 'TBK Md.182', 'İİK Md.67', 'TBK Md.120'];
    const actions       = analysisData?.actions ?? [
        'İhtarname gönderilmesi ve noter onayının alınması',
        'Hakediş belgelerinin noter sureti ile teslim edilmesi',
        'Sözleşme ihlali için arabuluculuk başvurusu yapılması',
        'Dava açılmadan önce uzlaşı görüşmeleri yürütülmesi',
    ];
    const requiredDocs = analysisData?.requiredDocs ?? [
        'İmzalı sözleşme (PDF)',
        'Hakediş raporu ve tutanaklar',
        'Yazışma kayıtları (e-posta / WhatsApp)',
        'İhtarname (varsa)',
    ];

    const [scanning, setScanning]           = useState(true);
    const [showConfirmModal, setShowConfirm] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [summaryText, setSummaryText] = useState('');
    const [editingSummary, setEditingSummary] = useState(false);

    const fadeIn = useRef(new Animated.Value(0)).current;

    const handleScanComplete = () => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    };

    const handleConfirmAndConnect = () => {
        if (!selectedLawyer) {
            Alert.alert('Avukat Seçin', 'Lütfen önce bir avukat seçin.');
            return;
        }
        setShowConfirm(true);
    };

    const handleFinalApprove = () => {
        setShowConfirm(false);
        navigation.navigate('LawSuccess', {
            lawyer: selectedLawyer,
            caseData: { title: caseTitle, riskScore, caseText },
        });
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <LinearGradient colors={['rgba(212,175,55,0.05)', 'transparent']} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.35 }} pointerEvents="none" />

            {/* Scanner overlay */}
            <ScannerOverlay visible={scanning} onComplete={() => { setScanning(false); handleScanComplete(); }} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
                        <Ionicons name="arrow-back" size={18} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={s.headerTitle}>YAPAY ZEKA ANALİZİ</Text>
                        <Text allowFontScaling={false} style={s.headerSub}>Vaka Sonuç Raporu</Text>
                    </View>
                    <View style={{ width: 38 }} />
                </View>

                <Animated.ScrollView
                    style={{ flex: 1, opacity: fadeIn }}
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── RISK SCORE HERO ── */}
                    <View style={s.heroCard}>
                        <LinearGradient colors={['#181818', '#111']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
                        <View style={s.heroBorder} />
                        {/* Left: case title */}
                        <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text allowFontScaling={false} style={s.heroEye}>VAKA TEŞHİSİ</Text>
                            <Text allowFontScaling={false} style={s.heroTitle}>{caseTitle}</Text>
                            <View style={s.heroIdRow}>
                                <MaterialCommunityIcons name="shield-check" size={12} color={GOLD} />
                                <Text allowFontScaling={false} style={s.heroIdText}>AI Analizi Tamamlandı</Text>
                            </View>
                        </View>
                        {/* Right: gauge */}
                        <RiskGauge score={riskScore} />
                    </View>

                    {/* ── VAKA ÖZETİ ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>Vaka Özeti</Text>
                        <TouchableOpacity onPress={() => { if (!editingSummary && !summaryText) setSummaryText(caseText || 'Müteahhitin hakedişi zamanında yapılmadığı ve sözleşmede belirlenen ödeme koşullarının ihlal edildiği tespit edilmiştir.'); setEditingSummary(e => !e); }} style={s.editBtn}>
                            <MaterialCommunityIcons name={editingSummary ? 'check' : 'pencil-outline'} size={14} color={GOLD} />
                            <Text allowFontScaling={false} style={s.editBtnText}>{editingSummary ? 'Kaydet' : 'Düzenle'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={s.glassCard}>
                        <View style={s.glassAccent} />
                        {editingSummary ? (
                            <TextInput
                                allowFontScaling={false}
                                style={[s.caseSummaryText, s.caseSummaryInput]}
                                value={summaryText}
                                onChangeText={setSummaryText}
                                multiline
                                autoFocus
                                placeholderTextColor="#444"
                                placeholder="Vaka özetini düzenleyin..."
                            />
                        ) : (
                            <Text allowFontScaling={false} style={s.caseSummaryText}>
                                {summaryText || caseText || 'Müteahhitin hakedişi zamanında yapılmadığı ve sözleşmede belirlenen ödeme koşullarının ihlal edildiği tespit edilmiştir. Yetersiz sözleşme koruma maddesi nedeniyle hak kayıplarına yol açabilecek riskler mevcuttur.'}
                            </Text>
                        )}
                    </View>

                    {/* ── KRİTİK BULGULAR ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>Hukuki Bulgular</Text>
                    </View>
                    <View style={s.findingsContainer}>
                        {findings.map((f, i) => (
                            <View key={i} style={s.findingRow}>
                                <View style={[s.findingIconBox, { backgroundColor: f.color + '22' }]}>
                                    <MaterialCommunityIcons name={f.icon} size={18} color={f.color} />
                                </View>
                                <Text allowFontScaling={false} style={s.findingText}>{f.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ── KANUN MADDELERİ ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>İlgili Kanun Maddeleri</Text>
                    </View>
                    <View style={s.tagsRow}>
                        {legalArticles.map((art, i) => (
                            <LinearGradient key={i} colors={['#1e1a0e', '#252010']} style={s.tag}>
                                <View style={s.tagDot} />
                                <Text allowFontScaling={false} style={s.tagText}>{art}</Text>
                            </LinearGradient>
                        ))}
                    </View>

                    {/* ── GEREKLİ BELGELER ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>Gerekli / Eksik Belgeler</Text>
                    </View>
                    <View style={s.glassCard}>
                        <View style={s.glassAccent} />
                        {requiredDocs.map((doc, i) => (
                            <View key={i} style={s.docRow}>
                                <MaterialCommunityIcons name="file-document-outline" size={16} color="#666" />
                                <Text allowFontScaling={false} style={s.docText}>{doc}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ── ÖNERİLEN AKSIYONLAR ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>Önerilen Hukuki Adımlar</Text>
                    </View>
                    <View style={s.glassCard}>
                        <View style={s.glassAccent} />
                        {actions.map((action, i) => (
                            <View key={i} style={s.actionRow}>
                                <LinearGradient colors={[GOLD, ORANGE]} style={s.actionNum}>
                                    <Text allowFontScaling={false} style={s.actionNumText}>{i + 1}</Text>
                                </LinearGradient>
                                <Text allowFontScaling={false} style={s.actionText}>{action}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ── AVUKAT EŞLEŞMESİ ── */}
                    <View style={s.sectionHeader}>
                        <View style={s.sectionDot} />
                        <Text allowFontScaling={false} style={s.sectionTitle}>Sana En Uygun 3 Avukat</Text>
                        <Text allowFontScaling={false} style={s.sectionSub}>Birini seç ve hemen başla</Text>
                    </View>
                    {MOCK_LAWYERS.map((lawyer) => {
                        const isSelected = selectedLawyer?.id === lawyer.id;
                        return (
                            <TouchableOpacity key={lawyer.id} onPress={() => setSelectedLawyer(lawyer)} activeOpacity={0.85}>
                                <View style={[s.lawyerCard, isSelected && s.lawyerCardSelected]}>
                                    {isSelected && (
                                        <LinearGradient colors={[GOLD + '18', 'transparent']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                                    )}
                                    {/* Avatar */}
                                    <LinearGradient colors={[lawyer.color, '#0a0a0a']} style={s.lawyerAvatar}>
                                        <Text allowFontScaling={false} style={s.lawyerAvatarText}>{lawyer.initials}</Text>
                                    </LinearGradient>
                                    {/* Info */}
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text allowFontScaling={false} style={s.lawyerName}>{lawyer.name}</Text>
                                        {/* Specialty — prominent */}
                                        <View style={s.lawyerSpecRow}>
                                            <MaterialCommunityIcons name={lawyer.specialtyIcon} size={13} color={GOLD} />
                                            <Text allowFontScaling={false} style={s.lawyerSpecBold}>{lawyer.specialty}</Text>
                                        </View>
                                        <View style={s.lawyerTagRow}>
                                            <View style={s.lawyerTag}>
                                                <MaterialCommunityIcons name="clock-outline" size={10} color={GOLD} />
                                                <Text allowFontScaling={false} style={s.lawyerTagText}>{lawyer.experience}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {/* Select indicator */}
                                    <View style={[s.lawyerSelectCircle, isSelected && s.lawyerSelectCircleActive]}>
                                        {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    <View style={{ height: 120 }} />
                </Animated.ScrollView>

                {/* ── STICKY BOTTOM CTA ── */}
                <View style={s.bottomCta}>
                    <TouchableOpacity onPress={handleConfirmAndConnect} activeOpacity={0.88} style={{ width: '100%' }}>
                        <LinearGradient colors={[GOLD, '#E8890C', ORANGE]} style={s.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <MaterialCommunityIcons name="check-circle" size={22} color="#000" />
                            <Text allowFontScaling={false} style={s.ctaText}>RAPORU ONAYLA & AVUKAT BUL</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ── ONAY MODAL ── */}
            <Modal visible={showConfirmModal} transparent animationType="slide" onRequestClose={() => setShowConfirm(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.confirmModal}>
                        <LinearGradient colors={['#1a1a1a', '#111']} style={StyleSheet.absoluteFillObject} borderRadius={24} />
                        {/* Header */}
                        <View style={s.confirmHeader}>
                            <MaterialCommunityIcons name="robot-outline" size={28} color={GOLD} />
                            <Text allowFontScaling={false} style={s.confirmTitle}>Sorununuzu Doğru Anladık mı?</Text>
                        </View>
                        {/* Summary */}
                        <View style={s.confirmSummaryBox}>
                            <View style={s.glassAccent} />
                            <Text allowFontScaling={false} style={s.confirmSummaryLabel}>VAKA ÖZETİ</Text>
                            <Text allowFontScaling={false} style={s.confirmSummaryTitle}>{caseTitle}</Text>
                            <Text allowFontScaling={false} style={s.confirmSummaryRisk}>Risk Skoru: <Text style={{ color: ORANGE, fontWeight: 'bold' }}>{riskScore}/10</Text></Text>
                        </View>
                        {/* Lawyer */}
                        {selectedLawyer && (
                            <View style={s.confirmLawyerRow}>
                                <LinearGradient colors={[selectedLawyer.color, '#111']} style={s.lawyerAvatarSm}>
                                    <Text allowFontScaling={false} style={s.lawyerAvatarTextSm}>{selectedLawyer.initials}</Text>
                                </LinearGradient>
                                <View>
                                    <Text allowFontScaling={false} style={s.confirmLawyerName}>{selectedLawyer.name}</Text>
                                    <Text allowFontScaling={false} style={s.confirmLawyerSpec}>{selectedLawyer.specialty}</Text>
                                </View>
                            </View>
                        )}
                        {/* Actions */}
                        <TouchableOpacity onPress={handleFinalApprove} style={{ marginTop: 8 }}>
                            <LinearGradient colors={[GOLD, ORANGE]} style={s.confirmApproveBtn}>
                                <Text allowFontScaling={false} style={s.confirmApproveBtnText}>✓ EVET, DOĞRU — BAŞLAT</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowConfirm(false)} style={s.confirmCancelBtn}>
                            <Text allowFontScaling={false} style={s.confirmCancelText}>Düzelt / Geri Dön</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
    headerTitle: { color: GOLD, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSub: { color: '#555', fontSize: 10, marginTop: 2 },

    // Scroll
    scroll: { paddingHorizontal: 16, paddingTop: 8 },

    // Hero card
    heroCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a' },
    heroBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: GOLD + '55' },
    heroEye: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
    heroTitle: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 20 },
    heroIdRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
    heroIdText: { color: '#444', fontSize: 10 },

    // Sections
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' },
    sectionDot: { width: 3, height: 16, backgroundColor: GOLD, borderRadius: 2 },
    sectionTitle: { color: '#ccc', fontSize: 13, fontWeight: '700' },
    sectionSub: { color: '#555', fontSize: 11, marginLeft: 'auto' },

    // Glass card
    glassCard: { backgroundColor: '#101010', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
    glassAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: GOLD },
    caseSummaryText: { color: '#999', fontSize: 13, lineHeight: 20, paddingLeft: 10 },
    caseSummaryInput: { color: '#ccc', minHeight: 80, paddingLeft: 10, textAlignVertical: 'top' },

    // Edit button
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: GOLD + '55', backgroundColor: GOLD + '11' },
    editBtnText: { color: GOLD, fontSize: 11, fontWeight: '700' },

    // Findings
    findingsContainer: { marginBottom: 24, gap: 10 },
    findingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    findingIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    findingText: { color: '#bbb', fontSize: 13, lineHeight: 19, flex: 1, paddingTop: 8 },

    // Tags
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: GOLD + '44', gap: 6 },
    tagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
    tagText: { color: GOLD, fontSize: 11, fontWeight: '700' },

    // Docs
    docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 10, paddingVertical: 6 },
    docText: { color: '#777', fontSize: 13 },

    // Actions
    actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: 10, paddingVertical: 6 },
    actionNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    actionNumText: { color: '#000', fontSize: 11, fontWeight: '900' },
    actionText: { color: '#aaa', fontSize: 13, lineHeight: 19, flex: 1 },

    // Lawyer cards
    lawyerCard: { backgroundColor: '#0e0e0e', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
    lawyerCardSelected: { borderColor: GOLD + '88' },
    lawyerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    lawyerAvatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    lawyerName: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 },
    lawyerSpecRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    lawyerSpecBold: { color: GOLD, fontSize: 12, fontWeight: '700', flex: 1 },
    lawyerSpec: { color: '#666', fontSize: 11, marginBottom: 6 },
    lawyerTagRow: { flexDirection: 'row', gap: 6 },
    lawyerTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1a1508', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    lawyerTagText: { color: GOLD, fontSize: 10, fontWeight: '600' },
    lawyerSelectCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
    lawyerSelectCircleActive: { backgroundColor: GOLD, borderColor: GOLD },

    // Bottom CTA
    bottomCta: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, backgroundColor: BG + 'EE' },
    ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10 },
    ctaText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

    // Confirm Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
    confirmModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, overflow: 'hidden', borderTopWidth: 1, borderColor: GOLD + '44' },
    confirmHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    confirmTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
    confirmSummaryBox: { backgroundColor: '#181818', borderRadius: 14, padding: 16, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' },
    confirmSummaryLabel: { color: GOLD, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6, paddingLeft: 10 },
    confirmSummaryTitle: { color: '#fff', fontSize: 14, fontWeight: '700', paddingLeft: 10 },
    confirmSummaryRisk: { color: '#888', fontSize: 12, marginTop: 4, paddingLeft: 10 },
    confirmLawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, backgroundColor: '#141414', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#222' },
    lawyerAvatarSm: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    lawyerAvatarTextSm: { color: '#fff', fontSize: 15, fontWeight: '900' },
    confirmLawyerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
    confirmLawyerSpec: { color: '#777', fontSize: 11 },
    confirmApproveBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
    confirmApproveBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
    confirmCancelBtn: { alignItems: 'center', paddingVertical: 14 },
    confirmCancelText: { color: '#555', fontSize: 13 },
});
