import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { 
    ActivityIndicator, 
    Alert, 
    Animated,
    Dimensions, 
    Modal, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput,
    TouchableOpacity, 
    View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ScreenConfigService } from '../../services/ScreenConfigService';
import { PermissionService } from '../../services/PermissionService';
import { TransformationService } from '../../services/TransformationService';

const COLOR_PALETTE = [
    { name: 'Altın', code: '#D4AF37' },
    { name: 'Beyaz', code: '#FFFFFF' },
    { name: 'Gümüş', code: '#C0C0C0' },
    { name: 'Kömür', code: '#333333' },
    { name: 'Turuncu', code: '#F97316' },
    { name: 'Mavi', code: '#06B6D4' },
    { name: 'Kırmızı', code: '#EF4444' },
];

const getLocalImage = (ref) => {
    if (ref === 'urban_transformation_hero') return require('../../../assets/urban_transformation_hero.jpg');
    return null;
};

const { width } = Dimensions.get('window');

const TRANSFORMATION_STEPS = [
    {
        id: 1,
        title: 'RİSKLİ YAPI TESPİTİ',
        subtitle: 'Binanız Güvenli mi?',
        icon: 'home-alert',
        desc: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı lisanslı kuruluşlarca binanızın deprem risk raporunun hazırlanması.',
        image: 'https://images.unsplash.com/photo-1590674899505-1c5c417b1bda?q=80&w=400&auto=format&fit=crop',
        action: 'Tespiti Başlat'
    },
    {
        id: 2,
        title: 'YARISI BİZDEN',
        subtitle: 'Devlet Destek Kampanyası',
        icon: 'hand-heart', // customized icon
        desc: 'Hak sahiplerine 1.75 Milyon TL\'ye kadar destek! 875 Bin TL hibe, 875 Bin TL kredi ve 125 Bin TL tahliye desteği.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop',
        action: 'Başvuru Bilgisi'
    },
    {
        id: 3,
        title: 'UZLAŞMA & PROTOKOL',
        subtitle: '3/2 Çoğunluk Kararı',
        icon: 'file-sign',
        desc: 'Kat malikleri ile müteahhit arasında SPK lisanslı değerleme raporlarına dayalı adil paylaşım ve sözleşme süreci.',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop',
        action: 'Uzman Ata'
    },
    {
        id: 4,
        title: 'YIKIM VE YAPIM',
        subtitle: 'Yeni Yaşam Alanınız',
        icon: 'crane',
        desc: 'Ruhsat alımı, güvenli yıkım ve projenin start alması. Kira yardımlarının başlaması.',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
        action: 'Müteahhit Bul'
    }
];

