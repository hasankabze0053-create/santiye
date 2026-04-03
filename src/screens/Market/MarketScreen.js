import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarketCart } from '../../context/MarketCartContext';
import { supabase } from '../../lib/supabase';
import { MarketService } from '../../services/MarketService';
import { getMarketImage } from '../../utils/marketAssets';
import { PermissionService } from '../../services/PermissionService';

const { width } = Dimensions.get('window');

const COLOR_PALETTE = [
    { name: 'Altın', code: '#D4AF37' },
    { name: 'Beyaz', code: '#FFFFFF' },
    { name: 'Gümüş', code: '#C0C0C0' },
    { name: 'Kömür', code: '#333333' },
    { name: 'Turuncu', code: '#F97316' },
    { name: 'Mavi', code: '#06B6D4' },
    { name: 'Kırmızı', code: '#EF4444' },
];

// ─── MARKET PRICE TICKER ──────────────────────────────────────────────────
const MARKET_PRICES = [
    { label: 'Nervürlü Demir', value: '₺28.40', unit: '/kg',    trend: 'up' },
    { label: 'Beton C30',      value: '₺3.850', unit: '/m³',   trend: 'up' },
    { label: 'Çimento 50kg',   value: '₺285',   unit: '/torba', trend: 'down' },
    { label: 'Kum',            value: '₺180',   unit: '/m³',   trend: 'up' },
    { label: 'Hazır Beton',    value: '₺3.650', unit: '/m³',   trend: 'down' },
    { label: 'Tuğla',          value: '₺4.20',  unit: '/adet',  trend: 'up' },
];

