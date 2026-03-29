import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionService } from '../../services/PermissionService';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const PLATINUM_DARK = '#2E2E2E'; // Dark Metallic
const PLATINUM_LIGHT = '#E5E4E2'; // Platinum Text
const GOLD_MAIN = '#FFD700';
const GOLD_ACCENT = '#D4AF37';

// Data
const HERO_SLIDES = [
    {
        id: 1,
        title: "Modern Salon\nYenileme",
        image: { uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop' },
        tag: "Minimalist"
    },
    {
        id: 2,
        title: "Lüks Mutfak\nTasarımı",
        image: { uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
        tag: "Avant-Garde"
    },
    {
        id: 3,
        title: "Asansör Revizyon\n& Bakım",
        image: { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop' },
        tag: "Premium"
    }
];

const SERVICES = [
    { id: 'turnkey',    title: 'Anahtar Teslim\nTadilat',        subtitle: 'Yıkım, proje ve uygulama.',           icon: 'key',             lib: 'Ionicons' },
    { id: 'elevator_maintenance', title: 'Asansör\nBakımı', subtitle: 'Periyodik kontrol ve modernizasyon.', icon: 'elevator-passenger', lib: 'MaterialCommunityIcons' },
    { id: 'paint',      title: 'Boya & Dekorasyon',             subtitle: 'Duvar kağıdı, boya ve alçıpan.',     icon: 'format-paint',    lib: 'MaterialCommunityIcons' },
    { id: 'kitchen',    title: 'Mutfak & Banyo\nYenileme',      subtitle: 'Modern ve fonksiyonel alanlar.',     icon: 'water-pump',      lib: 'MaterialCommunityIcons' },
    { id: 'outdoor',    title: 'Açık Alan, Teras\n& Kış Bahçesi', subtitle: 'Pergola, giyotin cam, peyzaj.',      icon: 'tree-outline',    lib: 'MaterialCommunityIcons' },
    { id: 'furniture',  title: 'Özel İmalat\nMobilya & Zemin',  subtitle: 'Giyinme odası, panel, masif parke.', icon: 'sofa-outline',    lib: 'MaterialCommunityIcons' },
    { id: 'smart',      title: 'Akıllı Ev &\nTesisat Dönüşümü', subtitle: 'Smart Home, VRF, yerden ısıtma.',    icon: 'home-automation', lib: 'MaterialCommunityIcons' },
    { id: 'arch',       title: 'Mimari Proje\n& Çizim',          subtitle: 'Ruhsat, tatbikat ve 3D tasarım.',    icon: 'pencil-ruler',    lib: 'MaterialCommunityIcons' },
];

// Standard Gold Card (Premium Button)
const GoldCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={['rgba(255, 215, 0, 0.15)', 'transparent', 'rgba(255, 255, 255, 0.05)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardContent}>
            {children}
        </View>
    </TouchableOpacity>
);

import { supabase } from '../../lib/supabase';

export default function RenovationScreen({ navigation }) {
    const [requestInput, setRequestInput] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('Konfor');
    const scrollX = useRef(new Animated.Value(0)).current;

    const [isAdmin, setIsAdmin] = useState(false);
    const [isArchitect, setIsArchitect] = useState(false);
    const [isContractor, setIsContractor] = useState(false);
    const [servicePage, setServicePage] = useState(0);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const [hasRenovationAccess, setHasRenovationAccess] = useState(false);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const roles = await PermissionService.getUserRoles();
                setIsAdmin(roles.isAdmin);

                const hasAccess = await PermissionService.checkAccess('renovation_office');
                setHasRenovationAccess(hasAccess);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const handleServicePress = (service) => {
        if (service.id === 'turnkey') {
            navigation.navigate('RenovationProjectSelection');
            return;
        } else if (service.id === 'kitchen') {
            navigation.navigate('KitchenBathWizard');
            return;
        } else if (service.id === 'paint') {
            navigation.navigate('PaintDecorWizard');
            return;
        }
        Alert.alert(service.title, `${service.subtitle}\n\nBu modül yakında aktif olacak.`);
    };

    const handleAction = (action) => {
        Alert.alert(action, "Modül başlatılıyor...");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <LinearGradient
                colors={['#000000', '#121212', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* CUSTOM HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>MİMARLIK OFİSİ</Text>
                        <Text allowFontScaling={false} style={styles.headerSubtitle}>Yaşam Alanınızı Yeniden Keşfedin</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !hasRenovationAccess && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || hasRenovationAccess) {
                                    navigation.navigate('RenovationProvider');
                                } else {
                                    Alert.alert("Yetkisiz Erişim", "Tadilat yönetim paneline sadece yetkili firmalar erişebilir.");
                                }
                            }}
                            activeOpacity={isAdmin || hasRenovationAccess ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="hammer-wrench" size={24} color={isAdmin || hasRenovationAccess ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>



                    {/* HERO CAROUSEL */}
                    <View style={styles.carouselContainer}>
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                            scrollEventThrottle={16}
                        >
                            {HERO_SLIDES.map((slide) => (
                                <View key={slide.id} style={styles.slide}>
                                    <Image source={slide.image} style={styles.slideImage} contentFit="cover" transition={500} />
                                    <View style={styles.slideOverlay}>
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                                            style={StyleSheet.absoluteFillObject}
                                        />
                                        <View style={styles.slideContent}>
                                            <View style={styles.tagContainer}>
                                                <Text allowFontScaling={false} style={styles.tagText}>{slide.tag}</Text>
                                            </View>
                                            <Text allowFontScaling={false} style={styles.slideTitle}>{slide.title}</Text>
                                            <TouchableOpacity style={styles.offerBtn} onPress={() => handleAction('Teklif Al')}>
                                                <Text allowFontScaling={false} style={styles.offerBtnText}>TEKLİF AL</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Animated.ScrollView>

                        {/* Pagination Dots */}
                        <View style={styles.pagination}>
                            {HERO_SLIDES.map((_, i) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp'
                                });
                                return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                            })}
                        </View>
                    </View>

                    {/* SERVICE GRID — Sayfalı slider */}
                    <View style={styles.sectionContainer}>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>HİZMETLERİMİZ</Text>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={e => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                                setServicePage(idx);
                            }}
                        >
                            {/* Sayfa 1 — İlk 4 servis */}
                            <View style={styles.gridPage}>
                                {SERVICES.slice(0, 4).map((item) => (
                                    <GoldCard
                                        key={item.id}
                                        style={styles.gridItem}
                                        onPress={() => handleServicePress(item)}
                                    >
                                        <View style={styles.iconCircle}>
                                            {item.lib === 'Ionicons' ? (
                                                <Ionicons name={item.icon} size={26} color={GOLD_MAIN} />
                                            ) : (
                                                <MaterialCommunityIcons name={item.icon} size={28} color={GOLD_MAIN} />
                                            )}
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text allowFontScaling={false} style={styles.gridItemTitle}>{item.title}</Text>
                                            <Text allowFontScaling={false} style={styles.gridItemSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </GoldCard>
                                ))}
                            </View>

                            {/* Sayfa 2 — Yeni premium modüller */}
                            <View style={[styles.gridPage, { paddingRight: 0 }]}>
                                {SERVICES.slice(4).map((item) => (
                                    <GoldCard
                                        key={item.id}
                                        style={styles.gridItem}
                                        onPress={() => handleServicePress(item)}
                                    >
                                        <View style={styles.iconCircle}>
                                            <MaterialCommunityIcons name={item.icon} size={28} color={GOLD_MAIN} />
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text allowFontScaling={false} style={styles.gridItemTitle}>{item.title}</Text>
                                            <Text allowFontScaling={false} style={styles.gridItemSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </GoldCard>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Sayfa Göstergesi */}
                        <View style={styles.servicePagination}>
                            {[0, 1].map(i => (
                                <View key={i} style={[styles.serviceDot, servicePage === i && styles.serviceDotActive]} />
                            ))}
                        </View>
                    </View>


                    {/* MIMARIM - SANAL TASARIM STÜDYOSU */}
                    <View style={styles.smartSection}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.05)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.smartHeader}>
                            <MaterialCommunityIcons name="cube-scan" size={24} color={GOLD_MAIN} />
                            <Text allowFontScaling={false} style={styles.smartTitle}>Mimarım - Sanal Tasarım Stüdyosu</Text>
                        </View>

                        <Text allowFontScaling={false} style={styles.smartDesc}>
                            Mevcut alanın fotoğrafını yükleyin; seçtiğiniz kalite sınıfına uygun olarak <Text allowFontScaling={false} style={{ color: GOLD_MAIN }}>3D tasarımınızı ve maliyet teklifinizi</Text> hazırlansın.
                        </Text>

                        {/* Mood Tags (Radio Selection) */}
                        <View style={styles.moodTagsRow}>
                            {['Ekonomik', 'Konfor', 'Exclusive'].map((tag, index) => {
                                const isSelected = selectedQuality === tag;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.moodTag, isSelected ? styles.moodTagActive : {}]}
                                        onPress={() => setSelectedQuality(tag)}
                                    >
                                        <Text allowFontScaling={false} style={[styles.moodTagText, isSelected ? styles.moodTagTextActive : {}]}>{tag}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput allowFontScaling={false}
                                style={styles.textInput}
                                placeholder="Dönüşümünüzdeki beklentilerinizi ve alanın fotoğrafını belirtin..."
                                placeholderTextColor="#666"
                                multiline
                                value={requestInput}
                                onChangeText={setRequestInput}
                            />
                        </View>

                        {/* Photo Upload Button (Large Card Style) */}
                        <TouchableOpacity style={styles.photoUploadCard} onPress={() => handleAction('Fotoğraf Yükle')}>
                            <View style={styles.photoIconCircle}>
                                <MaterialCommunityIcons name="camera-plus" size={24} color="#000" />
                                <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN }} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.photoUploadTitle}>Mevcut Alanın Fotoğrafını Yükle</Text>
                                <Text allowFontScaling={false} style={styles.photoUploadSub}>Mimarlarımız dönüşümü başlatsın</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitBtn} onPress={() => handleAction('Analiz Başlat')}>
                            <LinearGradient
                                colors={[GOLD_MAIN, '#B8860B']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text allowFontScaling={false} style={styles.submitText}>TASARIM VE TEKLİF İSTE</Text>
                                <MaterialCommunityIcons name="magic-staff" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Consultant CTA (Premium) */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => handleAction('Mimar Görüşmesi')}>
                            <LinearGradient
                                colors={['#1c1917', '#292524']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.consultantCard}
                            >
                                <View style={styles.consultantContent}>
                                    <View style={styles.consultantIconBox}>
                                        <MaterialCommunityIcons name="face-agent" size={24} color={GOLD_MAIN} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={styles.consultantTitle}>Karar veremediniz mi?</Text>
                                        <Text allowFontScaling={false} style={styles.consultantSub}>Profesyonel destek için tıklayın.</Text>
                                    </View>
                                    <View style={styles.consultantBtn}>
                                        <Text allowFontScaling={false} style={styles.consultantBtnText}>Mimarınızla Görüş</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={16} color="#000" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>


                    </View>


                    {/* ═══ AI TADİLAT ASİSTANI ═══════════════════════════ */}
                    <TouchableOpacity
                        style={styles.aiCard}
                        onPress={() => navigation.navigate('AIRenovationAssistant')}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={['#0a0900', '#1a1400', '#0a0900']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        {/* Subtle gold glow in corner */}
                        <LinearGradient
                            colors={['rgba(212,175,55,0.18)', 'transparent']}
                            style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
                            start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
                        />
                        <View style={styles.aiCardBorder} />

                        <View style={styles.aiCardLeft}>
                            <View style={styles.aiTagRow}>
                                <MaterialCommunityIcons name="chef-hat" size={13} color="#000" />
                                <Text allowFontScaling={false} style={styles.aiTagText}>CepteŞef AI</Text>
                            </View>
                            <Text allowFontScaling={false} style={styles.aiCardTitle}>İstediğini Bulamadın mı?</Text>
                            <Text allowFontScaling={false} style={styles.aiCardSub}>Mekanının fotoğrafını yükle ve hayalini anlat — yapay zeka teknik listeni çıkarsın.</Text>
                            <View style={styles.aiBtn}>
                                <Text allowFontScaling={false} style={styles.aiBtnText}>Şefle Konuş</Text>
                                <MaterialCommunityIcons name="arrow-right" size={14} color={GOLD_MAIN} />
                            </View>
                        </View>

                        <View style={styles.aiCardRight}>
                            {/* Animated-looking concentric rings */}
                            <View style={styles.aiRingOuter}>
                                <View style={styles.aiRingMid}>
                                    <View style={styles.aiRingInner}>
                                        <MaterialCommunityIcons name="magic-staff" size={28} color={GOLD_MAIN} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    headerTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: '300', marginTop: 4 },
    headerBtn: { padding: 5 },

    // Carousel
    carouselContainer: { marginBottom: 30 },
    slide: { width: width - 40, height: 220, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
    slideImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', padding: 20 },
    tagContainer: { backgroundColor: GOLD_MAIN, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    tagText: { color: '#000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    slideTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 15 },
    offerBtn: { backgroundColor: GOLD_MAIN, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5 },
    offerBtnText: { color: '#000', fontSize: 12, fontWeight: '900' },

    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN },

    // Grid
    sectionContainer: { paddingHorizontal: 20, marginBottom: 30, overflow: 'visible' },
    gridPage: { width: width - 40, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    servicePagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 8 },
    serviceDot: { width: 22, height: 4, borderRadius: 2, backgroundColor: '#333' },
    serviceDotActive: { backgroundColor: GOLD_MAIN, width: 36 },
    svcBadge: { position: 'absolute', top: 10, right: 10, borderRadius: 20, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
    svcBadgeText: { fontSize: 9, fontWeight: '900' },

    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D4AF37',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: { color: '#999', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 0, marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', height: 160, borderRadius: 20, marginBottom: 16 },

    // Premium Card Styles
    goldCardContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.65)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 215, 0, 0.25)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.8 },
    cardContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },

    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
    gridItemTitle: { color: '#FFF', fontSize: 14.5, fontWeight: '900', textAlign: 'center', marginTop: 12, letterSpacing: 0.5 },
    gridItemSubtitle: { color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 4, paddingHorizontal: 4, lineHeight: 15 },


    // Smart Section
    smartSection: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    smartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    smartTitle: { color: GOLD_MAIN, fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    smartDesc: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 20 },

    // Mood Tags
    moodTagsRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
    moodTag: {
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    moodTagActive: {
        backgroundColor: GOLD_MAIN,
        borderColor: GOLD_MAIN
    },
    moodTagText: { color: '#888', fontSize: 11, fontWeight: '600' },
    moodTagTextActive: { color: '#000', fontWeight: '900' },

    inputContainer: { backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 15, height: 100 },
    textInput: { flex: 1, color: '#fff', padding: 15, textAlignVertical: 'top', fontSize: 13 },

    // Photo Upload Card
    photoUploadCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#333', borderStyle: 'dashed'
    },
    photoIconCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_MAIN,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    photoUploadTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    photoUploadSub: { color: '#666', fontSize: 11 },

    submitBtn: { borderRadius: 16, overflow: 'hidden' },
    submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    submitText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

    // Consultant CTA (Premium Redesign)
    consultantCard: { marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: '#44403c', overflow: 'hidden' },
    consultantContent: { flexDirection: 'row', items: 'center', padding: 16, alignItems: 'center' },
    consultantIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    consultantTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    consultantSub: { color: '#a8a29e', fontSize: 11 },
    consultantBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: GOLD_MAIN, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 4 },
    consultantBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },

    // AI Asistan Kartı
    aiCard: { marginHorizontal: 20, marginTop: 20, marginBottom: 10, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 },
    aiCardBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
    aiCardLeft: { flex: 1, gap: 6 },
    aiTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD_MAIN, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    aiTagText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    aiCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
    aiCardSub: { color: '#888', fontSize: 12, lineHeight: 18 },
    aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    aiBtnText: { color: GOLD_MAIN, fontSize: 13, fontWeight: '700' },
    aiCardRight: { alignItems: 'center', justifyContent: 'center' },
    aiRingOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
    aiRingMid: { width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', alignItems: 'center', justifyContent: 'center' },
    aiRingInner: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: GOLD_MAIN, alignItems: 'center', justifyContent: 'center' },

});
