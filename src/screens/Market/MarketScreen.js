import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { MarketService } from '../../services/MarketService';
import { getMarketImage } from '../../utils/marketAssets';

const { width } = Dimensions.get('window');
export default function MarketScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin, is_seller')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsSeller(data?.is_seller || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    // Data State
    const [marketCategories, setMarketCategories] = useState([]);
    const [showcaseItems, setShowcaseItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter Logic
    const viewMode = route.params?.viewMode || 'list';
    const selectedCategory = route.params?.category || null;
    const [selectedSubCategory, setSelectedSubCategory] = useState(route.params?.subCategory || null);

    const [expandedItemIndex, setExpandedItemIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({});

    // Load Data with Caching Strategy
    useEffect(() => {
        const loadData = async () => {
            // 1. FAST: Try to load from local cache first
            const localCats = await MarketService.getLocalCategories();
            if (localCats) {
                setMarketCategories(localCats);
                setIsLoading(false); // Show content immediately
            }

            // 2. SLOW: Fetch fresh data from server
            try {
                const [remoteCats, showcase] = await Promise.all([
                    MarketService.getRemoteCategories(),
                    MarketService.getShowcaseItems()
                ]);

                // Update with fresh data
                setMarketCategories(remoteCats);
                setShowcaseItems(showcase);
            } catch (error) {
                console.error("Failed to load remote market data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Toggle Expand Helper with Default Options Initialization
    const toggleExpand = (index, filteredItems) => {
        if (expandedItemIndex === index) {
            setExpandedItemIndex(null);
            setSelectedOptions({});
        } else {
            setExpandedItemIndex(index);
            // Initialize default options if available
            const item = filteredItems[index];
            if (item && item.options) {
                const defaults = {};
                Object.keys(item.options).forEach(key => {
                    defaults[key] = item.options[key][0];
                });
                setSelectedOptions(defaults);
            }
        }
    };

    const handleOptionSelect = (key, value) => {
        setSelectedOptions(prev => ({ ...prev, [key]: value }));
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
    const handleAddToCart = (item) => Alert.alert("Sepete Eklendi", `${item.name} (${Object.values(selectedOptions).join(', ')}) sepete eklendi.`);
    const handleOpenMap = () => Alert.alert("Harita Görünümü", "Firma haritası yakında aktif olacak.");
    const handleRfq = () => navigation.navigate('MarketRequest');

    const handleBack = () => {
        navigation.goBack();
    };

    const renderVariationSelectors = (item) => {
        if (!item.options) return null;
        const labels = { brand: 'Marka', weight: 'Miktar', size: 'Ebat', type: 'Tip', thickness: 'Kalınlık', color: 'Renk', class: 'Sınıf', surface: 'Yüzey' };

        return (
            <View style={styles.optionsContainer}>
                {Object.keys(item.options).map((key) => (
                    <View key={key} style={styles.optionRow}>
                        <Text style={styles.optionLabel}>{labels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {item.options[key].map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.optionChip,
                                        selectedOptions[key] === opt && styles.optionChipActive
                                    ]}
                                    onPress={() => handleOptionSelect(key, opt)}
                                >
                                    <Text style={[
                                        styles.optionChipText,
                                        selectedOptions[key] === opt && styles.optionChipTextActive
                                    ]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </View>
        );
    };

    const filteredItems = selectedCategory && selectedSubCategory
        ? selectedCategory.items.filter(item => item.subcategory === selectedSubCategory)
        : [];

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !isSeller && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || isSeller) {
                                    navigation.navigate('MarketProvider');
                                }
                            }}
                            activeOpacity={isAdmin || isSeller ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="storefront-outline" size={24} color={isAdmin || isSeller ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* SEARCH BAR (In-Flow) */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
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
                                    {showcaseItems.map((item) => (
                                        <View key={item.id} style={styles.heroCard}>
                                            <View style={styles.heroImage}>
                                                <Image
                                                    source={item.is_local ? getMarketImage(item.image_ref) : { uri: item.image_url }}
                                                    style={StyleSheet.absoluteFill}
                                                    contentFit="cover"
                                                    transition={500}
                                                />
                                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
                                                <View style={styles.heroTag}><Text style={styles.heroTagText}>{item.tag}</Text></View>
                                                {item.title ? (
                                                    <View style={styles.heroContent}>
                                                        <Text style={styles.heroTitle}>{item.title}</Text>
                                                        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </View>
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

                            {/* 3. BULK ACTION BAR (Redesigned - Dark Mode) */}
                            <TouchableOpacity style={styles.bulkActionBar} onPress={handleRfq} activeOpacity={0.9}>
                                <View style={styles.bulkContainer}>
                                    <View style={styles.bulkIconCircle}>
                                        <MaterialCommunityIcons name="clipboard-list-outline" size={32} color="#000" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bulkTitle}>TEKLİF TOPLA</Text>
                                        <Text style={styles.bulkSubtitle}>Liste oluşturun, tüm firmalardan teklif alın.</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* 4. MAIN CATEGORY GRID */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>KATEGORİLER</Text>
                            </View>

                            <View style={styles.gridContainer}>
                                {marketCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.gridCard}
                                        onPress={() => {
                                            navigation.push('MarketStack', {
                                                viewMode: 'subcategory',
                                                category: cat
                                            });
                                        }}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.gridImage}>
                                            <Image
                                                source={getMarketImage(cat.image_ref)}
                                                style={StyleSheet.absoluteFill}
                                                contentFit="cover"
                                                transition={500}
                                            />


                                            {/* Bottom Left Patch (Integrated with main gradient) */}
                                            <LinearGradient
                                                colors={['transparent', '#000000']}
                                                style={StyleSheet.absoluteFill}
                                            />

                                            <MaterialCommunityIcons name={cat.icon} size={24} color="#D4AF37" style={styles.gridIconAbsolute} />
                                            {/* Removed old gradient to avoid double darkening */}
                                            <View style={styles.gridContent}>
                                                <Text style={styles.gridTitle}>{cat.title}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* NEW: SUBCATEGORY VIEW (List Mode) */}
                    {viewMode === 'subcategory' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>{selectedCategory.title} Kategorileri</Text>
                                <Text style={styles.categorySubtitle}>İlgilendiğiniz alt kategoriyi seçin</Text>
                            </View>

                            <View style={styles.listContainer}>
                                {selectedCategory.subcategories.map((sub) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={styles.listCard}
                                        onPress={() => {
                                            navigation.push('MarketStack', {
                                                viewMode: 'detail',
                                                category: selectedCategory,
                                                subCategory: sub.name
                                            });
                                        }}
                                        activeOpacity={0.7}
                                    >

                                        <View style={styles.listContent}>
                                            <Text style={styles.listTitle}>{sub.name}</Text>

                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
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
                                    {filteredItems.length} ürün listeleniyor
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

                            {/* PRODUCTS LIST (Standard - Expandable) */}
                            {/* PRODUCTS LIST (Premium Text-Based) */}
                            {filteredItems.map((item, idx) => {
                                const isExpanded = expandedItemIndex === idx;
                                return (
                                    <View key={idx} style={[styles.productCard, isExpanded && { borderColor: '#D4AF37' }]}>
                                        <TouchableOpacity
                                            style={styles.productMainRow}
                                            onPress={() => toggleExpand(idx, filteredItems)}
                                            activeOpacity={0.8}
                                        >
                                            {/* Left Icon (Gold) */}
                                            <View style={styles.productIconBox}>
                                                <MaterialCommunityIcons name={selectedCategory.subcategories.find(s => s.name === item.subcategory)?.icon || 'cube-outline'} size={24} color="#D4AF37" />
                                            </View>

                                            {/* Center Content */}
                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName}>{item.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.productSpec}>{item.subcategory} • {item.spec}</Text>
                                                    {item.options && <Text style={{ color: '#666', fontSize: 11, marginLeft: 6 }}>({Object.keys(item.options).length} Seçenek)</Text>}
                                                </View>
                                                {isExpanded && item.options && (
                                                    <Text style={{ fontSize: 11, color: '#D4AF37', marginTop: 4 }}>
                                                        Seçilen: {Object.values(selectedOptions).join(', ')}
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Right Action (Price/Expand) */}
                                            <View style={[styles.priceExpandBtn, isExpanded && { backgroundColor: '#D4AF37' }]}>
                                                <Text style={[styles.priceExpandText, isExpanded && { color: '#000' }]}>
                                                    {isExpanded ? 'KAPAT' : 'FİYAT'}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={18}
                                                    color={isExpanded ? "#000" : "#D4AF37"}
                                                    style={{ marginLeft: 4 }}
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View style={styles.supplierListContainer}>

                                                {/* Variants Selection */}
                                                {renderVariationSelectors(item)}

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                                    <MaterialCommunityIcons name="storefront-outline" size={16} color="#D4AF37" style={{ marginRight: 6 }} />
                                                    <Text style={[styles.supplierListHeader, { marginBottom: 0 }]}>TEDARİKÇİLER & FİYATLAR</Text>
                                                </View>

                                                {getMockSuppliers(item.price).map((supplier) => (
                                                    <View key={supplier.id} style={styles.supplierRow}>
                                                        <View style={styles.supplierInfo}>
                                                            <View style={styles.supplierAvatar}>
                                                                <Text style={styles.supplierInitials}>{supplier.name.substring(0, 2).toUpperCase()}</Text>
                                                            </View>
                                                            <View>
                                                                <TouchableOpacity onPress={() => navigation.navigate('SellerStore', {
                                                                    sellerName: supplier.name,
                                                                    rating: supplier.rating,
                                                                    location: 'İstanbul' // Mock location
                                                                })}>
                                                                    <Text style={[styles.supplierNameText, { textDecorationLine: 'underline' }]}>{supplier.name}</Text>
                                                                </TouchableOpacity>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Ionicons name="star" size={12} color="#D4AF37" />
                                                                    <Text style={styles.supplierRating}>{supplier.rating}</Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                                            <View style={{ alignItems: 'flex-end' }}>
                                                                <Text style={{ color: '#666', fontSize: 10, fontWeight: 'bold' }}>BİRİM FİYAT</Text>
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
    headerTitle: { color: '#D4AF37', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: '300', marginTop: 4 },
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
    heroTag: { position: 'absolute', top: 50, left: 20, backgroundColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 },
    heroTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
    heroContent: { marginBottom: 20 },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
    heroSubtitle: { color: '#ddd', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },

    // Pagination
    pagination: { flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4AF37', marginHorizontal: 4 },

    // Bulk Action
    bulkActionBar: { marginHorizontal: 16, marginBottom: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#141414' },
    bulkContainer: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    bulkIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 4, borderColor: 'rgba(255, 215, 0, 0.3)' },
    bulkTitle: { fontSize: 16, fontWeight: '900', color: '#D4AF37', letterSpacing: 0.5 },
    bulkSubtitle: { fontSize: 13, color: '#888', marginTop: 4, fontWeight: '400' },
    // bulkIconBox removed

    // Grid
    sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    gridCard: { width: '50%', padding: 6, height: 160, marginBottom: 4 },
    gridImage: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 12, borderWidth: 1, borderColor: '#333', borderRadius: 16, overflow: 'hidden' },
    gridContent: { alignItems: 'flex-start', width: '100%' }, // Ensure text takes width if needed
    gridIconAbsolute: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
    gridTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 0, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, lineHeight: 18 },
    gridBadge: { backgroundColor: 'rgba(255,215,0,0.25)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#D4AF37' },
    gridBadgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },

    // Product Card (Redesigned List View)
    detailContainer: { padding: 16 },
    categoryHeader: { marginBottom: 20 },
    categoryTitle: { color: '#D4AF37', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    categorySubtitle: { color: '#888', fontSize: 14 },
    // Product Card (Expandable List View)
    productCard: { borderRadius: 12, marginBottom: 12, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    productMainRow: { flexDirection: 'row', alignItems: 'center', padding: 16 }, // Adjusted padding for list
    productIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, // New Icon Box
    productInfo: { flex: 1, justifyContent: 'center' },
    productName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    productSpec: { color: '#888', fontSize: 12, fontWeight: '500' },

    // Price & Expand Button
    priceExpandBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    priceExpandText: { fontSize: 12, fontWeight: 'bold', color: '#D4AF37' },

    // Expanded Supplier List (NEW: Dark Theme)
    supplierListContainer: { backgroundColor: '#111', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
    supplierListHeader: { color: '#D4AF37', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    supplierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 10 },
    supplierInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    supplierAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    supplierInitials: { color: '#D4AF37', fontWeight: 'bold', fontSize: 14 },
    supplierNameText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    supplierRating: { color: '#888', fontSize: 12, marginLeft: 4 },
    supplierPrice: { color: '#D4AF37', fontSize: 18, fontWeight: '900' },
    addToCartBtnSmall: { backgroundColor: '#D4AF37', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
    addToCartText: { color: '#000', fontSize: 11, fontWeight: 'bold' },

    // Options (New)
    optionsContainer: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    optionRow: { marginBottom: 12 },
    optionLabel: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
    optionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#333', marginRight: 8, borderWidth: 1, borderColor: '#444' },
    optionChipActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    optionChipText: { color: '#ccc', fontSize: 12, fontWeight: '500' },
    optionChipTextActive: { color: '#000', fontWeight: 'bold' },

    // Floating Map Button
    mapFab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', shadowColor: '#D4AF37', shadowOffset: { height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

    // Filter Chips
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#333', marginRight: 10, borderWidth: 1, borderColor: '#444' },
    filterChipActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    filterChipText: { color: '#ccc', fontSize: 13, fontWeight: '500' },
    filterChipTextActive: { color: '#000', fontWeight: 'bold' },

    // List View Styles
    listContainer: { paddingHorizontal: 16 },
    listCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A',
        borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#333'
    },
    listIconContainer: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 16
    },
    listContent: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    listSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
});
