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

const { width } = Dimensions.get('window');

// --- THEME ---
const GOLD_MAIN = '#D4AF37';
const GOLD_DARK = '#B8860B';
const DANGER_RED = '#EF4444';

// ─── DATA ────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
    { id: 'kitchen', title: 'Sadece Mutfak', image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=800&auto=format&fit=crop' },
    { id: 'bath', title: 'Sadece Banyo', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800&auto=format&fit=crop' },
    { id: 'both', title: 'Mutfak ve Banyo', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop' },
];

const WORK_LEVELS = [
    {
        id: 'light',
        title: 'Yüzeysel Dokunuş',
        desc: 'Dolap kapakları, tezgah veya seramik yenilenir — yapı açılmaz, tesisat dokunulmaz. Hızlı ve bütçe dostu.',
        icon: 'brush-variant',
        warning: null,
    },
    {
        id: 'full',
        title: 'Kapsamlı Yenileme',
        desc: 'Kırım dahil. Elektrik & su tesisatı yenilenir, duvarlar açılır. Sonuç: tamamen yeni bir mekan.',
        icon: 'hammer',
        warning: null,
    },
    {
        id: 'premium',
        title: 'Premium Mimari Tasarım',
        desc: 'İç mimar 3D projesi + A kalite malzeme + uygulama garantisi. Yalnızca en iyisini isteyenler için.',
        icon: 'diamond-stone',
        warning: null,
    },
];

const BUDGET_OPTIONS = [
    { id: 'eco', label: 'Ekonomik', sub: '50.000 ₺ ve altı', color: '#4CAF50' },
    { id: 'std', label: 'Standart', sub: '50.000 – 150.000 ₺', color: GOLD_MAIN },
    { id: 'prem', label: 'Premium', sub: '150.000 – 400.000 ₺', color: '#E91E63' },
    { id: 'lux', label: 'Lüks', sub: '400.000 ₺ ve üzeri', color: '#9C27B0' },
];

// Style catalogue — per room (kitchen / bath)
const STYLE_CATALOG = {
    kitchen: [
        { id: 'modern', title: 'Modern & Minimalist', desc: 'Düz çizgiler, gizli kulplar, mat yüzeyler', image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=800&auto=format&fit=crop' },
        { id: 'rustic', title: 'Doğal & Rustik', desc: 'Açık ahşap, sıcak tonlar, doğal taş tezgah', image: 'https://images.unsplash.com/photo-1556909220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
        { id: 'classic', title: 'Klasik & Avangart', desc: 'Mermer tezgah, oymalı dolap, lak yüzey', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop' },
        { id: 'loft', title: 'Endüstriyel (Loft)', desc: 'Koyu renk, metal detay, açık tuğla', image: 'https://images.unsplash.com/photo-1556909075-0ba5f7b1dff7?q=80&w=800&auto=format&fit=crop' },
        { id: 'undecided', title: 'Mimar Yönlendirsin', desc: 'Bütçeme en uygun trendi siz belirleyin', image: '' },
    ],
    bath: [
        { id: 'modern', title: 'Modern & Minimalist', desc: 'Yüzer lavabo, gizli raf, mono renkler', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800&auto=format&fit=crop' },
        { id: 'rustic', title: 'Doğal & Rustik', desc: 'Doğal taş kaplama, bambu aksesuarlar', image: 'https://images.unsplash.com/photo-1584622781867-1c5fe959a80e?q=80&w=800&auto=format&fit=crop' },
        { id: 'classic', title: 'Klasik & Avangart', desc: 'Küvet, altın armatür, mermer zemin', image: 'https://images.unsplash.com/photo-1620626011761-996317702b9f?q=80&w=800&auto=format&fit=crop' },
        { id: 'loft', title: 'Endüstriyel (Loft)', desc: 'Beton görünüm, siyah armatür, pirinç detay', image: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?q=80&w=800&auto=format&fit=crop' },
        { id: 'undecided', title: 'Mimar Yönlendirsin', desc: 'Bütçeme en uygun trendi siz belirleyin', image: '' },
    ],
};

// ─── SMALL SHARED COMPONENTS ────────────────────────────────

const SectionTitle = ({ icon, title, sub }) => (
    <View style={{ marginBottom: sub ? 6 : 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name={icon} size={20} color={GOLD_MAIN} />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{title}</Text>
        </View>
        {sub ? <Text style={{ color: '#888', fontSize: 12, marginTop: 4, marginLeft: 28 }}>{sub}</Text> : null}
    </View>
);

const StyleGrid = ({ styles: styleList, selected, onSelect }) => (
    <View style={sgStyles.grid}>
        {styleList.map(s => {
            const isSel = selected === s.id;
            const isUndecided = s.id === 'undecided';
            return (
                <TouchableOpacity
                    key={s.id}
                    onPress={() => onSelect(s.id)}
                    activeOpacity={0.88}
                    style={[sgStyles.card, isSel && sgStyles.cardActive, isUndecided && sgStyles.cardUndecided]}
                >
                    {!isUndecided && s.image ? (
                        <Image source={{ uri: s.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                    ) : null}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={StyleSheet.absoluteFillObject} />
                    {isUndecided && (
                        <MaterialCommunityIcons name="star-circle-outline" size={32} color={GOLD_MAIN} style={{ marginBottom: 8 }} />
                    )}
                    {isSel && !isUndecided && (
                        <View style={sgStyles.checkBadge}>
                            <MaterialCommunityIcons name="check" size={14} color="#000" />
                        </View>
                    )}
                    <View style={sgStyles.cardTextWrap}>
                        <Text style={[sgStyles.cardTitle, isSel && { color: GOLD_MAIN }]} numberOfLines={1}>{s.title}</Text>
                        <Text style={sgStyles.cardDesc} numberOfLines={2}>{s.desc}</Text>
                    </View>
                </TouchableOpacity>
            );
        })}
    </View>
);

const sgStyles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { width: (width - 40 - 12) / 2, height: 175, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'flex-end' },
    cardActive: { borderColor: GOLD_MAIN },
    cardUndecided: { alignItems: 'center', justifyContent: 'center', borderColor: '#444', borderStyle: 'dashed' },
    checkBadge: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    cardTextWrap: { padding: 10, width: '100%' },
    cardTitle: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginBottom: 3 },
    cardDesc: { color: '#aaa', fontSize: 10, lineHeight: 13 },
});

const UploadBox = ({ icon, label, sub, images, onPick, onRemove }) => (
    <View style={ubStyles.container}>
        <SectionTitle icon={icon} title={label} sub={sub} />
        {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {images.map((img, i) => (
                    <View key={i} style={ubStyles.imgWrap}>
                        <Image source={{ uri: img.uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        <TouchableOpacity style={ubStyles.removeBtn} onPress={() => onRemove(i)}>
                            <Ionicons name="close" size={13} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={ubStyles.addBtn} onPress={onPick}>
                    <Ionicons name="add" size={26} color={GOLD_MAIN} />
                </TouchableOpacity>
            </ScrollView>
        ) : (
            <TouchableOpacity style={ubStyles.uploadEmpty} onPress={onPick}>
                <MaterialCommunityIcons name={icon} size={32} color={GOLD_MAIN} />
                <Text style={ubStyles.uploadText}>{label}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const ubStyles = StyleSheet.create({
    container: { marginBottom: 20 },
    imgWrap: { width: 90, height: 90, borderRadius: 12, marginRight: 10, overflow: 'hidden', position: 'relative', backgroundColor: '#222' },
    removeBtn: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: GOLD_MAIN, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
    uploadEmpty: { height: 100, borderRadius: 14, borderWidth: 1.5, borderColor: '#333', borderStyle: 'dashed', backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
    uploadText: { color: GOLD_MAIN, fontSize: 13, fontWeight: '600' },
});

// ─── MAIN COMPONENT ──────────────────────────────────────────

export default function KitchenBathWizardScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef(null);
    const [step, setStep] = useState(1);

    // Step 1
    const [selectedScope, setSelectedScope] = useState(null);

    // Step 2 – Kitchen
    const [kitchenArea, setKitchenArea] = useState(15);
    const [kitchenType, setKitchenType] = useState(null);
    // Step 2 – Bath
    const [bathCount, setBathCount] = useState(1);
    const [bathAreas, setBathAreas] = useState({ 0: 8, 1: 5, 2: 4 });
    const [occupancy, setOccupancy] = useState(null); // 'empty' | 'occupied'

    // Step 3
    const [workLevel, setWorkLevel] = useState(null);
    const [buildingAge, setBuildingAge] = useState(null);

    // Step 4
    const [kitchenStyle, setKitchenStyle] = useState(null);
    const [bathStyle, setBathStyle] = useState(null);

    // Step 5
    const [currentPhotos, setCurrentPhotos] = useState([]);
    const [inspirationPhotos, setInspirationPhotos] = useState([]);
    const [details, setDetails] = useState('');
    const [budget, setBudget] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);

    const showKitchen = selectedScope === 'kitchen' || selectedScope === 'both';
    const showBath = selectedScope === 'bath' || selectedScope === 'both';
    const isBoth = selectedScope === 'both';

    const STEP_TITLES = {
        1: "Yenilenme Neresi\nİçin Yapılacak?",
        2: "Metraj ve\nMekan Detayları",
        3: "Kapsam &\nBina Bilgisi",
        4: "Hayalindeki\nAtmosfer",
        5: "Detayları\nBizimle Paylaş",
    };
    const STEP_SUBS = {
        1: "İhtiyacına en uygun alanı seç.",
        2: "Alan ve mekan koşullarını belirleyelim.",
        3: "İşin boyutu ve binanın yaşı teklifi doğrudan etkiler.",
        4: selectedScope === 'both' ? "Mutfak ve banyo için ayrı ayrı tarz seçebilirsin." : "Sana en uygun tasarım dilini seçelim.",
        5: "Mimar için fotoğraflar ve bütçe bilgisi ekle.",
    };

    const scrollTop = () => scrollViewRef.current?.scrollTo({ y: 0, animated: true });

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
            if (!user) {
                Alert.alert("Hata", "Lütfen önce giriş yapın.");
                setLoading(false);
                return;
            }

            const getScopeTitle = () => SCOPE_OPTIONS.find(s => s.id === selectedScope)?.title || selectedScope;
            const getWorkLevel = () => WORK_LEVELS.find(w => w.id === workLevel)?.title || workLevel;
            const getBuildingAge = () => buildingAge === '0-5' ? '0 - 5 Yıl' : buildingAge === '5-15' ? '5 - 15 Yıl' : '15+ Yıl';
            const getBudget = () => BUDGET_OPTIONS.find(b => b.id === budget)?.label || 'Belirtilmedi';

            const kStyle = kitchenStyle ? STYLE_CATALOG.kitchen.find(s => s.id === kitchenStyle)?.title || kitchenStyle : null;
            const bStyle = bathStyle ? STYLE_CATALOG.bath.find(s => s.id === bathStyle)?.title || bathStyle : null;

            let fullDescription = `PROJE TİPİ: Mutfak & Banyo Yenileme\n`;
            fullDescription += `KAPSAM: ${getScopeTitle() || '-'}\n`;
            
            let mekanDetails = [];
            if (showKitchen) mekanDetails.push(`Mutfak (${kitchenArea} m², ${kitchenType || 'Tip Belirtilmedi'})`);
            if (showBath) {
                const bAreas = Array.from({ length: bathCount }).map((_, i) => bathAreas[i] || 5).join(' m², ') + ' m²';
                mekanDetails.push(`${bathCount} Banyo (${bAreas})`);
            }
            fullDescription += `MEKAN: ${mekanDetails.join(' + ')}\n`;
            
            let tarzDetails = [];
            if (showKitchen && kStyle) tarzDetails.push(`Mutfak: ${kStyle}`);
            if (showBath && bStyle) tarzDetails.push(`Banyo: ${bStyle}`);
            fullDescription += `TARZ: ${tarzDetails.join(' | ') || 'Belirtilmedi'}\n`;
            
            fullDescription += `İŞ SEVİYESİ: ${getWorkLevel()} (${occupancy === 'occupied' ? 'Eşyalı' : 'Boş'} Ev, Bina Yaşı: ${getBuildingAge()})\n`;
            fullDescription += `BÜTÇE: ${getBudget()}\n\n`;
            
            if (details) fullDescription += `NOT:\n${details}\n`;

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
                    full_address: 'Mutfak & Banyo Talebi',
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
        if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.85 });
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

    // ── STEP 1: SCOPE ────────────────────────────────────────
    const renderStep1 = () => (
        <View style={st.stepWrap}>
            {SCOPE_OPTIONS.map(item => {
                const isSel = selectedScope === item.id;
                return (
                    <TouchableOpacity key={item.id} style={[st.scopeCard, isSel && st.scopeCardActive]} onPress={() => setSelectedScope(item.id)} activeOpacity={0.9}>
                        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={StyleSheet.absoluteFillObject} />
                        {isSel && <LinearGradient colors={['rgba(212,175,55,0.25)', 'transparent']} style={StyleSheet.absoluteFillObject} />}
                        <View style={st.scopeRow}>
                            <Text style={[st.scopeTitle, isSel && { color: GOLD_MAIN }]}>{item.title}</Text>
                            <View style={[st.radio, isSel && st.radioActive]}>
                                {isSel && <View style={st.radioInner} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    // ── STEP 2: METRAJ + OCCUPANCY ───────────────────────────
    const renderStep2 = () => (
        <View style={st.stepWrap}>

            {/* Mekan Durumu */}
            <View style={st.block}>
                <SectionTitle icon="home-account" title="Mekan Durumu" sub="Çalışma takvimi ve maliyet buna göre belirlenir." />
                <View style={st.chipRow}>
                    {[{ id: 'empty', label: '🏚️  Boş / Kimse Yaşamıyor' }, { id: 'occupied', label: '🏠  İçinde Yaşanıyor' }].map(opt => (
                        <TouchableOpacity key={opt.id} style={[st.chipFull, occupancy === opt.id && st.chipActive]} onPress={() => setOccupancy(opt.id)}>
                            <Text style={[st.chipText, occupancy === opt.id && st.chipTextActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {occupancy === 'occupied' && (
                    <View style={st.warningBox}>
                        <MaterialCommunityIcons name="alert-circle" size={18} color={DANGER_RED} />
                        <Text style={st.warningText}>İçinde yaşanan mekanlarda toz koruması, gün kısıtlamaları ve maliyette yaklaşık %20 ek öngörülmektedir.</Text>
                    </View>
                )}
            </View>

            {/* Mutfak */}
            {showKitchen && (
                <View style={[st.block, { marginTop: 20 }]}>
                    <SectionTitle icon="countertop" title="Mutfak Alanı" />
                    <View style={st.sliderRow}>
                        <Text style={st.sliderLabel}>Alan (Yaklaşık)</Text>
                        <View style={st.valueBadge}><Text style={st.valueText}>{kitchenArea} m²</Text></View>
                    </View>
                    <Slider style={{ width: '100%', height: 40 }} minimumValue={5} maximumValue={60} step={1} value={kitchenArea} onValueChange={v => setKitchenArea(Math.round(v))} minimumTrackTintColor={GOLD_MAIN} maximumTrackTintColor="#333" thumbTintColor={GOLD_MAIN} />
                    <View style={st.rangeRow}><Text style={st.rangeText}>5 m²</Text><Text style={st.rangeText}>60 m²</Text></View>
                    <Text style={[st.subLabel, { marginTop: 16 }]}>Mutfak Tipi</Text>
                    <View style={st.chipRow}>
                        {['Kapalı Mutfak', 'Açık / Ada Mutfak'].map(t => (
                            <TouchableOpacity key={t} style={[st.chip, kitchenType === t && st.chipActive]} onPress={() => setKitchenType(t)}>
                                <Text style={[st.chipText, kitchenType === t && st.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Banyo */}
            {showBath && (
                <View style={[st.block, { marginTop: 20 }]}>
                    <SectionTitle icon="shower-head" title="Banyo Detayları" />
                    <Text style={st.subLabel}>Kaç banyo yenilenecek?</Text>
                    <View style={[st.chipRow, { marginBottom: 20 }]}>
                        {[1, 2, 3].map(n => (
                            <TouchableOpacity key={n} style={[st.chip, bathCount === n && st.chipActive]} onPress={() => setBathCount(n)}>
                                <Text style={[st.chipText, bathCount === n && st.chipTextActive]}>{n}{n === 3 ? '+' : ''}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {Array.from({ length: bathCount }).map((_, i) => {
                        const labels = ['Ebeveyn Banyosu', 'İkinci Banyo', 'Misafir WC / Banyo'];
                        return (
                            <View key={i} style={[st.bathItem, i > 0 && { marginTop: 18 }]}>
                                <View style={st.sliderRow}>
                                    <Text style={st.sliderLabel}>{bathCount === 1 ? 'Banyo Alanı' : labels[i] || `Banyo ${i + 1}`}</Text>
                                    <View style={st.valueBadge}><Text style={st.valueText}>{bathAreas[i] || 5} m²</Text></View>
                                </View>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={2} maximumValue={25} step={1}
                                    value={bathAreas[i] || 5}
                                    onValueChange={v => setBathAreas(prev => ({ ...prev, [i]: Math.round(v) }))}
                                    minimumTrackTintColor={GOLD_MAIN} maximumTrackTintColor="#333" thumbTintColor={GOLD_MAIN}
                                />
                                <View style={st.rangeRow}><Text style={st.rangeText}>2 m²</Text><Text style={st.rangeText}>25 m²</Text></View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );

    // ── STEP 3: KAPSAM + BİNA YAŞI ──────────────────────────
    const renderStep3 = () => (
        <View style={st.stepWrap}>
            {WORK_LEVELS.map(level => {
                const isSel = workLevel === level.id;
                return (
                    <TouchableOpacity key={level.id} style={[st.levelCard, isSel && st.levelCardActive]} onPress={() => setWorkLevel(level.id)} activeOpacity={0.85}>
                        <View style={st.levelHeader}>
                            <View style={[st.levelIcon, isSel && { backgroundColor: 'rgba(212,175,55,0.15)' }]}>
                                <MaterialCommunityIcons name={level.icon} size={22} color={isSel ? GOLD_MAIN : '#666'} />
                            </View>
                            <Text style={[st.levelTitle, isSel && { color: GOLD_MAIN }]}>{level.title}</Text>
                            {isSel && <MaterialCommunityIcons name="check-circle" size={20} color={GOLD_MAIN} />}
                        </View>
                        <Text style={st.levelDesc}>{level.desc}</Text>
                    </TouchableOpacity>
                );
            })}

            {/* Bina Yaşı */}
            <View style={[st.block, { marginTop: 24 }]}>
                <SectionTitle icon="office-building-outline" title="Bina Yaşı" sub="Binanın yaşı, kaplama altındaki tesisat maliyetini doğrudan belirler." />
                <View style={st.chipRow}>
                    {[{ id: '0-5', label: '0 – 5 Yıl' }, { id: '5-15', label: '5 – 15 Yıl' }, { id: '15+', label: '15+ Yıl' }].map(opt => (
                        <TouchableOpacity key={opt.id} style={[st.chip, buildingAge === opt.id && st.chipActive]} onPress={() => setBuildingAge(opt.id)}>
                            <Text style={[st.chipText, buildingAge === opt.id && st.chipTextActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {buildingAge === '15+' && workLevel === 'light' && (
                    <View style={st.warningBox}>
                        <MaterialCommunityIcons name="alert" size={18} color={DANGER_RED} />
                        <Text style={st.warningText}>15+ yıllık binalarda sadece yüzeysel dokunuş yapılması teknik risk taşımaktadır. Mimar bu konuda sizi bilgilendirecektir.</Text>
                    </View>
                )}
            </View>
        </View>
    );

    // ── STEP 4: TAR & STYLE ──────────────────────────────────
    const renderStep4 = () => (
        <View style={st.stepWrap}>
            {showKitchen && (
                <View style={isBoth && { marginBottom: 30 }}>
                    {isBoth && <SectionTitle icon="countertop" title="Mutfak Tarzi" sub="Mütfağın tasarım dili" />}
                    <StyleGrid styles={STYLE_CATALOG.kitchen} selected={kitchenStyle} onSelect={setKitchenStyle} />
                </View>
            )}
            {showBath && (
                <View>
                    {isBoth && <SectionTitle icon="shower-head" title="Banyo Tarzi" sub="Banyo için ayrı bir tarz seçebilirsin" />}
                    <StyleGrid styles={STYLE_CATALOG.bath} selected={bathStyle} onSelect={setBathStyle} />
                </View>
            )}
        </View>
    );

    // ── STEP 5: PHOTOS + BUDGET + NOTES ─────────────────────
    const renderStep5 = () => (
        <View style={st.stepWrap}>
            <UploadBox
                icon="camera"
                label="Mevcut Durumu Yükle"
                sub="Şu anki mutfak/banyo fotoğrafları"
                images={currentPhotos}
                onPick={() => pickImages(setCurrentPhotos)}
                onRemove={i => setCurrentPhotos(p => p.filter((_, idx) => idx !== i))}
            />
            <UploadBox
                icon="image-search"
                label="İlham Görsellerini Yükle"
                sub="Pinterest, dergi, referans fotoğrafları"
                images={inspirationPhotos}
                onPick={() => pickImages(setInspirationPhotos)}
                onRemove={i => setInspirationPhotos(p => p.filter((_, idx) => idx !== i))}
            />

            {/* BÜTÇE */}
            <View style={[st.block, { marginBottom: 24 }]}>
                <SectionTitle icon="currency-try" title="Planlanan Bütçe" sub="Opsiyonel — Mimar teklif süresini ve kalite sınıfını buna göre belirler." />
                <View style={st.budgetGrid}>
                    {BUDGET_OPTIONS.map(opt => {
                        const isSel = budget === opt.id;
                        return (
                            <TouchableOpacity key={opt.id} style={[st.budgetCard, isSel && { borderColor: opt.color, backgroundColor: `${opt.color}15` }]} onPress={() => setBudget(opt.id)}>
                                <View style={[st.budgetDot, { backgroundColor: opt.color }]} />
                                <Text style={[st.budgetLabel, isSel && { color: opt.color }]}>{opt.label}</Text>
                                <Text style={st.budgetSub}>{opt.sub}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* NOTLAR */}
            <View>
                <SectionTitle icon="text-box-edit-outline" title="Özel İstekleriniz" sub='"Ankastre fırın, çift lavabo olsun" gibi detaylar mimar için kritik.' />
                <View style={st.inputWrap}>
                    <TextInput
                        style={st.textInput}
                        placeholder="Özel isteklerinizi buraya yazın..."
                        placeholderTextColor="#666"
                        multiline
                        value={details}
                        onChangeText={setDetails}
                        inputAccessoryViewID="WizardDone"
                        onFocus={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150)}
                    />
                    <TouchableOpacity
                        style={[st.micBtn, isRecording && { backgroundColor: DANGER_RED }]}
                        onPress={() => setIsRecording(r => !r)}
                    >
                        <Ionicons name={isRecording ? "stop" : "mic"} size={22} color={isRecording ? "#FFF" : GOLD_MAIN} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // ── MAIN RETURN ──────────────────────────────────────────
    const disabled = isNextDisabled();
    return (
        <View style={st.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000000', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>

                    {/* Header — insets ile status bar çakışması giderildi */}
                    <View style={[st.header, { paddingTop: insets.top + 12 }]}>
                        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <View style={st.backBtnCircle}>
                                <Ionicons name="arrow-back" size={20} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <View style={st.progress}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <View key={s} style={[st.dot, s <= step && st.dotActive]} />
                            ))}
                        </View>
                        <Text style={st.stepLabel}>{step} / 5</Text>
                    </View>

                    <ScrollView ref={scrollViewRef} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
                        <View style={st.titleSection}>
                            <Text style={st.title}>{STEP_TITLES[step]}</Text>
                            <Text style={st.subtitle}>{STEP_SUBS[step]}</Text>
                        </View>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </ScrollView>

                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.97)', '#000']} style={[st.footer, { paddingBottom: insets.bottom + 16 }]}>
                        <TouchableOpacity style={[st.actionBtn, (disabled || loading) && { opacity: 0.4 }]} onPress={handleNext} disabled={disabled || loading} activeOpacity={0.8}>
                            <LinearGradient
                                colors={disabled ? ['#2a2a2a', '#222'] : [GOLD_MAIN, GOLD_DARK]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={st.actionGrad}
                            >
                                <Text style={[st.actionText, disabled && { color: '#555' }]}>
                                    {loading ? 'GÖNDERİLİYOR...' : step === 5 ? 'KEŞİF & TEKLİF İSTE' : 'DEVAM ET'}
                                </Text>
                                <MaterialCommunityIcons name={step === 5 ? "check-decagram" : "arrow-right"} size={22} color={disabled ? '#555' : '#000'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>

                </View>
            </KeyboardAvoidingView>

            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="WizardDone">
                    <View style={st.accessory}>
                        <TouchableOpacity onPress={Keyboard.dismiss}>
                            <Text style={st.accessoryText}>Bitti</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}
        </View>
    );
}

// ─── STYLES ──────────────────────────────────────────────────

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    backBtnCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    progress: { flexDirection: 'row', gap: 6 },
    dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#2a2a2a' },
    dotActive: { backgroundColor: GOLD_MAIN },
    stepLabel: { color: '#666', fontSize: 13, fontWeight: 'bold', width: 32, textAlign: 'right' },
    scroll: { paddingHorizontal: 20, paddingBottom: 30 },
    titleSection: { marginBottom: 26 },
    title: { color: '#FFF', fontSize: 26, fontWeight: 'bold', lineHeight: 34, marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 14, lineHeight: 21 },
    stepWrap: { width: '100%' },

    // Scope
    scopeCard: { height: 150, borderRadius: 20, overflow: 'hidden', marginBottom: 14, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#111' },
    scopeCardActive: { borderColor: GOLD_MAIN },
    scopeRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
    scopeTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: GOLD_MAIN },
    radioInner: { width: 13, height: 13, borderRadius: 7, backgroundColor: GOLD_MAIN },

    // Block
    block: { backgroundColor: '#111', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#222' },
    bathItem: {},

    // Slider
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    sliderLabel: { color: '#888', fontSize: 14 },
    valueBadge: { backgroundColor: 'rgba(212,175,55,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: GOLD_MAIN },
    valueText: { color: GOLD_MAIN, fontWeight: 'bold', fontSize: 13 },
    rangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    rangeText: { color: '#555', fontSize: 11 },

    // Chips
    subLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: '#333' },
    chipFull: { width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a' },
    chipActive: { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: GOLD_MAIN },
    chipText: { color: '#bbb', fontSize: 14 },
    chipTextActive: { color: GOLD_MAIN, fontWeight: 'bold' },

    // Warning
    warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    warningText: { color: '#f87171', fontSize: 12, lineHeight: 18, flex: 1 },

    // Work levels
    levelCard: { backgroundColor: '#111', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
    levelCardActive: { borderColor: GOLD_MAIN, backgroundColor: 'rgba(212,175,55,0.04)' },
    levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    levelIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
    levelTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', flex: 1 },
    levelDesc: { color: '#888', fontSize: 13, lineHeight: 19, paddingLeft: 52 },

    // Budget
    budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    budgetCard: { width: (width - 40 - 40 - 10) / 2, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#2a2a2a', backgroundColor: '#111', gap: 4 },
    budgetDot: { width: 10, height: 10, borderRadius: 5 },
    budgetLabel: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    budgetSub: { color: '#888', fontSize: 11 },

    // Input
    inputWrap: { position: 'relative', marginTop: 10 },
    textInput: { height: 140, backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', color: '#FFF', padding: 15, paddingRight: 55, textAlignVertical: 'top', fontSize: 14 },
    micBtn: { position: 'absolute', right: 12, bottom: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },

    // Footer
    footer: { paddingHorizontal: 20, paddingTop: 20 },
    actionBtn: { borderRadius: 16, overflow: 'hidden', height: 58 },
    actionGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    actionText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

    // Accessory
    accessory: { backgroundColor: '#1a1a1a', alignItems: 'flex-end', paddingHorizontal: 15, paddingVertical: 10 },
    accessoryText: { color: GOLD_MAIN, fontSize: 16, fontWeight: 'bold' },
});
