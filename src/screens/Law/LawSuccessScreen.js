/**
 * LawSuccessScreen.js — Premium AI Vaka Başlatma Onayı
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOLD_MAIN = '#D4AF37';
const GOLD_DARK = '#FF9100';
const SUCCESS_GREEN = '#10B981';

export default function LawSuccessScreen({ navigation, route }) {
    const lawyer   = route?.params?.lawyer;
    const caseData = route?.params?.caseData;

    const scaleVal  = useRef(new Animated.Value(0)).current;
    const fadeVal   = useRef(new Animated.Value(0)).current;
    const slideVal  = useRef(new Animated.Value(40)).current;

    // Ring pulse for icon
    const ring1 = useRef(new Animated.Value(0.8)).current;
    const ring2 = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Icon entrance
        Animated.spring(scaleVal, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
        // Content fade-in
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(fadeVal, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideVal, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]).start();
        // Ring pulse
        Animated.loop(Animated.sequence([
            Animated.timing(ring1, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
            Animated.timing(ring1, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.delay(600),
            Animated.timing(ring2, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
            Animated.timing(ring2, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
        ])).start();
    }, []);

    const caseId = '#VK-' + Math.floor(10000 + Math.random() * 90000);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0a120d', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Success Icon */}
                    <View style={styles.iconWrap}>
                        <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1 }] }]} />
                        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2 }] }]} />
                        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleVal }] }]}>
                            <LinearGradient colors={[GOLD_MAIN, GOLD_DARK]} style={StyleSheet.absoluteFill} />
                            <MaterialCommunityIcons name="check" size={48} color="#000" />
                        </Animated.View>
                    </View>

                    <Animated.View style={{ opacity: fadeVal, transform: [{ translateY: slideVal }] }}>

                        <Text style={styles.title}>Vaka Dosyası Oluşturuldu</Text>
                        <Text style={styles.subtitle}>Yapay Zeka analizi tamamlandı ve avukatlara iletildi.</Text>

                        {/* Case ID */}
                        <View style={styles.caseIdCard}>
                            <Text style={styles.caseIdLabel}>VAKA NUMARASI</Text>
                            <Text style={styles.caseIdValue}>{caseId}</Text>
                            <Text style={styles.caseIdNote}>Bu numara ile durumunuzu takip edebilirsiniz</Text>
                        </View>

                        {/* Matched Lawyer */}
                        {lawyer && (
                            <View style={styles.lawyerCard}>
                                <View style={styles.lawyerBadge}>
                                    <Text style={styles.lawyerBadgeText}>✦ EŞLEŞTİRİLEN AVUKAT</Text>
                                </View>
                                <View style={styles.lawyerRow}>
                                    <View style={styles.lawyerAvatar}>
                                        <Text style={{ fontSize: 26 }}>{lawyer.avatar}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.lawyerName}>{lawyer.name}</Text>
                                        <Text style={styles.lawyerTitle}>{lawyer.title}</Text>
                                    </View>
                                    <View style={styles.onlineDot} />
                                </View>
                            </View>
                        )}

                        {/* AI Summary snippet */}
                        {caseData && (
                            <View style={styles.summaryCard}>
                                <MaterialCommunityIcons name="robot-outline" size={16} color={GOLD_MAIN} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.summaryLabel}>AI ÖZET</Text>
                                    <Text style={styles.summaryText}>{caseData.kisa_ozet}</Text>
                                </View>
                            </View>
                        )}

                        {/* Timeline */}
                        <View style={styles.timelineCard}>
                            <Text style={styles.timelineTitle}>Süreç Adımları</Text>
                            {[
                                { icon: 'check-circle', color: SUCCESS_GREEN, text: 'Yapay Zeka Analizi Tamamlandı', done: true },
                                { icon: 'clock-outline', color: GOLD_MAIN, text: 'Avukat 24 saat içinde yanıt verecek', done: false },
                                { icon: 'message-outline', color: '#60A5FA', text: 'Mesaj kanalı açılacak', done: false },
                            ].map((step, i) => (
                                <View key={i} style={styles.timelineRow}>
                                    <MaterialCommunityIcons name={step.icon} size={18} color={step.color} />
                                    <Text style={[styles.timelineText, !step.done && { color: '#777' }]}>{step.text}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Actions */}
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.88}
                            onPress={() => navigation.navigate('MainTabs')}
                        >
                            <LinearGradient colors={[GOLD_MAIN, GOLD_DARK]} style={styles.primaryBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Text style={styles.primaryBtnText}>ANA SAYFAYA DÖN</Text>
                                <Ionicons name="home-outline" size={18} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.secondaryBtnText}>Yeni Analiz Başlat</Text>
                        </TouchableOpacity>

                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: 24, alignItems: 'center', paddingBottom: 48 },

    iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 32, marginTop: 20, width: 140, height: 140 },
    ring: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
    ring1: { width: 130, height: 130, borderColor: GOLD_MAIN + '30' },
    ring2: { width: 100, height: 100, borderColor: GOLD_MAIN + '50' },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        shadowColor: GOLD_MAIN, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
    },

    title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10, width: '100%' },
    subtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28, width: '100%' },

    caseIdCard: {
        width: '100%', backgroundColor: '#111', borderRadius: 20,
        padding: 20, marginBottom: 16, alignItems: 'center',
        borderWidth: 1, borderColor: '#222',
    },
    caseIdLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    caseIdValue: { color: GOLD_MAIN, fontSize: 28, fontWeight: '900', letterSpacing: 3, marginVertical: 8 },
    caseIdNote: { color: '#666', fontSize: 12 },

    lawyerCard: {
        width: '100%', backgroundColor: '#111', borderRadius: 20,
        padding: 18, marginBottom: 16,
        borderWidth: 1, borderColor: GOLD_MAIN + '33',
    },
    lawyerBadge: { marginBottom: 14 },
    lawyerBadgeText: { color: GOLD_MAIN, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    lawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    lawyerAvatar: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333',
        alignItems: 'center', justifyContent: 'center',
    },
    lawyerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
    lawyerTitle: { color: '#888', fontSize: 12, marginTop: 2 },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: SUCCESS_GREEN },

    summaryCard: {
        width: '100%', flexDirection: 'row', gap: 12,
        backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderLeftWidth: 3, borderColor: '#222', borderLeftColor: GOLD_MAIN,
    },
    summaryLabel: { color: GOLD_MAIN, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
    summaryText: { color: '#ccc', fontSize: 13, lineHeight: 20 },

    timelineCard: { width: '100%', backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#222' },
    timelineTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 16 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    timelineText: { color: '#ccc', fontSize: 13, flex: 1 },

    primaryBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', height: 58, marginBottom: 14, shadowColor: GOLD_MAIN, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    primaryBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

    secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
    secondaryBtnText: { color: GOLD_MAIN, fontSize: 14, fontWeight: '700' },
});
