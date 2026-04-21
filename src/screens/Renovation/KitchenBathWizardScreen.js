import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
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
import TurkeyLocationPicker from '../../components/TurkeyLocationPicker';
import BudgetSelector from '../../components/BudgetSelector';

const { width } = Dimensions.get('window');

// ─── THEME ───────────────────────────────────────────────────────
const TH = {
    bg: '#000000', // True Black
    cardLight: '#1C1C1E', // Elevated dark gray
    cardDark: '#0A0A0A',
    gold: '#FFD700', // Premium Gold
    goldDark: '#CCAC00',
    goldMuted: 'rgba(255, 215, 0, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: '#8E8E93',
    border: '#2C2C2E',
    borderLight: '#3A3A3C',
    danger: '#EF4444',
    warningBg: 'rgba(255, 215, 0, 0.08)',
};

// ─── DATA ────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
    { id: 'kitchen', title: 'Sadece Mutfak', image: require('../../../assets/renovation/kitchen_luxury.png') },
    { id: 'bath', title: 'Sadece Banyo', image: require('../../../assets/renovation/bath_luxury.png') },
    { id: 'both', title: 'Mutfak ve Banyo', image: require('../../../assets/renovation/kitchen_bath_split.png') },
];

const WORK_LEVELS = [
    {
        id: 'light',
        title: 'Yüzeysel Dokunuş',
        desc: 'Dolap kapakları, tezgah veya seramik yenilenir — yapı açılmaz. Hızlı ve bütçe dostu.',
        icon: 'format-paint',
    },
    {
        id: 'full',
        title: 'Kapsamlı Yenileme',
        desc: 'Kırım dahil. Tesisat yenilenir, duvarlar açılır. Temelden yepyeni bir mekan.',
        icon: 'hammer-wrench',
    },
    {
        id: 'premium',
        title: 'Premium Mimari Tasarım',
        desc: 'İç mimar 3D projesi + A kalite malzeme + tam kapsam garanti.',
        icon: 'diamond',
    },
];

const STYLE_CATALOG = {
    kitchen: [
        { id: 'modern', title: 'Modern & Minimalist', desc: 'Düz çizgiler, gizli kulplar, mat yüzeyler', image: require('../../../assets/renovation/kitchen_modern.png') },
        { id: 'rustic', title: 'Doğal & Rustik', desc: 'Açık ahşap, sıcak tonlar, doğal taş tezgah', image: 'https://images.unsplash.com/photo-1556909220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
        { id: 'classic', title: 'Klasik & Avangart', desc: 'Mermer tezgah, oymalı dolap, lak yüzey', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop' },
        { id: 'loft', title: 'Endüstriyel (Loft)', desc: 'Koyu renk, metal detay, açık tuğla', image: 'https://images.unsplash.com/photo-1556909075-0ba5f7b1dff7?q=80&w=800&auto=format&fit=crop' },
        { id: 'undecided', title: 'Mimar Yönlendirsin', desc: 'Bütçeme en uygun trendi siz belirleyin', image: '' },
    ],
    bath: [
        { id: 'modern', title: 'Modern & Minimalist', desc: 'Yüzer lavabo, gizli raf, mono renkler', image: require('../../../assets/renovation/bath_modern.png') },
        { id: 'rustic', title: 'Doğal & Rustik', desc: 'Doğal taş kaplama, bambu aksesuarlar', image: require('../../../assets/renovation/bath_rustic.png') },
        { id: 'classic', title: 'Klasik & Avangart', desc: 'Küvet, altın armatür, büyük seramik', image: require('../../../assets/renovation/bath_classic.png') },
        { id: 'loft', title: 'Endüstriyel (Loft)', desc: 'Beton görünüm, siyah metal, brütal detay', image: require('../../../assets/renovation/bath_loft.png') },
        { id: 'undecided', title: 'Mimar Yönlendirsin', desc: 'Bütçeme en uygun trendi siz belirleyin', image: '' },
    ],
};

// BUDGET_OPTIONS removed - using BudgetSelector component

// ─── SHARED COMPONENTS ───────────────────────────────────────

const SLabel = ({ text, sub }) => (
    <View style={{ marginBottom: 14 }}>
        <Text allowFontScaling={false} style={{ color: TH.textPrimary, fontSize: 16, fontWeight: '700' }}>{text}</Text>
        {sub && <Text allowFontScaling={false} style={{ color: TH.textMuted, fontSize: 13, marginTop: 4 }}>{sub}</Text>}
    </View>
);

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

// Custom Slider Component
const CustomSlider = ({ label, value, min, max, onChange, suffix = 'm²' }) => (
    <View style={{ marginBottom: 24 }}>
        <View style={slStyle.header}>
            <Text allowFontScaling={false} style={slStyle.label}>{label}</Text>
            <View style={slStyle.valBadge}>
                <Text allowFontScaling={false} style={slStyle.valText}>{value} {suffix}</Text>
            </View>
        </View>
        <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={min}
            maximumValue={max}
            step={1}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor={TH.gold}
            maximumTrackTintColor={TH.border}
            thumbTintColor={TH.gold}
        />
        <View style={slStyle.rangeRow}>
            <Text allowFontScaling={false} style={slStyle.rangeText}>{min} {suffix}</Text>
            <Text allowFontScaling={false} style={slStyle.rangeText}>{max} {suffix}</Text>
        </View>
    </View>
);
const slStyle = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -4 },
    label: { color: TH.textMuted, fontSize: 14, fontWeight: '500' },
    valBadge: { backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: TH.gold },
    valText: { color: TH.gold, fontSize: 13, fontWeight: '700' },
    rangeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
    rangeText: { color: TH.textMuted, fontSize: 11 },
});

