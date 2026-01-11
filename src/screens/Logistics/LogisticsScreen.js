import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- MOCK DATA FOR LOGISTICS ---
const LOGISTICS_SLIDES = [
    { id: 1, title: 'BOŞ DÖNÜŞ FIRSATI', subtitle: 'İstanbul > Ankara - %50 Fiyat Avantajı', image: require('../../assets/logistics/slider_opportunity.png'), tag: 'FIRSAT' },
    { id: 2, title: 'Parsiyel Taşıma', subtitle: 'Parça Yükleriniz İçin Ekonomik', image: require('../../assets/categories/cat_logistics_v11.png'), tag: 'EKONOMİK' },
    { id: 3, title: 'Evden Eve Nakliyat', subtitle: 'Sigortalı ve Ambalajlı Taşıma', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop', tag: 'GÜVENLİ' },
];

const LOGISTICS_CATEGORIES = [
    {
        id: '1',
        title: 'KAMYON & TIR',
        subtitle: 'Ağır Yük Taşımacılığı',
        icon: 'truck',
        image: require('../../assets/logistics/opt_truck.png'),
        items: [
            { name: '10 Teker Kamyon', type: '15 Ton Kapasite', image: 'https://images.unsplash.com/photo-1547053282-3d719543e26b?q=80&w=800&auto=format&fit=crop' },
            { name: 'Kırkayak Kamyon', type: '20 Ton Kapasite', image: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?q=80&w=800&auto=format&fit=crop' },
            { name: 'TIR (Tenteli)', type: '25 Ton / 13.60m', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop' },
            { name: 'TIR (Sal Dorse)', type: 'Açık Yük / Konteyner', image: 'https://images.unsplash.com/photo-1506306460321-8ddf464ba962?q=80&w=800&auto=format&fit=crop' },
        ]
    },
    {
        id: '2',
        title: 'PANELVAN & KAMYONET',
        subtitle: 'Şehir İçi Dağıtım',
        icon: 'truck-fast',
        image: require('../../assets/logistics/opt_van.png'),
        items: [
            { name: 'Panelvan', type: '3.5 Ton Altı', image: 'https://images.unsplash.com/photo-1566576912902-1dcd1f38e68e?q=80&w=800&auto=format&fit=crop' },
            { name: 'Kamyonet (Açık)', type: 'Şantiye Tedarik', image: 'https://images.unsplash.com/photo-1507560461415-998cd15dd0db?q=80&w=800&auto=format&fit=crop' },
            { name: 'Kamyonet (Kapalı)', type: 'Hassas Yük', image: 'https://images.unsplash.com/photo-1628882195000-8356895ce0be?q=80&w=800&auto=format&fit=crop' },
        ]
    },
    {
        id: '3',
        title: 'ÖZEL TAŞIMACILIK',
        subtitle: 'Lowbed ve Vinçli',
        icon: 'tow-truck',
        image: require('../../assets/logistics/opt_tow.png'),
        items: [
            { name: 'Lowbed', type: 'İş Makinesi Taşıma', image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=800&auto=format&fit=crop' },
            { name: 'Vinçli Kamyon', type: 'Kendinden Yüklemeli', image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=800&auto=format&fit=crop' },
        ]
    },
    {
        id: '4',
        title: 'EVDEN EVE',
        subtitle: 'Bireysel Nakliyat',
        icon: 'home-city',
        image: require('../../assets/logistics/opt_moving.png'),
        items: [
            { name: '1+1 Taşıma', type: 'Ekonomik Paket', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=800&auto=format&fit=crop' },
            { name: '2+1 Taşıma', type: 'Standart Paket', image: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?q=80&w=800&auto=format&fit=crop' },
            { name: '3+1 ve Üzeri', type: 'VIP Paket', image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?q=80&w=800&auto=format&fit=crop' },
        ]
    }
];

// Mock Suppliers for Detail View
const MOCK_SUPPLIERS = [
    { id: 'l1', name: 'Ege Lojistik', prices: { daily: '8.000 ₺', weekly: 'Sefer Bazlı', monthly: 'Teklif Al' }, verified: true, logo: 'truck' },
    { id: 'l2', name: 'Yıldız Nakliyat', prices: { daily: '7.500 ₺', weekly: 'Sefer Bazlı', monthly: 'Teklif Al' }, verified: true, logo: 'truck-delivery' },
    { id: 'l3', name: 'Global Trans', prices: { daily: '9.200 ₺', weekly: 'Sefer Bazlı', monthly: 'Teklif Al' }, verified: true, logo: 'airplane-takeoff' }
];

export default function LogisticsScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    // Consume params from navigation (Native Stack behavior)
    const viewMode = route.params?.viewMode || 'list';
    const selectedCategory = route.params?.category || null;

    const [activeTab, setActiveTab] = useState('instant'); // 'instant' vs 'corporate'
    const scrollX = useRef(new Animated.Value(0)).current;

    // Search State (kept for future implementation)
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Detail Grid State
    const [expandedItemIndex, setExpandedItemIndex] = useState(null);

    const togglePricing = (index) => {
        setExpandedItemIndex(expandedItemIndex === index ? null : index);
    };

    const handleCategorySelect = (cat) => {
        // PUSH to the same screen component ('Nakliye') but with new params
        navigation.push('Nakliye', {
            viewMode: 'detail',
            category: cat
        });
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#121212', '#000000']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>NAKLİYE & LOJİSTİK</Text>
                        <Text style={styles.headerSubtitle}>Güvenilir Taşıma Ağı</Text>
                    </View>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('CarrierDashboard')}>
                        <MaterialCommunityIcons name="truck-check" size={24} color="#D4AF37" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* HERO SLIDER */}
                    {viewMode === 'list' && (
                        <View style={styles.showcaseContainer}>
                            <Animated.ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                                scrollEventThrottle={16}
                            >
                                {LOGISTICS_SLIDES.map((slide) => (
                                    <View key={slide.id} style={styles.showcaseCard}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={{ flex: 1 }}
                                            onPress={() => {
                                                if (slide.id === 1) {
                                                    navigation.navigate('EmptyReturnOpportunities');
                                                }
                                            }}
                                        >
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
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </Animated.ScrollView>
                            {/* Dots */}
                            <View style={styles.pagination}>
                                {LOGISTICS_SLIDES.map((_, i) => {
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

                    {/* TYPE SELECTOR */}
                    {viewMode === 'list' && (
                        <View style={styles.typeSelectorContainer}>
                            <TouchableOpacity
                                style={[styles.typeCard, activeTab === 'instant' && styles.typeCardActive]}
                                onPress={() => setActiveTab('instant')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={activeTab === 'instant' ? ['#2A2A2A', '#1A1A1A'] : ['#1A1A1A', '#111']}
                                    style={styles.typeCardGradient}
                                >
                                    <View style={[styles.typeIconCircle, activeTab === 'instant' && { backgroundColor: '#D4AF37' }]}>
                                        <MaterialCommunityIcons name="clock-fast" size={24} color={activeTab === 'instant' ? '#000' : '#D4AF37'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.typeCardTitle, activeTab === 'instant' && { color: '#D4AF37' }]}>HIZLI NAKLİYE</Text>
                                        <Text style={styles.typeCardSub}>Anlık Araç Bul</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeCard, activeTab === 'corporate' && { borderColor: '#B0B0B0' }]}
                                onPress={() => setActiveTab('corporate')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={activeTab === 'corporate' ? ['#F5F5F5', '#B0B0B0'] : ['#1A1A1A', '#111']}
                                    style={styles.typeCardGradient}
                                >
                                    <View style={[styles.typeIconCircle, activeTab === 'corporate' && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}>
                                        <MaterialCommunityIcons name="briefcase" size={24} color={activeTab === 'corporate' ? '#F5F5F5' : '#D4AF37'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.typeCardTitle, activeTab === 'corporate' ? { color: '#000' } : { color: '#D4AF37' }]}>KURUMSAL LOJİSTİK</Text>
                                        <Text style={[styles.typeCardSub, activeTab === 'corporate' && { color: '#444' }]}>Proje & Filo</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* CATEGORY GRID */}
                    {viewMode === 'list' && activeTab === 'instant' && (
                        <View style={styles.gridSection}>
                            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
                                <MaterialCommunityIcons name="magnify" size={24} color="#D4AF37" />
                                <Text style={styles.searchText}>Araç Tipi veya Yük Ara...</Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionHeader}>LOJİSTİK SEÇENEKLERİ</Text>
                            <View style={styles.gridContainer}>
                                {LOGISTICS_CATEGORIES.map((cat) => (
                                    <TouchableOpacity key={cat.id} style={styles.gridCard} onPress={() => handleCategorySelect(cat)} activeOpacity={0.9}>
                                        <View style={styles.gridImage}>
                                            <Image source={cat.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} />
                                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
                                            <View style={styles.gridIconBadge}>
                                                <MaterialCommunityIcons name={cat.icon} size={20} color="#D4AF37" />
                                            </View>
                                            <View style={styles.gridContent}>
                                                <Text style={styles.gridTitle} numberOfLines={2}>{cat.title}</Text>
                                                <MaterialCommunityIcons name="chevron-right" size={20} color="#D4AF37" />
                                            </View>
                                        </View>
                                        <View style={styles.gridBorder} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* CORPORATE FORM (Simplified) */}
                    {viewMode === 'list' && activeTab === 'corporate' && (
                        <View style={{ padding: 20 }}>
                            <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                                <Text style={{ fontSize: 24, fontWeight: '900', color: '#D4AF37', marginBottom: 8 }}>LOJİSTİK YÖNETİMİ</Text>
                                <Text style={{ fontSize: 14, color: '#ccc', lineHeight: 20 }}>
                                    Büyük ölçekli taşıma projeleriniz, fabrika taşımaları ve düzenli sevkiyatlarınız için kurumsal çözüm ortağınız olalım.
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert('Talep Alındı', 'Müşteri temsilcimiz sizinle iletişime geçecektir.')}>
                                <LinearGradient colors={['#D4AF37', '#FFA500']} style={styles.submitGradient}>
                                    <Text style={styles.submitBtnText}>KURUMSAL TEKLİF İSTE</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* DETAIL VIEW */}
                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.detailHeader}>
                                <Image source={selectedCategory.image} style={styles.detailHeaderImage} contentFit="cover" transition={500} />
                                <LinearGradient colors={['transparent', '#000']} style={StyleSheet.absoluteFill} />
                                <Text style={styles.detailCategoryTitle}>{selectedCategory.title}</Text>
                            </View>

                            {selectedCategory.items.map((item, idx) => {
                                const isExpanded = expandedItemIndex === idx;
                                return (
                                    <View key={idx} style={styles.cardContainer}>
                                        <TouchableOpacity activeOpacity={0.9} onPress={() => togglePricing(idx)}>
                                            <LinearGradient colors={['#2C2C2C', '#1A1A1A']} style={styles.itemCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                                <View style={styles.itemInfo}>
                                                    <View style={styles.itemImageBox}>
                                                        <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                                                    </View>
                                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                                        <Text style={styles.itemType}>{item.type}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.priceInfoBtn}>
                                                    <Text style={styles.priceInfoText}>TEKLİFLER</Text>
                                                    <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#D4AF37" />
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View style={styles.accordionContent}>
                                                <Text style={styles.accordionTitle}>Uygun Araçlar / Firmalar</Text>
                                                {MOCK_SUPPLIERS.map((supplier) => (
                                                    <LinearGradient key={supplier.id} colors={['#1A1A1A', '#000000']} style={styles.supplierCard}>
                                                        <View style={styles.supplierHeader}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <MaterialCommunityIcons name={supplier.logo} size={18} color="#D4AF37" style={{ marginRight: 6 }} />
                                                                <Text style={styles.supplierName}>{supplier.name}</Text>
                                                            </View>
                                                            {supplier.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#D4AF37" />}
                                                        </View>
                                                        <View style={styles.priceGrid}>
                                                            <View style={styles.priceColumn}>
                                                                <Text style={styles.priceLabel}>Şehir İçi</Text>
                                                                <Text style={styles.priceValue}>{supplier.prices.daily}</Text>
                                                            </View>
                                                            <View style={styles.priceSeparator} />
                                                            <View style={styles.priceColumn}>
                                                                <Text style={styles.priceLabel}>Şehirler Arası</Text>
                                                                <Text style={styles.priceValue}>KM Bazlı</Text>
                                                            </View>
                                                        </View>
                                                        <TouchableOpacity style={styles.selectSupplierBtn} onPress={() => Alert.alert("Seçildi", `${item.name} için ${supplier.name} seçildi.`)}>
                                                            <Text style={styles.selectSupplierText}>ARAÇ ÇAĞIR</Text>
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

                {/* STICKY FOOTER */}
                {viewMode === 'list' && (
                    <View style={styles.stickyFooter}>
                        <TouchableOpacity style={styles.quickOfferBtn} onPress={() => navigation.navigate('CreateTransport')}>
                            <Text style={styles.quickOfferText}>HEMEN ARAÇ BUL</Text>
                            <MaterialCommunityIcons name="truck-fast" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
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
    scrollContent: { paddingBottom: 100 },

    // HERO SLIDER
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
    gridBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // STICKY FOOTER
    stickyFooter: { position: 'absolute', bottom: 20, left: 16, right: 16, alignItems: 'center' },
    quickOfferBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    quickOfferText: { color: '#000', fontWeight: 'bold', fontSize: 14, marginRight: 8 },

    // DETAIL VIEW & ACCORDION
    detailContainer: { paddingHorizontal: 0 },
    detailHeader: { height: 200, justifyContent: 'flex-end', padding: 20, marginBottom: 20 },
    detailHeaderImage: { ...StyleSheet.absoluteFillObject },
    detailCategoryTitle: { color: '#D4AF37', fontSize: 28, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 },
    cardContainer: { marginBottom: 12, paddingHorizontal: 16 },
    itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 0, borderRadius: 12, borderWidth: 1, borderColor: '#D4AF37', height: 110, overflow: 'hidden' },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemImageBox: { width: 110, height: 110 },
    itemImage: { width: '100%', height: '100%' },
    itemName: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 2, marginLeft: 12 },
    itemType: { color: '#BBB', fontSize: 12, marginLeft: 12, fontWeight: '500' },
    priceInfoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 12 },
    priceInfoText: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginRight: 4 },
    accordionContent: { backgroundColor: '#111', marginTop: 4, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    accordionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    supplierCard: { marginBottom: 16, borderRadius: 12, padding: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    supplierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
    supplierName: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    priceGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    priceColumn: { alignItems: 'center', flex: 1 },
    priceSeparator: { width: 1, backgroundColor: '#333', height: '80%' },
    priceLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    priceValue: { color: '#D4AF37', fontSize: 14, fontWeight: '900' },
    selectSupplierBtn: { backgroundColor: '#D4AF37', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
    selectSupplierText: { color: '#000', fontSize: 12, fontWeight: 'bold' },

    // SHARED / CORPORATE SUBMIT
    submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 20 },
    submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