// --- YARISI BİZDEN KAMPANYASI DATASI ---
const YARISI_BIZDEN_FAQ = [
    { q: '1-Kimler faydalanabilir?', a: 'İstanbul’un 39 ilçesinde riskli yapı sahiplerinin tümü kampanyadan faydalanabilir.' },
    { q: '2-Proje ön şartları nelerdir?', a: 'Yeni projedeki yapı (otopark ve sığınak hariç), eski yapının bir buçuk katı büyüklüğünü geçmemeli.' },
    { q: '3-“Ev/iş yerimin riskli olup olmadığını nasıl öğrenebilirim?”', a: 'Bakanlığa bağlı lisanslı kuruluşlara karot örneği baktırılarak risk durumu tespit edilir.' },
    { q: '4-Yarısı Bizden’e nasıl başvuru yapılır?', a: 'e-Devlet başvurusuna gerek duyulmaz. Kat irtifakı kurulduktan sonra hak sahibi tespiti yaptırmak üzere ilçe belediyesine başvurur. Bakanlıkça belirlenen randevu gününde hak sahibi ile hibe taahhütnamesi ve kredi sözleşmesi imzalanır.' },
    { q: '5-TOKİ ve Emlak Konut inşaat desteği veriyor mu?', a: 'Bina yerine alan/ada bazlı site benzeri büyük dönüşümlerde tam uzlaşma sağlanması halinde Kentsel Dönüşüm Başkanlığı, TOKİ ve Emlak Konut iş birliği ile destek sağlanır.' },
    { q: '6-Alan bazlı büyük dönüşümde hangi kolaylıklar sağlanır?', a: '875 bin TL’lik hibe, TOKİ ya da Emlak Konut ile de inşa desteği verilir.' },
    { q: '7-Alan bazlı dönüşümde geri ödeme nasıl yapılır?', a: 'Hibe tutarı bina maliyetinden düşürülür arta kalan borç ise uzun vadeli uygun ödeme koşullarıyla taksitlendirilir.' },
    { q: '8-Yüklenici firma ile dönüşümde her konut/iş yeri için ne kadar destek verilir?', a: 'Hak sahibinin bir konutu için 875 bin TL hibe ve 875 bin TL kredi, hak sahibinin bir dükkanı için 437 bin 500 TL hibe ve 437 bin 500 TL kredi.' },
    { q: '9-İlk konut/iş yeri için Yarısı Bizden desteği alan vatandaşlar diğer ev/ iş yerleri için de kampanyadan faydalanabilir mi?', a: 'Hak sahipleri bir konut için verilen 1 milyon 875 bin TL’lik desteğin ardından diğer her bir konutu için 1 milyon 750 bin TL kredi imkanından faydalanabilir. Bir iş yeri için 1 milyon TL dönüşüm desteğini alan hak sahibi diğer her bir dükkanı için ise 875 bin TL kredi desteğinden yararlanabilir.' },
    { q: '10-Ödeme hak sahibine mi yükleniciye mi yapılır?', a: 'Bina bazlı dönüşümde ödemeler hak sahipleri adına yükleniciye yapılır.' },
    { q: '11-Ödeme ne zaman ve nasıl yapılır?', a: 'İş başlayınca yüzde 30, taşıyıcı sistemin bitiminde yüzde 30, sıva aşamasında yüzde 30, yapı kullanım izin belgesi alındığında yüzde 10 oranında ödemeler yapılır.' },
    { q: '12-Tahliye/taşınma desteği ne kadar?', a: 'Tahliye desteği tek seferde 125 bin TL olarak ödenir.' },
    { q: '13-Tahliye desteğinden kiracılar da faydalanabilir mi?', a: 'Daire/iş yerinde oturan kiracıysa kiracıya, değilse ev sahibine ödenir.' },
    { q: '14-Otopark ve sığınak yapınca hak kaybı olur mu?', a: 'Otopark ve sığınak alanları inşaat alanı metrekaresinin dışında tutulur.' },
    { q: '15-Kredi geri ödemeleri ne zaman başlar?', a: 'Yapı ruhsatının alınmasından 2 yıl sonra başlar. 10 yıla kadar vade uygulanır. Ödemenin başladığı ilk yıl faiz uygulanmaz. Sonraki yıllar Tüketici Fiyat Endeksi (TÜFE) oranının yarısı kadar güncelleme yapılır.' },
    { q: '16-Kredi için gelir şartı aranır mı?', a: 'Hak sahiplerine kredi verilirken gelir ve kredi puanına bakılmaz.' }
];

// Expanded Faq Item Component
const FaqItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity style={styles.faqItem} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
            <View style={styles.faqHeader}>
                <Text allowFontScaling={false} style={styles.faqQuestion}>{item.q}</Text>
                <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color="#FFD700" />
            </View>
            {expanded && <Text allowFontScaling={false} style={styles.faqAnswer}>{item.a}</Text>}
        </TouchableOpacity>
    );
};

// Default configuration in case DB is unreachable
const DEFAULT_SECTIONS = [
    { id: 'urban_construction_quotes', title: 'İnşaat Teklifleri', sort_order: 10, is_visible: true },
    { id: 'urban_expert_qa', title: 'Uzmana Sor', sort_order: 20, is_visible: true },
    { id: 'urban_process_steps', title: 'Dönüşüm Adımları', sort_order: 30, is_visible: true }
];