function MarketPriceTicker() {
    const scrollX = useRef(new Animated.Value(0)).current;
    const totalW  = MARKET_PRICES.length * 160;
    useEffect(() => {
        Animated.loop(
            Animated.timing(scrollX, { toValue: -totalW, duration: MARKET_PRICES.length * 2800, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, []);
    const items = [...MARKET_PRICES, ...MARKET_PRICES];
    return (
        <View style={tk.wrap}>
            <View style={tk.dot} />
            <Text allowFontScaling={false} style={tk.live}>CANLI</Text>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: scrollX }] }}>
                    {items.map((p, i) => (
                        <View key={i} style={tk.item}>
                            <Text allowFontScaling={false} style={tk.label}>{p.label}</Text>
                            <Text allowFontScaling={false} style={[tk.val, { color: p.trend === 'up' ? '#F97316' : '#10B981' }]}>
                                {p.value}<Text style={tk.unit}>{p.unit}</Text>
                            </Text>
                            <MaterialCommunityIcons
                                name={p.trend === 'up' ? 'trending-up' : 'trending-down'}
                                size={12}
                                color={p.trend === 'up' ? '#F97316' : '#10B981'}
                            />
                        </View>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
}

const tk = StyleSheet.create({
    wrap:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 8 },
    dot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
    live:  { color: '#EF4444', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
    item:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 22, width: 150 },
    label: { color: '#666', fontSize: 10 },
    val:   { fontSize: 11, fontWeight: '700' },
    unit:  { fontSize: 9, fontWeight: '400', color: '#555' },
});

export default function MarketScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getCartCount } = useMarketCart();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const [hasMarketAccess, setHasMarketAccess] = useState(false);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const roles = await PermissionService.getUserRoles();
                setIsAdmin(roles.isAdmin);

                const hasAccess = await PermissionService.checkAccess('market_seller');
                setHasMarketAccess(hasAccess);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    // --- ADMIN CATEGORY MANAGEMENT ---
    const toggleCatVisibility = async (cat) => {
        const { success } = await MarketService.toggleCategoryVisibility(cat.id, cat.is_active);
        if (success) {
            setMarketCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
        } else {
            Alert.alert("Hata", "Görünürlük güncellenemedi.");
        }
    };

    const moveCat = async (index, direction) => {
        const newCats = [...marketCategories];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCats.length) return;

        [newCats[index], newCats[targetIndex]] = [newCats[targetIndex], newCats[index]];
        setMarketCategories(newCats);

        // Update DB
        await MarketService.updateCategorySortOrder(newCats[index].id, index * 10);
        await MarketService.updateCategorySortOrder(newCats[targetIndex].id, targetIndex * 10);
    };

    const toggleSubCatVisibility = async (sub) => {
        const { success } = await MarketService.toggleSubCategoryVisibility(sub.id, sub.is_active);
        if (success) {
            // Update the nested state
            setMarketCategories(prev => prev.map(c => {
                if (c.id === selectedCategory.id) {
                    return {
                        ...c,
                        subcategories: c.subcategories.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s)
                    };
                }
                return c;
            }));
        } else {
            Alert.alert("Hata", "Görünürlük güncellenemedi.");
        }
    };

    const moveSubCat = async (sub, index, direction) => {
        if (!selectedCategory) return;
        const subcats = [...selectedCategory.subcategories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= subcats.length) return;

        [subcats[index], subcats[targetIndex]] = [subcats[targetIndex], subcats[index]];
        
        // Update main state
        setMarketCategories(prev => prev.map(c => {
            if (c.id === selectedCategory.id) {
                return { ...c, subcategories: subcats };
            }
            return c;
        }));

        // Update DB
        await MarketService.updateSubCategorySortOrder(subcats[index].id, index * 10);
        await MarketService.updateSubCategorySortOrder(subcats[targetIndex].id, targetIndex * 10);
    };

    const handleRenameCat = (cat) => {
        Alert.prompt(
            "Kategoriyi Yeniden Adlandır",
            `"${cat.title}" için yeni bir isim girin:`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Değiştir",
                    onPress: async (newName) => {
                        if (newName && newName.trim()) {
                            const { success } = await MarketService.updateCategoryName(cat.id, newName.trim());
                            if (success) {
                                setMarketCategories(prev => prev.map(c => c.id === cat.id ? { ...c, title: newName.trim() } : c));
                            } else {
                                Alert.alert("Hata", "İsim güncellenemedi.");
                            }
                        }
                    }
                }
            ],
            "plain-text",
            cat.title
        );
    };

    const handleRenameSubCat = (sub) => {
        Alert.prompt(
            "Alt Kategoriyi Yeniden Adlandır",
            `"${sub.name}" için yeni bir isim girin:`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Değiştir",
                    onPress: async (newName) => {
                        if (newName && newName.trim()) {
                            const { success } = await MarketService.updateSubCategoryName(sub.id, newName.trim());
                            if (success) {
                                setMarketCategories(prev => prev.map(c => {
                                    if (c.id === selectedCategory.id) {
                                        return {
                                            ...c,
                                            subcategories: c.subcategories.map(s => s.id === sub.id ? { ...s, name: newName.trim() } : s)
                                        };
                                    }
                                    return c;
                                }));
                            } else {
                                Alert.alert("Hata", "İsim güncellenemedi.");
                            }
                        }
                    }
                }
            ],
            "plain-text",
            sub.name
        );
    };

    // --- SHOWCASE MANAGEMENT ---
    const handlePickShowcaseImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setIsUploading(true);
            const publicUrl = await MarketService.uploadImage(result.assets[0].uri);
            if (publicUrl) {
                setEditingShowcaseItem(prev => ({ ...prev, image_url: publicUrl, image_ref: null, is_local: false }));
            } else {
                Alert.alert("Hata", "Resim yüklenemedi.");
            }
            setIsUploading(false);
        }
    };

    const handleSaveShowcase = async () => {
        if (!editingShowcaseItem) return;
        
        const isNew = !editingShowcaseItem.id;
        let success = false;

        if (isNew) {
            const res = await MarketService.addShowcaseItem(editingShowcaseItem);
            success = res.success;
        } else {
            const res = await MarketService.updateShowcaseItem(editingShowcaseItem.id, editingShowcaseItem);
            success = res.success;
        }

        if (success) {
            const freshShowcase = await MarketService.getShowcaseItems();
            setShowcaseItems(freshShowcase);
            setEditingShowcaseItem(null);
            Alert.alert("Başarılı", "Kampanya kaydedildi.");
        } else {
            Alert.alert("Hata", "Kampanya kaydedilemedi.");
        }
    };

    const handleDeleteShowcase = async (id) => {
        Alert.alert("Sil", "Bu kampanyayı silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    const { success } = await MarketService.deleteShowcaseItem(id);
                    if (success) {
                        setShowcaseItems(prev => prev.filter(item => item.id !== id));
                    }
                }
            }
        ]);
    };
    const [isShowcaseManagerVisible, setIsShowcaseManagerVisible] = useState(false);
    const [editingShowcaseItem, setEditingShowcaseItem] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
                        <Text allowFontScaling={false} style={styles.optionLabel}>{labels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
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
                                    <Text allowFontScaling={false} style={[
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
                        <Text allowFontScaling={false} style={styles.headerTitle}>YAPI MARKET</Text>
                        <Text allowFontScaling={false} style={styles.headerSubtitle}>
                            {viewMode === 'list' ? 'Tüm İhtiyaçlarınız Kapınızda' : (selectedCategory ? selectedCategory.title : 'Market')}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !hasMarketAccess && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || hasMarketAccess) {
                                    navigation.navigate('MarketProvider');
                                } else {
                                    Alert.alert("Yetkisiz Erişim", "Yalnızca onaylı 'Yapı Market / Satıcı' hesapları bu panele erişebilir.");
                                }
                            }}
                            activeOpacity={isAdmin || hasMarketAccess ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="storefront-outline" size={24} color={isAdmin || hasMarketAccess ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* PRICE TICKER */}
                <MarketPriceTicker />

                {/* SEARCH BAR (In-Flow) */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
                    <TextInput allowFontScaling={false}
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
                                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
                                    scrollEventThrottle={16}
                                    style={styles.heroSlider}
                                    contentContainerStyle={{ paddingHorizontal: 0 }}
                                >
                                    {showcaseItems.map((item) => (
                                        <View key={item.id} style={styles.heroCard}>
                                            <View style={styles.heroImage}>
                                                <Image
                                                    source={item.is_local ? getMarketImage(item.image_ref) : { uri: item.image_url }}
                                                    style={[
                                                        StyleSheet.absoluteFill,
                                                        { transform: [{ scale: item.image_scale || 1 }] }
                                                    ]}
                                                    contentFit="cover"
                                                    transition={500}
                                                />
                                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                                                
                                                <View style={[
                                                    styles.heroContent,
                                                    { 
                                                        transform: [
                                                            { translateX: item.text_offset_x || 0 },
                                                            { translateY: item.text_offset_y || 0 }
                                                        ]
                                                    }
                                                ]}>
                                                    <View style={[
                                                        styles.heroTag, 
                                                        { 
                                                            position: 'relative', top: 0, left: 0, 
                                                            alignSelf: 'flex-start', marginBottom: 8,
                                                            backgroundColor: item.tag_color || '#D4AF37'
                                                        }
                                                    ]}>
                                                        <Text allowFontScaling={false} style={styles.heroTagText}>{item.tag}</Text>
                                                    </View>
                                                    {item.title ? (
                                                        <Text allowFontScaling={false} style={[styles.heroTitle, { color: item.title_color || '#FFFFFF' }]}>
                                                            {item.title}
                                                        </Text>
                                                    ) : null}
                                                    {item.subtitle ? (
                                                        <Text allowFontScaling={false} style={[styles.heroSubtitle, { color: item.subtitle_color || '#FFFFFF' }]}>
                                                            {item.subtitle}
                                                        </Text>
                                                    ) : null}
                                                    
                                                    {/* Premium Button */}
                                                    <TouchableOpacity 
                                                        style={styles.heroPremiumBtn}
                                                        onPress={() => navigation.navigate('MarketRequest')}
                                                        activeOpacity={0.8}
                                                    >
                                                        <LinearGradient
                                                            colors={['#D4AF37', '#B8860B']}
                                                            style={StyleSheet.absoluteFillObject}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                        />
                                                        <Text allowFontScaling={false} style={styles.heroPremiumBtnText}>{item.button_text || 'Şimdi En Uygun Fiyatı Öğren'}</Text>
                                                        <MaterialCommunityIcons name="arrow-right" size={16} color="#000" style={{ marginLeft: 6 }} />
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Admin Slider Edit Shortcut */}
                                                {isAdmin && (
                                                    <TouchableOpacity 
                                                        style={styles.heroEditShortcut} 
                                                        onPress={() => setEditingShowcaseItem(item)}
                                                    >
                                                        <MaterialCommunityIcons name="pencil" size={20} color="#000" />
                                                    </TouchableOpacity>
                                                )}
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

                            {/* Slider Settings Button (Admin Only) */}
                            {isAdmin && (
                                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
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

                            {/* 3. BULK ACTION BAR (Redesigned - Dark Mode) */}
                            <TouchableOpacity style={styles.bulkActionBar} onPress={handleRfq} activeOpacity={0.9}>
                                <View style={styles.bulkContainer}>
                                    <View style={styles.bulkIconCircle}>
                                        <MaterialCommunityIcons name="clipboard-list-outline" size={32} color="#000" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={styles.bulkTitle}>TEKLİF TOPLA</Text>
                                        <Text allowFontScaling={false} style={styles.bulkSubtitle}>Liste oluşturun, tüm firmalardan teklif alın.</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* NEW: AI PROCUREMENT WIZARD BUTTON */}
                            <TouchableOpacity
                                style={styles.aiWizardButton}
                                onPress={() => navigation.navigate('SmartProcurementWizard')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#101828', '#1D2939']} // Dark blue-grey gradient background
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                                <View style={styles.aiContentContainer}>
                                    <View style={styles.aiIconContainer}>
                                        <LinearGradient
                                            colors={['#FDB931', '#996515']} // Gold gradient for icon bg
                                            style={StyleSheet.absoluteFill}
                                        />
                                        <MaterialCommunityIcons name="robot-confused-outline" size={32} color="#000" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                            <Text allowFontScaling={false} style={styles.aiTitle}>CEPTEŞEF AI</Text>
                                            <View style={styles.newBadge}>
                                                <Text allowFontScaling={false} style={styles.newBadgeText}>YENİ</Text>
                                            </View>
                                        </View>
                                        <Text allowFontScaling={false} style={styles.aiSubtitle}>
                                            "10 katlı bina için beton lazım" diyin, yapay zeka sizin için en iyi tedarikçileri bulsun.
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#D4AF37" />
                                </View>
                            </TouchableOpacity>

                            {/* 4. MAIN CATEGORY GRID */}
                            <View style={[styles.sectionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <Text allowFontScaling={false} style={styles.sectionTitle}>KATEGORİLER</Text>
                                {isAdmin && (
                                    <TouchableOpacity 
                                        onPress={() => setIsEditMode(!isEditMode)}
                                        style={[styles.editModeBtn, isEditMode && styles.editModeBtnActive]}
                                    >
                                        <MaterialCommunityIcons 
                                            name={isEditMode ? "content-save" : "cog-outline"} 
                                            size={20} 
                                            color={isEditMode ? "#000" : "#D4AF37"} 
                                        />
                                        <Text allowFontScaling={false} style={[styles.editModeText, { color: isEditMode ? "#000" : "#D4AF37" }]}>
                                            {isEditMode ? "KAYDET" : "DÜZENLE"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.gridContainer}>
                                {marketCategories
                                    .filter(c => isEditMode || c.is_active !== false)
                                    .map((cat, idx) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.gridCard, 
                                            isEditMode && cat.is_active === false && { opacity: 0.5 }
                                        ]}
                                        onPress={() => {
                                            if (isEditMode) return;
                                            navigation.push('MarketStack', {
                                                viewMode: 'subcategory',
                                                category: cat
                                            });
                                        }}
                                        activeOpacity={0.9}
                                    >
                                        {/* Admin Controls Overlay */}
                                        {isEditMode && (
                                            <View style={[styles.adminOverlay, { flexDirection: 'column' }]}>
                                                <TouchableOpacity onPress={() => handleRenameCat(cat)} style={[styles.adminBtn, { backgroundColor: '#B8860B', marginBottom: 10, width: 44, height: 44, borderRadius: 22 }]}>
                                                    <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
                                                </TouchableOpacity>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    <TouchableOpacity onPress={() => moveCat(idx, 'left')} style={styles.adminBtn}>
                                                        <MaterialCommunityIcons name="arrow-left" size={18} color="#FFF" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => toggleCatVisibility(cat)} style={styles.adminBtn}>
                                                        <MaterialCommunityIcons 
                                                            name={cat.is_active === false ? "eye-off" : "eye"} 
                                                            size={18} 
                                                            color={cat.is_active === false ? "#FF4D4D" : "#4ADE80"} 
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => moveCat(idx, 'right')} style={styles.adminBtn}>
                                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
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
                                                <Text allowFontScaling={false} style={styles.gridTitle}>{cat.title}</Text>
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
                            <View style={[styles.categoryHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.categoryTitle}>{selectedCategory.title} Kategorileri</Text>
                                    <Text allowFontScaling={false} style={styles.categorySubtitle}>İlgilendiğiniz alt kategoriyi seçin</Text>
                                </View>
                                {isAdmin && (
                                    <TouchableOpacity 
                                        onPress={() => setIsEditMode(!isEditMode)}
                                        style={[styles.editModeBtn, isEditMode && styles.editModeBtnActive, { marginTop: 0 }]}
                                    >
                                        <MaterialCommunityIcons 
                                            name={isEditMode ? "content-save" : "cog-outline"} 
                                            size={18} 
                                            color={isEditMode ? "#000" : "#D4AF37"} 
                                        />
                                        <Text allowFontScaling={false} style={[styles.editModeText, { color: isEditMode ? "#000" : "#D4AF37", fontSize: 10 }]}>
                                            {isEditMode ? "KAYDET" : "DÜZENLE"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.listContainer}>
                                {selectedCategory.subcategories
                                    .filter(s => isEditMode || s.is_active !== false)
                                    .map((sub, idx) => (
                                    <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={[
                                                styles.listCard, 
                                                { flex: 1 },
                                                isEditMode && sub.is_active === false && { opacity: 0.5 }
                                            ]}
                                            onPress={() => {
                                                if (isEditMode) return;
                                                navigation.navigate('MarketDynamicForm', {
                                                    category: selectedCategory,
                                                    subCategory: sub.name
                                                });
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.listContent}>
                                                <Text allowFontScaling={false} style={styles.listTitle}>{sub.name}</Text>
                                            </View>
                                            {!isEditMode && <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />}
                                        </TouchableOpacity>

                                        {isEditMode && (
                                            <View style={[styles.listAdminControls, { flexDirection: 'column', gap: 4 }]}>
                                                <TouchableOpacity onPress={() => handleRenameSubCat(sub)} style={[styles.listAdminBtn, { backgroundColor: 'rgba(184, 134, 11, 0.2)', borderColor: '#B8860B' }]}>
                                                    <MaterialCommunityIcons name="pencil" size={16} color="#B8860B" />
                                                </TouchableOpacity>
                                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                                    <TouchableOpacity onPress={() => moveSubCat(sub, idx, 'up')} style={styles.listAdminBtn}>
                                                        <MaterialCommunityIcons name="chevron-up" size={18} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => toggleSubCatVisibility(sub)} style={styles.listAdminBtn}>
                                                        <MaterialCommunityIcons 
                                                            name={sub.is_active === false ? "eye-off" : "eye"} 
                                                            size={18} 
                                                            color={sub.is_active === false ? "#FF4D4D" : "#4ADE80"} 
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => moveSubCat(sub, idx, 'down')} style={styles.listAdminBtn}>
                                                        <MaterialCommunityIcons name="chevron-down" size={18} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* PRODUCT LIST (FILTERED) */}
                    {viewMode === 'detail' && selectedCategory && selectedSubCategory && (
                        <View style={styles.detailContainer}>
                            <View style={styles.categoryHeader}>
                                <Text allowFontScaling={false} style={styles.categoryTitle}>{selectedSubCategory}</Text>
                                <Text allowFontScaling={false} style={styles.categorySubtitle}>
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
                                        <Text allowFontScaling={false} style={[
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
                                                <Text allowFontScaling={false} style={styles.productName}>{item.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text allowFontScaling={false} style={styles.productSpec}>{item.subcategory} • {item.spec}</Text>
                                                    {item.options && <Text allowFontScaling={false} style={{ color: '#666', fontSize: 11, marginLeft: 6 }}>({Object.keys(item.options).length} Seçenek)</Text>}
                                                </View>
                                                {isExpanded && item.options && (
                                                    <Text allowFontScaling={false} style={{ fontSize: 11, color: '#D4AF37', marginTop: 4 }}>
                                                        Seçilen: {Object.values(selectedOptions).join(', ')}
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Right Action (Price/Expand) */}
                                            <View style={[styles.priceExpandBtn, isExpanded && { backgroundColor: '#D4AF37' }]}>
                                                <Text allowFontScaling={false} style={[styles.priceExpandText, isExpanded && { color: '#000' }]}>
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
                                                    <Text allowFontScaling={false} style={[styles.supplierListHeader, { marginBottom: 0 }]}>TEDARİKÇİLER & FİYATLAR</Text>
                                                </View>

                                                {getMockSuppliers(item.price).map((supplier) => (
                                                    <View key={supplier.id} style={styles.supplierRow}>
                                                        <View style={styles.supplierInfo}>
                                                            <View style={styles.supplierAvatar}>
                                                                <Text allowFontScaling={false} style={styles.supplierInitials}>{supplier.name.substring(0, 2).toUpperCase()}</Text>
                                                            </View>
                                                            <View>
                                                                <TouchableOpacity onPress={() => navigation.navigate('SellerStore', {
                                                                    sellerName: supplier.name,
                                                                    rating: supplier.rating,
                                                                    location: 'İstanbul' // Mock location
                                                                })}>
                                                                    <Text allowFontScaling={false} style={[styles.supplierNameText, { textDecorationLine: 'underline' }]}>{supplier.name}</Text>
                                                                </TouchableOpacity>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Ionicons name="star" size={12} color="#D4AF37" />
                                                                    <Text allowFontScaling={false} style={styles.supplierRating}>{supplier.rating}</Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                                            <View style={{ alignItems: 'flex-end' }}>
                                                                <Text allowFontScaling={false} style={{ color: '#666', fontSize: 10, fontWeight: 'bold' }}>BİRİM FİYAT</Text>
                                                                <Text allowFontScaling={false} style={styles.supplierPrice}>{supplier.price}</Text>
                                                            </View>
                                                            <TouchableOpacity style={styles.addToCartBtnSmall} onPress={() => handleAddToCart(item)}>
                                                                <Text allowFontScaling={false} style={styles.addToCartText}>SEPETE EKLE</Text>
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

                {/* 6. FLOATING CART BUTTON (Dynamic) */}
                {getCartCount() > 0 && (
                    <TouchableOpacity 
                        style={styles.cartFab} 
                        onPress={() => navigation.navigate('MarketCart')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient colors={['#D4AF37', '#B8860B']} style={StyleSheet.absoluteFillObject} />
                        <View style={styles.cartContentWrap}>
                            <MaterialCommunityIcons name="cart-outline" size={26} color="#000" />
                            <View style={styles.cartBadge}>
                                <Text allowFontScaling={false} style={styles.cartBadgeText}>{getCartCount()}</Text>
                            </View>
                            <Text allowFontScaling={false} style={styles.cartFabText}>Sepete Git</Text>
                        </View>
                    </TouchableOpacity>
                )}


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
                                        <Image 
                                            source={item.is_local ? getMarketImage(item.image_ref) : { uri: item.image_url }} 
                                            style={styles.managerItemThumb} 
                                        />
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
                                        sort_order: (showcaseItems.length + 1) * 10
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
                                                source={editingShowcaseItem?.is_local ? getMarketImage(editingShowcaseItem.image_ref) : { uri: editingShowcaseItem?.image_url }} 
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
    heroCard: { width: width, height: 240, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 20 },
    heroTag: { position: 'absolute', top: 50, left: 20, backgroundColor: '#D4AF37', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 },
    heroTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
    heroContent: { marginBottom: 20 },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4, textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
    heroSubtitle: { color: '#ddd', fontSize: 13, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
    heroPremiumBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
    heroPremiumBtnText: { color: '#000', fontSize: 13, fontWeight: 'bold' },

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

    // Floating Cart Button
    cartFab: { position: 'absolute', bottom: 100, right: 20, borderRadius: 28, height: 56, paddingHorizontal: 20, overflow: 'hidden', shadowColor: '#D4AF37', shadowOffset: { height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    cartContentWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    cartBadge: { position: 'absolute', top: 4, left: 16, backgroundColor: '#000', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D4AF37' },
    cartBadgeText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
    cartFabText: { color: '#000', fontSize: 15, fontWeight: '800', marginLeft: 10 },

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

    // AI Wizard Button Styles
    aiWizardButton: {
        marginHorizontal: 16,
        marginBottom: 24,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#D4AF37',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    aiContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        height: '100%'
    },
    aiIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#FFF'
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#D4AF37',
        letterSpacing: 1,
        marginRight: 8
    },
    newBadge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    newBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold'
    },
    aiSubtitle: {
        fontSize: 12,
        color: '#CCC',
        fontStyle: 'italic',
        lineHeight: 16
    },

    // Admin Category Management Styles
    editModeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D4AF37',
        marginTop: 4
    },
    editModeBtnActive: {
        backgroundColor: '#D4AF37',
    },
    editModeText: {
        fontSize: 11,
        fontWeight: '900',
        marginLeft: 4,
        letterSpacing: 1
    },
    adminOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 16
    },
    adminBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D4AF37'
    },
    listAdminControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        gap: 6
    },
    listAdminBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },

    // Showcase Management Styles
    adminSliderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        gap: 12,
        overflow: 'hidden'
    },
    adminSliderBtnText: {
        color: '#D4AF37',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1.5
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'flex-end'
    },
    managerModalContent: {
        backgroundColor: '#111',
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#333'
    },
    editModalContent: {
        backgroundColor: '#111',
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222'
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '900'
    },
    managerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    managerItemThumb: {
        width: 60,
        height: 34,
        borderRadius: 4,
        backgroundColor: '#333'
    },
    managerItemTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold'
    },
    managerActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    addSliderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
        marginBottom: 30
    },
    addSliderBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900'
    },
    imagePickerArea: {
        width: '100%',
        height: 180,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20
    },
    inputLabel: {
        color: '#D4AF37',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 4
    },
    modalInput: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 14,
        color: '#FFF',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 16
    },
    adjustmentGroup: {
        backgroundColor: '#161616',
        padding: 16,
        borderRadius: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#222'
    },
    adjHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    adjVal: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold'
    },
    modalSaveBtn: {
        backgroundColor: '#D4AF37',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    modalSaveBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1
    },
    heroEditShortcut: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D4AF37',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10
    },
    colorPalette: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingVertical: 5
    },
    colorChip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#444'
    }
});


