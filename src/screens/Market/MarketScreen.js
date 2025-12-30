import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- HERO SLIDER DATA ---
const MARKET_SHOWCASE = [
    { id: '1', title: 'HAFTANIN İNDİRİMLİ DEMİRİ', subtitle: 'Krom Çelik A.Ş. - Ton Fiyatında Şok İndirim', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800', tag: '%15 İNDİRİM' },
    { id: '2', title: 'TUĞLA KAMPANYASI', subtitle: 'Yüksek kaliteli yığma tuğla toplu alımda avantaj', image: 'https://images.unsplash.com/photo-1588011930968-748435e16ee9?q=80&w=800', tag: 'KARGO BEDAVA' },
    { id: '3', title: 'YALITIM ÇÖZÜMLERİ', subtitle: 'Kışa hazırlık için mantolama paketlerinde fırsat', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800', tag: 'YENİ SEZON' },
];

// 15 KATEGORİLİ DEV MARKET YAPISI (Updated with Subcategory Objects and Enriched Items)
const MARKET_CATEGORIES = [
    {
        id: '1',
        title: 'KABA YAPI & İNŞAAT',
        subtitle: 'Demir, Çimento, Tuğla, Çatı',
        icon: 'office-building',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
        // Enhanced subcategories with images for the Grid View
        subcategories: [
            { id: 'sc1', name: 'Demir & Çelik', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400', icon: 'grid' },
            { id: 'sc2', name: 'Çimento & Harçlar', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400', icon: 'cup' }, // generic icon
            { id: 'sc3', name: 'Duvar Elemanları', image: 'https://images.unsplash.com/photo-1588011930968-748435e16ee9?q=80&w=400', icon: 'wall' },
            { id: 'sc4', name: 'Yalıtım', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=400', icon: 'shield-home' },
            { id: 'sc5', name: 'Çatı Malzemeleri', image: 'https://images.unsplash.com/photo-1632759145351-1d592911f3b3?q=80&w=400', icon: 'home-roof' }
        ],
        items: [
            // Demir & Çelik
            { name: 'Nervürlü İnşaat Demiri Ø12', subcategory: 'Demir & Çelik', spec: 'Ton', price: '₺24.500', seller: 'Demir Dünyası', location: 'Gebze', rating: '4.9', sellerLogo: 'domain' },
            { name: 'Çelik Hasır Q188', subcategory: 'Demir & Çelik', spec: 'Adet', price: '₺1.450', seller: 'Hasır Metal', location: 'Dudullu', rating: '4.7', sellerLogo: 'grid' },
            { name: 'Kutu Profil 40x40 3mm', subcategory: 'Demir & Çelik', spec: '6m Boy', price: '₺950', seller: 'Metal Market', location: 'İkitelli', rating: '4.8', sellerLogo: 'domain' },
            { name: 'NPU 100 Demir', subcategory: 'Demir & Çelik', spec: '6m Boy', price: '₺2.800', seller: 'Çelik Center', location: 'Gebze', rating: '4.6', sellerLogo: 'domain' },

            // Çimento & Harçlar
            { name: 'Portland Çimento (CEM I)', subcategory: 'Çimento & Harçlar', spec: '50 Kg Torba', price: '₺195', seller: 'Beton Market', location: 'Tuzla', rating: '4.6', sellerLogo: 'store' },
            { name: 'Beyaz Çimento', subcategory: 'Çimento & Harçlar', spec: '50 Kg Torba', price: '₺320', seller: 'Yapı Kimyasalları', location: 'Pendik', rating: '4.9', sellerLogo: 'store' },
            { name: 'Hazır Sıva Harcı', subcategory: 'Çimento & Harçlar', spec: '25 Kg Torba', price: '₺110', seller: 'Beton Market', location: 'Tuzla', rating: '4.5', sellerLogo: 'store' },
            { name: 'Tamir Harcı (Yapısal)', subcategory: 'Çimento & Harçlar', spec: '25 Kg Torba', price: '₺250', seller: 'Sika Bayi', location: 'Kartal', rating: '4.8', sellerLogo: 'tools' },

            // Duvar Elemanları
            { name: 'Gazbeton 20\'lik', subcategory: 'Duvar Elemanları', spec: 'Adet', price: '₺72', seller: 'Ytong Market', location: 'Pendik', rating: '4.8', sellerLogo: 'wall' },
            { name: 'Yığma Tuğla 13.5', subcategory: 'Duvar Elemanları', spec: 'Adet', price: '₺9.50', seller: 'Toprak Kiremit', location: 'Manisa', rating: '4.5', sellerLogo: 'wall' },
            { name: 'Bims Blok 19\'luk', subcategory: 'Duvar Elemanları', spec: 'Adet', price: '₺18', seller: 'Bims Dünyası', location: 'Nevşehir', rating: '4.6', sellerLogo: 'wall' },
            { name: 'Briket 20\'lik', subcategory: 'Duvar Elemanları', spec: 'Adet', price: '₺12', seller: 'Yerel Yapı', location: 'Sultanbeyli', rating: '4.4', sellerLogo: 'wall' },

            // Yalıtım
            { name: 'XPS Köpük Levha 5cm', subcategory: 'Yalıtım', spec: 'Paket (5.76 m²)', price: '₺1.350', seller: 'İzocam Bayi', location: 'Ümraniye', rating: '4.7', sellerLogo: 'shield-home' },
            { name: 'Taş Yünü Mantolama Levhası', subcategory: 'Yalıtım', spec: 'Paket (2.88 m²)', price: '₺1.800', seller: 'Yalıtım Center', location: 'Dudullu', rating: '4.8', sellerLogo: 'shield-home' },
            { name: 'Mantolama Paketi (Tam Set)', subcategory: 'Yalıtım', spec: 'm²', price: '₺450', seller: 'İzocam Bayi', location: 'Ümraniye', rating: '4.9', sellerLogo: 'shield-home' },
            { name: 'Membran (3mm Arduazlı)', subcategory: 'Yalıtım', spec: '10m Top', price: '₺850', seller: 'Su Yalıtım', location: 'Karaköy', rating: '4.7', sellerLogo: 'water-off' },

            // Çatı Malzemeleri
            { name: 'Braas Kiremit', subcategory: 'Çatı Malzemeleri', spec: 'Adet', price: '₺35', seller: 'Çatı Sistemleri', location: 'Kartal', rating: '4.8', sellerLogo: 'home-roof' },
            { name: 'Onduline Levha', subcategory: 'Çatı Malzemeleri', spec: 'Adet', price: '₺420', seller: 'Çatı Market', location: 'Sultanbeyli', rating: '4.4', sellerLogo: 'home-roof' },
            { name: 'Shingle (Yaprak)', subcategory: 'Çatı Malzemeleri', spec: 'Paket (2.9 m²)', price: '₺950', seller: 'Çatı Dünyası', location: 'Gebze', rating: '4.7', sellerLogo: 'home-roof' },
            { name: 'PVC Yağmur Oluğu', subcategory: 'Çatı Malzemeleri', spec: '4m Boy', price: '₺250', seller: 'Pimaş Market', location: 'Pendik', rating: '4.6', sellerLogo: 'pipe' },
        ]
    },
    {
        id: '2',
        title: 'İNCE YAPI & DEKORASYON',
        subtitle: 'Boya, Parke, Seramik, Kapı',
        icon: 'format-paint',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600',
        subcategories: [
            { id: 'sc6', name: 'Boya & Ürünleri', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400', icon: 'format-paint' },
            { id: 'sc7', name: 'Zemin Kaplama', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400', icon: 'floor-plan' },
            { id: 'sc8', name: 'Tavan Sistemleri', image: 'https://images.unsplash.com/photo-1594913785162-e678a0c2fc6a?q=80&w=400', icon: 'view-quilt' },
            { id: 'sc9', name: 'Kapı & Pencere', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=400', icon: 'door' }
        ],
        items: [
            { name: 'Silikonlu İç Cephe Boyası', subcategory: 'Boya & Ürünleri', spec: '15 Lt', price: '₺2.100', seller: 'Marshall Bayi', location: 'Maltepe', rating: '4.8', sellerLogo: 'format-paint' },
            { name: 'Tavan Boyası', subcategory: 'Boya & Ürünleri', spec: '17.5 Kg', price: '₺950', seller: 'Renk Dünyası', location: 'Kartal', rating: '4.5', sellerLogo: 'format-paint' },
            { name: 'Laminat Parke 8mm 32. Sınıf', subcategory: 'Zemin Kaplama', spec: 'm²', price: '₺380', seller: 'Parke Center', location: 'Pendik', rating: '4.6', sellerLogo: 'floor-plan' },
            { name: '60x120 Granit Seramik', subcategory: 'Zemin Kaplama', spec: 'm²', price: '₺650', seller: 'Seramiksan', location: 'Ataşehir', rating: '4.7', sellerLogo: 'floor-plan' },
            { name: 'Alçıpan Levha (Beyaz)', subcategory: 'Tavan Sistemleri', spec: 'Adet', price: '₺180', seller: 'Knauf Bayi', location: 'Samandıra', rating: '4.8', sellerLogo: 'view-quilt' },
            { name: 'Amerikan Panel Kapı', subcategory: 'Kapı & Pencere', spec: 'Adet (Kasalı)', price: '₺3.500', seller: 'Kapı Dünyası', location: 'İkitelli', rating: '4.4', sellerLogo: 'door' },
        ]
    },
    {
        id: '3',
        title: 'TESİSAT & ALTYAPI',
        subtitle: 'Elektrik, Su, Isıtma/Soğutma',
        icon: 'pipe',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600',
        subcategories: [
            { id: 'sc10', name: 'Elektrik', image: 'https://images.unsplash.com/photo-1563294025-b77827e85746?q=80&w=400', icon: 'lightning-bolt' },
            { id: 'sc11', name: 'Sıhhi Tesisat', image: 'https://images.unsplash.com/photo-1581093458791-9c16c029cd78?q=80&w=400', icon: 'pipe' },
            { id: 'sc12', name: 'Isıtma & Soğutma', image: 'https://images.unsplash.com/photo-1581093583449-82558e4d2752?q=80&w=400', icon: 'radiator' }
        ],
        items: [
            { name: 'NYM Antigron Kablo 3x2.5', subcategory: 'Elektrik', spec: '100m Top', price: '₺4.200', seller: 'Öznur Kablo', location: 'Karaköy', rating: '4.9', sellerLogo: 'lightning-bolt' },
            { name: 'Viko Anahtar Priz', subcategory: 'Elektrik', spec: 'Adet', price: '₺85', seller: 'Elektrik Sepeti', location: 'Perpa', rating: '4.7', sellerLogo: 'toggle-switch' },
            { name: 'PPRC Boru 20mm', subcategory: 'Sıhhi Tesisat', spec: '4m Boy', price: '₺75', seller: 'Fırat Bayi', location: 'Dudullu', rating: '4.6', sellerLogo: 'pipe' },
            { name: 'PVC Atık Su Borusu 100\'lük', subcategory: 'Sıhhi Tesisat', spec: '3m Boy', price: '₺180', seller: 'Pimaş Market', location: 'Gebze', rating: '4.5', sellerLogo: 'pipe' },
            { name: 'Panel Radyatör 600x1200', subcategory: 'Isıtma & Soğutma', spec: 'Adet', price: '₺2.800', seller: 'Isı Market', location: 'Ümraniye', rating: '4.8', sellerLogo: 'radiator' },
        ]
    },
    {
        id: '4',
        title: 'BANYO & MUTFAK',
        subtitle: 'Vitrifiye, Dolap, Batarya',
        icon: 'toilet',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
        subcategories: [
            { id: 'sc13', name: 'Vitrifiye', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400', icon: 'toilet' },
            { id: 'sc14', name: 'Banyo Mobilyası', image: 'https://images.unsplash.com/photo-1595111666426-5c5e62f6b8b8?q=80&w=400', icon: 'cupboard' },
            { id: 'sc15', name: 'Mutfak', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400', icon: 'countertop' }
        ],
        items: [
            { name: 'Asma Klozet Seti', subcategory: 'Vitrifiye', spec: 'Takım', price: '₺6.500', seller: 'Vitra Bayi', location: 'Kadıköy', rating: '4.9', sellerLogo: 'toilet' },
            { name: 'Lavabo Bataryası Krom', subcategory: 'Vitrifiye', spec: 'Adet', price: '₺1.200', seller: 'Artema Bayi', location: 'Kartal', rating: '4.8', sellerLogo: 'water' },
            { name: '80cm Banyo Dolabı', subcategory: 'Banyo Mobilyası', spec: 'Takım', price: '₺8.500', seller: 'Orka Banyo', location: 'Maltepe', rating: '4.7', sellerLogo: 'cupboard' },
            { name: 'Granit Mutfak Eviyesi', subcategory: 'Mutfak', spec: 'Adet', price: '₺3.800', seller: 'Franke Center', location: 'Ataşehir', rating: '4.8', sellerLogo: 'countertop' },
        ]
    },
    {
        id: '5',
        title: 'HIRDAVAT & EL ALETLERİ',
        subtitle: 'Matkap, Vida, İş Güvenliği',
        icon: 'tools',
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600',
        subcategories: [
            { id: 'sc16', name: 'Elektrikli Aletler', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400', icon: 'drill' },
            { id: 'sc17', name: 'Manuel Aletler', image: 'https://images.unsplash.com/photo-1586864387789-628af9eea72a?q=80&w=400', icon: 'hammer' },
            { id: 'sc18', name: 'Bağlantı', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=400', icon: 'screw-machine-round-top' },
            { id: 'sc19', name: 'İş Güvenliği', image: 'https://images.unsplash.com/photo-1599689018228-5690b2075677?q=80&w=400', icon: 'shoe-formal' }
        ],
        items: [
            { name: 'Akülü Vidalama 18V', subcategory: 'Elektrikli Aletler', spec: 'Set', price: '₺8.500', seller: 'Bosch Market', location: 'Karaköy', rating: '4.9', sellerLogo: 'drill' },
            { name: 'Kırıcı Delici Hilti', subcategory: 'Elektrikli Aletler', spec: 'Adet', price: '₺12.000', seller: 'Makita Center', location: 'Dudullu', rating: '4.8', sellerLogo: 'drill' },
            { name: 'Çelik Çekiç 500gr', subcategory: 'Manuel Aletler', spec: 'Adet', price: '₺250', seller: 'İzeltaş Bayi', location: 'Perpa', rating: '4.7', sellerLogo: 'hammer' },
            { name: 'Sunta Vidası 4x50', subcategory: 'Bağlantı', spec: '1000\'li Kutu', price: '₺450', seller: 'Vida Dünyası', location: 'İkitelli', rating: '4.6', sellerLogo: 'screw-machine-round-top' },
            { name: 'İş Ayakkabısı S3', subcategory: 'İş Güvenliği', spec: 'Çift', price: '₺850', seller: 'Mekap Bayi', location: 'Gebze', rating: '4.5', sellerLogo: 'shoe-formal' },
        ]
    },
];

export default function MarketScreen() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null); // Updated: null by default
    const [expandedItemIndex, setExpandedItemIndex] = useState(null); // NEW: Track expanded item
    const [viewMode, setViewMode] = useState('list'); // 'list', 'subcategory', 'detail'
    const [searchQuery, setSearchQuery] = useState('');

    // Toggle Expand Helper
    const toggleExpand = (index) => {
        setExpandedItemIndex(expandedItemIndex === index ? null : index);
    };

    // Mock Suppliers Generator
    const getMockSuppliers = (basePrice) => {
        const numericPrice = parseInt(basePrice.replace(/[^0-9]/g, '')) || 1000;
        return [
            { id: 1, name: 'Anadolu Yapı Market', rating: '4.8', price: `₺${numericPrice}` },
            { id: 2, name: 'Demirler İnşaat', rating: '4.5', price: `₺${numericPrice + 50}` },
            { id: 3, name: 'Sarılar Toptan', rating: '4.9', price: `₺${numericPrice - 25}` },
        ];
    };

    // Animation Ref
    const scrollX = useRef(new Animated.Value(0)).current;

    // Mock functions
    const handleAddToCart = (item) => Alert.alert("Sepete Eklendi", `${item.name} sepete eklendi.`);
    const handleOpenMap = () => Alert.alert("Harita Görünümü", "Firma haritası yakında aktif olacak.");
    const handleRfq = () => navigation.navigate('BulkRequest');

    const handleBack = () => {
        if (viewMode === 'detail') {
            setViewMode('subcategory');
            setSelectedSubCategory(null);
        } else if (viewMode === 'subcategory') {
            setViewMode('list');
            setSelectedCategory(null);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* 1. HEADER & SEARCH BAR */}
                {/* 1. HEADER (Standardized) */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>YAPI MARKET</Text>
                        <Text style={styles.headerSubtitle}>
                            {viewMode === 'list' ? 'Tüm İhtiyaçlarınız Kapınızda' : (selectedCategory ? selectedCategory.title : 'Market')}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialCommunityIcons name="account-circle-outline" size={28} color="#FFD700" />
                    </TouchableOpacity>
                </View>

                {/* SEARCH BAR (In-Flow) */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#FFD700" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Malzeme, Firma veya Konum Ara..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="tune" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                    {viewMode === 'list' && (
                        <>
                            {/* 2. HERO SLIDER (Paginated) */}
                            <View style={styles.heroSliderContainer}>
                                <Animated.ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                                    scrollEventThrottle={16}
                                    style={styles.heroSlider}
                                    contentContainerStyle={{ paddingHorizontal: 0 }}
                                >
                                    {MARKET_SHOWCASE.map((item) => (
                                        <View key={item.id} style={styles.heroCard}>
                                            <ImageBackground source={{ uri: item.image }} style={styles.heroImage} imageStyle={{ borderRadius: 0 }}>
                                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
                                                <View style={styles.heroTag}><Text style={styles.heroTagText}>{item.tag}</Text></View>
                                                <View style={styles.heroContent}>
                                                    <Text style={styles.heroTitle}>{item.title}</Text>
                                                    <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                                                </View>
                                            </ImageBackground>
                                        </View>
                                    ))}
                                </Animated.ScrollView>

                                {/* Pagination Dots */}
                                <View style={styles.pagination}>
                                    {MARKET_SHOWCASE.map((_, i) => {
                                        const opacity = scrollX.interpolate({
                                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                            outputRange: [0.3, 1, 0.3],
                                            extrapolate: 'clamp'
                                        });
                                        return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                                    })}
                                </View>
                            </View>

                            {/* 3. BULK ACTION BAR (Sticky Look) */}
                            <TouchableOpacity style={styles.bulkActionBar} onPress={handleRfq} activeOpacity={0.9}>
                                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.bulkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bulkTitle}>TOPLU MALZEME TALEBİ</Text>
                                        <Text style={styles.bulkSubtitle}>Liste oluşturun, tüm firmalardan teklif alın.</Text>
                                    </View>
                                    <View style={styles.bulkIconBox}>
                                        <MaterialCommunityIcons name="clipboard-list" size={28} color="#000" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* 4. MAIN CATEGORY GRID */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>KATEGORİLER</Text>
                            </View>

                            <View style={styles.gridContainer}>
                                {MARKET_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.gridCard}
                                        onPress={() => {
                                            setSelectedCategory(cat);
                                            setViewMode('subcategory'); // Go to subcategory view
                                        }}
                                        activeOpacity={0.9}
                                    >
                                        <ImageBackground source={{ uri: cat.image }} style={styles.gridImage} imageStyle={{ borderRadius: 16 }}>
                                            <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
                                            <View style={styles.gridContent}>
                                                <MaterialCommunityIcons name={cat.icon} size={24} color="#FFD700" style={{ marginBottom: 4 }} />
                                                <Text style={styles.gridTitle}>{cat.title}</Text>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* NEW: SUBCATEGORY VIEW */}
                    {viewMode === 'subcategory' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>{selectedCategory.title} Kategorileri</Text>
                                <Text style={styles.categorySubtitle}>İlgilendiğiniz alt kategoriyi seçin</Text>
                            </View>

                            <View style={styles.gridContainer}>
                                {selectedCategory.subcategories.map((sub) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={styles.gridCard}
                                        onPress={() => {
                                            setSelectedSubCategory(sub.name);
                                            setViewMode('detail'); // Go to product list
                                        }}
                                        activeOpacity={0.9}
                                    >
                                        <ImageBackground source={{ uri: sub.image }} style={styles.gridImage} imageStyle={{ borderRadius: 16 }}>
                                            <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
                                            <View style={styles.gridContent}>
                                                <MaterialCommunityIcons name={sub.icon} size={24} color="#FFD700" style={{ marginBottom: 4 }} />
                                                <Text style={styles.gridTitle}>{sub.name}</Text>
                                                <View style={styles.gridBadge}>
                                                    <Text style={styles.gridBadgeText}>
                                                        {selectedCategory.items.filter(item => item.subcategory === sub.name).length} Ürün
                                                    </Text>
                                                </View>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* PRODUCT LIST (FILTERED) */}
                    {viewMode === 'detail' && selectedCategory && selectedSubCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>{selectedSubCategory}</Text>
                                <Text style={styles.categorySubtitle}>
                                    {selectedCategory.items.filter(item => item.subcategory === selectedSubCategory).length} ürün listeleniyor
                                </Text>
                            </View>

                            {/* Optional: Horizontal Chip Scroll to switch siblings quickly */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {selectedCategory.subcategories.map((sub) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={[
                                            styles.filterChip,
                                            selectedSubCategory === sub.name && styles.filterChipActive
                                        ]}
                                        onPress={() => setSelectedSubCategory(sub.name)}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            selectedSubCategory === sub.name && styles.filterChipTextActive
                                        ]}>
                                            {sub.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {selectedCategory.items
                                .filter(item => item.subcategory === selectedSubCategory)
                                .map((item, idx) => {
                                    const isExpanded = expandedItemIndex === idx;
                                    return (
                                        <View key={idx} style={[styles.productCard, isExpanded && { height: 'auto', borderColor: '#FFD700', borderWidth: 1 }]}>
                                            <LinearGradient colors={['#F5F5F5', '#B0B0B0']} style={styles.productMainRow} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                                <View style={styles.productImageContainer}>
                                                    <ImageBackground source={{ uri: selectedCategory.image }} style={styles.productImage}>
                                                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={StyleSheet.absoluteFill} />
                                                    </ImageBackground>
                                                </View>

                                                <View style={styles.productInfo}>
                                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                                        <Text style={styles.productName}>{item.name}</Text>
                                                        <Text style={styles.productSpec}>{item.spec}</Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={[styles.priceExpandBtn, isExpanded && { backgroundColor: '#333' }]}
                                                        onPress={() => toggleExpand(idx)}
                                                    >
                                                        <Text style={[styles.priceExpandText, isExpanded && { color: '#FFD700' }]}>
                                                            {isExpanded ? 'KAPAT' : 'FİYAT'}
                                                        </Text>
                                                        <MaterialCommunityIcons
                                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                                            size={20}
                                                            color={isExpanded ? "#FFD700" : "#FFD700"}
                                                            style={{ marginLeft: 4 }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </LinearGradient>

                                            {isExpanded && (
                                                <View style={styles.supplierListContainer}>
                                                    <Text style={styles.supplierListHeader}>TEDARİKÇİLER & FİYATLAR</Text>

                                                    {getMockSuppliers(item.price).map((supplier) => (
                                                        <View key={supplier.id} style={styles.supplierRow}>
                                                            <View style={styles.supplierInfo}>
                                                                <View style={styles.supplierAvatar}>
                                                                    <Text style={styles.supplierInitials}>{supplier.name.substring(0, 2).toUpperCase()}</Text>
                                                                </View>
                                                                <View>
                                                                    <Text style={styles.supplierNameText}>{supplier.name}</Text>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <Ionicons name="star" size={12} color="#FFD700" />
                                                                        <Text style={styles.supplierRating}>{supplier.rating}</Text>
                                                                    </View>
                                                                </View>
                                                            </View>

                                                            <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                                                <View style={{ alignItems: 'flex-end' }}>
                                                                    <Text style={{ color: '#bbb', fontSize: 10 }}>BİRİM FİYAT</Text>
                                                                    <Text style={styles.supplierPrice}>{supplier.price}</Text>
                                                                </View>
                                                                <TouchableOpacity style={styles.addToCartBtnSmall} onPress={() => handleAddToCart(item)}>
                                                                    <Text style={styles.addToCartText}>SEPETE EKLE</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                        </View>
                    )}

                </ScrollView>

                {/* 5. FLOATING MAP BUTTON */}
                <TouchableOpacity style={styles.mapFab} onPress={handleOpenMap}>
                    <MaterialCommunityIcons name="map-marker-radius" size={28} color="#000" />
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    // Header
    // Header (Standardized)
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
    headerTitle: { color: '#FFD700', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: '300', marginTop: 4 },
    headerBtn: { padding: 5 },

    // Search Bar
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A',
        marginHorizontal: 16, marginBottom: 20, paddingHorizontal: 16, height: 50, borderRadius: 12,
        borderWidth: 1, borderColor: '#333'
    },
    searchInput: { flex: 1, color: '#fff', marginLeft: 8, fontSize: 14 },

    // Hero Slider
    heroSliderContainer: { marginBottom: 20, height: 240 },
    heroSlider: { marginTop: 10 },
    heroCard: { width: width, height: 240 },
    heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 20 },
    heroTag: { position: 'absolute', top: 50, left: 20, backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 },
    heroTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
    heroContent: { marginBottom: 20 },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
    heroSubtitle: { color: '#ddd', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },

    // Pagination
    pagination: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', marginHorizontal: 4 },

    // Bulk Action
    bulkActionBar: { marginHorizontal: 16, marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
    bulkGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    bulkTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    bulkSubtitle: { fontSize: 12, color: '#333', marginTop: 2, fontWeight: '500' },
    bulkIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },

    // Grid
    sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    gridCard: { width: '50%', padding: 6, height: 160, marginBottom: 4 },
    gridImage: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 16, overflow: 'hidden' },
    gridContent: { alignItems: 'flex-start' },
    gridTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, lineHeight: 18 },
    gridBadge: { backgroundColor: 'rgba(255,215,0,0.25)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700' },
    gridBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold' },

    // Product Card (Redesigned List View)
    detailContainer: { padding: 16 },
    categoryHeader: { marginBottom: 20 },
    categoryTitle: { color: '#FFD700', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    categorySubtitle: { color: '#888', fontSize: 14 },
    // Product Card (Expandable List View)
    productCard: { borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden' },
    productMainRow: { flexDirection: 'row', height: 110 },
    productImageContainer: { width: 110, height: '100%', backgroundColor: '#222' },
    productImage: { width: '100%', height: '100%' },
    productInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
    productName: { color: '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    productSpec: { color: '#444', fontSize: 13, fontWeight: '500' },

    // Price & Expand Button
    priceExpandBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-end' },
    priceExpandText: { fontSize: 13, fontWeight: 'bold', color: '#FFD700' },

    // Expanded Supplier List
    supplierListContainer: { backgroundColor: '#151515', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
    supplierListHeader: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
    supplierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    supplierInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    supplierAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#252525', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#333' },
    supplierInitials: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },
    supplierNameText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    supplierRating: { color: '#bbb', fontSize: 12, marginLeft: 4 },
    supplierPrice: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
    addToCartBtnSmall: { backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 4 },
    addToCartText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

    // Floating Map Button
    mapFab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', shadowColor: '#FFD700', shadowOffset: { height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

    // Filter Chips
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#333', marginRight: 10, borderWidth: 1, borderColor: '#444' },
    filterChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    filterChipText: { color: '#ccc', fontSize: 13, fontWeight: '500' },
    filterChipTextActive: { color: '#000', fontWeight: 'bold' },
});
