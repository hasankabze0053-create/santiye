import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const GOLD = '#D4AF37';
const GOLD_D = '#B8860B';

// ─── MOCK AI RESULT ─────────────────────────────────────────────────────────
const MOCK_BOQ = [
    { id: '1', group: 'Yıkım & Hazırlık', task: 'Mevcut bölme duvarın kırılarak moloz atımı', qty: '~12 m²', note: 'Açık mutfak için statik rapor şart.' },
    { id: '2', group: 'Zemin', task: '60×120 Lüks Mermer Görünümlü Seramik uygulaması', qty: '~25 m²', note: 'Kullanıcı parlak doku istedi.' },
    { id: '3', group: 'Tavan & Aydınlatma', task: 'Alçıpan asma tavan + gizli LED kanalı', qty: '15 m', note: 'Sıcak ışık ve modern hava talebi.' },
    { id: '4', group: 'Mobilya', task: 'Lake boyalı gizli kulplu mutfak dolabı', qty: '4.5 m', note: 'Mevcut yerleşim üzerinden optimize edildi.' },
    { id: '5', group: 'Boya & Yüzey', task: 'İtalyan dokulu dekoratif boya (Antrasit)', qty: '~40 m²', note: 'Sadece TV arkası duvarda uygulanacak.' },
];

const SUGGESTIONS = [
    "Duvar kırımını iptal et, sadece boyayalım",
    "Mermer değil masif parke olsun",
    "Gizli ışıklandırma kapsamını genişlet",
    "Bütçeyi ekonomik tut",
];

// ─── VOICE WAVE ─────────────────────────────────────────────────────────────
function VoiceWave({ active }) {
    const bars = [0.4, 0.7, 1, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7, 1, 0.4, 0.8, 0.6, 0.9];
    const anims = useRef(bars.map(() => new Animated.Value(0.3))).current;

    useEffect(() => {
        if (!active) {
            anims.forEach(a => Animated.timing(a, { toValue: 0.3, duration: 300, useNativeDriver: true }).start());
            return;
        }
        const animations = anims.map((a, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(a, { toValue: bars[i], duration: 200 + i * 40, easing: Easing.sin, useNativeDriver: true }),
                    Animated.timing(a, { toValue: 0.15, duration: 200 + i * 40, easing: Easing.sin, useNativeDriver: true }),
                ])
            )
        );
        Animated.stagger(50, animations).start();
        return () => animations.forEach(a => a.stop?.());
    }, [active]);

    return (
        <View style={wv.wrap}>
            {anims.map((a, i) => (
                <Animated.View
                    key={i}
                    style={[wv.bar, { transform: [{ scaleY: a }] }]}
                />
            ))}
        </View>
    );
}
const wv = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', height: 40, gap: 3.5, justifyContent: 'center' },
    bar: { width: 3, height: 32, borderRadius: 2, backgroundColor: GOLD },
});

