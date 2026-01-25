import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- HERO SLIDER DATA ---
const MARKET_SHOWCASE = [
    { id: '1', title: '', subtitle: '', image: require('../../assets/market/concrete_showcase.png'), tag: 'EN İYİ FİYAT' },
    { id: '2', title: 'TUĞLA KAMPANYASI', subtitle: 'Yüksek kaliteli yığma tuğla toplu alımda avantaj', image: 'https://images.unsplash.com/photo-1588011930968-748435e16ee9?q=80&w=800', tag: 'KARGO BEDAVA' },
    { id: '3', title: 'YALITIM ÇÖZÜMLERİ', subtitle: 'Kışa hazırlık için mantolama paketlerinde fırsat', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800', tag: 'YENİ SEZON' },
];

// 12 MAIN CATEGORIES - MEGA MARKET INVENTORY
const MARKET_CATEGORIES = [
    {
        id: '1',
        title: 'KABA YAPI & İNŞAAT',
        subtitle: 'Demir, Çimento, Tuğla, Çatı',
        icon: 'office-building',
        image: require('../../assets/market/kaba_yapi.png'), // Generated
        subcategories: [
            { id: '1.1', name: 'Demir & Çelik', icon: 'grid' },
            { id: '1.2', name: 'Çimento & Bağlayıcılar', icon: 'cup' },
            { id: '1.3', name: 'Duvar Blokları & Tuğla', icon: 'wall' },
            { id: '1.4', name: 'Agrega (Kum & Çakıl)', icon: 'truck-snowflake' } // using snowflake as sand proxy or truck
        ],
        items: [
            { name: 'Nervürlü İnşaat Demiri Ø12', subcategory: 'Demir & Çelik', spec: 'Ton', price: '₺24.500', options: { type: ['Ø8', 'Ø10', 'Ø12', 'Ø16'], brand: ['İÇDAŞ', 'KARDEMİR'] } },
            { name: 'Çelik Hasır Q188', subcategory: 'Demir & Çelik', spec: 'Adet', price: '₺1.450', options: { type: ['Q Tip', 'R Tip'] } },
            { name: 'Portland Kompoze Çimento', subcategory: 'Çimento & Bağlayıcılar', spec: '50kg Torba', price: '₺195', options: { brand: ['Nuh', 'Akçansa', 'Limak'] } },
            { name: 'Beyaz Çimento', subcategory: 'Çimento & Bağlayıcılar', spec: '25kg', price: '₺180', options: { brand: ['Çimsa'] } },
            { name: 'Yığma Tuğla 13.5', subcategory: 'Duvar Blokları & Tuğla', spec: 'Adet', price: '₺6.50', options: { brand: ['Kılıçoğlu', 'Işıklar'] } },
            { name: 'Gazbeton G2 Düz', subcategory: 'Duvar Blokları & Tuğla', spec: 'Adet', price: '₺75', options: { size: ['10cm', '15cm', '20cm'] } },
            { name: 'Sıva Kumu (İnce)', subcategory: 'Agrega (Kum & Çakıl)', spec: 'Ton', price: '₺450', options: { origin: ['Şile', 'Kemerburgaz'] } },
            { name: 'Mıcır 1 No', subcategory: 'Agrega (Kum & Çakıl)', spec: 'Ton', price: '₺420' }
        ]
    },
    {
        id: '2',
        title: 'YALITIM & ÇATI',
        subtitle: 'Mantolama, Su Yalıtımı, Çatı',
        icon: 'shield-home',
        image: require('../../assets/market/yalitim_cati.png'),
        subcategories: [
            { id: '2.1', name: 'Isı Yalıtımı (Mantolama)', icon: 'temperature-celsius' },
            { id: '2.2', name: 'Su Yalıtımı', icon: 'water-off' },
            { id: '2.3', name: 'Çatı Kaplamaları', icon: 'home-roof' }
        ],
        items: [
            { name: 'Karbonlu EPS Levha (Gri)', subcategory: 'Isı Yalıtımı (Mantolama)', spec: 'Paket', price: '₺850', options: { thickness: ['3cm', '4cm', '5cm'] } },
            { name: 'Folyolu Taşyünü Levha', subcategory: 'Isı Yalıtımı (Mantolama)', spec: 'Paket', price: '₺1.200', options: { density: ['50kg', '70kg'] } },
            { name: 'Bitümlü Membran PP3000', subcategory: 'Su Yalıtımı', spec: 'Top (10m)', price: '₺950', options: { type: ['3mm', '4mm', 'Arduazlı'] } },
            { name: 'Sürme İzolasyon (Çimento)', subcategory: 'Su Yalıtımı', spec: '25kg Set', price: '₺650' },
            { name: 'Marsilya Kiremit', subcategory: 'Çatı Kaplamaları', spec: 'Adet', price: '₺18', options: { material: ['Toprak', 'Beton'] } },
            { name: 'Onduline Levha', subcategory: 'Çatı Kaplamaları', spec: 'Adet', price: '₺320', options: { color: ['Kırmızı', 'Yeşil', 'Siyah'] } },
            { name: 'OSB-3 Levha 11mm', subcategory: 'Çatı Kaplamaları', spec: 'Plaka', price: '₺450' }
        ]
    },
    {
        id: '3',
        title: 'KURU YAPI & TAVAN',
        subtitle: 'Alçıpan, Profil, Taşyünü Tavan',
        icon: 'view-quilt',
        image: require('../../assets/market/kuru_yapi.png'),
        subcategories: [
            { id: '3.1', name: 'Alçıpan Grubu', icon: 'layers' },
            { id: '3.2', name: 'Toz Alçı Grubu', icon: 'shaker-outline' }, // Custom icon proxy
            { id: '3.3', name: 'Profil & Aksesuar', icon: 'shape-outline' },
            { id: '3.4', name: 'Tavan Plakaları', icon: 'view-grid' }
        ],
        items: [
            { name: 'Standart Alçıpan (Beyaz)', subcategory: 'Alçıpan Grubu', spec: 'Plaka', price: '₺140', options: { type: ['Beyaz', 'Yeşil (Su)', 'Kırmızı (Yangın)'] } },
            { name: 'Boardex Dış Cephe Levhası', subcategory: 'Alçıpan Grubu', spec: 'Plaka', price: '₺480' },
            { name: 'Saten Perdah Alçısı', subcategory: 'Toz Alçı Grubu', spec: '25kg', price: '₺110' },
            { name: 'Tavan U Profili', subcategory: 'Profil & Aksesuar', spec: '3m Boy', price: '₺45' },
            { name: 'Duvar C Profili 75\'lik', subcategory: 'Profil & Aksesuar', spec: '3m Boy', price: '₺65' },
            { name: 'Karolam Asma Tavan', subcategory: 'Tavan Plakaları', spec: 'Paket (m²)', price: '₺180', options: { pattern: ['Yıldızlı', 'Kırçıllı'] } }
        ]
    },
    {
        id: '4',
        title: 'ZEMİN & DUVAR',
        subtitle: 'Seramik, Parke, Doğal Taş',
        icon: 'floor-plan',
        image: require('../../assets/market/zemin_duvar.png'),
        subcategories: [
            { id: '4.1', name: 'Seramik & Porselen', icon: 'checkerboard' },
            { id: '4.2', name: 'Doğal Taş & Mermer', icon: 'diamond-stone' },
            { id: '4.3', name: 'Ahşap Zemin', icon: 'wood' } // custom icon proxy
        ],
        items: [
            { name: '60x120 Granit Seramik', subcategory: 'Seramik & Porselen', spec: 'm²', price: '₺650', options: { finish: ['Mat', 'Parlak', 'Lappato'], color: ['Gri', 'Bej', 'Antrasit'] } },
            { name: 'Duvar Fayansı 30x90', subcategory: 'Seramik & Porselen', spec: 'm²', price: '₺420', options: { pattern: ['Düz', 'Rölyefli'] } },
            { name: 'Afyon Mermer Basamak', subcategory: 'Doğal Taş & Mermer', spec: 'Metretül', price: '₺950' },
            { name: 'Patlatma Doğal Taş', subcategory: 'Doğal Taş & Mermer', spec: 'm²', price: '₺850' },
            { name: 'Laminat Parke 8mm 32.Sınıf', subcategory: 'Ahşap Zemin', spec: 'm²', price: '₺380', options: { brand: ['Çamsan', 'AGT', 'Yıldız'] } },
            { name: 'Süpürgelik 10cm', subcategory: 'Ahşap Zemin', spec: 'Metretül', price: '₺65', options: { color: ['Beyaz', 'Antrasit', 'Ahşap'] } }
        ]
    },
    {
        id: '5',
        title: 'BOYA & KİMYASAL',
        subtitle: 'Boya, Yapıştırıcı, Silikon',
        icon: 'format-paint',
        image: require('../../assets/market/boya_kimyasal.png'),
        subcategories: [
            { id: '5.1', name: 'Boyalar', icon: 'bucket-outline' },
            { id: '5.2', name: 'Yapıştırıcılar', icon: 'sticker-plus-outline' },
            { id: '5.3', name: 'Teknik Kimyasallar', icon: 'bottle-tonic-plus' }
        ],
        items: [
            { name: 'Silikonlu İç Cephe Boyası', subcategory: 'Boyalar', spec: '15Lt', price: '₺2.200', options: { brand: ['Marshall', 'Filli', 'Jotun'] } },
            { name: 'Dış Cephe Grenli Boya', subcategory: 'Boyalar', spec: '20kg', price: '₺2.400' },
            { name: 'Seramik Yapıştırıcısı C2TE', subcategory: 'Yapıştırıcılar', spec: '25kg', price: '₺250', options: { brand: ['Kalekim', 'Weber', 'Yurtbay'] } },
            { name: 'Poliüretan Köpük', subcategory: 'Teknik Kimyasallar', spec: 'Adet', price: '₺120' },
            { name: 'Şeffaf Silikon', subcategory: 'Teknik Kimyasallar', spec: 'Adet', price: '₺85' }
        ]
    },
    {
        id: '6',
        title: 'SIHHİ TESİSAT',
        subtitle: 'Boru, Vitrifiye, Batarya',
        icon: 'water',
        image: require('../../assets/market/sihhi_tesisat.png'),
        subcategories: [
            { id: '6.1', name: 'Altyapı (Boru Grubu)', icon: 'pipe' },
            { id: '6.2', name: 'Vitrifiye & Banyo', icon: 'toilet' },
            { id: '6.3', name: 'Armatürler', icon: 'water-pump' }
        ],
        items: [
            { name: 'PPRC Temiz Su Borusu Ø20', subcategory: 'Altyapı (Boru Grubu)', spec: '4m Boy', price: '₺45' },
            { name: '100\'lük Pimaş Boru', subcategory: 'Altyapı (Boru Grubu)', spec: '3m Boy', price: '₺150', options: { type: ['3.2mm', '2.2mm'] } },
            { name: 'Asma Klozet Seti', subcategory: 'Vitrifiye & Banyo', spec: 'Takım', price: '₺4.500', options: { brand: ['Vitra', 'Serel', 'Kale'] } },
            { name: 'Gömme Rezervuar', subcategory: 'Vitrifiye & Banyo', spec: 'Set', price: '₺2.200' },
            { name: 'Lavabo Bataryası', subcategory: 'Armatürler', spec: 'Adet', price: '₺1.200', options: { brand: ['Artema', 'ECA', 'GPD'] } },
            { name: 'Krom Banyo Bataryası', subcategory: 'Armatürler', spec: 'Adet', price: '₺1.600' }
        ]
    },
    {
        id: '7',
        title: 'ISITMA & DOĞALGAZ',
        subtitle: 'Kombi, Radyatör, Klima',
        icon: 'radiator',
        image: require('../../assets/market/isitma_dogalgaz.png'),
        subcategories: [
            { id: '7.1', name: 'Isıtma Sistemleri', icon: 'fire' },
            { id: '7.2', name: 'Doğalgaz Tesisatı', icon: 'gas-cylinder' },
            { id: '7.3', name: 'İklimlendirme', icon: 'air-conditioner' }
        ],
        items: [
            { name: 'Tam Yoğuşmalı Kombi 24kW', subcategory: 'Isıtma Sistemleri', spec: 'Adet', price: '₺22.000', options: { brand: ['Vaillant', 'DemirDöküm', 'ECA'] } },
            { name: 'Panel Radyatör 600x1200', subcategory: 'Isıtma Sistemleri', spec: 'Adet', price: '₺3.200', options: { type: ['22 Tip (PKKP)'] } },
            { name: 'Yerden Isıtma Borusu PEX-b', subcategory: 'Isıtma Sistemleri', spec: 'Top (160m)', price: '₺4.500' },
            { name: 'Doğalgaz Flex 1/2"', subcategory: 'Doğalgaz Tesisatı', spec: 'Adet', price: '₺120' },
            { name: 'Bakır Klima Borusu', subcategory: 'İklimlendirme', spec: 'Metre', price: '₺450' }
        ]
    },
    {
        id: '8',
        title: 'ELEKTRİK & AKILLI EV',
        subtitle: 'Kablo, Priz, Aydınlatma',
        icon: 'lightning-bolt',
        image: require('../../assets/market/elektrik.png'),
        subcategories: [
            { id: '8.1', name: 'Altyapı Kablo & Boru', icon: 'cable-data' },
            { id: '8.2', name: 'Anahtar & Priz', icon: 'power-socket-eu' },
            { id: '8.3', name: 'Aydınlatma', icon: 'lightbulb-on' },
            { id: '8.4', name: 'Zayıf Akım & Güvenlik', icon: 'cctv' }
        ],
        items: [
            { name: 'NYM (Antigron) Kablo 3x2.5', subcategory: 'Altyapı Kablo & Boru', spec: '100m Top', price: '₺3.800', options: { brand: ['Öznur', 'Hes', 'Siemens'] } },
            { name: 'W Otomat Sigorta B16', subcategory: 'Altyapı Kablo & Boru', spec: 'Adet', price: '₺120', options: { brand: ['Siemens', 'Schneider', 'Legrand'] } },
            { name: 'Topraklı Priz', subcategory: 'Anahtar & Priz', spec: 'Adet', price: '₺85', options: { color: ['Beyaz', 'Antrasit', 'Ahşap'] } },
            { name: 'LED Panel 60x60 (Sıva Altı)', subcategory: 'Aydınlatma', spec: 'Adet', price: '₺450' },
            { name: 'Akıllı Anahtar Modülü (WiFi)', subcategory: 'Zayıf Akım & Güvenlik', spec: 'Adet', price: '₺850' },
            { name: 'Görüntülü Diyafon Seti', subcategory: 'Zayıf Akım & Güvenlik', spec: 'Daire Başı', price: '₺3.500' }
        ]
    },
    {
        id: '9',
        title: 'HIRDAVAT & NALBURİYE',
        subtitle: 'El Aletleri, Vida, Bağlantı',
        icon: 'tools',
        image: require('../../assets/market/hirdavat.png'),
        subcategories: [
            { id: '9.1', name: 'Elektrikli El Aletleri', icon: 'drill' }, // Proxy for power tool
            { id: '9.2', name: 'Manuel El Aletleri', icon: 'hammer' },
            { id: '9.3', name: 'Bağlantı Elemanları', icon: 'screw-flat-top' },
            { id: '9.4', name: 'Mobilya Aksesuarları', icon: 'handle' } // Proxy for handle
        ],
        items: [
            { name: 'Şarjlı Vidalama Seti 18V', subcategory: 'Elektrikli El Aletleri', spec: 'Set', price: '₺4.500', options: { brand: ['Bosch', 'Makita', 'Dewalt'] } },
            { name: 'Kırıcı-Delici Hilti 3kg', subcategory: 'Elektrikli El Aletleri', spec: 'Adet', price: '₺6.200' },
            { name: 'Profesyonel Pense', subcategory: 'Manuel El Aletleri', spec: 'Adet', price: '₺350', options: { brand: ['İzeltaş', 'Knipex'] } },
            { name: 'Sunta Vidası 4x50', subcategory: 'Bağlantı Elemanları', spec: 'Kutu (500)', price: '₺180' },
            { name: 'Frenli Menteşe', subcategory: 'Mobilya Aksesuarları', spec: 'Adet', price: '₺45' }
        ]
    },
    {
        id: '10',
        title: 'KAPI & PENCERE',
        subtitle: 'Çelik Kapı, PVC, Doğrama',
        icon: 'door',
        image: require('../../assets/market/kapi_pencere.png'),
        subcategories: [
            { id: '10.1', name: 'Kapılar', icon: 'door-closed' },
            { id: '10.2', name: 'Pencere & Aksesuar', icon: 'window-closed-variant' },
            { id: '10.3', name: 'Merdivenler', icon: 'stairs' }
        ],
        items: [
            { name: 'Çelik Kapı (Lüks)', subcategory: 'Kapılar', spec: 'Adet', price: '₺12.000', options: { type: ['Ahşap Kaplama', 'Kompozit'] } },
            { name: 'Amerikan Panel Kapı', subcategory: 'Kapılar', spec: 'Adet', price: '₺2.800' },
            { name: 'PVC Pencere Kolu', subcategory: 'Pencere & Aksesuar', spec: 'Adet', price: '₺85' },
            { name: 'Sineklik Pileli', subcategory: 'Pencere & Aksesuar', spec: 'm²', price: '₺650' },
            { name: 'Alüminyum Akrobat Merdiven', subcategory: 'Merdivenler', spec: '4x4', price: '₺3.200' }
        ]
    },
    {
        id: '11',
        title: 'İŞ GÜVENLİĞİ & SAHA',
        subtitle: 'Baret, Yelek, El Arabası',
        icon: 'hard-hat',
        image: require('../../assets/market/is_guvenligi.png'),
        subcategories: [
            { id: '11.1', name: 'Kişisel Koruyucu (KKD)', icon: 'account-hard-hat' },
            { id: '11.2', name: 'Saha Ekipmanı', icon: 'cone' }
        ],
        items: [
            { name: 'Mühendis Bareti (Beyaz)', subcategory: 'Kişisel Koruyucu (KKD)', spec: 'Adet', price: '₺250', options: { brand: ['3M', 'Uvex'] } },
            { name: 'Çelik Burunlu İş Ayakkabısı', subcategory: 'Kişisel Koruyucu (KKD)', spec: 'Çift', price: '₺850', options: { size: ['41', '42', '43', '44'] } },
            { name: 'İnşaat El Arabası (Kalın Sac)', subcategory: 'Saha Ekipmanı', spec: 'Adet', price: '₺1.400' },
            { name: 'İnşaat Filesi (Güvenlik Ağı)', subcategory: 'Saha Ekipmanı', spec: 'm²', price: '₺45' }
        ]
    },
    {
        id: '12',
        title: 'PEYZAJ & BAHÇE',
        subtitle: 'Kilit Taşı, Çit, Sulama',
        icon: 'pine-tree',
        image: require('../../assets/market/peyzaj_bahce.png'),
        subcategories: [
            { id: '12.1', name: 'Zemin Düzenleme', icon: 'road-variant' },
            { id: '12.2', name: 'Bahçe Ekipmanı', icon: 'sprinkler' }, // proxy
            { id: '12.3', name: 'Çit Sistemleri', icon: 'gate' }
        ],
        items: [
            { name: 'Kilit Parke Taşı (8cm)', subcategory: 'Zemin Düzenleme', spec: 'm²', price: '₺180', options: { color: ['Gri', 'Kırmızı'] } },
            { name: 'Bahçe Bordürü', subcategory: 'Zemin Düzenleme', spec: 'Adet', price: '₺45' },
            { name: 'Hortum Makarası Seti', subcategory: 'Bahçe Ekipmanı', spec: 'Set', price: '₺1.200' },
            { name: 'Panel Çit 150x250', subcategory: 'Çit Sistemleri', spec: 'Adet', price: '₺650' }
        ]
    }
];

export default function MarketScreen() { // Force Refresh
    const navigation = useNavigation();
    const route = useRoute();

    // Navigation State (Native Stack derived)
    const viewMode = route.params?.viewMode || 'list';
    const selectedCategory = route.params?.category || null;

    // SubCategory is stateful because chips in Detail view allow switching it
    const [selectedSubCategory, setSelectedSubCategory] = useState(route.params?.subCategory || null);

    const [expandedItemIndex, setExpandedItemIndex] = useState(null); // NEW: Track expanded item
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({}); // New: Track selections for expanded item

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
    const handleRfq = () => navigation.navigate('BulkRequest');

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
                        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('MarketProvider')}>
                            <MaterialCommunityIcons name="storefront-outline" size={24} color="#D4AF37" />
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
                                    {MARKET_SHOWCASE.map((item) => (
                                        <View key={item.id} style={styles.heroCard}>
                                            <View style={styles.heroImage}>
                                                <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} />
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
                                {MARKET_CATEGORIES.map((cat) => (
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
                                            <Image source={cat.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} />


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
                                        <View style={styles.listIconContainer}>
                                            <MaterialCommunityIcons name={sub.icon} size={24} color="#D4AF37" />
                                        </View>
                                        <View style={styles.listContent}>
                                            <Text style={styles.listTitle}>{sub.name}</Text>
                                            <Text style={styles.listSubtitle}>
                                                {selectedCategory.items.filter(item => item.subcategory === sub.name).length} Ürün Mevcut
                                            </Text>
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
