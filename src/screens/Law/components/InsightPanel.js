/**
 * InsightPanel.js — AI Analiz Sonuç Paneli
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MOCK_LAWYERS } from '../../../services/legalAiService';

const { height } = Dimensions.get('window');
const GOLD = '#D4AF37';
const GOLD_DARK = '#FF9100';
const DANGER = '#EF4444';
const ORANGE = '#F97316';
const GREEN = '#10B981';

function scoreColor(s) { return s >= 8 ? DANGER : s >= 5 ? ORANGE : GREEN; }
function scoreLabel(s) { return s >= 8 ? 'KRİTİK' : s >= 5 ? 'ORTA' : 'DÜŞÜK'; }

// Circular ring score
function RingScore({ score }) {
    const pct = score / 10;
    const c = scoreColor(score);
    return (
        <View style={rs.wrap}>
            <View style={[rs.outer, { borderColor: c + '40' }]}>
                <View style={[rs.inner, { borderColor: c, borderTopColor: 'transparent' }]} />
                <Text allowFontScaling={false} style={[rs.num, { color: c }]}>{score}</Text>
            </View>
            <Text allowFontScaling={false} style={[rs.label, { color: c }]}>{scoreLabel(score)}</Text>
        </View>
    );
}
const rs = StyleSheet.create({
    wrap: { alignItems: 'center' },
    outer: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    inner: { position: 'absolute', width: 70, height: 70, borderRadius: 35, borderWidth: 4 },
    num: { fontSize: 22, fontWeight: '900' },
    label: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});

function LawyerCard({ lawyer, rank, onConnect }) {
    return (
        <View style={lc.card}>
            {rank === 1 && <LinearGradient colors={['rgba(212,175,55,0.07)', 'transparent']} style={StyleSheet.absoluteFill} />}
            {rank === 1 && <View style={lc.topBadge}><Text allowFontScaling={false} style={lc.topText}>✦ BEST MATCH</Text></View>}
            <View style={lc.row}>
                <View style={lc.avatar}><Text allowFontScaling={false} style={{ fontSize: 24 }}>{lawyer.avatar}</Text></View>
                <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={lc.name}>{lawyer.name}</Text>
                    <Text allowFontScaling={false} style={lc.spec}>{lawyer.title}</Text>
                </View>
                <View style={lc.stats}>
                    <Text allowFontScaling={false} style={lc.statVal}>⭐{lawyer.rating}</Text>
                    <Text allowFontScaling={false} style={lc.statVal}>%{lawyer.successRate}</Text>
                </View>
            </View>
            <TouchableOpacity style={lc.btn} onPress={() => onConnect(lawyer)} activeOpacity={0.85}>
                <LinearGradient colors={[GOLD, GOLD_DARK]} style={lc.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text allowFontScaling={false} style={lc.btnText}>AVUKATA BAĞLAN</Text>
                    <Ionicons name="arrow-forward" size={14} color="#000" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}
const lc = StyleSheet.create({
    card: { backgroundColor: '#111', borderRadius: 20, borderWidth: 1, borderColor: '#222', padding: 16, marginBottom: 12, overflow: 'hidden' },
    topBadge: { position: 'absolute', top: 10, right: 12, backgroundColor: GOLD + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: GOLD + '44' },
    topText: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
    name: { color: '#fff', fontSize: 15, fontWeight: '700' },
    spec: { color: '#777', fontSize: 11, marginTop: 2 },
    stats: { alignItems: 'flex-end', gap: 4 },
    statVal: { color: '#aaa', fontSize: 11, fontWeight: '600' },
    btn: { borderRadius: 12, overflow: 'hidden', height: 42 },
    btnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
});

export default function InsightPanel({ visible, data, onClose, onConfirm, onReAnalyze }) {
    const translateY = useRef(new Animated.Value(height)).current;
    const scoreAnim  = useRef(new Animated.Value(0)).current;
    const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;
    const [display, setDisplay] = useState(0);
    const [showLawyers, setShowLawyers] = useState(false);
    
    // Revizyon & Onay State'leri
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editableSummary, setEditableSummary] = useState('');
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        if (visible && data) {
            setShowLawyers(false);
            setIsEditingMode(false);
            setEditableSummary(data.kisa_ozet || '');
            setHasScrolled(false);
            scoreAnim.setValue(0);
            setDisplay(0);
            Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }).start();
            Animated.timing(scoreAnim, { toValue: data.aciliyet_skoru, duration: 1600, useNativeDriver: false }).start();
            
            // Scroll Indicator Animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scrollIndicatorAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(scrollIndicatorAnim, { toValue: 0, duration: 800, useNativeDriver: true })
                ])
            ).start();

            const id = scoreAnim.addListener(({ value }) => setDisplay(Math.round(value)));
            return () => scoreAnim.removeListener(id);
        } else {
            Animated.timing(translateY, { toValue: height, duration: 260, useNativeDriver: true }).start();
        }
    }, [visible, data]);

    if (!data) return null;
    const sc = scoreColor(data.aciliyet_skoru);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
                <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
                    <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={s.bg} />
                    <View style={s.handle} />
                    
                    {/* Close Button */}
                    <TouchableOpacity style={s.closeIconBtn} onPress={onClose} hitSlop={{top: 15, bottom:15, left:15, right:15}}>
                        <MaterialCommunityIcons name="close" size={24} color="#aaa" />
                    </TouchableOpacity>

                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{ paddingBottom: 50 }}
                        onScroll={() => setHasScrolled(true)}
                        scrollEventThrottle={16}
                    >
                        {!showLawyers ? (
                            <>
                                {data.sos_modu && (
                                    <View style={s.sosAlert}>
                                        <MaterialCommunityIcons name="alarm-light" size={16} color={DANGER} />
                                        <Text allowFontScaling={false} style={s.sosAlertText}>S.O.S. MODU — Derhal canlı desteğe bağlanın</Text>
                                    </View>
                                )}
                                <View style={s.header}>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={s.catLabel}>{data.kategori.toUpperCase()}</Text>
                                        <Text allowFontScaling={false} style={s.title}>Yapay Zeka Vaka Analizi</Text>
                                    </View>
                                    <RingScore score={display} />
                                </View>

                                {/* Editable Summary */}
                                <View style={[s.summaryCard, isEditingMode && { borderColor: GOLD, backgroundColor: 'rgba(212,175,55,0.05)' }]}>
                                    <View style={s.summaryLine} />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <Text allowFontScaling={false} style={{ color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
                                                {isEditingMode ? 'ÖZETİ DÜZENLE' : 'VAKA ÖZETİ'}
                                            </Text>
                                            {!isEditingMode && (
                                                <TouchableOpacity onPress={() => setIsEditingMode(true)} style={{ padding: 4 }}>
                                                    <MaterialCommunityIcons name="pencil" size={16} color="#aaa" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {isEditingMode ? (
                                            <TextInput
                                                style={s.summaryInput}
                                                multiline
                                                value={editableSummary}
                                                onChangeText={setEditableSummary}
                                                placeholder="Özeti buraya ekleyin veya değiştirin..."
                                                placeholderTextColor="#555"
                                                autoFocus
                                            />
                                        ) : (
                                            <Text allowFontScaling={false} style={s.summaryText}>{editableSummary || data.kisa_ozet}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Riskler */}
                                <Text allowFontScaling={false} style={s.sectionTitle}>⚠️  Kritik Riskler</Text>
                                {data.kritik_riskler.map((r, i) => (
                                    <View key={i} style={s.riskRow}>
                                        <View style={[s.riskDot, { backgroundColor: i === 0 ? DANGER : ORANGE }]} />
                                        <Text allowFontScaling={false} style={s.riskText}>{r}</Text>
                                    </View>
                                ))}

                                {/* Kanun */}
                                <Text allowFontScaling={false} style={[s.sectionTitle, { marginTop: 20 }]}>⚖️  Kanun Maddeleri</Text>
                                {data.kanun_maddeleri.map((l, i) => (
                                    <View key={i} style={s.lawRow}>
                                        <View style={s.lawBadge}><Text allowFontScaling={false} style={s.lawBadgeText}>Md.{l.madde}</Text></View>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={s.lawTitle}>{l.konu}</Text>
                                            <Text allowFontScaling={false} style={s.lawSub}>{l.kanun}</Text>
                                        </View>
                                    </View>
                                ))}

                                {/* Belgeler */}
                                <Text allowFontScaling={false} style={[s.sectionTitle, { marginTop: 20 }]}>📎  Gerekli Belgeler</Text>
                                {data.gereken_belgeler.map((d, i) => (
                                    <View key={i} style={s.docRow}>
                                        <MaterialCommunityIcons name="file-document-outline" size={13} color={GOLD} />
                                        <Text allowFontScaling={false} style={s.docText}>{d}</Text>
                                    </View>
                                ))}

                                {/* Aksiyonlar */}
                                <Text allowFontScaling={false} style={[s.sectionTitle, { marginTop: 20 }]}>💡  Önerilen Aksiyonlar</Text>
                                {data.onerilen_aksiyonlar.map((a, i) => (
                                    <View key={i} style={s.actRow}>
                                        <View style={s.actNum}><Text allowFontScaling={false} style={s.actNumText}>{i + 1}</Text></View>
                                        <Text allowFontScaling={false} style={s.actText}>{a}</Text>
                                    </View>
                                ))}

                                {/* Scroll Indicator (Hides when Scrolled) */}
                                {!hasScrolled && !isEditingMode && (
                                    <Animated.View style={[s.scrollIndicator, { 
                                        opacity: scrollIndicatorAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                                        transform: [{ translateY: scrollIndicatorAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }]
                                    }]}>
                                        <MaterialCommunityIcons name="chevron-double-down" size={24} color={GOLD} />
                                        <Text allowFontScaling={false} style={s.scrollIndicatorText}>Aşağı Kaydır</Text>
                                    </Animated.View>
                                )}

                                {/* CTAs */}
                                {isEditingMode ? (
                                    <View style={s.editActionsRow}>
                                        <TouchableOpacity style={s.reanalyzeBtn} onPress={() => {
                                            if (onReAnalyze) onReAnalyze(editableSummary);
                                        }}>
                                            <MaterialCommunityIcons name="refresh" size={18} color={GOLD} />
                                            <Text allowFontScaling={false} style={s.reanalyzeBtnText}>YENİDEN ANALİZ ET</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity style={s.saveEditBtn} onPress={() => setIsEditingMode(false)}>
                                            <LinearGradient colors={[GREEN, '#059669']} style={s.btnFullGrad} start={{ x:0, y:0 }} end={{ x:1, y:0 }}>
                                                <MaterialCommunityIcons name="check" size={18} color="#fff" />
                                                <Text allowFontScaling={false} style={s.saveEditBtnText}>KAYDET</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={s.ctaBtn} onPress={() => setShowLawyers(true)} activeOpacity={0.87}>
                                        <LinearGradient colors={data.sos_modu ? [DANGER, '#B91C1C'] : [GOLD, GOLD_DARK]} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                            <MaterialCommunityIcons name={data.sos_modu ? 'alarm-light' : 'check-decagram'} size={20} color="#000" />
                                            <Text allowFontScaling={false} style={s.ctaText}>{data.sos_modu ? 'ACİL AVUKATA BAĞLAN' : 'RAPORU ONAYLA & AVUKAT BUL'}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <>
                                <View style={s.header}>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={s.catLabel}>AI TARAFINDAN SEÇİLDİ</Text>
                                        <Text allowFontScaling={false} style={s.title}>Size En Uygun Avukatlar</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowLawyers(false)} style={s.backBtn}>
                                        <Ionicons name="arrow-back" size={18} color="#aaa" />
                                    </TouchableOpacity>
                                </View>
                                {MOCK_LAWYERS.map((lawyer, i) => (
                                    <LawyerCard key={lawyer.id} lawyer={lawyer} rank={i + 1} onConnect={onConfirm} />
                                ))}
                            </>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    sheet: { height: height * 0.92, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', shadowColor: GOLD, shadowOpacity: 0.12, shadowRadius: 24, elevation: 20 },
    bg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0C0C0C' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#2A2A2A', alignSelf: 'center', marginTop: 12, marginBottom: 2 },
    sosAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.10)', marginHorizontal: 20, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: DANGER + '33', marginTop: 4 },
    sosAlertText: { color: DANGER, fontWeight: '700', fontSize: 12 },
    header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12, gap: 12 },
    catLabel: { color: GOLD, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
    title: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 3 },
    backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
    summaryCard: { flexDirection: 'row', gap: 10, marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: '#1E1E1E' },
    summaryLine: { width: 3, borderRadius: 2, backgroundColor: GOLD, alignSelf: 'stretch' },
    summaryText: { color: '#bbb', fontSize: 13, lineHeight: 21, flex: 1 },
    sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 10, paddingHorizontal: 20 },
    riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 20, marginBottom: 9 },
    riskDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 4.5, flexShrink: 0 },
    riskText: { color: '#bbb', fontSize: 13, lineHeight: 20, flex: 1 },
    lawRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
    lawBadge: { backgroundColor: GOLD + '18', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: GOLD + '33' },
    lawBadgeText: { color: GOLD, fontSize: 10, fontWeight: '800' },
    lawTitle: { color: '#ddd', fontSize: 12, fontWeight: '600' },
    lawSub: { color: '#666', fontSize: 11, marginTop: 1 },
    docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 7 },
    docText: { color: '#999', fontSize: 13 },
    actRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
    actNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD + '20', borderWidth: 1, borderColor: GOLD + '44', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    actNumText: { color: GOLD, fontSize: 10, fontWeight: '800' },
    actText: { color: '#bbb', fontSize: 13, lineHeight: 20, flex: 1 },
    ctaBtn: { marginHorizontal: 20, borderRadius: 18, overflow: 'hidden', height: 58, marginTop: 24, shadowColor: GOLD, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    ctaGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    ctaText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
    
    // New Styles for UX Fixes
    closeIconBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    summaryInput: { minHeight: 80, color: '#fff', fontSize: 13, lineHeight: 21, padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' },
    editActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 24 },
    reanalyzeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 14, borderWidth: 1, borderColor: GOLD + '55', backgroundColor: 'rgba(212,175,55,0.08)' },
    reanalyzeBtnText: { color: GOLD, fontSize: 12, fontWeight: '800' },
    saveEditBtn: { flex: 1, height: 50, borderRadius: 14, overflow: 'hidden' },
    btnFullGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    saveEditBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    scrollIndicator: { alignItems: 'center', marginTop: 30, marginBottom: 10 },
    scrollIndicatorText: { color: GOLD, fontSize: 10, fontWeight: '600', marginTop: 2, opacity: 0.8 },
});