export default function UrbanTransformationScreen({ navigation }) {
    const [selectedStep, setSelectedStep] = useState(null);
    const [campaignModalVisible, setCampaignModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consultantQuery, setConsultantQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // Dynamic Configuration State
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        loadScreenConfig();
        checkAdminStatus();
        fetchShowcase();
    }, []);

    // Showcase State
    const [showcaseItems, setShowcaseItems] = useState([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isShowcaseManagerVisible, setIsShowcaseManagerVisible] = useState(false);
    const [editingShowcaseItem, setEditingShowcaseItem] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchShowcase = async () => {
        const items = await TransformationService.getShowcaseItems();
        setShowcaseItems(items || []);
    };

    const handlePickShowcaseImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setIsUploading(true);
            const publicUrl = await TransformationService.uploadImage(result.assets[0].uri);
            if (publicUrl) {
                setEditingShowcaseItem(prev => ({ ...prev, image_url: publicUrl, image_ref: null, is_local: false }));
            } else {
                Alert.alert("Hata", "Resim yüklenemedi. 'transformation-images' bucket'ı oluşturulduğundan emin olun.");
            }
            setIsUploading(false);
        }
    };

    const handleSaveShowcase = async () => {
        if (!editingShowcaseItem) return;
        
        const isNew = !editingShowcaseItem.id;
        let success = false;

        if (isNew) {
            const res = await TransformationService.addShowcaseItem(editingShowcaseItem);
            success = res.success;
        } else {
            const res = await TransformationService.updateShowcaseItem(editingShowcaseItem.id, editingShowcaseItem);
            success = res.success;
        }

        if (success) {
            fetchShowcase();
            setEditingShowcaseItem(null);
            Alert.alert("Başarılı", "Dönüşüm kampanyası kaydedildi.");
        } else {
            Alert.alert("Hata", "Kampanya kaydedilemedi.");
        }
    };

    const handleDeleteShowcase = async (id) => {
        Alert.alert("Sil", "Bu kampanyayı silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    const { success } = await TransformationService.deleteShowcaseItem(id);
                    if (success) {
                        setShowcaseItems(prev => prev.filter(item => item.id !== id));
                    }
                }
            }
        ]);
    };

    const loadScreenConfig = async () => {
        try {
            const config = await ScreenConfigService.fetchConfig('UrbanTransformationScreen');
            if (config && config.length > 0) {
                setSections(config);
            } else {
                setSections(DEFAULT_SECTIONS);
            }
        } catch (error) {
            console.warn('Error loading screen config:', error);
            setSections(DEFAULT_SECTIONS);
        } finally {
            setLoadingConfig(false);
        }
    };

    const handleGetQuotes = () => {
        navigation.navigate('ConstructionOffer');
    };

    const [isContractor, setIsContractor] = useState(false);
    const [isProvider, setIsProvider] = useState(false); // New state for general providers

    const [hasTransformationAccess, setHasTransformationAccess] = useState(false);

    const checkAdminStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check detailed roles via Service
                const roles = await PermissionService.getUserRoles();
                setIsAdmin(roles.isAdmin);

                // Check specific module permission (Urban Transformation)
                const hasAccess = await PermissionService.checkAccess('urban_transformation');
                setHasTransformationAccess(hasAccess);
            }
        } catch (e) {
            console.warn('Admin check failed', e);
        }
    };

    const toggleSectionVisibility = async (section) => {
        try {
            const newVisibility = !section.is_visible;
            const updatedSections = sections.map(s =>
                s.id === section.id ? { ...s, is_visible: newVisibility } : s
            );
            setSections(updatedSections);
            await ScreenConfigService.updateSectionConfig(section.id, { is_visible: newVisibility });
        } catch (error) {
            Alert.alert("Hata", "Güncelleme yapılamadı.");
            loadScreenConfig();
        }
    };

    const handleAction = (step) => {
        setSelectedItem(step);
        setModalVisible(true);
    };

    const handleApplication = () => {
        setModalVisible(false);
        Alert.alert("Talep Alındı", "Kentsel dönüşüm uzmanımız 24 saat içinde sizinle iletişime geçerek süreci başlatacaktır.");
    };

    const handleConsultantSubmit = () => {
        if (!consultantQuery.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen sorunuzu yazın.");
            return;
        }
        Alert.alert("İletildi", "Sorunuz uzmanlarımıza iletildi. En kısa sürede dönüş sağlanacaktır.");
        setConsultantQuery('');
    };

    const renderSection = (sectionId, section) => {
        switch (sectionId) {
            case 'urban_expert_qa':
                return (
                    <View key={sectionId} style={styles.premiumBox}>
                        <LinearGradient
                            colors={['#1A1A1A', '#000000']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.premiumBoxContent}>
                            <View style={styles.premiumHeaderRow}>
                                <Text allowFontScaling={false} style={styles.premiumBoxTitle}>KENTSEL DÖNÜŞÜM UZMANINA SOR</Text>
                                <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
                            </View>

                            <TouchableOpacity
                                style={styles.chatPremiumButton}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('TransformationExpertChat')}
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFB300']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <View style={styles.buttonContent}>
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="chatbubbles" size={20} color="#FFD700" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={styles.buttonTitle}>UZMANA DANIŞIN</Text>
                                            <Text allowFontScaling={false} style={styles.buttonSubtitle}>Aklınıza takılanları sorun, anında cevaplayalım.</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={24} color="#000" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'urban_construction_quotes':
                return (
                    <View key={sectionId} style={styles.premiumActionCard}>
                        <View style={styles.premiumActionHeader}>
                            <View style={styles.premiumActionIconBox}>
                                <MaterialCommunityIcons name="crane" size={24} color="#000" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={styles.premiumActionTitle}>Anahtar Teslim İnşaat Teklifi</Text>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Lisanslı müteahhitlerden resmi teklif alın.</Text>
                            </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.9} onPress={handleGetQuotes}>
                            <LinearGradient
                                colors={['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30']}
                                style={styles.premiumActionButton}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <Text allowFontScaling={false} style={styles.premiumActionButtonText}>HEMEN TEKLİF AL</Text>
                            </LinearGradient>
                        </TouchableOpacity>


                    </View>
                );

            case 'urban_process_steps':
                return (
                    <View key={sectionId}>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>DÖNÜŞÜM SÜRECİ ADIMLARI</Text>
                        {TRANSFORMATION_STEPS.map((step, index) => (
                            <TouchableOpacity
                                key={step.id}
                                style={styles.stepCard}
                                activeOpacity={0.9}
                                onPress={() => handleAction(step)}
                            >
                                <View style={styles.stepHeader}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name={step.icon} size={24} color="#FFD700" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 15 }}>
                                        <Text allowFontScaling={false} style={styles.stepTitle}>{step.title}</Text>
                                        <Text allowFontScaling={false} style={styles.stepSubtitle}>{step.subtitle}</Text>
                                    </View>
                                    <View style={styles.stepNumberBox}>
                                        <Text allowFontScaling={false} style={styles.stepNumber}>{step.id}</Text>
                                    </View>
                                </View>

                                <Text allowFontScaling={false} style={styles.stepDesc}>{step.desc}</Text>

                                <View style={styles.stepFooter}>
                                    <Text allowFontScaling={false} style={styles.actionText}>{step.action}</Text>
                                    <Ionicons name="arrow-forward-circle" size={24} color="#FFD700" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text allowFontScaling={false} style={styles.headerTitle}>YERİNDE DÖNÜŞÜM</Text>
                        <Text allowFontScaling={false} style={styles.headerSubtitle}>GÜVENLİ GELECEK</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !hasTransformationAccess && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || hasTransformationAccess) {
                                    navigation.navigate('ContractorProvider');
                                } else {
                                    Alert.alert("Yetkisiz Erişim", "Kentsel dönüşüm paneline sadece yetkili firmalar erişebilir.");
                                }
                            }}
                            activeOpacity={isAdmin || hasTransformationAccess ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="home-city" size={24} color={isAdmin || hasTransformationAccess ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Hero Slider */}
                    <View style={styles.carouselContainer}>
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
                            scrollEventThrottle={16}
                        >
                            {showcaseItems.map((slide) => (
                                <TouchableOpacity
                                    key={slide.id}
                                    style={styles.slide}
                                    activeOpacity={0.9}
                                    onPress={() => setCampaignModalVisible(true)}
                                >
                                    <Image
                                        source={slide.is_local ? getLocalImage(slide.image_ref) : { uri: slide.image_url }}
                                        style={[
                                            styles.heroImage,
                                            { transform: [{ scale: slide.image_scale || 1 }] }
                                        ]}
                                        contentFit="cover"
                                        transition={500}
                                    />
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFillObject} />
                                    
                                    <View style={[
                                        styles.heroTextContainer,
                                        {
                                            transform: [
                                                { translateX: slide.text_offset_x || 0 },
                                                { translateY: slide.text_offset_y || 0 }
                                            ]
                                        }
                                    ]}>
                                        <View style={[
                                            styles.tagBadge,
                                            { backgroundColor: slide.tag_color || '#D4AF37', alignSelf: 'flex-start', marginBottom: 8 }
                                        ]}>
                                            <Text allowFontScaling={false} style={styles.tagBadgeText}>{slide.tag}</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.heroTitle, { color: slide.title_color || '#FFF' }]} numberOfLines={1} adjustsFontSizeToFit>{slide.title}</Text>
                                        <Text allowFontScaling={false} style={[styles.heroDesc, { color: slide.subtitle_color || '#888' }]}>{slide.subtitle}</Text>
                                    </View>

                                    {/* Detail Button */}
                                    <View style={styles.heroDetailBtn}>
                                        <Text allowFontScaling={false} style={styles.heroDetailText}>{slide.button_text || 'DETAYLAR'}</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFD700" />
                                    </View>

                                    {/* Admin Slider Edit Shortcut */}
                                    {isAdmin && (
                                        <TouchableOpacity 
                                            style={styles.heroEditShortcut} 
                                            onPress={() => setEditingShowcaseItem(slide)}
                                        >
                                            <MaterialCommunityIcons name="pencil" size={20} color="#000" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </Animated.ScrollView>

                        {/* Pagination Dots */}
                        <View style={styles.pagination}>
                            {showcaseItems.map((_, i) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp'
                                });
                                return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                            })}
                        </View>
                    </View>

                    {/* Slider Settings Button (Admin Only) */}
                    {isAdmin && (
                        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                            <TouchableOpacity 
                                style={styles.adminSliderBtn}
                                onPress={() => setIsShowcaseManagerVisible(true)}
                            >
                                <LinearGradient colors={['#1A1A1A', '#111']} style={StyleSheet.absoluteFillObject} />
                                <MaterialCommunityIcons name="view-carousel-outline" size={20} color="#D4AF37" />
                                <Text allowFontScaling={false} style={styles.adminSliderBtnText}>SLIDER AYARLARI</Text>
                                <MaterialCommunityIcons name="cog-outline" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Stats Row - Always Visible */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text allowFontScaling={false} style={styles.statValue}>875.000₺</Text>
                            <Text allowFontScaling={false} style={styles.statLabel}>HİBE</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text allowFontScaling={false} style={styles.statValue}>875.000₺</Text>
                            <Text allowFontScaling={false} style={styles.statLabel}>KREDİ</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text allowFontScaling={false} style={styles.statValue}>12-18 Ay</Text>
                            <Text allowFontScaling={false} style={styles.statLabel}>Teslim Hedefi</Text>
                        </View>
                    </View>

                    {/* Dynamic Sections - Optimistic UI (Always Show Content) */}
                    {sections.length > 0 ? (
                        sections
                            .filter(s => s.is_visible || isAdmin) // Admins see everything
                            .map(section => (
                                <View key={section.id} style={{ position: 'relative' }}>
                                    {/* Admin Control Overlay */}
                                    {isAdmin && (
                                        <View style={{
                                            position: 'absolute',
                                            top: -10,
                                            right: 10,
                                            zIndex: 999,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            padding: 5,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: section.is_visible ? '#00FF00' : '#FF0000'
                                        }}>
                                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 10, marginRight: 5 }}>
                                                {section.is_visible ? 'AKTİF' : 'GİZLİ'}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => toggleSectionVisibility(section)}
                                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                                style={{ padding: 8 }}
                                            >
                                                <MaterialCommunityIcons
                                                    name={section.is_visible ? "eye" : "eye-off"}
                                                    size={24}
                                                    color={section.is_visible ? "#00FF00" : "#FF0000"}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {/* Section Content with opacity if hidden */}
                                    <View style={{ opacity: (!section.is_visible && isAdmin) ? 0.5 : 1 }}>
                                        {renderSection(section.id, section)}
                                    </View>
                                </View>
                            ))
                    ) : (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#FFD700" />
                            <Text allowFontScaling={false} style={{ color: '#666', marginTop: 10, fontSize: 12 }}>İçerik Yükleniyor...</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>

            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>{selectedItem?.title}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Image source={{ uri: selectedItem?.image }} style={styles.modalImage} />
                            <Text allowFontScaling={false} style={styles.modalDescText}>{selectedItem?.desc}</Text>

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={24} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.infoText}>
                                    Bu aşamada uzman ekiplerimiz, mevzuata uygun şekilde tüm resmi süreçleri sizin adınıza yönetmektedir.
                                </Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.applyBtn} onPress={handleApplication}>
                            <Text allowFontScaling={false} style={styles.applyBtnText}>BAŞVURU OLUŞTUR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Campaign Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={campaignModalVisible}
                onRequestClose={() => setCampaignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <MaterialCommunityIcons name="handshake" size={24} color="#FFD700" />
                                <Text allowFontScaling={false} style={[styles.modalTitle, { fontSize: 18 }]} numberOfLines={1}>YARISI BİZDEN KAMPANYASI</Text>
                            </View>
                            <TouchableOpacity onPress={() => setCampaignModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text allowFontScaling={false} style={[styles.campaignSubtitle, { marginLeft: 0, marginBottom: 15 }]}>Sıkça Sorulan Sorular ve Detaylar</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.faqContainer}>
                                {YARISI_BIZDEN_FAQ.map((item, index) => (
                                    <FaqItem key={index} item={item} />
                                ))}
                            </View>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* SHOWCASE MANAGER MODAL */}
            <Modal visible={isShowcaseManagerVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.managerModalContent}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Slider Yönetimi</Text>
                            <TouchableOpacity onPress={() => setIsShowcaseManagerVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 16 }}>
                            {showcaseItems.map((item, idx) => (
                                <View key={item.id || idx} style={styles.managerItem}>
                                    <View style={styles.managerItemThumbContainer}>
                                        <Image 
                                            source={item.is_local ? getLocalImage(item.image_ref) : { uri: item.image_url }} 
                                            style={styles.managerItemThumb} 
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text allowFontScaling={false} style={styles.managerItemTitle} numberOfLines={1}>
                                            {item.tag || 'Resimsiz'} - {item.title || 'Başlıksız'}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity onPress={() => setEditingShowcaseItem(item)} style={styles.managerActionBtn}>
                                            <MaterialCommunityIcons name="pencil" size={18} color="#D4AF37" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteShowcase(item.id)} style={styles.managerActionBtn}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF4D4D" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity 
                                style={styles.addSliderBtn}
                                onPress={() => setEditingShowcaseItem({
                                    tag: 'YENİ', title: '', subtitle: '', 
                                    image_url: 'https://placehold.co/800x450/png',
                                    text_offset_x: 0, text_offset_y: 0, image_scale: 1.0,
                                    sort_order: (showcaseItems.length + 1) * 10,
                                    tag_color: '#D4AF37', title_color: '#FFFFFF', subtitle_color: '#FFFFFF'
                                })}
                            >
                                <MaterialCommunityIcons name="plus" size={24} color="#000" />
                                <Text allowFontScaling={false} style={styles.addSliderBtnText}>YENİ SLIDER EKLE</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* SHOWCASE EDIT MODAL */}
            <Modal visible={!!editingShowcaseItem} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.editModalContent}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Slider Düzenle</Text>
                            <TouchableOpacity onPress={() => setEditingShowcaseItem(null)}>
                                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 16 }}>
                            {/* Image Preview & Picker */}
                            <TouchableOpacity style={styles.imagePickerArea} onPress={handlePickShowcaseImage}>
                                {isUploading ? (
                                    <ActivityIndicator color="#D4AF37" />
                                ) : (
                                    <>
                                        <Image 
                                            source={editingShowcaseItem?.is_local ? getLocalImage(editingShowcaseItem.image_ref) : { uri: editingShowcaseItem?.image_url }} 
                                            style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} 
                                        />
                                        <MaterialCommunityIcons name="camera-plus" size={32} color="#FFF" />
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, marginTop: 4 }}>Resmi Değiştir</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Inputs */}
                            <Text allowFontScaling={false} style={styles.inputLabel}>BANNER ETİKETİ (SARI ALAN)</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editingShowcaseItem?.tag}
                                onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, tag: t }))}
                                placeholder="Örn: FIRSAT"
                                placeholderTextColor="#666"
                            />

                            <Text allowFontScaling={false} style={styles.inputLabel}>ANA BAŞLIK</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editingShowcaseItem?.title}
                                onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, title: t }))}
                                placeholder="Örn: DEV İNDİRİM"
                                placeholderTextColor="#666"
                            />

                            <Text allowFontScaling={false} style={styles.inputLabel}>ALT BAŞLIK</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editingShowcaseItem?.subtitle}
                                onChangeText={t => setEditingShowcaseItem(prev => ({ ...prev, subtitle: t }))}
                                placeholder="Detaylı açıklama..."
                                placeholderTextColor="#666"
                            />

                            {/* Color Selectors */}
                            <Text allowFontScaling={false} style={styles.inputLabel}>ETİKET ZEMİN RENGİ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                {COLOR_PALETTE.map(c => (
                                    <TouchableOpacity 
                                        key={c.code} 
                                        style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.tag_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                        onPress={() => setEditingShowcaseItem(prev => ({ ...prev, tag_color: c.code }))}
                                    />
                                ))}
                            </ScrollView>

                            <Text allowFontScaling={false} style={styles.inputLabel}>ANA BAŞLIK RENGİ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                {COLOR_PALETTE.map(c => (
                                    <TouchableOpacity 
                                        key={c.code} 
                                        style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.title_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                        onPress={() => setEditingShowcaseItem(prev => ({ ...prev, title_color: c.code }))}
                                    />
                                ))}
                            </ScrollView>

                            <Text allowFontScaling={false} style={styles.inputLabel}>ALT BAŞLIK RENGİ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
                                {COLOR_PALETTE.map(c => (
                                    <TouchableOpacity 
                                        key={c.code} 
                                        style={[styles.colorChip, { backgroundColor: c.code, borderColor: editingShowcaseItem?.subtitle_color === c.code ? '#FFF' : 'transparent', borderWidth: 2 }]} 
                                        onPress={() => setEditingShowcaseItem(prev => ({ ...prev, subtitle_color: c.code }))}
                                    />
                                ))}
                            </ScrollView>

                            {/* Visual Adjustments (Sliders) */}
                            <View style={styles.adjustmentGroup}>
                                <View style={styles.adjHeader}>
                                    <Text allowFontScaling={false} style={styles.inputLabel}>GÖRSEL ÖLÇEĞİ (ZOOM)</Text>
                                    <Text style={styles.adjVal}>{(editingShowcaseItem?.image_scale || 1).toFixed(2)}x</Text>
                                </View>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={0.5}
                                    maximumValue={3.0}
                                    value={editingShowcaseItem?.image_scale || 1}
                                    onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, image_scale: v }))}
                                    minimumTrackTintColor="#D4AF37"
                                    maximumTrackTintColor="#333"
                                    thumbTintColor="#D4AF37"
                                />

                                <View style={styles.adjHeader}>
                                    <Text allowFontScaling={false} style={styles.inputLabel}>YAZI DİKEY KONUM (Y)</Text>
                                    <Text style={styles.adjVal}>{Math.round(editingShowcaseItem?.text_offset_y || 0)}</Text>
                                </View>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={-150}
                                    maximumValue={150}
                                    value={editingShowcaseItem?.text_offset_y || 0}
                                    onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, text_offset_y: v }))}
                                    minimumTrackTintColor="#D4AF37"
                                    maximumTrackTintColor="#333"
                                    thumbTintColor="#D4AF37"
                                />

                                <View style={styles.adjHeader}>
                                    <Text allowFontScaling={false} style={styles.inputLabel}>YAZI YATAY KONUM (X)</Text>
                                    <Text style={styles.adjVal}>{Math.round(editingShowcaseItem?.text_offset_x || 0)}</Text>
                                </View>
                                <Slider
                                    style={{ width: '100%', height: 40 }}
                                    minimumValue={-150}
                                    maximumValue={150}
                                    value={editingShowcaseItem?.text_offset_x || 0}
                                    onValueChange={v => setEditingShowcaseItem(prev => ({ ...prev, text_offset_x: v }))}
                                    minimumTrackTintColor="#D4AF37"
                                    maximumTrackTintColor="#333"
                                    thumbTintColor="#D4AF37"
                                />
                            </View>

                            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveShowcase}>
                                <Text allowFontScaling={false} style={styles.modalSaveBtnText}>DEĞİŞİKLİKLERİ KAYDET</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    backBtn: { padding: 8, backgroundColor: '#222', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: '900', textAlign: 'center' },
    headerSubtitle: { color: '#666', fontSize: 10, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },

    scrollContent: { paddingBottom: 40 },

    heroCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    heroImage: { width: '100%', height: '100%' },
    heroTextContainer: { position: 'absolute', bottom: 20, left: 20, right: 130 },
    heroTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 5 },
    heroDesc: { color: '#ccc', fontSize: 14 },
    heroDetailBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    heroDetailText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#222', marginHorizontal: 20 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#ccc', fontSize: 11, marginTop: 2, fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: '#333' },

    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15, letterSpacing: 0.5, marginLeft: 20 },

    stepCard: { backgroundColor: '#161616', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#222', marginHorizontal: 20 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
    stepTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    stepSubtitle: { color: '#888', fontSize: 12 },
    stepNumberBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    stepNumber: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    stepDesc: { color: '#aaa', fontSize: 13, lineHeight: 18, marginBottom: 15 },
    stepFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 },
    actionText: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginRight: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    modalImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },
    modalDescText: { color: '#ccc', fontSize: 15, lineHeight: 22, marginBottom: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: 15, borderRadius: 12, alignItems: 'center', gap: 12, marginBottom: 20 },
    infoText: { color: '#FFD700', flex: 1, fontSize: 13 },
    applyBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center' },

    applyBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    // Chat Button Styles
    // Premium Box Styles
    premiumBox: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative'
    },
    premiumBoxContent: {
        padding: 20,
    },
    premiumHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    premiumBoxTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5
    },
    chatPremiumButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },
    buttonGradient: {
        padding: 4,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonTitle: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 2
    },
    buttonSubtitle: {
        color: '#333',
        fontSize: 11,
        fontWeight: '600',
        maxWidth: 200
    },

    // Premium Action Card Styles
    premiumActionCard: { backgroundColor: '#0F0F0F', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222', marginBottom: 30 },
    premiumActionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    premiumActionIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    premiumActionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    premiumActionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    premiumActionButtonText: { color: '#000', fontSize: 14, fontWeight: 'bold' },

    // Ad Banner Styles
    adBanner: { height: 180, borderRadius: 16, overflow: 'hidden', marginTop: 20, borderWidth: 1, borderColor: '#222' },
    adBannerContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 10 },
    adBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' },
    adBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700', marginRight: 6, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 2 },
    adBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    adTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', lineHeight: 24, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: 8 },
    adActionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    adActionText: { color: '#FFD700', fontSize: 13, fontWeight: '700' },

    // Campaign & FAQ Styles
    campaignSection: { marginTop: 10, paddingBottom: 20 },
    campaignHeaderBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5, marginHorizontal: 20 },
    campaignTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', flex: 1, lineHeight: 22 },
    campaignSubtitle: { color: '#666', fontSize: 12, marginBottom: 20, marginLeft: 58 },
    faqContainer: { gap: 10, paddingHorizontal: 20 },
    faqItem: { backgroundColor: '#161616', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    faqQuestion: { color: '#fff', fontSize: 13, fontWeight: 'bold', flex: 1, lineHeight: 20 },
    faqAnswer: { color: '#aaa', fontSize: 13, marginTop: 10, lineHeight: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
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
    // Admin Styles
    adminEditBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    adminConfigRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333'
    },
    configTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    arrowBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },

    // New Showcase Styles
    carouselContainer: { marginBottom: 20 },
    slide: { width: width, height: 220, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroTextContainer: { position: 'absolute', bottom: 30, left: 20, right: 100 },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 5 },
    heroDesc: { color: '#ccc', fontSize: 13, lineHeight: 18 },
    
    tagBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase'
    },

    heroDetailBtn: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    heroDetailText: { color: '#FFD700', fontSize: 11, fontWeight: 'bold' },
    
    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: -15, gap: 8, marginBottom: 15 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },

    heroEditShortcut: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        elevation: 5
    },
    adminSliderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },
    adminSliderBtnText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1.5
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
    managerModalContent: { backgroundColor: '#111', height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: '#333' },
    editModalContent: { backgroundColor: '#111', height: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: '#333' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    
    managerItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 10, marginBottom: 12, marginHorizontal: 16, borderWidth: 1, borderColor: '#333' },
    managerItemThumbContainer: { width: 60, height: 40, borderRadius: 6, backgroundColor: '#333', overflow: 'hidden' },
    managerItemThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    managerItemTitle: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    managerActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    
    addSliderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFD700', padding: 16, borderRadius: 16, marginTop: 10, marginBottom: 30, gap: 8, marginHorizontal: 16 },
    addSliderBtnText: { color: '#000', fontSize: 14, fontWeight: 'bold' },

    imagePickerArea: { width: '100%', height: 180, borderRadius: 16, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
    inputLabel: { color: '#999', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
    modalInput: { backgroundColor: '#000', color: '#FFF', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
    
    adjustmentGroup: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    adjHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    adjVal: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
    
    modalSaveBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    modalSaveBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1 },

    colorPalette: { flexDirection: 'row', marginBottom: 20, paddingVertical: 5 },
    colorChip: { width: 32, height: 32, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#444' }
});
