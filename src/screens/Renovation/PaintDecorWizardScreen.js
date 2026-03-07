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
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { uploadImageToSupabase } from '../../services/PhotoUploadService';

const { width } = Dimensions.get('window');

// ─── THEME ───────────────────────────────────────────────────────
const TH = {
    bg: '#0A0A0A',
    cardLight: '#121212',
    cardDark: '#0D0D0D',
    gold: '#FFD700',
    goldDark: '#CCAC00',
    goldMuted: 'rgba(255, 215, 0, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: '#8E8E93',
    border: '#2C2C2E',
    borderLight: '#3A3A3C',
    warningBg: 'rgba(212,175,55,0.08)',
    warningText: '#D4AF37',
};

// ─── DATA ───────────────────────────────────────────────────────
const SERVICES = [
    { id: 'interior', title: 'İç Cephe Boya', desc: 'Oda, salon veya tüm daire boyası', icon: 'roller' },
    { id: 'wallpaper', title: 'Duvar Kağıdı & Çıta', desc: 'Premium duvar kağıdı ve dekoratif çıta uygulaması', icon: 'texture' },
    { id: 'ceiling', title: 'Alçıpan & Asma Tavan', desc: 'Gizli LED, kartonpiyer ve tavan uygulamaları', icon: 'ceiling-light' },
    { id: 'exterior', title: 'Dış Cephe & Yalıtım', desc: 'Bina dışı boya, mantolama ve ısı yalıtımı', icon: 'home-city' },
];

const AREA_OPTIONS = [
    { id: '1+1', label: '1+1 Daire', sub: '~50 m²' },
    { id: '2+1', label: '2+1 Daire', sub: '~80 m²' },
    { id: '3+1', label: '3+1 Daire', sub: '~110 m²' },
    { id: '4+1', label: '4+1 / Villa', sub: '150 m²+ ' },
];

const TIMELINE_OPTIONS = [
    { id: 'asap', label: 'Hemen Başlanmalı', icon: 'rocket-launch-outline' },
    { id: '1month', label: '1 Ay İçinde', icon: 'calendar-clock' },
    { id: 'explore', label: 'Sadece Fiyat Araştırıyorum', icon: 'magnify' },
];

const WALL_CONDITIONS = [
    { id: 'clean', title: 'Temiz (Sadece Boya)', desc: 'Çatlak veya dökülme yok. Doğrudan boyanabilir.', icon: 'check-circle-outline' },
    { id: 'partial', title: 'Kısmi Tamirat', desc: 'Birkaç noktada alçı yoklaması. Hazırlık şart.', icon: 'wrench-outline' },
    { id: 'heavy', title: 'Kapsamlı Tamirat', desc: 'Derin çatlaklar, kağıt sökümü veya koyu açık geçişi.', icon: 'alert-circle-outline' },
];

