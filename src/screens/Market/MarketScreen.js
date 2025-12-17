import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

// 15 KATEGORİLİ DEV MARKET YAPISI
const MARKET_CATEGORIES = [
    {
        id: '1',
        title: 'KABA İNŞAAT VE YAPI ELEMANLARI',
        subtitle: 'Çimento, Demir, Tuğla',
        icon: 'wall',
        items: [
            { name: 'Gri Portland Çimento', spec: '50 Kg Torba', price: '₺180' },
            { name: 'Beyaz Çimento', spec: '25 Kg Torba', price: '₺220' },
            { name: 'Sönmüş Kireç', spec: 'Torba', price: '₺90' },
            { name: 'İnşaat Demiri Ø8', spec: 'Ton', price: '₺24.500' },
            { name: 'İnşaat Demiri Ø12-Ø32', spec: 'Ton', price: '₺24.000' },
            { name: 'Çelik Hasır', spec: 'Adet', price: '₺1.200' },
            { name: 'Kutu Profil', spec: '6m Boy', price: '₺850' },
            { name: 'Yığma Tuğla', spec: 'Adet', price: '₺8.50' },
            { name: 'Gazbeton (Ytong)', spec: 'Adet', price: '₺65' },
            { name: 'Sıva Kumu', spec: 'Ton', price: '₺450' },
            { name: 'Mıcır', spec: 'Ton', price: '₺400' },
        ]
    },
    {
        id: '2',
        title: 'YAPI KİMYASALLARI VE GÜÇLENDİRME',
        subtitle: 'Tamir, Ankraj, Zemin',
        icon: 'flask',
        items: [
            { name: 'Karbon Elyaf (FRP)', spec: 'm²', price: '€45' },
            { name: 'Epoksi Ankraj Kartuşu', spec: '345ml', price: '₺450' },
            { name: 'Grout Harcı', spec: '25 Kg', price: '₺320' },
            { name: 'Yapısal Tamir Harcı', spec: '25 Kg', price: '₺280' },
            { name: 'Seramik Yapıştırıcı (C2)', spec: '25 Kg', price: '₺180' },
            { name: 'Yüzey Sertleştirici', spec: '25 Kg', price: '₺150' },
            { name: 'Self-Leveling Şap', spec: '25 Kg', price: '₺600' },
        ]
    },
    {
        id: '3',
        title: 'İZOLASYON VE SU YALITIMI',
        subtitle: 'Mantolama, Membran',
        icon: 'shield-home',
        items: [
            { name: 'Bitüm Sürme Yalıtım', spec: 'Teneke (18kg)', price: '₺1.200' },
            { name: 'Arduvazlı Membran', spec: 'Top (10m²)', price: '₺850' },
            { name: 'XPS Köpük (Mavi)', spec: 'Paket', price: '₺1.100' },
            { name: 'Taşyünü Levha', spec: 'Paket', price: '₺950' },
            { name: 'Mantolama Paketi', spec: 'm²', price: '₺450' },
            { name: 'Su Tutucu Bant', spec: 'Metre', price: '₺120' },
        ]
    },
    {
        id: '4',
        title: 'KALIP, İSKELE VE ŞANTİYE',
        subtitle: 'Plywood, Güvenlik',
        icon: 'scaffold-tower', // Using custom icon name if available or generic
        items: [
            { name: 'Plywood (Huş)', spec: 'Plaka', price: '₺2.800' },
            { name: 'OSB-3 Levha', spec: 'Plaka', price: '₺450' },
            { name: 'Kalıp Yağı', spec: '30 Lt', price: '₺900' },
            { name: 'Tayrot Mili', spec: 'Adet', price: '₺150' },
            { name: 'H Tipi İskele', spec: 'm²', price: 'Teklif Al' },
            { name: 'İnşaat Bareti', spec: 'Adet', price: '₺85' },
            { name: 'Çelik Burunlu Ayakkabı', spec: 'Çift', price: '₺650' },
        ]
    },
    {
        id: '5',
        title: 'ÇATI VE DIŞ CEPHE',
        subtitle: 'Kiremit, Oluk, Siding',
        icon: 'home-roof',
        items: [
            { name: 'Kiremit (Marsilya)', spec: 'Adet', price: '₺22' },
            { name: 'Shingle', spec: 'Paket', price: '₺1.400' },
            { name: 'Sandviç Panel', spec: 'm²', price: '₺850' },
            { name: 'PVC Yağmur Oluğu', spec: '4m Boy', price: '₺180' },
            { name: 'Fibercement Levha', spec: 'Plaka', price: '₺750' },
        ]
    },
    {
        id: '6',
        title: 'TESİSAT VE MEKANİK',
        subtitle: 'Boru, Kombi, Vana',
        icon: 'pipe',
        items: [
            { name: 'PPRC Boru (20mm)', spec: '4m Boy', price: '₺65' },
            { name: 'Pimaş Boru (100mm)', spec: '3m Boy', price: '₺150' },
            { name: 'Yoğuşmalı Kombi', spec: 'Adet', price: '₺24.000' },
            { name: 'Panel Radyatör (600x1000)', spec: 'Adet', price: '₺2.200' },
            { name: 'Küresel Vana (1")', spec: 'Adet', price: '₺250' },
        ]
    },
    {
        id: '7',
        title: 'ELEKTRİK VE AYDINLATMA',
        subtitle: 'Kablo, Pano, LED',
        icon: 'lightning-bolt',
        items: [
            { name: 'Antigron Kablo 3x2.5', spec: '100m Top', price: '₺3.500' },
            { name: 'Otomatik Sigorta', spec: 'Adet', price: '₺120' },
            { name: 'Kaçak Akım Rölesi', spec: 'Adet', price: '₺850' },
            { name: 'Sıva Altı Priz', spec: 'Adet', price: '₺65' },
            { name: 'LED Ampul (10W)', spec: 'Adet', price: '₺45' },
            { name: 'Şerit LED', spec: '5m', price: '₺150' },
        ]
    },
    {
        id: '8',
        title: 'AKILLI EV VE TEKNOLOJİ',
        subtitle: 'Kamera, Alarm, Otomasyon',
        icon: 'home-automation', // or 'cctv'
        items: [
            { name: 'Akıllı Kapı Kilidi', spec: 'Adet', price: '₺4.500' },
            { name: 'IP Kamera Seti (4\'lü)', spec: 'Set', price: '₺8.500' },
            { name: 'Görüntülü Diyafon', spec: 'Adet', price: '₺3.200' },
            { name: 'Akıllı Termostat', spec: 'Adet', price: '₺2.800' },
        ]
    },
    {
        id: '9',
        title: 'KURU YAPI VE BOYA',
        subtitle: 'Alçıpan, Astar, Boya',
        icon: 'format-paint',
        items: [
            { name: 'Beyaz Alçıpan', spec: 'Plaka', price: '₺140' },
            { name: 'Yeşil Alçıpan (Suya D.)', spec: 'Plaka', price: '₺165' },
            { name: 'Tavan U Profili', spec: '3m', price: '₺45' },
            { name: 'İç Cephe Boyası', spec: '15 Lt', price: '₺1.800' },
            { name: 'Saten Alçı', spec: 'Torba', price: '₺140' },
        ]
    },
    {
        id: '10',
        title: 'ZEMİN VE DUVAR KAPLAMALARI',
        subtitle: 'Parke, Seramik, Mermer',
        icon: 'floor-plan',
        items: [
            { name: 'Laminat Parke 8mm', spec: 'm²', price: '₺320' },
            { name: 'Granit Seramik 60x120', spec: 'm²', price: '₺450' },
            { name: 'Duvar Seramiği', spec: 'm²', price: '₺280' },
            { name: 'Derz Dolgu', spec: '20 Kg', price: '₺220' },
        ]
    },
    {
        id: '11',
        title: 'HIRDAVAT VE EL ALETLERİ',
        subtitle: 'Matkap, Vida, Dübel',
        icon: 'hammer',
        items: [
            { name: 'Kırıcı-Delici Matkap', spec: 'Pro', price: '₺4.500' },
            { name: 'Avuç Taşlama', spec: '115mm', price: '₺2.200' },
            { name: 'Akülü Vidalama', spec: '18V', price: '₺3.800' },
            { name: 'Sunta Vidası Kutusu', spec: '1000 Adet', price: '₺350' },
            { name: 'Silikon Tabancası', spec: 'Adet', price: '₺85' },
        ]
    },
    {
        id: '12',
        title: 'KAPI, PENCERE VE DOĞRAMA',
        subtitle: 'Çelik Kapı, PVC',
        icon: 'door',
        items: [
            { name: 'Çelik Kapı (Lüks)', spec: 'Adet', price: '₺12.000' },
            { name: 'Amerikan Panel Kapı', spec: 'Adet', price: '₺2.400' },
            { name: 'PVC Pencere (120x120)', spec: 'Adet', price: '₺3.500' },
            { name: 'Kapı Kolu (Rozetli)', spec: 'Takım', price: '₺250' },
        ]
    },
    {
        id: '13',
        title: 'MUTFAK, BANYO VE VİTRİFİYE',
        subtitle: 'Klozet, Batarya, Dolap',
        icon: 'toilet',
        items: [
            { name: 'Asma Klozet Seti', spec: 'Tam Takım', price: '₺4.500' },
            { name: 'Banyo Dolabı (80cm)', spec: 'Alt+Üst', price: '₺3.800' },
            { name: 'Mutfak Bataryası', spec: 'Krom', price: '₺1.200' },
            { name: 'Duşakabin (90x90)', spec: 'Temperli', price: '₺3.200' },
        ]
    },
    {
        id: '14',
        title: 'PEYZAJ, HAVUZ VE ÇEVRE',
        subtitle: 'Kilit Taşı, Çit, Havuz',
        icon: 'flower',
        items: [
            { name: 'Kilit Parke Taşı', spec: 'm²', price: '₺180' },
            { name: 'Panel Çit', spec: 'm²', price: '₺320' },
            { name: 'Havuz Pompası', spec: '1.5 HP', price: '₺8.500' },
            { name: 'Klor (Tablet)', spec: '10 Kg', price: '₺1.400' },
        ]
    },
    {
        id: '15',
        title: 'ENERJİ SİSTEMLERİ',
        subtitle: 'Solar Panel, Jeneratör',
        icon: 'solar-power',
        items: [
            { name: 'Monokristal Solar Panel', spec: '450W', price: '$140' },
            { name: 'Solar İnverter', spec: '5KW', price: '₺22.000' },
            { name: 'Benzinli Jeneratör', spec: '3.5 kVA', price: '₺12.000' },
            { name: 'Kesintisiz Güç (UPS)', spec: '1 kVA', price: '₺3.500' },
        ]
    },
];