// ─── MAIN COMPONENT ──────────────────────────────────────────

export default function KitchenBathWizardScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const [step, setStep] = useState(1);

    // Flow State
    const [selectedScope, setSelectedScope] = useState(null);

    const showKitchen = selectedScope === 'kitchen' || selectedScope === 'both';
    const showBath = selectedScope === 'bath' || selectedScope === 'both';
    const isBoth = selectedScope === 'both';

    // Step 2 State
    const [occupancy, setOccupancy] = useState(null); // 'empty' | 'occupied'
    const [kitchenCount, setKitchenCount] = useState(1);
    const [kitchenAreas, setKitchenAreas] = useState({ 0: 15, 1: 15, 2: 15 });
    const [kitchenTypes, setKitchenTypes] = useState({ 0: 'Kapalı' });
    const [bathCount, setBathCount] = useState(1);
    const [bathAreas, setBathAreas] = useState({ 0: 6, 1: 5, 2: 4 });

    // Step 3 State
    const [workLevel, setWorkLevel] = useState(null);
    const [buildingAge, setBuildingAge] = useState(null);

    // Step 4 State
    const [kitchenStyle, setKitchenStyle] = useState(null);
    const [bathStyle, setBathStyle] = useState(null);

    // Step 5 State
    const [budget, setBudget] = useState('Standart');
    const [currentPhotos, setCurrentPhotos] = useState([]);
    const [inspirationPhotos, setInspirationPhotos] = useState([]);
    const [details, setDetails] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

    const TITLES = {
        1: "Yenilenme Neresi\nİçin Yapılacak?",
        2: "Mekan Durumu\n& Alanlar",
        3: "İşin Boyutu\n& Bina Yaşı",
        4: "Hayalindeki\nAtmosfer",
        5: "Detayları\nPaylaş",
    };

    const SUBS = {
        1: "İhtiyacına en uygun alanı seç.",
        2: "Gerçekçi metrajlarla çalışmaya başlayalım.",
        3: "Yapılacak işin çapı teklifi doğrudan etkiler.",
        4: isBoth ? "Mutfak ve banyo için ayrı ayrı tarz seçebilirsin." : "Sana en uygun tasarım dilini seçelim.",
        5: "Mimar için bütçe opsiyonu ve referans fotoğrafları ekle.",
    };

    const scrollTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

    const handleNext = () => {
        if (step < 5) { setStep(s => s + 1); scrollTop(); }
        else handleFinalSubmit();
    };
    const handleBack = () => {
        if (step > 1) { setStep(s => s - 1); scrollTop(); }
        else navigation.goBack();
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { Alert.alert("Hata", "Lütfen önce giriş yapın."); setLoading(false); return; }

            const getScopeTitle = () => SCOPE_OPTIONS.find(s => s.id === selectedScope)?.title || selectedScope;
            const getWorkLevel = () => WORK_LEVELS.find(w => w.id === workLevel)?.title || workLevel;
            const getAge = () => buildingAge === '0-5' ? '0-5 Yıl' : buildingAge === '5-15' ? '5-15 Yıl' : '15+ Yıl';
            const getBudget = () => BUDGET_OPTIONS.find(b => b.id === budget)?.label || 'Belirtilmedi';

            const kStyle = kitchenStyle ? STYLE_CATALOG.kitchen.find(s => s.id === kitchenStyle)?.title || kitchenStyle : null;
            const bStyle = bathStyle ? STYLE_CATALOG.bath.find(s => s.id === bathStyle)?.title || bathStyle : null;

            let fullDescription = `[PROJE TİPİ] Mutfak & Banyo Yenileme\n`;
            fullDescription += `[KAPSAM] ${getScopeTitle()}\n`;
            fullDescription += `[DURUM] ${occupancy === 'occupied' ? 'Eşyalı' : 'Boş'} Konut • Bina Yaşı: ${getAge()}\n`;

            let areaDet = [];
            if (showKitchen) {
                const kAreasStr = Array.from({ length: kitchenCount }).map((_, i) => `${kitchenAreas[i] || 15}m² (${kitchenTypes[i] || 'Kapalı'})`).join(' + ');
                areaDet.push(`${kitchenCount} Mutfak: ${kAreasStr}`);
            }
            if (showBath) {
                const bAreasStr = Array.from({ length: bathCount }).map((_, i) => `${bathAreas[i] || 5}m²`).join(' + ');
                areaDet.push(`${bathCount} Banyo: ${bAreasStr}`);
            }
            fullDescription += `[TEKNİK] ${areaDet.join(' | ')}\n`;
            
            let styleDet = [];
            if (showKitchen && kStyle) styleDet.push(`Mutfak: ${kStyle}`);
            if (showBath && bStyle) styleDet.push(`Banyo: ${bStyle}`);
            fullDescription += `[TASARIM] ${styleDet.join(' | ') || 'Belirtilmedi'}\n`;

            fullDescription += `[İŞ ÖLÇEĞİ] ${getWorkLevel()}\n`;
            fullDescription += `[BÜTÇE] ${budget}\n`;
            fullDescription += `[LOKASYON] ${city} / ${district}\n\n`;
            if (details) fullDescription += `[NOTLARI]\n${details}\n`;

            const currentUrls = await Promise.all(currentPhotos.map(img => uploadImageToSupabase(img.uri)));
            const inspirationUrls = await Promise.all(inspirationPhotos.map(img => uploadImageToSupabase(img.uri)));
            const allDocumentUrls = [...currentUrls, ...inspirationUrls];

            const { error } = await supabase.from('construction_requests').insert({
                user_id: user.id, city: city || 'Türkiye Geneli', district: district || 'Tümü', neighborhood: 'Tümü',
                ada: '', parsel: '', pafta: '', full_address: 'Mutfak & Banyo Talebi',
                offer_type: 'anahtar_teslim_tadilat', description: fullDescription, status: 'pending',
                document_urls: allDocumentUrls, deed_image_url: allDocumentUrls.length > 0 ? allDocumentUrls[0] : null,
                current_situation_urls: currentUrls,
                inspiration_urls: inspirationUrls
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
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsMultipleSelection: true, quality: 0.8 });
        if (!result.canceled) setter(prev => [...prev, ...result.assets]);
    };

    const isNextDisabled = () => {
        if (step === 1 && !selectedScope) return true;
        if (step === 2 && !occupancy) return true;
        if (step === 3 && (!workLevel || !buildingAge)) return true;
        if (step === 4) {
            if (showKitchen && !kitchenStyle) return true;
            if (showBath && !bathStyle) return true;
        }
        return false;
    };

    // ── STEP RENDERERS ───────────────────────────────────────

    const renderStep1 = () => (
        <View style={s.stepBlock}>
            {SCOPE_OPTIONS.map(opt => {
                const isSel = selectedScope === opt.id;
                return (
                    <TouchableOpacity key={opt.id} style={[s1.card, isSel && s1.cardActive]} onPress={() => setSelectedScope(opt.id)} activeOpacity={0.9}>
                        <Image source={typeof opt.image === 'string' ? { uri: opt.image } : opt.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        {/* Critical gradient for text legibility */}
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }} />
                        {isSel && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,215,0,0.08)' }]} />}

                        <View style={s1.contentWrap}>
                            <Text allowFontScaling={false} style={s1.title}>{opt.title}</Text>
                            <View style={[s1.radio, isSel && s1.radioActive]}>
                                {isSel && <View style={s1.radioInner} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderStep2 = () => (
        <View style={s.stepBlock}>
            {/* Occupancy - Segmented Pill */}
            <View style={s2.cardBlock}>
                <SLabel text="Mekan Durumu" sub="Çalışma takvimi ve maliyetini belirler." />
                <View style={s2.pillWrap}>
                    {[
                        { id: 'empty', label: 'Boş Konut', icon: 'home-outline' },
                        { id: 'occupied', label: 'Eşyalı Ev', icon: 'sofa-outline' }
                    ].map(opt => {
                        const isSel = occupancy === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s2.pillBtn, isSel && s2.pillBtnActive]} onPress={() => setOccupancy(opt.id)} activeOpacity={0.8}>
                                <MaterialCommunityIcons name={opt.icon} size={20} color={isSel ? TH.bg : TH.textMuted} />
                                <Text allowFontScaling={false} style={[s2.pillText, isSel && { color: TH.bg, fontWeight: '700' }]}>{opt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Kitchen */}
            {showKitchen && (
                <View style={s2.cardBlock}>
                    <View style={s.rowHeader}>
                        <MaterialCommunityIcons name="countertop" size={20} color={TH.gold} />
                        <Text allowFontScaling={false} style={s.rowTitle}>Mutfak Detayları</Text>
                    </View>

                    <Text allowFontScaling={false} style={s2.subLabel}>Kaç mutfak yenilenecek?</Text>
                    <View style={s2.circRow}>
                        {[1, 2, 3].map(n => {
                            const isSel = kitchenCount === n;
                            return (
                                <TouchableOpacity key={n} style={[s2.circBtn, isSel && s2.circBtnActive]} onPress={() => setKitchenCount(n)} activeOpacity={0.8}>
                                    {isSel ? (
                                        <LinearGradient colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 28 }} />
                                    ) : null}
                                    <Text allowFontScaling={false} style={[s2.circText, isSel && { color: '#000', fontWeight: '800', zIndex: 2 }]}>{n}{n === 3 ? '+' : ''}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {Array.from({ length: kitchenCount }).map((_, i) => (
                        <View key={i} style={{ marginTop: 20 }}>
                            <CustomSlider label={kitchenCount === 1 ? 'Mutfak Alanı' : `Mutfak ${i + 1} Alanı`} value={kitchenAreas[i] || 15} min={5} max={60} onChange={v => setKitchenAreas(prev => ({ ...prev, [i]: Math.round(v) }))} />
                            
                            <Text allowFontScaling={false} style={[s2.subLabel, { marginTop: 10 }]}>{kitchenCount === 1 ? 'Mutfak Tipi' : `Mutfak ${i + 1} Tipi`}</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['Kapalı', 'Açık / Ada'].map(t => {
                                    const isSel = (kitchenTypes[i] || 'Kapalı') === t;
                                    return (
                                        <TouchableOpacity key={t} style={[s2.typeBtn, isSel && s2.typeBtnActive]} onPress={() => setKitchenTypes(prev => ({ ...prev, [i]: t }))} activeOpacity={0.8}>
                                            <Text allowFontScaling={false} style={[s2.typeBtnText, isSel && { color: TH.gold }]}>{t}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Bathroom */}
            {showBath && (
                <View style={s2.cardBlock}>
                    <View style={s.rowHeader}>
                        <MaterialCommunityIcons name="shower-head" size={20} color={TH.gold} />
                        <Text allowFontScaling={false} style={s.rowTitle}>Banyo Detayları</Text>
                    </View>

                    <Text allowFontScaling={false} style={s2.subLabel}>Kaç banyo yenilenecek?</Text>
                    <View style={s2.circRow}>
                        {[1, 2, 3].map(n => {
                            const isSel = bathCount === n;
                            return (
                                <TouchableOpacity key={n} style={[s2.circBtn, isSel && s2.circBtnActive]} onPress={() => setBathCount(n)} activeOpacity={0.8}>
                                    {isSel ? (
                                        <LinearGradient colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 28 }} />
                                    ) : null}
                                    <Text allowFontScaling={false} style={[s2.circText, isSel && { color: '#000', fontWeight: '800', zIndex: 2 }]}>{n}{n === 3 ? '+' : ''}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {Array.from({ length: bathCount }).map((_, i) => (
                        <View key={i} style={{ marginTop: 20 }}>
                            <CustomSlider label={bathCount === 1 ? 'Banyo Alanı' : `Banyo ${i + 1} Alanı`} value={bathAreas[i] || 5} min={2} max={25} onChange={v => setBathAreas(prev => ({ ...prev, [i]: Math.round(v) }))} />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderStep3 = () => (
        <View style={s.stepBlock}>
            {WORK_LEVELS.map(level => {
                const isSel = workLevel === level.id;
                const isPrem = level.id === 'premium';
                return (
                    <TouchableOpacity key={level.id} style={[s3.scopeCard, isPrem && s3.scopePrem, isSel && s3.scopeCardActive, isSel && isPrem && s3.scopePremActive]} onPress={() => setWorkLevel(level.id)} activeOpacity={0.85}>
                        <View style={s3.scopeRow}>
                            <MaterialCommunityIcons name={level.icon} size={28} color={isPrem ? TH.gold : (isSel ? TH.gold : '#FFF')} />
                            <View style={{ flex: 1, paddingLeft: 14 }}>
                                <Text allowFontScaling={false} style={[s3.scopeTitle, isSel && { color: TH.gold }]}>{level.title}</Text>
                                <Text allowFontScaling={false} style={s3.scopeDesc}>{level.desc}</Text>
                            </View>
                            <View style={[s1.radio, isSel && s1.radioActive]}>
                                {isSel && <View style={s1.radioInner} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}

            <View style={s2.cardBlock}>
                <View style={s.rowHeader}>
                    <MaterialCommunityIcons name="office-building-marker" size={20} color={TH.gold} />
                    <Text allowFontScaling={false} style={s.rowTitle}>Bina Yaşı</Text>
                </View>
                <Text allowFontScaling={false} style={[s2.subLabel, { marginBottom: 16 }]}>Altyapı tesisat maliyetini belirler.</Text>

                <View style={s3.ageWrap}>
                    {[{ id: '0-5', l: '0-5 Yıl' }, { id: '5-15', l: '5-15 Yıl' }, { id: '15+', l: '15+ Yıl' }].map(opt => {
                        const isSel = buildingAge === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[s3.ageBtn, isSel && s3.ageBtnActive]} onPress={() => setBuildingAge(opt.id)} activeOpacity={0.8}>
                                <Text allowFontScaling={false} style={[s3.ageText, isSel && { color: TH.bg, fontWeight: '700' }]}>{opt.l}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const renderStyleGrid = (stylesList, selected, onSelect) => (
        <View style={s4.grid}>
            {stylesList.map(item => {
                const isSel = selected === item.id;
                const isUndecided = item.id === 'undecided';

                if (isUndecided) {
                    return (
                        <TouchableOpacity key={item.id} style={[s4.unCard, isSel && s4.unCardActive]} onPress={() => onSelect(item.id)} activeOpacity={0.85}>
                            <MaterialCommunityIcons name={isSel ? "star" : "star-outline"} size={34} color={TH.gold} />
                            <Text allowFontScaling={false} style={[s4.unTitle, isSel && { color: TH.gold }]}>{item.title}</Text>
                            <Text allowFontScaling={false} style={s4.unSub}>En uygun trendi mimar seçsin</Text>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity key={item.id} style={[s4.imgCard, isSel && s4.imgCardActive]} onPress={() => onSelect(item.id)} activeOpacity={0.85}>
                        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0.2 }} end={{ x: 0, y: 1 }} />
                        
                        {isSel && (
                            <View style={s4.checkBadge}>
                                <MaterialCommunityIcons name="check" size={16} color="#000" />
                            </View>
                        )}
                        <View style={s4.imgTextWrap}>
                            <Text allowFontScaling={false} style={s4.imgTitle}>{item.title}</Text>
                            <Text allowFontScaling={false} style={s4.imgDesc} numberOfLines={2}>{item.desc}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderStep4 = () => (
        <View style={s.stepBlock}>
            {showKitchen && (
                <View style={showBath && { marginBottom: 36 }}>
                    {isBoth && (
                        <View style={s.rowHeader}>
                            <MaterialCommunityIcons name="countertop" size={20} color={TH.gold} />
                            <Text allowFontScaling={false} style={s.rowTitle}>Mutfak Tarzı</Text>
                        </View>
                    )}
                    {renderStyleGrid(STYLE_CATALOG.kitchen, kitchenStyle, setKitchenStyle)}
                </View>
            )}
            {showBath && (
                <View>
                    {isBoth && (
                        <View style={[s.rowHeader, { marginTop: 10 }]}>
                            <MaterialCommunityIcons name="shower-head" size={20} color={TH.gold} />
                            <Text allowFontScaling={false} style={s.rowTitle}>Banyo Tarzı</Text>
                        </View>
                    )}
                    {renderStyleGrid(STYLE_CATALOG.bath, bathStyle, setBathStyle)}
                </View>
            )}
        </View>
    );

    const renderStep5 = () => (
        <View style={s.stepBlock}>
            {/* Location Picker */}
            <View style={{ marginBottom: 24 }}>
                <SLabel text="Proje Konumu" sub="Mimara doğru bölge bilgisi sunmak için önemlidir." />
                <TouchableOpacity 
                    style={s5.locationBtn}
                    onPress={() => setIsLocationPickerVisible(true)}
                    activeOpacity={0.7}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Ionicons name="location" size={22} color={TH.gold} />
                        <Text allowFontScaling={false} style={{ color: city ? '#FFF' : TH.textMuted, fontSize: 16, fontWeight: 'bold' }}>
                            {city ? `${city} / ${district}` : 'İl ve İlçe Seçin'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={TH.textMuted} />
                </TouchableOpacity>
            </View>

            <TurkeyLocationPicker 
                visible={isLocationPickerVisible}
                onClose={() => setIsLocationPickerVisible(false)}
                onSelect={(c, d) => {
                    setCity(c);
                    setDistrict(d);
                }}
                currentCity={city}
                currentDistrict={district}
            />

            <UploadZone iconName="camera-plus-outline" label="Mevcut Durum Görselleri" images={currentPhotos} onPick={() => pickImages(setCurrentPhotos)} onRemove={i => setCurrentPhotos(p => p.filter((_, idx) => idx !== i))} />
            <UploadZone iconName="image-multiple-outline" label="Referans Görselleri" images={inspirationPhotos} onPick={() => pickImages(setInspirationPhotos)} onRemove={i => setInspirationPhotos(p => p.filter((_, idx) => idx !== i))} />

            <View style={{ marginBottom: 24 }}>
                <SLabel text="Planlanan Bütçe Segmenti" sub="Mimar kalite sınıfını buna göre projelendirir." />
                <BudgetSelector 
                    selectedSegment={budget} 
                    onSelect={setBudget} 
                />
            </View>

            <View style={{ marginBottom: 10 }}>
                <SLabel text="Özel İstekleriniz" sub="Evin mimarisine dair kritik notları ekleyin." />
                <View style={s5.textAreaWrap}>
                    <TextInput allowFontScaling={false}
                        style={s5.textArea}
                        placeholder="Örn: Ankastre ürünüm var ölçüsü..."
                        placeholderTextColor={TH.textMuted}
                        multiline
                        textAlignVertical="top"
                        value={details}
                        onChangeText={setDetails}
                        inputAccessoryViewID="KBDecor"
                    />
                    <TouchableOpacity style={[s5.micBtn, isRecording && { backgroundColor: TH.danger }]} onPress={() => setIsRecording(!isRecording)}>
                        <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? '#FFF' : TH.gold} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );


    // ── MAIN LAYOUT ─────────────────────────────────────────

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

                {/* Body */}
                <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerTitles}>
                        <Text allowFontScaling={false} style={styles.mainTitle}>{TITLES[step]}</Text>
                        <Text allowFontScaling={false} style={styles.subTitle}>{SUBS[step]}</Text>
                    </View>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </ScrollView>

                {/* Fixed Bottom Bar */}
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.bottomBackBtn} onPress={handleBack} activeOpacity={0.8}>
                            <Text allowFontScaling={false} style={styles.bottomBackText}>Geri</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.primaryBtn, (isNextDisabled() || loading) && { opacity: 0.5 }]} disabled={isNextDisabled() || loading} onPress={handleNext} activeOpacity={0.9}>
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
                <InputAccessoryView nativeID="KBDecor">
                    <View style={s5.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss}><Text allowFontScaling={false} style={s5.accessoryBtn}>Bitti</Text></TouchableOpacity>
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
    stepIndicator: { color: TH.textMuted, fontSize: 13, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
    headerTitles: { marginBottom: 30 },
    mainTitle: { color: TH.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
    subTitle: { color: TH.textMuted, fontSize: 14, marginTop: 8 },
    bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: TH.border, backgroundColor: TH.bg, gap: 12 },
    bottomBackBtn: { height: 56, paddingHorizontal: 24, borderRadius: 30, borderWidth: 1, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
    bottomBackText: { color: '#CCC', fontSize: 15, fontWeight: '600' },
    primaryBtn: { flex: 1, height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden' },
    primaryBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', letterSpacing: 1, zIndex: 2 },
});

const s = StyleSheet.create({
    stepBlock: { width: '100%' },
    rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    rowTitle: { color: TH.textPrimary, fontSize: 18, fontWeight: '700' },
});

// Step 1
const s1 = StyleSheet.create({
    card: { height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 2, borderColor: 'transparent', backgroundColor: TH.cardLight },
    cardActive: { borderColor: TH.gold },
    contentWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 10 },
    title: { color: TH.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    radioActive: { borderColor: TH.gold },
    radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: TH.gold },
});

// Step 2
const s2 = StyleSheet.create({
    cardBlock: { backgroundColor: TH.cardLight, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: TH.borderLight },
    subLabel: { color: TH.textMuted, fontSize: 13, marginBottom: 10, fontWeight: '500' },
    pillWrap: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 6, borderWidth: 1, borderColor: TH.borderLight },
    pillBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    pillBtnActive: { backgroundColor: '#FFF' },
    pillText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
    typeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: '#111', borderWidth: 1, borderColor: TH.borderLight },
    typeBtnActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
    typeBtnText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
    circRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
    circBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: TH.borderLight },
    circBtnActive: { borderColor: TH.gold, overflow: 'hidden' }, // Ensure gradient stays inside
    circText: { color: TH.textMuted, fontSize: 16, fontWeight: '600' },
});

// Step 3
const s3 = StyleSheet.create({
    scopeCard: { backgroundColor: TH.cardLight, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: TH.borderLight },
    scopeCardActive: { borderColor: TH.gold, backgroundColor: TH.warningBg },
    scopePrem: { borderColor: TH.gold, borderWidth: 1 },
    scopePremActive: { backgroundColor: 'rgba(255,215,0,0.1)' },
    scopeRow: { flexDirection: 'row', alignItems: 'center' },
    scopeTitle: { color: TH.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
    scopeDesc: { color: TH.textMuted, fontSize: 13, lineHeight: 18 },
    ageWrap: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 14, padding: 6, borderWidth: 1, borderColor: TH.borderLight },
    ageBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
    ageBtnActive: { backgroundColor: '#FFF' },
    ageText: { color: TH.textMuted, fontSize: 14, fontWeight: '600' },
});

// Step 4
const s4 = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    imgCard: { width: (width - 40 - 12) / 2, height: 210, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
    imgCardActive: { borderColor: TH.gold },
    checkBadge: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: TH.gold, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    imgTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 5 },
    imgTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    imgDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 },
    unCard: { width: '100%', height: 110, borderRadius: 20, borderWidth: 1.5, borderColor: TH.border, borderStyle: 'dashed', backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    unCardActive: { borderColor: TH.gold, backgroundColor: 'rgba(255, 215, 0, 0.05)' },
    unTitle: { color: TH.textMuted, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 2 },
    unSub: { color: '#666', fontSize: 13 },
});

// Step 5
const s5 = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    locationBtn: {
        backgroundColor: '#1A1A1C',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: TH.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    budgCard: { width: (width - 40 - 12) / 2, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: TH.border, backgroundColor: TH.cardLight, flexDirection: 'row', alignItems: 'center' },
    budgCardActive: { borderColor: TH.gold },
    budgTitle: { color: TH.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 2 },
    budgSub: { color: TH.textMuted, fontSize: 11 },
    textAreaWrap: { position: 'relative' },
    textArea: { height: 150, backgroundColor: TH.cardLight, borderRadius: 16, borderWidth: 1, borderColor: TH.border, color: TH.textPrimary, fontSize: 15, padding: 16, paddingRight: 50, textAlignVertical: 'top' },
    micBtn: { position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    accessory: { backgroundColor: '#1A1A1C', padding: 12, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: TH.border },
    accessoryBtn: { color: TH.gold, fontSize: 16, fontWeight: '800', marginRight: 10 },
});