const COLOR_STYLES = [
    { id: 'warm', title: 'Sıcak & Doğal Tonlar', desc: 'Bej, toprak, kum', image: 'https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?q=80&w=800&auto=format&fit=crop' },
    { id: 'cool', title: 'Modern & Soğuk Tonlar', desc: 'Gri, antrasit, füme', image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop' },
    { id: 'vivid', title: 'Canlı & Pastel Renkler', desc: 'Soft mavi, yeşil, lavanta', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800&auto=format&fit=crop' },
    { id: 'deco', title: 'Dekoratif / İtalyan Boya', desc: 'Mermer desen, dokulu', image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop' },
    { id: 'undecided', title: 'Karar Vermedim', desc: 'Mimarlarımız önersin', image: '' },
];

// ─── HELPERS ────────────────────────────────────────────────────
const SLabel = ({ text, sub }) => (
    <View style={{ marginBottom: 14 }}>
        <Text allowFontScaling={false} style={{ color: TH.textPrimary, fontSize: 16, fontWeight: '700' }}>{text}</Text>
        {sub && <Text allowFontScaling={false} style={{ color: TH.textMuted, fontSize: 13, marginTop: 4 }}>{sub}</Text>}
    </View>
);

const InfoAlert = ({ text }) => (
    <View style={inf.box}>
        <MaterialCommunityIcons name="information" size={20} color={TH.warningText} />
        <Text allowFontScaling={false} style={inf.text}>{text}</Text>
    </View>
);
const inf = StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: TH.warningBg, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
    text: { color: TH.warningText, fontSize: 13, lineHeight: 18, flex: 1, fontWeight: '500' },
});

const UploadZone = ({ iconName, label, images, onPick, onRemove }) => (
    <View style={uz.wrap}>
        <SLabel text={label} />
        {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {images.map((img, i) => (
                    <View key={i} style={uz.imgWrap}>
                        <Image source={{ uri: img.uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        <TouchableOpacity style={uz.removeBtn} onPress={() => onRemove(i)}>
                            <Ionicons name="close" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={uz.addMoreBtn} onPress={onPick}>
                    <Ionicons name="add" size={24} color={TH.textMuted} />
                </TouchableOpacity>
            </ScrollView>
        ) : (
            <TouchableOpacity style={uz.dropzone} onPress={onPick} activeOpacity={0.7}>
                <View style={uz.dropIcon}>
                    <MaterialCommunityIcons name={iconName} size={28} color={TH.textMuted} />
                </View>
                <Text allowFontScaling={false} style={uz.dropText}>Görsel Yüklemek İçin Dokun</Text>
            </TouchableOpacity>
        )}
    </View>
);
const uz = StyleSheet.create({
    wrap: { marginBottom: 24 },
    dropzone: { height: 110, borderRadius: 16, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center', gap: 10 },
    dropIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    dropText: { color: TH.textMuted, fontSize: 14, fontWeight: '500' },
    imgWrap: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden', backgroundColor: '#222' },
    removeBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    addMoreBtn: { width: 100, height: 100, borderRadius: 16, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center' },
});

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function PaintDecorWizardScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const [step, setStep] = useState(1);

    // States
    const [selectedServices, setSelectedServices] = useState([]);
    const [areaType, setAreaType] = useState(null);
    const [timeline, setTimeline] = useState(null);
    const [occupancy, setOccupancy] = useState(null);
    const [wallCondition, setWallCondition] = useState(null);
    const [colorStyle, setColorStyle] = useState(null);
    const [currentPhotos, setCurrentPhotos] = useState([]);
    const [inspirationPhotos, setInspirationPhotos] = useState([]);
    const [notes, setNotes] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);

    const TITLES = {
        1: "Mekanında Hangi\nDokunuşlara İhtiyacın Var?",
        2: "Planlamayı\nYapalım",
        3: "Mekanın Şu Anki\nDurumu Nasıl?",
        4: "İlham & Tarz\nDünyası",
        5: "Bize Detayları\nAnlat",
    };

    const toggleService = (id) => setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
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
            if (!user) { Alert.alert("Hata", "Lütfen önce giriş yapın."); setLoading(false); return; }

            const getServiceNames = () => selectedServices.map(id => SERVICES.find(s => s.id === id)?.title || id).join(', ');
            const getAreaName = () => AREA_OPTIONS.find(a => a.id === areaType)?.label || areaType;
            const getColorStyle = () => COLOR_STYLES.find(c => c.id === colorStyle)?.title || colorStyle;

            let fullDescription = `PROJE TİPİ: Boya & Dekorasyon\n`;
            fullDescription += `HİZMETLER: ${getServiceNames() || '-'}\n`;
            fullDescription += `MEKAN: ${getAreaName() || 'Belirtilmedi'}\n`;
            fullDescription += `ZAMAN: ${timeline || 'Belirtilmedi'}\n`;
            fullDescription += `TARZ: ${getColorStyle() || 'Belirtilmedi'}\n`;
            fullDescription += `DURUM: ${occupancy === 'occupied' ? 'Eşyalı Ev' : 'Boş Ev'}, ${wallCondition === 'clean' ? 'Temiz Duvar' : wallCondition === 'heavy' ? 'Kapsamlı Tamirat' : 'Kısmi Tamirat'}\n\n`;
            if (notes) fullDescription += `NOT:\n${notes}\n`;

            const currentUrls = await Promise.all(currentPhotos.map(img => uploadImageToSupabase(img.uri)));
            const inspirationUrls = await Promise.all(inspirationPhotos.map(img => uploadImageToSupabase(img.uri)));
            const allDocumentUrls = [...currentUrls, ...inspirationUrls];

            const { error } = await supabase.from('construction_requests').insert({
                user_id: user.id, city: 'Türkiye Geneli', district: 'Tümü', neighborhood: 'Tümü',
                ada: '', parsel: '', pafta: '', full_address: 'Boya & Dekorasyon Talebi',
                offer_type: 'anahtar_teslim_tadilat', description: fullDescription, status: 'pending',
                document_urls: allDocumentUrls, deed_image_url: allDocumentUrls.length > 0 ? allDocumentUrls[0] : null
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
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
        if (!res.canceled) setter(p => [...p, ...res.assets]);
    };

    const isNextDisabled = () => {
        if (step === 1 && selectedServices.length === 0) return true;
        if (step === 2 && (!areaType || !timeline)) return true;
        if (step === 3 && (!occupancy || !wallCondition)) return true;
        if (step === 4 && !colorStyle) return true;
        return false;
    };

    // ── STEP Renderers ──────────────────────────────────────────
    const renderStep1 = () => (
        <View style={s.stepBlock}>
            {SERVICES.map(svc => {
                const isSel = selectedServices.includes(svc.id);
                return (
                    <TouchableOpacity key={svc.id} style={[s1.card, isSel && s1.cardActive]} onPress={() => toggleService(svc.id)} activeOpacity={0.85}>
                        <View style={[s1.iconBox, isSel && s1.iconBoxActive]}>
                            <MaterialCommunityIcons name={svc.icon} size={24} color={isSel ? TH.gold : TH.textMuted} />
                        </View>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text allowFontScaling={false} style={[s1.title, isSel && { color: TH.gold }]}>{svc.title}</Text>
                            <Text allowFontScaling={false} style={s1.desc}>{svc.desc}</Text>
                        </View>
                        <View style={[s1.checkbox, isSel && s1.checkboxActive]}>
                            {isSel && <View style={s1.checkInner} />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderStep2 = () => (
        <View style={s.stepBlock}>
            {/* Area Grid */}
            <View style={{ marginBottom: 30 }}>
                <SLabel text="Mekanın Genel Yapısı" />
                <View style={s2.grid}>
                    {AREA_OPTIONS.map(opt => {
                        const isSel = areaType === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s2.squareCard, isSel && s2.squareActive]} onPress={() => setAreaType(opt.id)} activeOpacity={0.85}>
                                <Text allowFontScaling={false} style={[s2.sqTitle, isSel && { color: TH.gold }]}>{opt.label}</Text>
                                <Text allowFontScaling={false} style={s2.sqSub}>{opt.sub}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Timeline */}
            <View>
                <SLabel text="Ne Zaman Başlanmalı?" />
                <View style={{ gap: 12 }}>
                    {TIMELINE_OPTIONS.map(opt => {
                        const isSel = timeline === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s2.rowCard, isSel && s2.rowCardActive]} onPress={() => setTimeline(opt.id)} activeOpacity={0.85}>
                                <MaterialCommunityIcons name={opt.icon} size={22} color={isSel ? TH.gold : TH.textMuted} />
                                <Text allowFontScaling={false} style={[s2.rowTitle, isSel && { color: TH.gold }]}>{opt.label}</Text>
                                <View style={[s1.checkbox, isSel && s1.checkboxActive]}>
                                    {isSel && <View style={s1.checkInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={s.stepBlock}>
            {/* Occupancy */}
            <View style={{ marginBottom: 30 }}>
                <SLabel text="Eşya Durumu" sub="Çalışma ve koruma planını doğrudan etkiler." />
                <View style={s3.radioWrap}>
                    <TouchableOpacity style={[s3.radioCard, occupancy === 'empty' && s3.radioActive]} onPress={() => setOccupancy('empty')} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="home-outline" size={26} color={occupancy === 'empty' ? TH.gold : TH.textMuted} style={{ marginBottom: 12 }} />
                        <Text allowFontScaling={false} style={[s3.radioTitle, occupancy === 'empty' && { color: TH.gold }]}>Boş Ev</Text>
                        <Text allowFontScaling={false} style={s3.radioDesc}>Eşyasız, anında hazır</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s3.radioCard, occupancy === 'occupied' && s3.radioActive]} onPress={() => setOccupancy('occupied')} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="sofa" size={26} color={occupancy === 'occupied' ? TH.gold : TH.textMuted} style={{ marginBottom: 12 }} />
                        <Text allowFontScaling={false} style={[s3.radioTitle, occupancy === 'occupied' && { color: TH.gold }]}>Eşyalı Ev</Text>
                        <Text allowFontScaling={false} style={s3.radioDesc}>Koruma gerektirir</Text>
                    </TouchableOpacity>
                </View>
                {occupancy === 'occupied' && (
                    <InfoAlert text="Eşyalı çalışmalarda koruma örtüleri ve taşıma eforu sebebiyle işçilik süresi uzar ve ek koruma maliyeti doğabilir (+%15-20)." />
                )}
            </View>

            {/* Wall Condition */}
            <View>
                <SLabel text="Duvarların Durumu" sub="Alçı, astar ve tamirat gereklilikleri için." />
                <View style={{ gap: 12 }}>
                    {WALL_CONDITIONS.map(cond => {
                        const isSel = wallCondition === cond.id;
                        return (
                            <TouchableOpacity key={cond.id} style={[s3.rowCard, isSel && s2.rowCardActive]} onPress={() => setWallCondition(cond.id)} activeOpacity={0.85}>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={[s3.rowTitle, isSel && { color: TH.gold }]}>{cond.title}</Text>
                                    <Text allowFontScaling={false} style={s3.rowDesc}>{cond.desc}</Text>
                                </View>
                                <View style={[s1.checkbox, isSel && s1.checkboxActive]}>
                                    {isSel && <View style={s1.checkInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={s.stepBlock}>
            <View style={s4.grid}>
                {COLOR_STYLES.map(cs => {
                    const isSel = colorStyle === cs.id;
                    const isUndecided = cs.id === 'undecided';

                    if (isUndecided) {
                        return (
                            <TouchableOpacity key={cs.id} style={[s4.undecidedCard, isSel && s4.undecidedActive]} onPress={() => setColorStyle(cs.id)} activeOpacity={0.85}>
                                <MaterialCommunityIcons name={isSel ? "star-circle" : "star-circle-outline"} size={36} color={isSel ? TH.textPrimary : TH.textMuted} />
                                <Text allowFontScaling={false} style={[s4.unTitle, isSel && { color: TH.textPrimary }]}>{cs.title}</Text>
                                <Text allowFontScaling={false} style={s4.unSub}>Fikrim yok, mimar süreci yönlendirsin</Text>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity key={cs.id} style={[s4.imgCard, isSel && s4.imgCardActive]} onPress={() => setColorStyle(cs.id)} activeOpacity={0.85}>
                            <Image source={{ uri: cs.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                            {/* Gradient Overlay for Text legibility */}
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }} />

                            {isSel && (
                                <View style={s4.checkBadge}>
                                    <MaterialCommunityIcons name="check" size={16} color="#000" />
                                </View>
                            )}
                            <View style={s4.imgTextWrap}>
                                <Text allowFontScaling={false} style={s4.imgTitle}>{cs.title}</Text>
                                <Text allowFontScaling={false} style={s4.imgDesc} numberOfLines={2}>{cs.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderStep5 = () => (
        <View style={s.stepBlock}>
            <UploadZone iconName="camera-plus-outline" label="Mevcut Durum Görselleri" images={currentPhotos} onPick={() => pickImages(setCurrentPhotos)} onRemove={i => setCurrentPhotos(p => p.filter((_, idx) => idx !== i))} />
            <UploadZone iconName="image-multiple-outline" label="İlham & Referans Görselleri" images={inspirationPhotos} onPick={() => pickImages(setInspirationPhotos)} onRemove={i => setInspirationPhotos(p => p.filter((_, idx) => idx !== i))} />

            <View style={{ marginTop: 10 }}>
                <SLabel text="Özel İstekleriniz" sub="Bilinmesi gereken diğer detayları buraya yazabilirsiniz." />
                <View style={s5.textAreaWrap}>
                    <TextInput allowFontScaling={false}
                        style={s5.textArea}
                        placeholder="Örn: Evde kedi var boya kokusuz olmalı, boya rengi filli boya lületaşı..."
                        placeholderTextColor={TH.textMuted}
                        multiline
                        textAlignVertical="top"
                        value={notes}
                        onChangeText={setNotes}
                        inputAccessoryViewID="PaintDecor"
                    />
                    <TouchableOpacity style={[s5.micBtn, isRecording && { backgroundColor: DANGER_RED }]} onPress={() => setIsRecording(!isRecording)}>
                        <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? '#FFF' : TH.gold} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );


    // ── MAIN RENDER ──────────────────────────────────────────
    const disabled = isNextDisabled();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={TH.bg} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={TH.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.progressWrap}>
                        {[1, 2, 3, 4, 5].map(idx => (
                            <View key={idx} style={[styles.progSeg, idx <= step && styles.progSegActive]} />
                        ))}
                    </View>
                    <Text allowFontScaling={false} style={styles.stepIndicator}>Adım {step}/5</Text>
                </View>

                {/* Content */}
                <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerTitles}>
                        <Text allowFontScaling={false} style={styles.mainTitle}>{TITLES[step]}</Text>
                    </View>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </ScrollView>

                {/* Fixed Bottom Action Bar */}
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.bottomBackBtn} onPress={handleBack} activeOpacity={0.8}>
                            <Text allowFontScaling={false} style={styles.bottomBackText}>Geri</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.primaryBtn, (disabled || loading) && { opacity: 0.5 }]} disabled={disabled || loading} onPress={handleNext} activeOpacity={0.9}>
                        <LinearGradient colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
                        <Text allowFontScaling={false} style={styles.primaryBtnText}>
                            {loading ? 'YÜKLENİYOR...' : (step === 5 ? 'KEŞİF & TEKLİF İSTE' : 'DEVAM ET')}
                        </Text>
                        {step < 5 && !loading && <MaterialCommunityIcons name="arrow-right" size={18} color="#000" style={{ marginLeft: 6 }} />}
                        {step === 5 && !loading && <MaterialCommunityIcons name="check-decagram" size={20} color="#000" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>

            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="PaintDecor">
                    <View style={s5.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss}>
                            <Text allowFontScaling={false} style={s5.accessoryBtn}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </View>
    );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: TH.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: TH.bg, zIndex: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: TH.cardLight, alignItems: 'center', justifyContent: 'center' },
    progressWrap: { flex: 1, flexDirection: 'row', gap: 6, marginHorizontal: 16, height: 4 },
    progSeg: { flex: 1, height: '100%', borderRadius: 2, backgroundColor: TH.border },
    progSegActive: { backgroundColor: TH.gold },
    stepIndicator: { color: TH.textMuted, fontSize: 12, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
    headerTitles: { marginBottom: 30 },
    mainTitle: { color: TH.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
    bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: TH.border, backgroundColor: TH.bg, gap: 12 },
    bottomBackBtn: { height: 56, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    bottomBackText: { color: '#CCC', fontSize: 15, fontWeight: '600' },
    primaryBtn: { flex: 1, height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden' },
    primaryBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', letterSpacing: 1, zIndex: 2 },
});

const s = StyleSheet.create({
    stepBlock: { width: '100%' },
});

// Step 1 Styles
const s1 = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: TH.border },
    cardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg }, // Slight tint
    iconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: TH.cardDark, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconBoxActive: { backgroundColor: TH.goldMuted },
    title: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    desc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
    checkboxActive: { borderColor: TH.gold },
    checkInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: TH.gold },
});

// Step 2 Styles
const s2 = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    squareCard: { width: (width - 40 - 12) / 2, aspectRatio: 1.2, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, padding: 16, justifyContent: 'center', alignItems: 'center' },
    squareActive: { borderColor: TH.gold, backgroundColor: TH.warningBg, transform: [{ scale: 1.02 }] },
    sqTitle: { color: TH.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 6 },
    sqSub: { color: TH.textMuted, fontSize: 13, fontWeight: '500' },
    rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: TH.border },
    rowCardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
    rowTitle: { color: TH.textPrimary, fontSize: 15, fontWeight: '700', flex: 1, marginLeft: 14 },
});

// Step 3 Styles
const s3 = StyleSheet.create({
    radioWrap: { flexDirection: 'row', gap: 12 },
    radioCard: { flex: 1, backgroundColor: TH.cardLight, borderRadius: 18, borderWidth: 1, borderColor: TH.border, padding: 20, alignItems: 'flex-start' },
    radioActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
    radioTitle: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    radioDesc: { color: TH.textMuted, fontSize: 12, lineHeight: 16 },
    rowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TH.cardLight, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: TH.border },
    rowTitle: { color: TH.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    rowDesc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
});

// Step 4 Styles
const s4 = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    imgCard: { width: (width - 40 - 12) / 2, height: 210, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: TH.border },
    imgCardActive: { borderColor: TH.gold, borderWidth: 2 },
    checkBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: TH.gold, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    imgTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 5 },
    imgTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    imgDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 },
    undecidedCard: { width: '100%', height: 110, borderRadius: 20, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: '#161618', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    undecidedActive: { borderColor: TH.gold, backgroundColor: 'rgba(255, 215, 0, 0.05)' },
    unTitle: { color: TH.textMuted, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 2 },
    unSub: { color: '#666', fontSize: 13 },
});

// Step 5
const s5 = StyleSheet.create({
    textAreaWrap: { position: 'relative' },
    textArea: { height: 150, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, color: TH.textPrimary, fontSize: 15, padding: 16, paddingRight: 50, textAlignVertical: 'top' },
    micBtn: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    accessory: { backgroundColor: '#1A1A1C', padding: 12, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: TH.border },
    accessoryBtn: { color: TH.gold, fontSize: 16, fontWeight: '800', marginRight: 10 },
});