// --- CITY & DISTRICT DATA ---
const CITY_DATA = {
    'İstanbul': ['Tümü', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
    'Ankara': ['Tümü', 'Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
    'İzmir': ['Tümü', 'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
    'Kastamonu': ['Tümü', 'Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya']
};

// --- MOCK FIRM DATA ---
const FIRM_DATA = [
    { id: '1', name: 'Demir Dünyası A.Ş.', rating: '4.8', deals: '12 Kampanya', city: 'İstanbul', district: 'Ataşehir', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200' },
    { id: '2', name: 'Beton & Yapı Market', rating: '4.5', deals: 'Ücretsiz Nakliye', city: 'Ankara', district: 'Yenimahalle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200' },
    { id: '3', name: 'Çelik Kardeşler', rating: '4.9', deals: '%5 İndirim', city: 'İzmir', district: 'Bornova', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=200' },
    { id: '4', name: 'Yıldız Hafriyat', rating: '4.7', deals: 'Hızlı Teslimat', city: 'İstanbul', district: 'Pendik', image: 'https://images.unsplash.com/photo-1590483005817-7159518a41df?q=80&w=200' },
    { id: '5', name: 'Kastamonu Kereste', rating: '4.6', deals: 'Toptan Satış', city: 'Kastamonu', district: 'Merkez', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200' },
];

export default function MarketScreen() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedFirm, setSelectedFirm] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'firms', 'firmDetail'
    const [activeTab, setActiveTab] = useState('market'); // 'market' or 'request'

    // Filter State
    const [selectedCity, setSelectedCity] = useState('İstanbul');
    const [selectedDistrict, setSelectedDistrict] = useState('Tümü');
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionType, setSelectionType] = useState('city'); // 'city' or 'district'
    const [selectionOptions, setSelectionOptions] = useState([]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const handleFirmSelect = (firm) => {
        setSelectedFirm(firm);
        setViewMode('firmDetail');
    };

    const handleAddToCart = (item) => {
        Alert.alert("Sepete Eklendi", `${item.name} (${item.spec}) sepete eklendi.`);
    };

    const handleSortByLocation = () => {
        Alert.alert("Sıralandı", "Firmalar konumuza göre en yakından uzağa sıralandı.");
    };

    // --- FILTER LOGIC ---
    const handleCityPress = () => {
        setSelectionOptions(Object.keys(CITY_DATA));
        setSelectionType('city');
        setSelectionModalVisible(true);
    };

    const handleDistrictPress = () => {
        if (CITY_DATA[selectedCity]) {
            setSelectionOptions(CITY_DATA[selectedCity]);
            setSelectionType('district');
            setSelectionModalVisible(true);
        } else {
            Alert.alert("Hata", "Lütfen önce geçerli bir il seçiniz.");
        }
    };

    const handleOptionSelect = (option) => {
        if (selectionType === 'city') {
            setSelectedCity(option);
            setSelectedDistrict('Tümü'); // Reset district when city changes
        } else {
            setSelectedDistrict(option);
        }
        setSelectionModalVisible(false);
    };

    // --- RFQ LOGIC ---
    const [rfqModalVisible, setRfqModalVisible] = useState(false);
    const [rfqTab, setRfqTab] = useState('text'); // 'manual', 'text', 'photo'
    const [rfqText, setRfqText] = useState('');

    // --- SELLER MODE LOGIC (NEW) ---
    const [isSellerMode, setIsSellerMode] = useState(false);
    const [addProductModalVisible, setAddProductModalVisible] = useState(false);
    const [categories, setCategories] = useState(MARKET_CATEGORIES); // State for dynamic updates
    const [newProduct, setNewProduct] = useState({ name: '', price: '', spec: '', categoryId: '' });

    // --- SEARCH LOGIC ---
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.length > 1) {
            const results = [];
            categories.forEach(cat => {
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

    const handleSendRFQ = () => {
        setRfqModalVisible(false);
        Alert.alert(
            "Talep Alındı! 🚀",
            "Malzeme listeniz operasyon ekibimize iletildi. En kısa sürede en iyi fiyatlarla teklifinizi hazırlayıp size döneceğiz."
        );
        setRfqText('');
    };

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
            Alert.alert("Eksik Bilgi", "Lütfen ürün adı, fiyatı ve kategorisini giriniz.");
            return;
        }

        const updatedCategories = categories.map(cat => {
            if (cat.id === newProduct.categoryId) {
                return {
                    ...cat,
                    items: [{ name: newProduct.name, spec: newProduct.spec || 'Standart', price: `₺${newProduct.price}`, isSellerItem: true }, ...cat.items]
                };
            }
            return cat;
        });

        setCategories(updatedCategories);
        setAddProductModalVisible(false);
        setNewProduct({ name: '', price: '', spec: '', categoryId: '' });
        Alert.alert("Başarılı", "Ürününüz pazara eklendi ve müşterilere görünür hale geldi.");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    {viewMode !== 'list' ? (
                        <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.backButton,
                                {
                                    width: 50, height: 50, borderRadius: 14,
                                    backgroundColor: isSellerMode ? '#1e3a8a' : '#3b5998', // Active: Dark Blue, Inactive: Light Navy
                                    alignItems: 'center', justifyContent: 'center',
                                    borderWidth: isSellerMode ? 1 : 0, borderColor: '#4ADE80'
                                }
                            ]}
                            onPress={() => setIsSellerMode(!isSellerMode)}
                        >
                            <MaterialCommunityIcons
                                name={isSellerMode ? "store-check" : "store-cog"}
                                size={28}
                                color={isSellerMode ? "#4ADE80" : "#fff"}
                            />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.headerTitle}>
                        {viewMode === 'list' ? (isSellerMode ? 'MAĞAZA YÖNETİMİ' : 'İNŞAAT MARKET') :
                            viewMode === 'firms' ? 'TEDARİKÇİ FİRMALAR' :
                                selectedCategory?.title.split(' ')[0] + '...'}
                    </Text>

                    <TouchableOpacity style={styles.cartButton} onPress={() => Alert.alert("Sepetim", "Sepetinizde 3 ürün var.")}>
                        <Ionicons name="cart" size={24} color="#FFD700" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Seller Banner */}
                {isSellerMode && (
                    <View style={styles.sellerBanner}>
                        <Text style={styles.sellerBannerText}>SATICI MODU AKTİF</Text>
                        <TouchableOpacity style={styles.addProductBtn} onPress={() => setAddProductModalVisible(true)}>
                            <Ionicons name="add-circle" size={18} color="#000" />
                            <Text style={styles.addProductText}>ÜRÜN EKLE</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* TOP NAVIGATION BUTTONS (New Feature) */}
                    {/* TOP NAVIGATION TABS */}
                    {(viewMode === 'list' || viewMode === 'firms') && (
                        <View style={styles.topNavContainer}>
                            {/* Left Tab: Ürün Kataloğu */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topNavBtnLeft}
                                onPress={() => { setActiveTab('market'); setViewMode('list'); }}
                            >
                                <LinearGradient
                                    colors={activeTab === 'market' ? ['#FFD700', '#FFC000'] : ['#1E1E1E', '#111']}
                                    style={activeTab === 'market' ? styles.topNavGradient : styles.topNavGradientDark}
                                >
                                    {activeTab === 'market' ? (
                                        <>
                                            <View style={styles.topNavIconBoxBlack}>
                                                <MaterialCommunityIcons name="domain" size={24} color="#FFD700" />
                                            </View>
                                            <Text style={styles.topNavTitleBlack}>ÜRÜN{'\n'}KATALOĞU</Text>
                                            <Ionicons name="arrow-forward-circle" size={24} color="#000" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }} />
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.topNavIconBoxGold}>
                                                <MaterialCommunityIcons name="domain" size={24} color="#000" />
                                            </View>
                                            <Text style={styles.topNavTitleGold}>ÜRÜN{'\n'}KATALOĞU</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Right Tab: Toplu Malzeme Talebi */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topNavBtnRight}
                                onPress={() => setActiveTab('request')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'request' ? ['#FFD700', '#FFC000'] : ['#1E1E1E', '#111']}
                                    style={activeTab === 'request' ? styles.topNavGradient : styles.topNavGradientDark}
                                >
                                    {activeTab === 'request' ? (
                                        <>
                                            <View style={styles.topNavIconBoxBlack}>
                                                <MaterialCommunityIcons name="clipboard-list" size={24} color="#FFD700" />
                                            </View>
                                            <Text style={styles.topNavTitleBlack}>TOPLU MALZEME{'\n'}TALEBİ{'\n'}(Liste Oluştur)</Text>
                                            <Ionicons name="arrow-down-circle" size={24} color="#000" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }} />
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.topNavIconBoxGold}>
                                                <MaterialCommunityIcons name="clipboard-list" size={24} color="#000" />
                                            </View>
                                            <Text style={styles.topNavTitleGold}>TOPLU MALZEME{'\n'}TALEBİ{'\n'}(Liste Oluştur)</Text>
                                            <View style={[styles.projeTag, { backgroundColor: '#FFD700' }]}>
                                                <Text style={[styles.projeTagText, { color: '#000' }]}>TEKLİF AL</Text>
                                            </View>
                                        </>
                                    )}
                                </LinearGradient>
                                {activeTab !== 'request' && <View style={styles.glowBorder} pointerEvents="none" />}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* MARKET LIST VIEW (Categories) */}
                    {activeTab === 'market' && viewMode === 'list' && (
                        <View style={styles.listContainer}>

                            {/* DETAYLI MALZEME ARAMA BUTTON REMOVED */}

                            {/* NEW: Filter/Sort Design in Main View */}
                            <View style={{ marginBottom: 20 }}>
                                {/* FİRMA BAZLI ARAMA BUTTON (Replaces Sort By Location) */}
                                <TouchableOpacity
                                    style={styles.sortButton}
                                    activeOpacity={0.8}
                                    onPress={() => setViewMode('firms')}
                                >
                                    <LinearGradient
                                        colors={['#FFD700', '#FFC000']}
                                        style={styles.sortButtonGradient}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    >
                                        <MaterialCommunityIcons name="domain" size={20} color="#000" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>FİRMA BAZLI ARAMA</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.cardContainer}
                                    onPress={() => handleCategorySelect(cat)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#1E1E1E', '#111']}
                                        style={styles.cardGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.iconCircle}>
                                            <MaterialCommunityIcons name={cat.icon} size={32} color="#FFD700" />
                                        </View>

                                        <View style={styles.textContainer}>
                                            <Text style={styles.cardTitle}>{cat.title}</Text>
                                            <Text style={styles.cardSubtitle}>
                                                {cat.subtitle} • {cat.items.length} Ürün
                                            </Text>
                                        </View>

                                        <View style={styles.arrowBox}>
                                            <Ionicons name="chevron-forward" size={18} color="#444" />
                                        </View>
                                    </LinearGradient>
                                    {/* Gold Glow Border */}
                                    <View style={styles.glowBorder} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* INLINE REQUEST FORM (Tab Content) */}
                    {activeTab === 'request' && (
                        <View style={{ paddingHorizontal: 0, paddingVertical: 10 }}>
                            {/* Tabs */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'text' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('text')}
                                >
                                    <MaterialCommunityIcons name="text-box-outline" size={20} color={rfqTab === 'text' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'text' && styles.activeTabText]}>Yazarak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'photo' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('photo')}
                                >
                                    <MaterialCommunityIcons name="camera-outline" size={20} color={rfqTab === 'photo' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'photo' && styles.activeTabText]}>Fotoğraf</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'manual' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('manual')}
                                >
                                    <MaterialCommunityIcons name="playlist-plus" size={20} color={rfqTab === 'manual' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'manual' && styles.activeTabText]}>Manuel</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                {rfqTab === 'text' && (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>İhtiyaçlarınızı WhatsApp'tan yazar gibi yazın:</Text>
                                        <TextInput
                                            style={styles.textArea}
                                            multiline
                                            placeholder="Örn: 10 ton Q16 demir, 50 torba çimento, 1000 adet 11mm OSB..."
                                            placeholderTextColor="#555"
                                            value={rfqText}
                                            onChangeText={setRfqText}
                                        />
                                    </View>
                                )}
                                {rfqTab === 'photo' && (
                                    <View style={styles.photoUploadContainer}>
                                        <View style={styles.photoPlaceholder}>
                                            <MaterialCommunityIcons name="cloud-upload" size={48} color="#FFD700" />
                                            <Text style={styles.photoText}>Kağıt listenin fotoğrafını çekin veya yükleyin</Text>
                                        </View>
                                        <TouchableOpacity style={styles.cameraBtn}>
                                            <Text style={styles.cameraBtnText}>KAMERA / GALERİ</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {rfqTab === 'manual' && (
                                    <View style={styles.manualContainer}>
                                        <Text style={styles.manualInfo}>
                                            Detaylı arama ve liste oluşturma modülü yapım aşamasında.
                                            Lütfen şimdilik "Yazarak" sekmesini kullanın.
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Footer Action */}
                            <TouchableOpacity style={[styles.submitRfqBtn, { marginTop: 20 }]} onPress={handleSendRFQ}>
                                <Text style={styles.submitRfqText}>TEKLİF İSTE</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* FIRMS LIST VIEW */}
                    {activeTab === 'market' && viewMode === 'firms' && (
                        <View style={styles.listContainer}>

                            {/* FIRM FILTERS (City/District + Sort) */}
                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                                    {/* City Selector */}
                                    <TouchableOpacity
                                        style={styles.filterDropdown}
                                        activeOpacity={0.8}
                                        onPress={handleCityPress}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="location-sharp" size={16} color="#FFD700" style={{ marginRight: 6 }} />
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedCity}</Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={16} color="#888" />
                                    </TouchableOpacity>

                                    {/* District Selector */}
                                    <TouchableOpacity
                                        style={styles.filterDropdown}
                                        activeOpacity={0.8}
                                        onPress={handleDistrictPress}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedDistrict}</Text>
                                        <Ionicons name="chevron-down" size={16} color="#888" />
                                    </TouchableOpacity>
                                </View>

                                {/* BACK TO CATEGORIES BUTTON (Replaces Sort By Location) */}
                                <TouchableOpacity
                                    style={styles.sortButton}
                                    activeOpacity={0.8}
                                    onPress={() => setViewMode('list')}
                                >
                                    <LinearGradient
                                        colors={['#333', '#222']}
                                        style={styles.sortButtonGradient}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    >
                                        <Ionicons name="grid" size={20} color="#FFD700" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13 }}>KATEGORİLERE GERİ DÖN</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {FIRM_DATA.map((firm) => (
                                <TouchableOpacity
                                    key={firm.id}
                                    style={styles.firmCard}
                                    activeOpacity={0.7}
                                    onPress={() => handleFirmSelect(firm)}
                                >
                                    <LinearGradient
                                        colors={['#1E1E1E', '#111']}
                                        style={styles.firmCardGradient}
                                    >
                                        <View style={styles.firmIcon}>
                                            <MaterialCommunityIcons name="store" size={32} color="#FFD700" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.firmName}>{firm.name}</Text>

                                            {/* Location Info */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <Ionicons name="location-outline" size={14} color="#aaa" />
                                                <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 2 }}>{firm.city} / {firm.district}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                                <Ionicons name="star" size={14} color="#FFD700" />
                                                <Text style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>{firm.rating}</Text>
                                                <View style={{ backgroundColor: 'rgba(255,215,0,0.1)', marginLeft: 10, paddingHorizontal: 6, borderRadius: 4 }}>
                                                    <Text style={{ color: '#FFD700', fontSize: 10 }}>{firm.deals}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#666" />
                                    </LinearGradient>
                                    <View style={styles.glowBorder} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {viewMode === 'firmDetail' && selectedFirm && (
                        <View style={styles.detailContainer}>
                            {/* Firm Info Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                <View style={[styles.firmIcon, { width: 64, height: 64, borderRadius: 32 }]}>
                                    <MaterialCommunityIcons name="store" size={40} color="#FFD700" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{selectedFirm.name}</Text>
                                    <Text style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{selectedFirm.city} / {selectedFirm.district}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                        <Ionicons name="star" size={16} color="#FFD700" />
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold', marginLeft: 6 }}>{selectedFirm.rating}</Text>
                                        <Text style={{ color: '#666', marginLeft: 6 }}>(150+ Sipariş)</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.categoryHeader}>FİRMA ÜRÜNLERİ (Mock)</Text>

                            {/* Mock products for Firm Detail - using a few items from first category */}
                            {categories[0].items.slice(0, 4).map((item, idx) => (
                                <View key={idx}>
                                    <LinearGradient
                                        colors={['#1E1E1E', '#111']}
                                        style={styles.itemCard}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.itemInfo}>
                                            <View style={styles.itemIconBox}>
                                                <MaterialCommunityIcons name="tag" size={20} color="#FFD700" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemSpec}>{item.spec}</Text>
                                            </View>
                                            <Text style={styles.itemPrice}>{item.price}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.addBtn}
                                            onPress={() => handleAddToCart(item)}
                                        >
                                            <Text style={styles.addText}>SEPETE EKLE</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            ))}
                        </View>
                    )}

                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <Text style={styles.categoryHeader}>{selectedCategory.title}</Text>
                            {selectedCategory.items.map((item, idx) => (
                                <View key={idx}>
                                    <LinearGradient
                                        colors={['#1E1E1E', '#111']}
                                        style={styles.itemCard}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.itemInfo}>
                                            <View style={styles.itemIconBox}>
                                                <MaterialCommunityIcons name="tag" size={20} color="#FFD700" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemSpec}>{item.spec}</Text>
                                            </View>
                                            <Text style={styles.itemPrice}>{item.price}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.addBtn}
                                            onPress={() => handleAddToCart(item)}
                                        >
                                            <Text style={styles.addText}>SEPETE EKLE</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            ))}
                        </View>
                    )}

                </ScrollView>

                {/* SEARCH FAB (Replaces RFQ) */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 120,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        shadowColor: '#FFD700',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                        zIndex: 9999
                    }}
                    activeOpacity={0.8}
                    onPress={() => setSearchVisible(true)}
                >
                    <LinearGradient
                        colors={['#FFD700', '#FFC000']}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)'
                        }}
                    >
                        <Ionicons name="search" size={30} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* RFQ MODAL */}
                <Modal
                    visible={rfqModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setRfqModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>HIZLI MALZEME TALEBİ</Text>
                                <TouchableOpacity onPress={() => setRfqModalVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Tabs */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'text' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('text')}
                                >
                                    <MaterialCommunityIcons name="text-box-outline" size={20} color={rfqTab === 'text' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'text' && styles.activeTabText]}>Yazarak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'photo' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('photo')}
                                >
                                    <MaterialCommunityIcons name="camera-outline" size={20} color={rfqTab === 'photo' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'photo' && styles.activeTabText]}>Fotoğraf</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, rfqTab === 'manual' && styles.activeTabBtn]}
                                    onPress={() => setRfqTab('manual')}
                                >
                                    <MaterialCommunityIcons name="playlist-plus" size={20} color={rfqTab === 'manual' ? '#000' : '#888'} />
                                    <Text style={[styles.tabText, rfqTab === 'manual' && styles.activeTabText]}>Manuel</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Content based on Tab */}
                            <View style={styles.modalBody}>
                                {rfqTab === 'text' && (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>İhtiyaçlarınızı WhatsApp'tan yazar gibi yazın:</Text>
                                        <TextInput
                                            style={styles.textArea}
                                            multiline
                                            placeholder="Örn: 10 ton Q16 demir, 50 torba çimento, 1000 adet 11mm OSB..."
                                            placeholderTextColor="#555"
                                            value={rfqText}
                                            onChangeText={setRfqText}
                                        />
                                    </View>
                                )}

                                {rfqTab === 'photo' && (
                                    <View style={styles.photoUploadContainer}>
                                        <View style={styles.photoPlaceholder}>
                                            <MaterialCommunityIcons name="cloud-upload" size={48} color="#FFD700" />
                                            <Text style={styles.photoText}>Kağıt listenin fotoğrafını çekin veya yükleyin</Text>
                                        </View>
                                        <TouchableOpacity style={styles.cameraBtn}>
                                            <Text style={styles.cameraBtnText}>KAMERA / GALERİ</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {rfqTab === 'manual' && (
                                    <View style={styles.manualContainer}>
                                        <Text style={styles.manualInfo}>
                                            Detaylı arama ve liste oluşturma modülü yapım aşamasında.
                                            Lütfen şimdilik "Yazarak" sekmesini kullanın.
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Footer Action */}
                            <TouchableOpacity style={styles.submitRfqBtn} onPress={handleSendRFQ}>
                                <Text style={styles.submitRfqText}>TEKLİF İSTE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* SELECTION MODAL */}
                <Modal
                    visible={selectionModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setSelectionModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {selectionType === 'city' ? 'Şehir Seçiniz' : 'İlçe Seçiniz'}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectionModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectionOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={{
                                            paddingVertical: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#333',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onPress={() => handleOptionSelect(option)}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16 }}>{option}</Text>
                                        {(selectionType === 'city' ? selectedCity === option : selectedDistrict === option) && (
                                            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* SEARCH MODAL */}
                <Modal
                    visible={searchVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setSearchVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Malzeme Ara</Text>
                                <TouchableOpacity onPress={() => setSearchVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 10, padding: 10, marginBottom: 15 }}>
                                <Ionicons name="search" size={20} color="#FFD700" style={{ marginRight: 10 }} />
                                <TextInput
                                    style={{ flex: 1, color: '#fff', fontSize: 16 }}
                                    placeholder="Malzeme adı veya kategori..."
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

                            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                                {searchResults.length === 0 && searchQuery.length > 1 && (
                                    <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>Sonuç bulunamadı.</Text>
                                )}
                                {searchResults.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 12, marginBottom: 10, borderRadius: 12 }}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setSearchVisible(false);
                                            handleAddToCart(item);
                                        }}
                                    >
                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                            <MaterialCommunityIcons name={item.categoryIcon || 'tag'} size={24} color="#FFD700" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                                            <Text style={{ color: '#888', fontSize: 12 }}>{item.categoryTitle} • {item.spec}</Text>
                                        </View>
                                        <View style={{ padding: 8, backgroundColor: '#FFD700', borderRadius: 8 }}>
                                            <Ionicons name="cart" size={20} color="#000" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* ADD PRODUCT MODAL (SELLER) */}
                <Modal
                    visible={addProductModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddProductModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>YENİ ÜRÜN EKLE</Text>
                                <TouchableOpacity onPress={() => setAddProductModalVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 20 }}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Kategori Seçin</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {categories.map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[styles.categoryChip, newProduct.categoryId === cat.id && styles.categoryChipActive]}
                                                onPress={() => setNewProduct({ ...newProduct, categoryId: cat.id })}
                                            >
                                                <Text style={[styles.categoryChipText, newProduct.categoryId === cat.id && styles.categoryChipTextActive]}>{cat.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ürün Adı</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: 50kg Portland Çimento"
                                        placeholderTextColor="#666"
                                        value={newProduct.name}
                                        onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Özellik / Birim</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Torba, Adet, m²"
                                        placeholderTextColor="#666"
                                        value={newProduct.spec}
                                        onChangeText={(t) => setNewProduct({ ...newProduct, spec: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Satış Fiyatı (₺)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="150"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newProduct.price}
                                        onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                                    <Text style={styles.submitBtnText}>ÜRÜNÜ YAYINLA</Text>
                                </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    backButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    cartButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    badge: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4 },
    scrollContent: { paddingBottom: 120 }, // Increased padding for FAB

    // Top Navigation
    topNavContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
        gap: 12,
    },
    topNavBtnLeft: {
        flex: 1,
        borderRadius: 20,
        height: 140,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    topNavBtnRight: {
        flex: 1,
        borderRadius: 20,
        height: 140,
    },
    topNavGradient: {
        flex: 1,
        borderRadius: 20,
        padding: 15,
        justifyContent: 'space-between',
    },
    topNavGradientDark: {
        flex: 1,
        borderRadius: 20,
        padding: 15,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    topNavIconBoxBlack: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topNavIconBoxGold: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topNavTitleBlack: {
        color: '#000',
        fontSize: 15,
        fontWeight: '900',
        marginTop: 10,
    },
    topNavTitleGold: {
        color: '#FFD700',
        fontSize: 15,
        fontWeight: '900',
        marginTop: 10,
    },
    projeTag: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFD700',
        borderBottomLeftRadius: 12,
        borderTopRightRadius: 20, // Match Card Radius
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    projeTagText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // List View
    listContainer: { paddingHorizontal: 20, paddingTop: 0 },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        height: 80, // Keep height for visual impact
    },

    // Filter Styles
    filterDropdown: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333'
    },
    sortButton: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden'
    },
    sortButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },

    // Filter Styles
    filterDropdown: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333'
    },
    sortButton: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden'
    },
    sortButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.15)', // Subtle gold border
    },
    glowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        opacity: 0.5,
        zIndex: -1,
        pointerEvents: 'none', // Fix blocking touches
    },
    iconCircle: {
        width: 54, // INCREASED SIZE (was 48) as requested
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Gold Glass
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)'
    },
    textContainer: { flex: 1 },
    cardTitle: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
    cardSubtitle: { color: '#999', fontSize: 11 },
    arrowBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center'
    },

    // Firm Card
    firmCard: {
        marginBottom: 16,
        borderRadius: 20,
    },
    firmCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.15)',
    },
    firmIcon: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 15
    },
    firmName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Detail View
    detailContainer: { padding: 20 },
    categoryHeader: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
    itemCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.15)'
    },
    itemInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    itemIconBox: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    itemName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    itemSpec: { color: '#888', fontSize: 12, marginTop: 2 },
    itemPrice: { color: '#FFD700', fontSize: 16, fontWeight: '900' },

    addBtn: {
        backgroundColor: '#FFD700',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    addText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },

    // RFQ FAB
    rfqFab: {
        position: 'absolute',
        bottom: 120, // Increased to avoid FloatingTabBar
        alignSelf: 'center',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 9999, // Ensure it's on top
    },
    rfqFabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#fff',
    },
    rfqFabText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 14,
        marginLeft: 8,
    },

    // Mock Modal Styles (Simplified for brevity, usually in global or separate sheet)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 20
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: { color: '#FFD700', fontSize: 18, fontWeight: '900' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    activeTabBtn: {
        backgroundColor: '#FFD700',
    },
    tabText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
        color: '#888'
    },
    activeTabText: {
        color: '#000'
    },
    inputLabel: {
        color: '#ccc',
        marginBottom: 10,
        fontSize: 14
    },
    textArea: {
        backgroundColor: '#111',
        borderRadius: 12,
        color: '#fff',
        padding: 15,
        height: 150,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#333'
    },
    photoUploadContainer: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20
    },
    photoPlaceholder: { alignItems: 'center', marginBottom: 10 },
    photoText: { color: '#666', marginTop: 8, fontSize: 12 },
    cameraBtn: {
        backgroundColor: '#333',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    cameraBtnText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
    manualContainer: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center'
    },
    manualInfo: { color: '#666', textAlign: 'center', paddingHorizontal: 20 },
    submitRfqBtn: {
        backgroundColor: '#FFD700',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20
    },
    submitRfqText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1
    },

    // Seller Styles (New)
    sellerBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a3b1a', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#4ADE80' },
    sellerBannerText: { color: '#4ADE80', fontWeight: 'bold' },
    addProductBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4ADE80', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    addProductText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    // Form Styles
    formGroup: { marginBottom: 15 },
    label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#111', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },
    categoryChip: { padding: 8, borderRadius: 8, backgroundColor: '#222', marginRight: 8, borderWidth: 1, borderColor: '#333' },
    categoryChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    categoryChipText: { color: '#888', fontSize: 11 },
    categoryChipTextActive: { color: '#000', fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
