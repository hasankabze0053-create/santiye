import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Keyboard, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- HERO SLIDER DATA ---
const SHOWCASE_SLIDES = [
    { id: 1, title: 'Ücretsiz Yıkım Fırsatı', subtitle: 'Kentsel Dönüşüm & Enkaz Karşılığı', image: require('../../assets/rental/demolition_showcase.png'), tag: 'FIRSAT' },
    { id: 2, title: 'Yeni Filo Eklendi', subtitle: 'Manitou Telehandler Serisi', image: 'https://images.unsplash.com/photo-1519003300449-424ad9e12435?q=80&w=800&auto=format&fit=crop', tag: 'YENİ' },
    { id: 3, title: 'Proje Taşımacılığı', subtitle: 'Lowbed ve Ağır Nakliye', image: 'https://images.unsplash.com/photo-1605218456194-54d6af4b74aa?q=80&w=800&auto=format&fit=crop', tag: 'LOJİSTİK' },
];

const RENTAL_CATEGORIES = [
    {
        id: '1',
        title: 'VİNÇ SİSTEMLERİ',
        subtitle: 'Kule, Mobil ve Hiyap Çözümleri',
        icon: 'tower-beach',
        image: require('../../assets/rental/cover_rental_crane_v1_1767275715417.png'),
        items: [
            { name: 'Mobil Vinç (Lastikli)', type: 'Şehir İçi / Ağır Tonaj', image: require('../../assets/rental/rental_crane_mobile_v1_1767228684034.png') },
            { name: 'Kule Vinç (Sabit)', type: 'Yüksek Yapılar İçin', image: require('../../assets/rental/rental_crane_tower_v1_1767228696248.png') },
            { name: 'Hiyap Vinç (Kamyon Üstü)', type: 'Nakliye ve Montaj', image: require('../../assets/rental/rental_crane_hiab_v1_1767228708978.png') },
            { name: 'Paletli Vinç', type: 'Zorlu Zeminler', image: require('../../assets/rental/rental_crane_crawler_v1_1767228723658.png') },
        ]
    },
    {
        id: '2',
        title: 'HAFRİYAT GRUBU',
        subtitle: 'Ekskavatör ve Kazıcılar',
        icon: 'excavator',
        image: require('../../assets/rental/cover_rental_excavator_v1_1767275744509.png'),
        items: [
            { name: 'Paletli Ekskavatör', type: 'Genel Hafriyat', image: require('../../assets/rental/rental_earth_excavator_crawler_v1_1767228784937.png') },
            { name: 'Lastikli Ekskavatör', type: 'Mobil Kazı İşleri', image: require('../../assets/rental/rental_earth_excavator_wheeled_v1_1767228798846.png') },
            { name: 'Beko Loder (JCB)', type: 'Kanal ve Altyapı', image: require('../../assets/rental/rental_earth_backhoe_v1_1767228815249.png') },
            { name: 'Mini Ekskavatör', type: 'Peyzaj ve Dar Alan', image: require('../../assets/rental/rental_earth_excavator_mini_v1_1767228829549.png') },
            { name: 'Yıkım Ekskavatörü', type: 'Uzun Bomlu (High Reach)', image: require('../../assets/rental/rental_earth_excavator_demolition_v1_1767228843857.png') },
        ]
    },
    {
        id: '3',
        title: 'PLATFORM & MANLIFT',
        subtitle: 'Personel Yükseltici Çözümleri',
        icon: 'ladder',
        image: require('../../assets/rental/cover_rental_platform_v3_1767278384979.png'),
        items: [
            { name: 'Makaslı Platform (Akülü)', type: 'İç Mekan / Sessiz', image: require('../../assets/rental/rental_platform_scissor_electric_v1_1767228882412.png') },
            { name: 'Makaslı Platform (Dizel)', type: 'Dış Mekan / Zorlu Zemin', image: require('../../assets/rental/rental_platform_scissor_diesel_v1_1767228896600.png') },
            { name: 'Eklemli Platform', type: 'Yanal Erişim', image: require('../../assets/rental/rental_platform_articulated_v1_1767228911062.png') },
            { name: 'Örümcek Platform', type: 'Hassas Zeminler', image: require('../../assets/rental/rental_platform_spider_v1_1767228926171.png') },
            { name: 'Sepetli Vinç', type: 'Araç Üstü Erişim', image: require('../../assets/rental/rental_platform_bucket_v1_1767228941002.png') },
        ]
    },
    {
        id: '4',
        title: 'YÜKLEYİCİLER (LODER)',
        subtitle: 'Telehandler ve Mini Yükleyiciler',
        icon: 'bulldozer',
        image: require('../../assets/rental/cover_rental_loader_v1_1767275923552.png'),
        items: [
            { name: 'Loder (Lastikli)', type: 'Seri Yükleme', image: require('../../assets/rental/rental_loader_wheel_v1_1767228986639.png') },
            { name: 'Telehandler (Manitou)', type: 'Teleskopik Yükleyici', image: require('../../assets/rental/rental_loader_telehandler_v1_1767229001070.png') },
            { name: 'Bobcat (Mini Yükleyici)', type: 'Dar Alan / Seri', image: require('../../assets/rental/rental_loader_bobcat_v1_1767229015783.png') },
            { name: 'Forklift', type: 'Paletli Malzeme', image: require('../../assets/rental/rental_loader_forklift_v1_1767229029915.png') },
        ]
    },
    {
        id: '5',
        title: 'JENERATÖR & GÜÇ',
        subtitle: 'Enerji ve Şantiye Desteği',
        icon: 'lightning-bolt',
        image: require('../../assets/rental/cover_rental_generator_v1_1767276003359.png'),
        items: [
            { name: 'Dizel Jeneratör', type: 'Kesintisiz Güç', image: require('../../assets/rental/rental_power_generator_diesel_v1_1767229065030.png') },
            { name: 'Mobil Kompresör', type: 'Basınçlı Hava', image: require('../../assets/rental/rental_power_compressor_mobile_v1_1767229078639.png') },
            { name: 'Işık Kulesi', type: 'Gece Çalışmaları', image: require('../../assets/rental/rental_power_lighttower_v1_1767229094938.png') },
            { name: 'Konteyner', type: 'Ofis ve Barınma', image: 'https://images.unsplash.com/photo-1495904786722-d2b5a1955543?q=80&w=800&auto=format&fit=crop' },
        ]
    },
];