// ─── BOQ ITEM ────────────────────────────────────────────────────────────────
function BOQItem({ item, checked, onToggle }) {
    return (
        <TouchableOpacity style={[boq.row, !checked && boq.rowUnchecked]} onPress={onToggle} activeOpacity={0.8}>
            <View style={[boq.check, checked && boq.checkActive]}>
                {checked && <MaterialCommunityIcons name="check" size={13} color="#000" />}
            </View>
            <View style={{ flex: 1, gap: 3 }}>
                <Text allowFontScaling={false} style={[boq.group, !checked && { color: '#555' }]}>{item.group}</Text>
                <Text allowFontScaling={false} style={[boq.task, !checked && { color: '#444', textDecorationLine: 'line-through' }]}>{item.task}</Text>
                <View style={boq.meta}>
                    <View style={boq.badge}><Text allowFontScaling={false} style={boq.badgeText}>{item.qty}</Text></View>
                    <Text allowFontScaling={false} style={boq.note} numberOfLines={2}>{item.note}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
const boq = StyleSheet.create({
    row: { flexDirection: 'row', gap: 14, backgroundColor: '#111', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
    rowUnchecked: { opacity: 0.5 },
    check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
    checkActive: { backgroundColor: GOLD, borderColor: GOLD },
    group: { color: GOLD, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    task: { color: '#FFF', fontSize: 13, fontWeight: '600', lineHeight: 18 },
    meta: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 },
    badge: { backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', flexShrink: 0 },
    badgeText: { color: GOLD, fontSize: 10, fontWeight: '700' },
    note: { color: '#666', fontSize: 11, lineHeight: 15, flex: 1 },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AIRenovationAssistantScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);

    // phase: 'input' | 'analyzing' | 'result' | 'chat'
    const [phase, setPhase] = useState('input');
    const [photos, setPhotos] = useState([]);
    const [recording, setRecording] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [checkedItems, setCheckedItems] = useState(MOCK_BOQ.map(i => i.id));
    const [chatMsg, setChatMsg] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);

    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const micAnim = useRef(new Animated.Value(1)).current;

    // Analyzing spinner
    useEffect(() => {
        if (analyzing) {
            Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true })).start();
        } else {
            spinAnim.stopAnimation();
        }
    }, [analyzing]);

    // Mic pulse
    useEffect(() => {
        if (recording) {
            Animated.loop(Animated.sequence([
                Animated.timing(micAnim, { toValue: 1.14, duration: 600, useNativeDriver: true }),
                Animated.timing(micAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])).start();
        } else {
            micAnim.stopAnimation();
            Animated.timing(micAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }
    }, [recording]);

    // Upload glow
    const triggerGlow = () => {
        Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
            Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]).start();
    };

    const pickPhotos = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Galeri erişimi gerekiyor.'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.85 });
        if (!res.canceled) { setPhotos(p => [...p, ...res.assets]); triggerGlow(); }
    };

    const toggleMic = () => {
        if (recording) {
            setRecording(false);
            // Simulated transcription
            if (!voiceText) setVoiceText('Kanka buradaki duvarı yıkıp açık mutfak yapmak istiyorum, zeminler mermer görünümlü seramik olsun, bir de gizli ışıklandırma ekleyelim.');
        } else {
            setRecording(true);
        }
    };

    const startAnalysis = () => {
        if (photos.length === 0 && !voiceText) {
            Alert.alert('Bilgi Eksik', 'Fotoğraf yükle veya sesli açıkla — ya da ikisini birden yap.');
            return;
        }
        setAnalyzing(true);
        setPhase('analyzing');
        setTimeout(() => {
            setAnalyzing(false);
            setPhase('result');
            setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
        }, 2800);
    };

    const sendChat = () => {
        if (!chatMsg.trim()) return;
        const userMsg = chatMsg.trim();
        setChatMsg('');
        setChatLog(log => [...log, { role: 'user', text: userMsg }]);
        // Simulated AI response
        setTimeout(() => {
            setChatLog(log => [...log, {
                role: 'ai',
                text: '✅ Anlıyorum. Listenizi güncelliyorum. Değişiklik onaylandıktan sonra mimarlık ofislerine iletilebilir.',
            }]);
        }, 900);
    };

    const handleConfirm = () => {
        const selected = MOCK_BOQ.filter(i => checkedItems.includes(i.id));
        Alert.alert('Keşif Talebi Gönderildi ✅', `${selected.length} iş kalemi içeren teknik keşif özeti mimarlık ofislerine iletildi. En kısa sürede dönüş yapılacak.`, [
            { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
    };

    const spinInterpolate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const glowColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(212,175,55,0)', 'rgba(212,175,55,0.35)'] });

    // ── PHASE: INPUT ──────────────────────────────────────────────
    const renderInput = () => (
        <View style={{ gap: 20 }}>
            {/* Upload */}
            <Animated.View style={[ph.uploadOuter, { shadowColor: GOLD, shadowOpacity: glowAnim, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }]}>
                <TouchableOpacity style={ph.uploadBox} onPress={pickPhotos} activeOpacity={0.85}>
                    <LinearGradient colors={['#111', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />
                    <Animated.View style={[ph.uploadGlow, { backgroundColor: glowColor }]} />
                    {photos.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                            {photos.map((p, i) => (
                                <View key={i} style={ph.thumb}>
                                    <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                                    <TouchableOpacity style={ph.removeBtn} onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>
                                        <Ionicons name="close" size={12} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={ph.addMore} onPress={pickPhotos}>
                                <Ionicons name="add" size={28} color={GOLD} />
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={ph.uploadEmpty}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={44} color={GOLD} />
                            <Text allowFontScaling={false} style={ph.uploadTitle}>Mekanını Göster</Text>
                            <Text allowFontScaling={false} style={ph.uploadSub}>Fotoğraf veya video yükle — AI mekânı analiz etsin</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={ph.divRow}>
                <View style={ph.divLine} /><Text allowFontScaling={false} style={ph.divText}>VEYA</Text><View style={ph.divLine} />
            </View>

            {/* Voice */}
            <View style={ph.voiceBox}>
                <LinearGradient colors={['#111', '#0e0e0e']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                <View style={ph.voiceHead}>
                    <MaterialCommunityIcons name="chef-hat" size={18} color={GOLD} />
                    <Text allowFontScaling={false} style={ph.voiceLabel}>Şef Sizi Dinliyor</Text>
                </View>
                {recording && <VoiceWave active={recording} />}
                {voiceText ? (
                    <View style={ph.transcript}>
                        <Text allowFontScaling={false} style={ph.transcriptText}>"{voiceText}"</Text>
                    </View>
                ) : (
                    <Text allowFontScaling={false} style={ph.voiceHint}>Mikrofona basılı tutun ve tadilat hayallerinizi anlatın.</Text>
                )}
                <Animated.View style={{ transform: [{ scale: micAnim }] }}>
                    <TouchableOpacity style={[ph.micBtn, recording && ph.micBtnActive]} onPress={toggleMic} activeOpacity={0.85}>
                        <LinearGradient
                            colors={recording ? ['#ef4444', '#dc2626'] : [GOLD, GOLD_D]}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <Ionicons name={recording ? "stop" : "mic"} size={28} color={recording ? "#FFF" : "#000"} />
                        <Text allowFontScaling={false} style={[ph.micLabel, recording && { color: '#FFF' }]}>
                            {recording ? 'Durdur' : 'Hayalini Anlat'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* CTA */}
            <TouchableOpacity style={ph.analyzeBtn} onPress={startAnalysis} activeOpacity={0.85}>
                <LinearGradient colors={[GOLD, GOLD_D]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <MaterialCommunityIcons name="magic-staff" size={22} color="#000" />
                <Text allowFontScaling={false} style={ph.analyzeBtnText}>ŞEF ANALİZ ETSİN</Text>
            </TouchableOpacity>
        </View>
    );

    const ph = StyleSheet.create({
        uploadOuter: { borderRadius: 20, elevation: 10 },
        uploadBox: { height: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: '#2a2a2a', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
        uploadGlow: { ...StyleSheet.absoluteFillObject },
        uploadEmpty: { alignItems: 'center', gap: 10 },
        uploadTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
        uploadSub: { color: '#666', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
        thumb: { width: 100, height: 100, borderRadius: 12, margin: 6, overflow: 'hidden', position: 'relative', backgroundColor: '#222' },
        removeBtn: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
        addMore: { width: 100, height: 100, borderRadius: 12, margin: 6, borderWidth: 1, borderColor: GOLD, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
        divRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        divLine: { flex: 1, height: 1, backgroundColor: '#222' },
        divText: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
        voiceBox: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a', padding: 24, gap: 16, alignItems: 'center' },
        voiceHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        voiceLabel: { color: GOLD, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
        voiceHint: { color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 20 },
        transcript: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2a2a2a', width: '100%' },
        transcriptText: { color: '#ccc', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
        micBtn: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 4 },
        micBtnActive: {},
        micLabel: { color: '#000', fontSize: 10, fontWeight: '900' },
        analyzeBtn: { height: 58, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
        analyzeBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
    });

    // ── PHASE: ANALYZING ──────────────────────────────────────────
    const renderAnalyzing = () => (
        <View style={an.wrap}>
            <Animated.View style={[an.ring, { transform: [{ rotate: spinInterpolate }] }]}>
                <LinearGradient colors={[GOLD, 'transparent', GOLD + '33']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            </Animated.View>
            <View style={an.inner}>
                <MaterialCommunityIcons name="chef-hat" size={40} color={GOLD} />
            </View>
            <Text allowFontScaling={false} style={an.title}>Şef Analiz Ediyor...</Text>
            <Text allowFontScaling={false} style={an.sub}>Mekan fotoğrafları ve ses kaydınız yapay zeka tarafından teknik parametrelere dönüştürülüyor.</Text>
            <View style={an.steps}>
                {['📸 Görüntü analizi', '🎙️ Ses metni çözümleme', '📐 BOQ listesi hazırlanıyor'].map((s, i) => (
                    <View key={i} style={an.stepRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color={GOLD} />
                        <Text allowFontScaling={false} style={an.stepText}>{s}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
    const an = StyleSheet.create({
        wrap: { alignItems: 'center', paddingTop: 60, gap: 24 },
        ring: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: 'transparent', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
        inner: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
        title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
        sub: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
        steps: { width: '100%', gap: 12, backgroundColor: '#111', borderRadius: 18, padding: 20 },
        stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        stepText: { color: '#aaa', fontSize: 13 },
    });

    // ── PHASE: RESULT ─────────────────────────────────────────────
    const renderResult = () => (
        <View style={{ gap: 20 }}>
            {/* AI özet başlığı */}
            <View style={rs.header}>
                <LinearGradient colors={['rgba(212,175,55,0.08)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                <View style={rs.aiTag}>
                    <MaterialCommunityIcons name="magic-staff" size={14} color="#000" />
                    <Text allowFontScaling={false} style={rs.aiTagText}>AI KEŞİF ÖZETİ</Text>
                </View>
                <Text allowFontScaling={false} style={rs.headerTitle}>Teknik İhtiyaç Listesi</Text>
                <Text allowFontScaling={false} style={rs.headerSub}>AI {MOCK_BOQ.length} iş kalemi tespit etti. İstemediğin kalemleri kaldır, ardından ofislere gönder.</Text>
            </View>

            {/* BOQ liste */}
            {MOCK_BOQ.map(item => (
                <BOQItem
                    key={item.id}
                    item={item}
                    checked={checkedItems.includes(item.id)}
                    onToggle={() => setCheckedItems(prev =>
                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                    )}
                />
            ))}

            {/* Öneriler */}
            <View style={rs.suggestBox}>
                <Text allowFontScaling={false} style={rs.suggestTitle}>💬 Şefe Sor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {SUGGESTIONS.map((s, i) => (
                        <TouchableOpacity key={i} style={rs.chip} onPress={() => { setChatMsg(s); setPhase('chat'); }}>
                            <Text allowFontScaling={false} style={rs.chipText}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Confirm */}
            <TouchableOpacity style={rs.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                <LinearGradient colors={[GOLD, GOLD_D]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <MaterialCommunityIcons name="send-check" size={22} color="#000" />
                <Text allowFontScaling={false} style={rs.confirmText}>ONAYLA & OFİSLERE GÖNDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rs.chatBtn} onPress={() => setPhase('chat')} activeOpacity={0.85}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={GOLD} />
                <Text allowFontScaling={false} style={rs.chatBtnText}>Şef ile listeyi düzenle</Text>
            </TouchableOpacity>
        </View>
    );
    const rs = StyleSheet.create({
        header: { backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', overflow: 'hidden', gap: 8 },
        aiTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
        aiTagText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
        headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
        headerSub: { color: '#888', fontSize: 13, lineHeight: 20 },
        suggestBox: { backgroundColor: '#111', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#222' },
        suggestTitle: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
        chip: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, marginRight: 10, borderWidth: 1, borderColor: '#333' },
        chipText: { color: '#ccc', fontSize: 12 },
        confirmBtn: { height: 58, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
        confirmText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
        chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
        chatBtnText: { color: GOLD, fontSize: 13, fontWeight: '600' },
    });

    // ── PHASE: CHAT ───────────────────────────────────────────────
    const renderChat = () => (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ gap: 16 }}>
            {/* Chat log */}
            <View style={ch.chatBox}>
                <View style={ch.aiRow}>
                    <View style={ch.aiAvatar}><MaterialCommunityIcons name="chef-hat" size={16} color="#000" /></View>
                    <View style={ch.aiBubble}>
                        <Text allowFontScaling={false} style={ch.aiBubbleText}>Merhaba! Teknik listenizi güncellememi veya düzenlemememi ister misiniz? Her türlü tadilat sorunuzu sorabilirsiniz.</Text>
                    </View>
                </View>
                {chatLog.map((msg, i) => (
                    msg.role === 'user' ? (
                        <View key={i} style={ch.userRow}>
                            <View style={ch.userBubble}><Text allowFontScaling={false} style={ch.userBubbleText}>{msg.text}</Text></View>
                        </View>
                    ) : (
                        <View key={i} style={ch.aiRow}>
                            <View style={ch.aiAvatar}><MaterialCommunityIcons name="chef-hat" size={16} color="#000" /></View>
                            <View style={ch.aiBubble}><Text allowFontScaling={false} style={ch.aiBubbleText}>{msg.text}</Text></View>
                        </View>
                    )
                ))}
            </View>

            {/* Input */}
            <View style={ch.inputRow}>
                <TextInput allowFontScaling={false}
                    style={ch.input}
                    placeholder="Şefe yaz..."
                    placeholderTextColor="#555"
                    value={chatMsg}
                    onChangeText={setChatMsg}
                    multiline
                    maxLength={300}
                />
                <TouchableOpacity style={ch.sendBtn} onPress={sendChat}>
                    <LinearGradient colors={[GOLD, GOLD_D]} style={StyleSheet.absoluteFillObject} />
                    <Ionicons name="send" size={18} color="#000" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={rs.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
                <LinearGradient colors={[GOLD, GOLD_D]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <MaterialCommunityIcons name="send-check" size={22} color="#000" />
                <Text allowFontScaling={false} style={rs.confirmText}>ONAYLA & OFİSLERE GÖNDER</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
    const ch = StyleSheet.create({
        chatBox: { backgroundColor: '#0e0e0e', borderRadius: 20, padding: 16, gap: 14, borderWidth: 1, borderColor: '#1a1a1a', minHeight: 200 },
        aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
        aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        aiBubble: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12 },
        aiBubbleText: { color: '#CCC', fontSize: 13, lineHeight: 20 },
        userRow: { alignItems: 'flex-end' },
        userBubble: { backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 16, borderBottomRightRadius: 4, padding: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', maxWidth: '80%' },
        userBubbleText: { color: GOLD, fontSize: 13, lineHeight: 20 },
        inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
        input: { flex: 1, backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', color: '#FFF', padding: 14, fontSize: 14, maxHeight: 100 },
        sendBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    });

    // ── HEADER LABEL ─────────────────────────────────────────────
    const phaseLabel = {
        input: 'Mekanını Göster,\nHayalini Anlat',
        analyzing: 'Şef Çalışıyor...',
        result: 'Teknik Keşif\nÖzetiniz Hazır',
        chat: 'Şef ile Düzenle',
    };
    const phaseSub = {
        input: 'Fotoğraf yükle veya sesli anlat — AI teknik liste çıkarsın.',
        analyzing: 'Yapay zeka mekan analizini tamamlıyor.',
        result: 'Onaylamak istemediğin kalemleri kaldırabilir veya değiştirebilirsin.',
        chat: 'Listeyi şefle birlikte düzeltebilir, ek kalem ekleyebilirsin.',
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000', '#080808']} style={StyleSheet.absoluteFillObject} />

            {/* Gold grain overlay */}
            <LinearGradient
                colors={['rgba(212,175,55,0.03)', 'transparent', 'rgba(212,175,55,0.02)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity
                    onPress={() => phase === 'input' ? navigation.goBack() : (phase === 'chat' ? setPhase('result') : setPhase('input'))}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <View style={styles.backCircle}>
                        <Ionicons name="arrow-back" size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <View style={styles.aiChip}>
                    <MaterialCommunityIcons name="chef-hat" size={14} color="#000" />
                    <Text allowFontScaling={false} style={styles.aiChipText}>CepteŞef AI</Text>
                </View>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Phase title */}
                <View style={styles.phaseTitle}>
                    <Text allowFontScaling={false} style={styles.title}>{phaseLabel[phase]}</Text>
                    <Text allowFontScaling={false} style={styles.sub}>{phaseSub[phase]}</Text>
                </View>

                {phase === 'input' && renderInput()}
                {phase === 'analyzing' && renderAnalyzing()}
                {phase === 'result' && renderResult()}
                {phase === 'chat' && renderChat()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    backCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    aiChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    aiChipText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },
    phaseTitle: { marginBottom: 26 },
    title: { color: '#FFF', fontSize: 26, fontWeight: 'bold', lineHeight: 34, marginBottom: 8 },
    sub: { color: '#888', fontSize: 14, lineHeight: 21 },
});
