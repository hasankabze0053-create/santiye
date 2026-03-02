import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    InputAccessoryView,
    Keyboard,
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
import { supabase } from '../../lib/supabase';
import { uploadImageToSupabase } from '../../services/PhotoUploadService';

const { width } = Dimensions.get('window');
const GOLD_MAIN = '#D4AF37';
const GOLD_DARK = '#B8860B';
const DANGER_RED = '#EF4444';

// ─── DATA ───────────────────────────────────────────────────────

const SERVICES = [
    { id: 'interior', title: 'İç Cephe Boya', desc: 'Oda, salon veya tüm daire boyası', icon: 'roller' },
    { id: 'wallpaper', title: 'Duvar Kağıdı & Çıta', desc: 'Premium duvar kağıdı ve dekoratif çıta uygulaması', icon: 'texture' },
    { id: 'ceiling', title: 'Alçıpan & Asma Tavan', desc: 'Gizli LED, kartonpiyer ve tavan uygulamaları', icon: 'ceiling-light' },
    { id: 'exterior', title: 'Dış Cephe & Yalıtım', desc: 'Bina dışı boya, mantolama ve ısı yalıtımı', icon: 'home-city' },
];

const AREA_OPTIONS = [
    { id: '1+1', label: '1+1 Daire', sub: '~50 m²', icon: 'home-outline' },
    { id: '2+1', label: '2+1 Daire', sub: '~80 m²', icon: 'home' },
    { id: '3+1', label: '3+1 Daire', sub: '~110 m²', icon: 'home-plus-outline' },
    { id: '4+1', label: '4+1 / Villa', sub: '150 m² ve üzeri', icon: 'home-city-outline' },
    { id: 'rooms', label: 'Belirli Odalar', sub: 'Oda bazlı detay gir', icon: 'door-open' },
];

const TIMELINE_OPTIONS = [
    { id: 'asap', label: 'Hemen Başlanmalı', icon: 'rocket-launch-outline' },
    { id: '1month', label: '1 Ay İçinde', icon: 'calendar-clock' },
    { id: 'explore', label: 'Sadece Fiyat Araştırıyorum', icon: 'magnify' },
];

const WALL_CONDITIONS = [
    { id: 'clean', title: 'Temiz (Sadece Boya)', desc: 'Çatlak veya dökülme yok. Yıkama sonrası doğrudan boyanabilir.', icon: 'check-circle-outline' },
    { id: 'partial', title: 'Kısmi Tamirat', desc: 'Birkaç noktada alçı yoklaması ve sıva gerekiyor. Duvar hazırlığı şart.', icon: 'wrench-outline' },
    { id: 'heavy', title: 'Kapsamlı Tamirat', desc: 'Derin çatlaklar, duvar kağıdı sökümü veya koyu→açık renk geçişi var.', icon: 'alert-circle-outline' },
];