// Reused Category Data for Selection Modal
const PROPOSAL_CATEGORIES = [
    {
        id: '1', title: 'VİNÇ SİSTEMLERİ', icon: 'tower-beach',
        items: ['Mobil Vinç', 'Kule Vinç', 'Hiyap Vinç', 'Paletli Vinç']
    },
    {
        id: '2', title: 'HAFRİYAT GRUBU', icon: 'excavator',
        items: ['Paletli Ekskavatör', 'Lastikli Ekskavatör', 'Beko Loder (JCB)', 'Mini Ekskavatör']
    },
    {
        id: '3', title: 'PLATFORM & MANLIFT', icon: 'ladder',
        items: ['Makaslı Platform', 'Eklemli Platform', 'Örümcek Platform', 'Sepetli Vinç']
    },
    {
        id: '4', title: 'YÜKLEYİCİLER', icon: 'bulldozer',
        items: ['Loder', 'Telehandler', 'Bobcat', 'Forklift']
    },
    {
        id: '5', title: 'JENERATÖR & GÜÇ', icon: 'lightning-bolt',
        items: ['Jeneratör', 'Kompresör', 'Işık Kulesi']
    },
];

// MOCK SUPPLIERS DATA
// This simulates different companies offering the same equipment at different rates
const MOCK_ITEM_SUPPLIERS = [
    {
        id: 's1',
        name: 'Kaya Vinç & Platform',
        rating: '4.8',
        verified: true,
        logo: 'domain', // material icon name
        prices: {
            hourly: '850 ₺',
            daily: '6.500 ₺',
            weekly: '35.000 ₺',
            monthly: '110.000 ₺'
        }
    },
    {
        id: 's2',
        name: 'Demir Makine Kiralama',
        rating: '4.6',
        verified: true,
        logo: 'tow-truck',
        prices: {
            hourly: '800 ₺',
            daily: '6.200 ₺',
            weekly: '33.000 ₺',
            monthly: '105.000 ₺'
        }
    },
    {
        id: 's3',
        name: 'Bosphorus Heavy Equipment',
        rating: '4.9',
        verified: true,
        logo: 'excavator',
        prices: {
            hourly: '950 ₺',
            daily: '7.000 ₺',
            weekly: '38.000 ₺',
            monthly: '120.000 ₺'
        }
    }
];