const COLOR_STYLES = [
    { id: 'warm', title: 'Sıcak & Doğal Tonlar', desc: 'Bej, toprak, kum, açık terrakota', image: 'https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?q=80&w=800&auto=format&fit=crop' },
    { id: 'cool', title: 'Modern & Soğuk Tonlar', desc: 'Gri, antrasit, füme, mavi-gri', image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop' },
    { id: 'vivid', title: 'Canlı & Pastel Renkler', desc: 'Soft mavi, yeşil, açık lavanta tonları', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800&auto=format&fit=crop' },
    { id: 'deco', title: 'Dekoratif / İtalyan Boya', desc: 'Mermer desen, sedef, mikro-çimento, dokulu premium boyalar', image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop' },
    { id: 'undecided', title: 'Karar Vermedim', desc: 'Mimarlarımız mekana ve aydınlatmaya göre öneri sunsun', image: '' },
];

const DEFAULT_ROOM = (services) => ({ name: '', services: services.slice(0, 1) });

// ─── HELPERS ────────────────────────────────────────────────────

const Block = ({ children, style }) => (
    <View style={[bst.block, style]}>{children}</View>
);
const bst = StyleSheet.create({ block: { backgroundColor: '#111', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#222' } });

const SLabel = ({ text, sub }) => (
    <View style={{ marginBottom: 10 }}>
        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>{text}</Text>
        {sub ? <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{sub}</Text> : null}
    </View>
);

// Gold info box — not an error, just informational
const InfoBox = ({ text }) => (
    <View style={inf.box}>
        <MaterialCommunityIcons name="information-outline" size={16} color={GOLD_MAIN} />
        <Text style={inf.text}>{text}</Text>
    </View>
);
const inf = StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
    text: { color: '#c9a227', fontSize: 12, lineHeight: 18, flex: 1 },
});

const UploadBox = ({ iconName, label, sub, images, onPick, onRemove }) => (
    <View style={ubs.wrap}>
        <SLabel text={label} sub={sub} />
        {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {images.map((img, i) => (
                    <View key={i} style={ubs.imgWrap}>
                        <Image source={{ uri: img.uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        <TouchableOpacity style={ubs.removeBtn} onPress={() => onRemove(i)}>
                            <Ionicons name="close" size={13} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={ubs.addBtn} onPress={onPick}>
                    <Ionicons name="add" size={26} color={GOLD_MAIN} />
                </TouchableOpacity>
            </ScrollView>
        ) : (
            <TouchableOpacity style={ubs.emptyArea} onPress={onPick}>
                <MaterialCommunityIcons name={iconName} size={34} color={GOLD_MAIN} />
                <Text style={ubs.emptyLabel}>{label}</Text>
            </TouchableOpacity>
        )}
    </View>
);
const ubs = StyleSheet.create({
    wrap: { marginBottom: 20 },
    imgWrap: { width: 90, height: 90, borderRadius: 12, marginRight: 10, overflow: 'hidden', position: 'relative', backgroundColor: '#222' },
    removeBtn: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: GOLD_MAIN, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
    emptyArea: { height: 100, borderRadius: 14, borderWidth: 1.5, borderColor: '#333', borderStyle: 'dashed', backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
    emptyLabel: { color: GOLD_MAIN, fontSize: 13, fontWeight: '600' },
});

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export default function PaintDecorWizardScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const [step, setStep] = useState(1);

    // Step 1
    const [selectedServices, setSelectedServices] = useState([]);
    // Step 2
    const [areaType, setAreaType] = useState(null);
    const [rooms, setRooms] = useState([{ name: 'Salon', services: [] }, { name: 'Yatak Odası', services: [] }]);
    const [timeline, setTimeline] = useState(null);
    // Step 3
    const [occupancy, setOccupancy] = useState(null);
    const [wallCondition, setWallCondition] = useState(null);
    const [loading, setLoading] = useState(false);
    // Step 4
    const [colorStyle, setColorStyle] = useState(null);
    // Step 5
    const [currentPhotos, setCurrentPhotos] = useState([]);
    const [inspirationPhotos, setInspirationPhotos] = useState([]);
    const [notes, setNotes] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const TITLES = {
        1: "Mekanında Hangi\nDokunuşlara İhtiyacın Var?",
        2: "Boyanacak Alanın\nBüyüklüğü Nedir?",
        3: "Mekanın Şu Anki\nDurumu Nasıl?",
        4: "Aklındaki Renk ve\nTarz Dünyası Hangisi?",
        5: "Detayları\nBizimle Paylaş",
    };
    const SUBS = {
        1: "Sana en uygun hizmeti seç — birden fazla seçebilirsin.",
        2: "Mekanın genel yapısını belirleyelim.",
        3: "Doğru planlama için çalışma ortamını anlayalım.",
        4: "Henüz karar vermediysen mimarlarımız sana yardımcı olabilir.",
        5: "Fotoğraf ve özel isteklerini ekle.",
    };

    const toggleService = (id) =>
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );

    const toggleRoomService = (roomIdx, serviceId) => {
        setRooms(prev => prev.map((r, i) => {
            if (i !== roomIdx) return r;
            const hasSvc = r.services.includes(serviceId);
            return { ...r, services: hasSvc ? r.services.filter(s => s !== serviceId) : [...r.services, serviceId] };
        }));
    };

    const addRoom = () => setRooms(prev => [...prev, { name: `Oda ${prev.length + 1}`, services: [] }]);
    const removeRoom = (idx) => setRooms(prev => prev.filter((_, i) => i !== idx));

    const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });
    const handleNext = () => {
        if (step < 5) { setStep(s => s + 1); scrollTop(); }
        else handleSubmit();
    };
    const handleBack = () => {
        if (step > 1) { setStep(s => s - 1); scrollTop(); }
        else navigation.goBack();
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Hata", "Lütfen önce giriş yapın.");
                setLoading(false);
                return;
            }

            // Fetch specific titles for chosen items
            const getServiceNames = () => selectedServices.map(id => SERVICES.find(s => s.id === id)?.title || id).join(', ');
            const getAreaName = () => AREA_OPTIONS.find(a => a.id === areaType)?.label || areaType;
            const getColorStyle = () => COLOR_STYLES.find(c => c.id === colorStyle)?.title || colorStyle;

            // Build comprehensive description
            let fullDescription = `PROJE TİPİ: Boya & Dekorasyon\n`;
            fullDescription += `HİZMETLER: ${getServiceNames() || '-'}\n`;
            fullDescription += `MEKAN: ${getAreaName() || 'Belirtilmedi'} (${areaType === 'rooms' ? rooms.length + ' Oda' : '-'}) \n`;
            fullDescription += `TARZ: ${getColorStyle() || 'Belirtilmedi'}\n`;
            fullDescription += `DURUM: ${occupancy === 'occupied' ? 'Eşyalı' : 'Boş'} Ev, ${wallCondition === 'clean' ? 'Temiz Duvar' : wallCondition === 'heavy' ? 'Kapsamlı Tamirat' : 'Kısmi Tamirat'}\n\n`;
            if (notes) fullDescription += `NOT:\n${notes}\n`;

            const currentUrls = await Promise.all(currentPhotos.map(img => uploadImageToSupabase(img.uri)));
            const inspirationUrls = await Promise.all(inspirationPhotos.map(img => uploadImageToSupabase(img.uri)));
            const allDocumentUrls = [...currentUrls, ...inspirationUrls];

            const { error } = await supabase
                .from('construction_requests')
                .insert({
                    user_id: user.id,
                    city: 'Türkiye Geneli',
                    district: 'Tümü', 
                    neighborhood: 'Tümü',
                    ada: '', parsel: '', pafta: '',
                    full_address: 'Boya & Dekorasyon Talebi',
                    offer_type: 'anahtar_teslim_tadilat',
                    description: fullDescription,
                    status: 'pending',
                    document_urls: allDocumentUrls,
                    deed_image_url: allDocumentUrls.length > 0 ? allDocumentUrls[0] : null
                });

            if (error) throw error;

            navigation.navigate('RenovationSuccess');
        } catch (error) {
            console.error('Submit Error:', error);
            Alert.alert("Hata", "Talebiniz alınırken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const pickImages = async (setter) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Galeri erişimi gerekiyor.'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.85 });
        if (!res.canceled) setter(prev => [...prev, ...res.assets]);
    };

    const isNextDisabled = () => {
        if (step === 1 && selectedServices.length === 0) return true;
        if (step === 2 && (!areaType || !timeline)) return true;
        if (step === 3 && (!occupancy || !wallCondition)) return true;
        if (step === 4 && !colorStyle) return true;
        return false;
    };

    // ── STEP 1: Servis Seçimi ──────────────────────────────────
    const renderStep1 = () => (
        <View style={{ width: '100%' }}>
            {SERVICES.map(svc => {
                const isSel = selectedServices.includes(svc.id);
                return (
                    <TouchableOpacity
                        key={svc.id}
                        style={[s1.card, isSel && s1.cardActive]}
                        onPress={() => toggleService(svc.id)}
                        activeOpacity={0.88}
                    >
                        <View style={[s1.iconBox, isSel && s1.iconBoxActive]}>
                            <MaterialCommunityIcons name={svc.icon} size={24} color={isSel ? GOLD_MAIN : '#888'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s1.title, isSel && { color: GOLD_MAIN }]}>{svc.title}</Text>
                            <Text style={s1.desc}>{svc.desc}</Text>
                        </View>
                        <View style={[s1.check, isSel && s1.checkActive]}>
                            {isSel && <MaterialCommunityIcons name="check" size={16} color="#000" />}
                        </View>
                    </TouchableOpacity>
                );
            })}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <MaterialCommunityIcons name="information-outline" size={13} color="#555" />
                <Text style={{ color: '#555', fontSize: 12 }}>Birden fazla hizmet seçebilirsin.</Text>
            </View>
        </View>
    );
    const s1 = StyleSheet.create({
        card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#111', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
        cardActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.04)' },
        iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
        iconBoxActive: { backgroundColor: 'rgba(212,175,55,0.12)', borderColor: GOLD_MAIN },
        title: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
        desc: { color: '#888', fontSize: 12 },
        check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
        checkActive: { backgroundColor: GOLD_MAIN, borderColor: GOLD_MAIN },
    });

    // ── STEP 2: Alan + Akıllı Oda + Zaman ────────────────────
    const renderStep2 = () => (
        <View style={{ width: '100%', gap: 20 }}>
            {/* Alan Seçimi */}
            <View style={s2.grid}>
                {AREA_OPTIONS.map(opt => {
                    const isSel = areaType === opt.id;
                    return (
                        <TouchableOpacity key={opt.id} style={[s2.card, isSel && s2.cardActive]} onPress={() => setAreaType(opt.id)} activeOpacity={0.85}>
                            <MaterialCommunityIcons name={opt.icon} size={28} color={isSel ? GOLD_MAIN : '#888'} />
                            <Text style={[s2.label, isSel && { color: GOLD_MAIN }]}>{opt.label}</Text>
                            <Text style={s2.sub}>{opt.sub}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Akıllı Oda Accordion */}
            {areaType === 'rooms' && selectedServices.length > 0 && (
                <View style={s2.accord}>
                    <View style={s2.accordHead}>
                        <MaterialCommunityIcons name="floor-plan" size={18} color={GOLD_MAIN} />
                        <Text style={s2.accordTitle}>Oda Bazlı Hizmet Seçimi</Text>
                        <Text style={s2.accordSub}>Her oda için istediğin hizmetlere dokun</Text>
                    </View>

                    {rooms.map((room, idx) => (
                        <View key={idx} style={s2.roomRow}>
                            <View style={s2.roomHeader}>
                                <View style={s2.roomBadge}>
                                    <Text style={s2.roomBadgeText}>{idx + 1}</Text>
                                </View>
                                <Text style={s2.roomName}>{room.name}</Text>
                                {rooms.length > 1 && (
                                    <TouchableOpacity onPress={() => removeRoom(idx)} style={s2.removeBtn}>
                                        <MaterialCommunityIcons name="close" size={16} color="#555" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={s2.chipRow}>
                                {selectedServices.map(svcId => {
                                    const svc = SERVICES.find(s => s.id === svcId);
                                    if (!svc) return null;
                                    const active = room.services.includes(svcId);
                                    return (
                                        <TouchableOpacity
                                            key={svcId}
                                            style={[s2.svcChip, active && s2.svcChipActive]}
                                            onPress={() => toggleRoomService(idx, svcId)}
                                        >
                                            <MaterialCommunityIcons name={svc.icon} size={14} color={active ? '#000' : '#888'} />
                                            <Text style={[s2.svcChipText, active && { color: '#000' }]}>{svc.title.split(' ')[0]}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={s2.addRoomBtn} onPress={addRoom}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={18} color={GOLD_MAIN} />
                        <Text style={s2.addRoomText}>+ Yeni Oda Ekle</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Zaman Çizelgesi */}
            <Block>
                <SLabel text="Ne Zaman Başlanmasını İstiyorsun?" sub="Bu bilgi, profesyonellerin müsaitlik durumunu düzenler." />
                <View style={{ gap: 10 }}>
                    {TIMELINE_OPTIONS.map(opt => {
                        const isSel = timeline === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s2.timeRow, isSel && s2.timeRowActive]} onPress={() => setTimeline(opt.id)} activeOpacity={0.85}>
                                <View style={[s2.timeIcon, isSel && { backgroundColor: 'rgba(212,175,55,0.15)' }]}>
                                    <MaterialCommunityIcons name={opt.icon} size={20} color={isSel ? GOLD_MAIN : '#666'} />
                                </View>
                                <Text style={[s2.timeLabel, isSel && { color: GOLD_MAIN }]}>{opt.label}</Text>
                                {isSel && <MaterialCommunityIcons name="check-circle" size={20} color={GOLD_MAIN} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Block>
        </View>
    );
    const s2 = StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        card: { width: (width - 40 - 12) / 2, backgroundColor: '#111', borderRadius: 18, padding: 16, borderWidth: 2, borderColor: '#222', alignItems: 'center', gap: 8 },
        cardActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.06)' },
        label: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
        sub: { color: '#666', fontSize: 12 },
        // accordion
        accord: { backgroundColor: '#111', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: GOLD_MAIN + '55' },
        accordHead: { marginBottom: 16, flexDirection: 'column', gap: 3 },
        accordTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
        accordSub: { color: '#888', fontSize: 12 },
        roomRow: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10 },
        roomHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
        roomBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center' },
        roomBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
        roomName: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 },
        removeBtn: { padding: 4 },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        svcChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#222', borderWidth: 1, borderColor: '#333' },
        svcChipActive: { backgroundColor: GOLD_MAIN, borderColor: GOLD_MAIN },
        svcChipText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
        addRoomBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', borderStyle: 'dashed' },
        addRoomText: { color: GOLD_MAIN, fontSize: 14, fontWeight: '600' },
        // timeline
        timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#2a2a2a' },
        timeRowActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.04)' },
        timeIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
        timeLabel: { color: '#CCC', fontSize: 14, fontWeight: '600', flex: 1 },
    });

    // ── STEP 3: Mevcut Durum ──────────────────────────────────
    const renderStep3 = () => (
        <View style={{ width: '100%', gap: 20 }}>
            <Block>
                <SLabel text="Eşya Durumu" sub="Çalışma planı ve süre tahmini değişir." />
                <View style={{ gap: 10 }}>
                    {[
                        { id: 'empty', icon: 'home-outline', title: 'Boş Ev', desc: 'Eşya yok, hemen çalışmaya uygun.' },
                        { id: 'occupied', icon: 'sofa', title: 'Eşyalı Ev', desc: 'İçinde yaşanıyor, eşyaların korunması gerekiyor.' },
                    ].map(opt => {
                        const isSel = occupancy === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s3.bigCard, isSel && s3.bigCardActive]} onPress={() => setOccupancy(opt.id)} activeOpacity={0.85}>
                                <MaterialCommunityIcons name={opt.icon} size={28} color={isSel ? GOLD_MAIN : '#666'} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[s3.bigTitle, isSel && { color: GOLD_MAIN }]}>{opt.title}</Text>
                                    <Text style={s3.bigDesc}>{opt.desc}</Text>
                                </View>
                                {isSel && <MaterialCommunityIcons name="check-circle" size={22} color={GOLD_MAIN} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {/* ✅ Gold bilgilendirme kutusu — artık kırmızı değil */}
                {occupancy === 'occupied' && (
                    <InfoBox text="Eşyalı çalışmalarda örtüm, taşıma ve süre artışından dolayı yaklaşık %15-20 ek maliyet öngörülmektedir. Keşif sırasında netleştirilir." />
                )}
            </Block>

            <Block>
                <SLabel text="Duvarların Mevcut Durumu" sub="Bu bilgi; malzeme ve iş gücü planlamasını doğrudan belirler." />
                <View style={{ gap: 10 }}>
                    {WALL_CONDITIONS.map(cond => {
                        const isSel = wallCondition === cond.id;
                        return (
                            <TouchableOpacity key={cond.id} style={[s3.listRow, isSel && s3.listRowActive]} onPress={() => setWallCondition(cond.id)} activeOpacity={0.85}>
                                <View style={[s3.condIcon, isSel && { backgroundColor: 'rgba(212,175,55,0.15)' }]}>
                                    <MaterialCommunityIcons name={cond.icon} size={22} color={isSel ? GOLD_MAIN : '#666'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s3.condTitle, isSel && { color: GOLD_MAIN }]}>{cond.title}</Text>
                                    <Text style={s3.condDesc}>{cond.desc}</Text>
                                </View>
                                {isSel && <MaterialCommunityIcons name="check-circle" size={20} color={GOLD_MAIN} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Block>
        </View>
    );
    const s3 = StyleSheet.create({
        bigCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#2a2a2a' },
        bigCardActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.05)' },
        bigTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
        bigDesc: { color: '#888', fontSize: 12, marginTop: 2 },
        listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#2a2a2a' },
        listRowActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.04)' },
        condIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
        condTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
        condDesc: { color: '#888', fontSize: 12, lineHeight: 17 },
    });

    // ── STEP 4: Renk & Tarz ───────────────────────────────────
    const renderStep4 = () => (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {COLOR_STYLES.map(cs => {
                const isSel = colorStyle === cs.id;
                const isUndecided = cs.id === 'undecided';
                return (
                    <TouchableOpacity
                        key={cs.id}
                        style={[s4.card, isSel && s4.cardActive, isUndecided && s4.cardUndecided]}
                        onPress={() => setColorStyle(cs.id)}
                        activeOpacity={0.88}
                    >
                        {!isUndecided && cs.image ? (
                            <Image source={{ uri: cs.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        ) : null}
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={StyleSheet.absoluteFillObject} />
                        {isUndecided && <MaterialCommunityIcons name="star-circle-outline" size={34} color={GOLD_MAIN} style={{ marginBottom: 10 }} />}
                        {isSel && !isUndecided && (
                            <View style={s4.checkBadge}>
                                <MaterialCommunityIcons name="check" size={14} color="#000" />
                            </View>
                        )}
                        <View style={s4.textWrap}>
                            <Text style={[s4.title, isSel && { color: GOLD_MAIN }]}>{cs.title}</Text>
                            <Text style={s4.desc} numberOfLines={2}>{cs.desc}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
    const s4 = StyleSheet.create({
        card: { width: (width - 40 - 12) / 2, height: 180, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'flex-end' },
        cardActive: { borderColor: GOLD_MAIN },
        cardUndecided: { justifyContent: 'center', borderColor: '#333', borderStyle: 'dashed' },
        checkBadge: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
        textWrap: { padding: 12, width: '100%' },
        title: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginBottom: 3 },
        desc: { color: '#aaa', fontSize: 10, lineHeight: 14 },
    });

    // ── STEP 5: Final Detaylar ─────────────────────────────────
    const renderStep5 = () => (
        <View style={{ width: '100%' }}>
            <UploadBox iconName="camera" label="Mevcut Durumu Yükle" sub="Şu anki duvarların veya tavanının fotoğrafları" images={currentPhotos} onPick={() => pickImages(setCurrentPhotos)} onRemove={i => setCurrentPhotos(p => p.filter((_, idx) => idx !== i))} />
            <UploadBox iconName="image-search" label="İlham Görsellerini Yükle" sub="Pinterest, dergi veya referans fotoğrafları" images={inspirationPhotos} onPick={() => pickImages(setInspirationPhotos)} onRemove={i => setInspirationPhotos(p => p.filter((_, idx) => idx !== i))} />
            <Block>
                <SLabel text="Özel İstekleriniz" sub='"Salondaki TV arkasına çıta yapalım, boya silinebilir olsun." gibi detayları belirtin.' />
                <View style={s5.inputWrap}>
                    <TextInput
                        style={s5.input}
                        placeholder="Özel isteklerinizi buraya yazın..."
                        placeholderTextColor="#666"
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                        inputAccessoryViewID="PaintDone"
                        onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)}
                    />
                    <TouchableOpacity
                        style={[s5.mic, isRecording && { backgroundColor: DANGER_RED }]}
                        onPress={() => setIsRecording(r => !r)}
                    >
                        <Ionicons name={isRecording ? "stop" : "mic"} size={22} color={isRecording ? "#FFF" : GOLD_MAIN} />
                    </TouchableOpacity>
                </View>
            </Block>
        </View>
    );
    const s5 = StyleSheet.create({
        inputWrap: { position: 'relative', marginTop: 10 },
        input: { height: 140, backgroundColor: '#1a1a1a', borderRadius: 14, borderWidth: 1, borderColor: '#2a2a2a', color: '#FFF', padding: 15, paddingRight: 55, textAlignVertical: 'top', fontSize: 14 },
        mic: { position: 'absolute', right: 12, bottom: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    });

    // ── MAIN RENDER ──────────────────────────────────────────
    const disabled = isNextDisabled();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000000', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {/* Header — insets ile status bar üstüne çıkma giderildi */}
                    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <View style={styles.backBtnCircle}>
                                <Ionicons name="arrow-back" size={20} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.progress}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <View key={s} style={[styles.dot, s <= step && styles.dotActive]} />
                            ))}
                        </View>
                        <Text style={styles.stepNum}>{step} / 5</Text>
                    </View>

                    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.titleBox}>
                            <Text style={styles.title}>{TITLES[step]}</Text>
                            <Text style={styles.subtitle}>{SUBS[step]}</Text>
                        </View>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </ScrollView>

                    {/* Footer — gradient arka plan + alt inset */}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.97)', '#000']} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                        <TouchableOpacity style={[styles.btn, (disabled || loading) && { opacity: 0.4 }]} onPress={handleNext} disabled={disabled || loading} activeOpacity={0.8}>
                            <LinearGradient
                                colors={disabled ? ['#2a2a2a', '#222'] : [GOLD_MAIN, GOLD_DARK]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.btnGrad}
                            >
                                <Text style={[styles.btnText, disabled && { color: '#555' }]}>
                                    {loading ? 'GÖNDERİLİYOR...' : step === 5 ? 'KEŞİF & TEKLİF İSTE' : 'DEVAM ET'}
                                </Text>
                                <MaterialCommunityIcons name={step === 5 ? "check-decagram" : "arrow-right"} size={22} color={disabled ? '#555' : '#000'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>

            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="PaintDone">
                    <View style={styles.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss}>
                            <Text style={styles.accessoryText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    backBtnCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    progress: { flexDirection: 'row', gap: 6 },
    dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#222' },
    dotActive: { backgroundColor: GOLD_MAIN },
    stepNum: { color: '#666', fontSize: 13, fontWeight: 'bold', width: 32, textAlign: 'right' },
    scroll: { paddingHorizontal: 20, paddingBottom: 30 },
    titleBox: { marginBottom: 26 },
    title: { color: '#FFF', fontSize: 26, fontWeight: 'bold', lineHeight: 34, marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 14, lineHeight: 21 },
    footer: { paddingHorizontal: 20, paddingTop: 20 },
    btn: { borderRadius: 16, overflow: 'hidden', height: 58 },
    btnGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    btnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
    accessory: { backgroundColor: '#1a1a1a', alignItems: 'flex-end', paddingHorizontal: 15, paddingVertical: 10 },
    accessoryText: { color: GOLD_MAIN, fontSize: 16, fontWeight: 'bold' },
});