export default function RentalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [viewMode, setViewMode] = useState('list');
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedItemIndex, setExpandedItemIndex] = useState(null);
    const [scrollX] = useState(new Animated.Value(0));
    const [machineModalVisible, setMachineModalVisible] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isTransporter, setIsTransporter] = useState(false);

    // Helpers
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const togglePricing = (index) => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedItemIndex(expandedItemIndex === index ? null : index);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.length > 1) {
            const results = [];
            RENTAL_CATEGORIES.forEach(cat => {
                cat.items.forEach(item => {
                    if (item.name.toLowerCase().includes(text.toLowerCase())) {
                        results.push({ ...item, categoryTitle: cat.title, categoryIcon: cat.icon });
                    }
                });
            });
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleRentRequest = (item, supplierName) => {
        Alert.alert("Talep Alındı", `${item.name} için ${supplierName ? supplierName + ' üzerinden' : ''} kiralama talebiniz başarıyla oluşturuldu. Operasyon ekibimiz sizinle iletişime geçecektir.`);
    };

    const handleAddMachine = (item, icon) => {
        // Project Proposal Logic Placeholder
        Alert.alert("Eklendi", `${item} listeye eklendi.`);
    };

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await import('../../lib/supabase').supabase.auth.getUser();
            if (user) {
                const { data } = await import('../../lib/supabase').supabase
                    .from('profiles')
                    .select('is_admin, is_transporter')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsTransporter(data?.is_transporter || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#121212', '#000000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header (Standardized) */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerBtn}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>İŞ MAKİNESİ KİRALAMA</Text>
                        <Text style={styles.headerSubtitle}>Projeniz İçin Güçlü Çözümler</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerIconBtn, !isTransporter && !isAdmin && { opacity: 0.5 }]}
                        onPress={() => {
                            if (isAdmin || isTransporter) {
                                navigation.navigate('MachineryProvider');
                            } else {
                                Alert.alert("Yetkisiz Erişim", "Bu panele sadece 'İş Makinesi / Nakliye' yetkisi olan hesaplar erişebilir.");
                            }
                        }}
                        activeOpacity={isAdmin || isTransporter ? 0.7 : 1}
                    >
                        <MaterialCommunityIcons name="excavator" size={24} color={isAdmin || isTransporter ? "#D4AF37" : "#666"} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* SHOWCASE SLIDER (New) */}
                    {viewMode === 'list' && (
                        <View style={styles.showcaseContainer}>
                            <Animated.ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                                scrollEventThrottle={16}
                                contentContainerStyle={{ paddingHorizontal: 0 }}
                            >
                                {SHOWCASE_SLIDES.map((slide) => (
                                    <View key={slide.id} style={styles.showcaseCard}>
                                        <View style={styles.showcaseImage}>
                                            <Image source={typeof slide.image === 'string' ? { uri: slide.image } : slide.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} />
                                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                                            <View style={styles.showcaseTag}>
                                                <Text style={styles.showcaseTagText}>{slide.tag}</Text>
                                            </View>
                                            <View style={styles.showcaseTextContent}>
                                                <Text style={styles.showcaseTitle}>{slide.title}</Text>
                                                <Text style={styles.showcaseSubtitle}>{slide.subtitle}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </Animated.ScrollView>

                            {/* Pagination Dots */}
                            <View style={styles.pagination}>
                                {SHOWCASE_SLIDES.map((_, i) => {
                                    const opacity = scrollX.interpolate({
                                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                        outputRange: [0.3, 1, 0.3],
                                        extrapolate: 'clamp'
                                    });
                                    return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                                })}
                            </View>
                        </View>
                    )}

                    {/* RENTAL TYPE SELECTOR (New Side-by-Side Cards) */}
                    {viewMode === 'list' && (
                        <View style={styles.typeSelectorContainer}>
                            <TouchableOpacity
                                style={[styles.typeCard, styles.typeCardActive]}
                                activeOpacity={1}
                            >
                                <LinearGradient
                                    colors={['#2A2A2A', '#1A1A1A']}
                                    style={styles.typeCardGradient}
                                >
                                    <View style={[styles.typeIconCircle, { backgroundColor: '#D4AF37' }]}>
                                        <MaterialCommunityIcons name="clock-time-four" size={24} color="#000" />
                                    </View>
                                    <View>
                                        <Text style={[styles.typeCardTitle, { color: '#D4AF37' }]}>SÜRELİ KİRALAMA</Text>
                                        <Text style={styles.typeCardSub}>Saatlik / Günlük</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.typeCard}
                                onPress={() => navigation.navigate('ProjectProposal')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#1A1A1A', '#111']}
                                    style={styles.typeCardGradient}
                                >
                                    <View style={styles.typeIconCircle}>
                                        <MaterialCommunityIcons name="domain" size={24} color="#D4AF37" />
                                    </View>
                                    <View>
                                        <Text style={[styles.typeCardTitle, { color: '#D4AF37' }]}>PROJE BAZLI KİRALAMA</Text>
                                        <Text style={styles.typeCardSub}>Uzun Dönem / Yıkım / Proje</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* MAIN CONTENT AREA */}
                    {viewMode === 'list' && (
                        <View style={styles.gridSection}>
                            {/* SEARCH BAR (Transparent) */}
                            <TouchableOpacity
                                style={styles.searchBar}
                                onPress={() => setSearchVisible(true)}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="magnify" size={24} color="#D4AF37" />
                                <Text style={styles.searchText}>Makine Parkurunda Ara...</Text>
                            </TouchableOpacity>

                            {/* CATEGORY GRID (2-Column) */}
                            <Text style={styles.sectionHeader}>MAKİNE PARKURU</Text>
                            <View style={styles.gridContainer}>
                                {rentalCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.gridCard}
                                        onPress={() => handleCategorySelect(cat)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.gridImage}>
                                            <Image
                                                source={typeof cat.image === 'number' ? cat.image : { uri: cat.image }}
                                                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 16 }}
                                                contentFit="cover"
                                                transition={500}
                                            />
                                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
                                            <View style={styles.gridIconBadge}>
                                                <MaterialCommunityIcons name={cat.icon} size={20} color="#D4AF37" />
                                            </View>
                                            <View style={styles.gridContent}>
                                                <View style={{ flex: 1, paddingRight: 4 }}>
                                                    <Text style={styles.gridTitle} numberOfLines={2}>{cat.title}</Text>
                                                </View>
                                                <MaterialCommunityIcons name="chevron-right" size={20} color="#D4AF37" />
                                            </View>
                                        </View>
                                        <View style={styles.gridBorder} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}



                    {/* DETAIL VIEW (Updated with Multi-Supplier) */}
                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.detailHeader}>
                                <Image source={{ uri: selectedCategory.image }} style={styles.detailHeaderImage} contentFit="cover" transition={500} />
                                <LinearGradient colors={['transparent', '#000']} style={StyleSheet.absoluteFill} />
                                <Text style={styles.detailCategoryTitle}>{selectedCategory.title}</Text>
                            </View>
                            {selectedCategory.items.map((item, idx) => {
                                const isExpanded = expandedItemIndex === idx;
                                return (
                                    <View key={idx} style={styles.cardContainer}>
                                        <TouchableOpacity activeOpacity={0.9} onPress={() => togglePricing(idx)}>
                                            <LinearGradient
                                                colors={['#2C2C2C', '#1A1A1A']} // Lighter Dark Gradient for Separation
                                                style={styles.itemCard}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.itemInfo}>
                                                    {/* Machine Image (Thumbnail) */}
                                                    <View style={styles.itemImageBox}>
                                                        <Image
                                                            source={typeof item.image === 'number' ? item.image : { uri: item.image || selectedCategory.image }}
                                                            style={styles.itemImage}
                                                            contentFit="cover"
                                                            transition={300}
                                                        />
                                                    </View>
                                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                                        <Text style={styles.itemType}>{item.type}</Text>
                                                    </View>
                                                </View>

                                                {/* Price Info Button */}
                                                <View style={styles.priceInfoBtn}>
                                                    <Text style={styles.priceInfoText}>FİYATLAR</Text>
                                                    <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#D4AF37" />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        {/* ACCORDION CONTENT: Supplier List */}
                                        {isExpanded && (
                                            <View style={styles.accordionContent}>
                                                <Text style={styles.accordionTitle}>Firma Teklifleri</Text>
                                                {MOCK_ITEM_SUPPLIERS.map((supplier) => (
                                                    <LinearGradient
                                                        key={supplier.id}
                                                        colors={['#1A1A1A', '#000000']} // Obsidian Gradient
                                                        style={styles.supplierCard}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        {/* Supplier Header */}
                                                        <View style={styles.supplierHeader}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name={supplier.logo} size={18} color="#D4AF37" style={{ marginRight: 6 }} />
                                                                <TouchableOpacity onPress={() => navigation.navigate('SellerStore', {
                                                                    sellerName: supplier.name,
                                                                    rating: supplier.rating,
                                                                    location: 'İstanbul',
                                                                    isRental: true
                                                                })}>
                                                                    <Text style={[styles.supplierName, { textDecorationLine: 'underline', color: '#FFF' }]}>{supplier.name}</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            {supplier.verified && (
                                                                <MaterialCommunityIcons name="check-decagram" size={16} color="#D4AF37" />
                                                            )}
                                                        </View>

                                                        {/* Pricing Grid */}
                                                        <View style={[styles.priceGrid, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                                                            {/* Left Side: Short Term */}
                                                            <View style={{ flex: 1 }}>
                                                                <View style={{ marginBottom: 12 }}>
                                                                    <Text style={styles.priceLabel}>Saatlik</Text>
                                                                    <Text style={[styles.priceValue, { fontSize: 15 }]}>{supplier.prices.hourly}</Text>
                                                                </View>
                                                                <View>
                                                                    <Text style={styles.priceLabel}>Günlük</Text>
                                                                    <Text style={[styles.priceValue, { fontSize: 15 }]}>{supplier.prices.daily}</Text>
                                                                </View>
                                                            </View>

                                                            {/* Vertical Divider */}
                                                            <View style={{ width: 1, backgroundColor: '#333', height: '100%', marginHorizontal: 16 }} />

                                                            {/* Right Side: Long Term */}
                                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                                <View style={{ marginBottom: 12, alignItems: 'flex-end' }}>
                                                                    <Text style={styles.priceLabel}>Haftalık</Text>
                                                                    <Text style={[styles.priceValue, { fontSize: 15 }]}>{supplier.prices.weekly}</Text>
                                                                </View>
                                                                <View style={{ alignItems: 'flex-end' }}>
                                                                    <Text style={styles.priceLabel}>Aylık</Text>
                                                                    <Text style={[styles.priceValue, { fontSize: 15 }]}>{supplier.prices.monthly}</Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        {/* Select Button */}
                                                        <TouchableOpacity style={styles.selectSupplierBtn} onPress={() => handleRentRequest(item, supplier.name)}>
                                                            <Text style={styles.selectSupplierText}>FİRMA SEÇ</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* STICKY BOTTOM BUTTON */}
                {viewMode === 'list' && (
                    <View style={styles.stickyFooter}>
                        <TouchableOpacity style={styles.quickOfferBtn} onPress={() => Alert.alert('Hızlı Teklif', 'Müşteri temsilcimize bağlanıyorsunuz...')}>
                            <Text style={styles.quickOfferText}>HIZLI TEKLİF İSTE</Text>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* SEARCH MODAL */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={searchVisible}
                    onRequestClose={() => setSearchVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Makine Ara</Text>
                                    <TouchableOpacity onPress={() => setSearchVisible(false)} style={styles.closeBtn}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.searchInputContainer}>
                                    <Ionicons name="search" size={20} color="#D4AF37" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Makine adı veya kategori..."
                                        placeholderTextColor="#666"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                        autoFocus
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity onPress={() => handleSearch('')}>
                                            <Ionicons name="close-circle" size={18} color="#666" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ marginTop: 20 }}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    ListEmptyComponent={
                                        searchQuery.length > 1 ? (
                                            <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>Sonuç bulunamadı.</Text>
                                        ) : null
                                    }
                                    renderItem={({ item }) => (
                                        <View style={styles.searchResultItem}>
                                            <View style={styles.itemIconBox}>
                                                <MaterialCommunityIcons name={item.categoryIcon} size={24} color="#D4AF37" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemType}>{item.categoryTitle} • {item.type}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.rentButton}
                                                onPress={() => {
                                                    setSearchVisible(false);
                                                    handleRentRequest(item);
                                                }}
                                            >
                                                <Ionicons name="arrow-forward" size={18} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* MACHINE SELECTION MODAL */}
                <Modal
                    visible={machineModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setMachineModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Makine Seç</Text>
                                <TouchableOpacity onPress={() => setMachineModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {PROPOSAL_CATEGORIES.map(cat => (
                                    <View key={cat.id} style={styles.modalCategory}>
                                        <View style={styles.modalCatHeader}>
                                            <MaterialCommunityIcons name={cat.icon} size={20} color="#D4AF37" style={{ marginRight: 8 }} />
                                            <Text style={styles.modalCatTitle}>{cat.title}</Text>
                                        </View>
                                        <View style={styles.modalItemsRow}>
                                            {cat.items.map((item, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.modalItemBadge}
                                                    onPress={() => handleAddMachine(item, cat.icon)}
                                                >
                                                    <Text style={styles.modalItemText}>{item}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { color: '#D4AF37', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 11, fontWeight: '300' },
    headerBtn: { padding: 5 },
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

    // SHOWCASE SLIDER
    showcaseContainer: { height: 220, marginBottom: 20 },
    showcaseCard: { width: width, height: 220 },
    showcaseImage: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 20 },
    showcaseTag: { position: 'absolute', top: 20, right: 20, backgroundColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    showcaseTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
    showcaseTextContent: { marginBottom: 20 },
    showcaseTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
    showcaseSubtitle: { color: '#ddd', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
    pagination: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4AF37', marginHorizontal: 4 },

    // TYPE SELECTOR
    typeSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
    typeCard: { width: '48%', height: 90, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    typeCardActive: { borderColor: '#D4AF37', transform: [{ scale: 1.02 }] },
    typeCardGradient: { flex: 1, justifyContent: 'center', padding: 12 },
    typeIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    typeCardTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    typeCardSub: { color: '#888', fontSize: 10, marginTop: 2 },

    // GRID SECTION
    gridSection: { paddingHorizontal: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 48, borderRadius: 12, paddingHorizontal: 12, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    searchText: { color: '#666', marginLeft: 10, fontSize: 14 },
    sectionHeader: { color: '#D4AF37', fontSize: 13, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCard: { width: '48%', height: 160, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
    gridImage: { flex: 1, justifyContent: 'flex-end' },
    gridContent: { zIndex: 2, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 12, paddingBottom: 12 },
    gridIconBadge: { position: 'absolute', top: 0, right: 0, width: 36, height: 36, borderBottomLeftRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    gridTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
    gridSub: { color: '#bbb', fontSize: 11 },
    gridBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // DETAIL VIEW
    detailContainer: { padding: 16 },
    detailHeader: { height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 20, justifyContent: 'flex-end', padding: 20 },
    detailHeaderImage: { ...StyleSheet.absoluteFillObject },
    detailCategoryTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', zIndex: 2 },

    cardContainer: { marginBottom: 16 },
    // Silver Gradient Look for Item Card
    // Detail View Item Card (Dark Theme)
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 0,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4AF37', // Gold Border
        height: 110,
        overflow: 'hidden',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemImageBox: { width: 110, height: 110 },
    itemImage: { width: '100%', height: '100%' },
    itemName: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 2, marginLeft: 12 }, // White Text
    itemType: { color: '#BBB', fontSize: 12, marginLeft: 12, fontWeight: '500' }, // Light Grey Text
    priceInfoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 12 }, // Black Button
    priceInfoText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginRight: 4 }, // Gold Text

    // ACCORDION
    accordionContent: { backgroundColor: '#111', marginTop: 4, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    accordionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },

    // Supplier Card (Dark Theme)
    supplierCard: { marginBottom: 16, borderRadius: 12, padding: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    supplierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
    orderPrice: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },

    // STYLES RESTORED
    priceGrid: { flexDirection: 'row', marginBottom: 16 },
    priceLabel: { color: '#E0E0E0', fontSize: 13, fontWeight: '600', marginBottom: 4 }, // Made lighter and slightly larger
    priceValue: { color: '#D4AF37', fontWeight: '900' },
    selectSupplierBtn: { backgroundColor: '#000', borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
    selectSupplierText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold' },

    // STICKY FOOTER
    stickyFooter: { position: 'absolute', bottom: 20, left: 16, right: 16, alignItems: 'center' },
    quickOfferBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    quickOfferText: { color: '#000', fontWeight: 'bold', fontSize: 14, marginRight: 8 },

    // PROJECT FORM STYLES
    section: { padding: 12 },
    sectionSub: { color: '#bbb', fontSize: 14, marginBottom: 20 },
    label: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
    textAreaContainer: { backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333', padding: 4 },
    textArea: { color: '#fff', height: 100, padding: 12, textAlignVertical: 'top' },
    locationInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, height: 50 },
    locationIcon: { marginRight: 8 },
    locationInput: { flex: 1, color: '#fff' },
    gpsButton: { padding: 8 },
    galleryContainer: { flexDirection: 'row', alignItems: 'center' },
    addPhotoBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    addPhotoText: { color: '#666', fontSize: 10, marginTop: 4 },
    photoContainer: { position: 'relative', marginRight: 10 },
    photo: { width: 80, height: 80, borderRadius: 12 },
    deleteBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#CF3335', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    machineCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
    machineInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    machineIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    machineName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    machineActions: { flexDirection: 'row', alignItems: 'center' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 8, padding: 4, marginRight: 12 },
    qtyBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: 6 },
    qtyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    qtyValue: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginHorizontal: 10 },
    removeMachineBtn: { padding: 4 },
    addMachineBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', borderRadius: 12, marginTop: 10 },
    addMachineText: { color: '#ccc', marginLeft: 8, fontWeight: '500' },
    submitBtn: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
    submitGradient: { paddingVertical: 16, alignItems: 'center' },
    submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    // MODAL STYLES (Search & Machine)
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '80%', paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 12, paddingHorizontal: 12, height: 50, borderWidth: 1, borderColor: '#333' },
    searchInput: { flex: 1, color: '#fff', fontSize: 14 },
    searchResultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    itemIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rentButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },

    // Machine Selection Modal Specific
    modalCategory: { marginBottom: 24 },
    modalCatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    modalCatTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
    modalItemsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    modalItemBadge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#444' },
    modalItemText: { color: '#fff', fontSize: 12 },
});
