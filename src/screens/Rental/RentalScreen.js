import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, FlatList, Keyboard, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
const { width } = Dimensions.get('window');

// 1. Full Detailed Category Structure (Restored)
const RENTAL_CATEGORIES = [
    {
        id: '1',
        title: 'KULE VE DİKEY KALDIRMA GRUBU',
        subtitle: 'Vinçler',
        icon: 'tower-beach',
        items: [
            { name: 'Sabit Kule Vinç', type: 'Yüksek Katlı' },
            { name: 'Mobil Kule Vinç (Self-Erecting)', type: 'Kendi Kurulan' },
            { name: 'Gırgır Vinç', type: 'Çatı Tipi' },
            { name: 'Dış Cephe Asansörü (Alimak)', type: 'Personel/Yük' },
            { name: 'Yük Asansörü (İnşaat Vinci)', type: 'Sadece Malzeme' },
        ]
    },
    {
        id: '2',
        title: 'MOBİL KALDIRMA VE YÜKLEME',
        subtitle: 'Sahada Hareketli',
        icon: 'tow-truck',
        items: [
            { name: 'Mobil Vinç (Lastikli)', type: 'Şehir İçi' },
            { name: 'Arazi Tipi Mobil Vinç (All Terrain)', type: 'Zorlu Arazi' },
            { name: 'Hiyap Vinç (Kamyon Üstü)', type: 'Nakliye/Montaj' },
            { name: 'Paletli Vinç', type: 'Ağır Tonaj/Bataklık' },
            { name: 'Örümcek Vinç (Mini Vinç)', type: 'Dar Alan' },
            { name: 'Telehandler (Manitou)', type: 'Teleskopik Yükleyici' },
            { name: 'Roto Telehandler (Dönerli)', type: '360 Derece' },
        ]
    },
    {
        id: '3',
        title: 'HAFRİYAT VE KAZI GRUBU',
        subtitle: 'Ekskavatörler',
        icon: 'excavator',
        items: [
            { name: 'Paletli Ekskavatör (Mini 1-5 Ton)', type: 'Peyzaj' },
            { name: 'Paletli Ekskavatör (Midi 6-14 Ton)', type: 'Şehir İçi' },
            { name: 'Paletli Ekskavatör (Standart 20-30 Ton)', type: 'Hafriyat' },
            { name: 'Paletli Ekskavatör (Ağır 40+ Ton)', type: 'Taş Ocağı' },
            { name: 'Yıkım Ekskavatörü (High Reach)', type: 'Yüksek Yıkım' },
            { name: 'Lastikli Ekskavatör', type: 'Mobil Kazı' },
            { name: 'Beko Loder (JCB)', type: 'Kazıcı Yükleyici' },
        ]
    },
    {
        id: '4',
        title: 'YÜKLEME VE SERİ ÇALIŞMA',
        subtitle: 'Loderler',
        icon: 'bulldozer',
        items: [
            { name: 'Lastikli Loder', type: 'Yükleyici' },
            { name: 'Paletli Loder', type: 'Zorlu Zemin' },
            { name: 'Mini Yükleyici (Bobcat)', type: 'Skid Steer' },
            { name: 'Paletli Mini Yükleyici', type: 'Paletli Bobcat' },
        ]
    },
    {
        id: '5',
        title: 'PERSONEL YÜKSELTİCİ (MANLİFT)',
        subtitle: 'Platformlar',
        icon: 'ladder',
        items: [
            { name: 'Makaslı Platform (Akülü)', type: 'İç Mekan' },
            { name: 'Makaslı Platform (Dizel)', type: 'Dış Mekan' },
            { name: 'Eklemli Platform (Bomlu)', type: 'Engelli Erişim' },
            { name: 'Teleskopik Platform', type: 'Düz Bomlu' },
            { name: 'Örümcek Platform', type: 'Hassas Zemin' },
            { name: 'Dikey Direk Platform', type: 'Dar Alan' },
            { name: 'Araç Üstü Sepetli Platform', type: 'Kamyonet Arkası' },
        ]
    },
    {
        id: '6',
        title: 'YOL, ASFALT VE SIKIŞTIRMA',
        subtitle: 'Silindirler',
        icon: 'road-variant',
        items: [
            { name: 'Greyder', type: 'Yol Tesviye' },
            { name: 'Dozer', type: 'Zemin Sıyırma' },
            { name: 'Toprak Silindiri', type: 'Zemin Sıkıştırma' },
            { name: 'Yama Silindiri', type: 'Çift Tamburlu' },
            { name: 'Keçi Ayağı Silindir', type: 'Killi Zemin' },
            { name: 'Lastik Tekerlekli Silindir (Vabıl)', type: 'Asfalt Yüzey' },
            { name: 'Finişer', type: 'Asfalt Serici' },
            { name: 'Asfalt Kazıyıcı (Freze)', type: 'Asfalt Tıraşlama' },
        ]
    },
    {
        id: '7',
        title: 'BETON TEKNOLOJİLERİ',
        subtitle: 'Pompa & Mikser',
        icon: 'truck', // Changed from truck-mixer
        items: [
            { name: 'Mobil Beton Pompası', type: 'Bomlu' },
            { name: 'Sabit (Yer) Pompası', type: 'Yüksek Basınç' },
            { name: 'Transmikser', type: 'Beton Kamyonu' },
            { name: 'Beton Perdah (Helikopter)', type: 'Yüzey İşleme' },
            { name: 'Vibrasyonlu Mastar', type: 'Düzeltme' },
        ]
    },
    {
        id: '8',
        title: 'ZEMİN GÜÇLENDİRME',
        subtitle: 'Delgi & Kazık',
        icon: 'screw-machine-flat-top',
        items: [
            { name: 'Fore Kazık Makinesi', type: 'Büyük Çaplı' },
            { name: 'Mini Kazık Makinesi', type: 'Güçlendirme' },
            { name: 'Ankraj Makinesi', type: 'Yatay Delgi' },
            { name: 'Jet Grout', type: 'Enjeksiyon' },
        ]
    },
    {
        id: '9',
        title: 'ENERJİ VE DESTEK',
        subtitle: 'Jeneratörler',
        icon: 'lightning-bolt',
        items: [
            { name: 'Mobil Jeneratör (Dizel)', type: 'Şantiye Elektriği' },
            { name: 'Portatif Jeneratör', type: 'El Aletleri' },
            { name: 'Mobil Kompresör', type: 'Hava Kaynağı' },
            { name: 'Işık Kulesi', type: 'Gece Çalışması' },
            { name: 'Dalgıç Pompa', type: 'Su Tahliye' },
            { name: 'Şantiye Konteyneri', type: 'Ofis/Yatakhane' },
        ]
    },
    {
        id: '10',
        title: 'NAKLİYE VE LOJİSTİK',
        subtitle: 'Tır & Kamyon',
        icon: 'truck',
        items: [
            { name: 'Damperli Kamyon', type: 'Hafriyat' },
            { name: 'Lowbed (Tır)', type: 'Makine Nakliyesi' },
            { name: 'Su Tankeri (Arazöz)', type: 'Su İkmali' },
        ]
    },
    {
        id: '11',
        title: 'MAKİNE ATAŞMANLARI',
        subtitle: 'Kırıcı & Kova',
        icon: 'tools',
        items: [
            { name: 'Hidrolik Kırıcı', type: 'Kırım Ucu' },
            { name: 'Kova (Bucket)', type: 'Kazı/Tesviye' },
            { name: 'Polip (Ahtapot)', type: 'Hurda/Taş' },
            { name: 'Burgu', type: 'Delgi Ucu' },
            { name: 'Ripper', type: 'Kedi Pençesi' },
            { name: 'Forklift Çatalı', type: 'Palet Taşıma' },
        ]
    },
];

// Reused Category Data for Selection Modal
const PROPOSAL_CATEGORIES = [
    {
        id: '1', title: 'KULE VE DİKEY KALDIRMA', icon: 'tower-beach',
        items: ['Sabit Kule Vinç', 'Mobil Kule Vinç', 'Gırgır Vinç', 'Dış Cephe Asansörü', 'Yük Asansörü']
    },
    {
        id: '2', title: 'MOBİL KALDIRMA', icon: 'tow-truck',
        items: ['Mobil Vinç', 'Hiyap Vinç', 'Paletli Vinç', 'Örümcek Vinç', 'Telehandler']
    },
    {
        id: '3', title: 'HAFRİYAT VE KAZI', icon: 'excavator',
        items: ['Paletli Ekskavatör', 'Lastikli Ekskavatör', 'Beko Loder (JCB)', 'Yıkım Ekskavatörü']
    },
    {
        id: '4', title: 'YÜKLEME VE SERİ ÇALIŞMA', icon: 'bulldozer',
        items: ['Lastikli Loder', 'Paletli Loder', 'Bobcat']
    },
    {
        id: '5', title: 'PERSONEL YÜKSELTİCİ', icon: 'ladder',
        items: ['Makaslı Platform', 'Eklemli Platform', 'Sepetli Vinç']
    },
    {
        id: '10', title: 'NAKLİYE VE LOJİSTİK', icon: 'truck',
        items: ['Damperli Kamyon', 'Tır (Lowbed)', 'Su Tankeri']
    },
];

export default function RentalScreen() {
    const navigation = useNavigation();
    // Premium Rental Screen UI
    // const { mode } = route.params || { mode: 'periodic' }; // Removed as mode is now handled by top nav buttons
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [activeTab, setActiveTab] = useState('periodic'); // 'periodic' or 'project'

    // --- PROJECT PROPOSAL STATE ---
    const [photos, setPhotos] = useState([]);
    const [address, setAddress] = useState('Bağdat Cad. No:15, Kadıköy');
    const [description, setDescription] = useState('');
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [machineModalVisible, setMachineModalVisible] = useState(false);

    // --- CORPORATE MODE STATE (NEW) ---
    const [isCorporateMode, setIsCorporateMode] = useState(false);
    const [addMachineModalVisible, setAddMachineModalVisible] = useState(false);
    const [rentalCategories, setRentalCategories] = useState(RENTAL_CATEGORIES);
    const [newMachine, setNewMachine] = useState({ name: '', type: '', price: '', categoryId: '' });

    // Mock Photo Add
    const handleAddPhoto = () => {
        const newPhoto = { id: Date.now(), uri: 'https://via.placeholder.com/150/FFD700/000000?text=Foto' };
        setPhotos([...photos, newPhoto]);
    };
    const handleRemovePhoto = (id) => setPhotos(photos.filter(p => p.id !== id));

    // Machine Logic
    const handleAddMachine = (machineName, categoryIcon) => {
        const existing = selectedMachines.find(m => m.name === machineName);
        if (existing) { handleUpdateQuantity(existing.id, 1); }
        else {
            const newMachine = { id: Date.now().toString(), name: machineName, icon: categoryIcon, quantity: 1 };
            setSelectedMachines([...selectedMachines, newMachine]);
        }
        setMachineModalVisible(false);
    };
    const handleUpdateQuantity = (id, delta) => {
        setSelectedMachines(prev => prev.map(m => {
            if (m.id === id) {
                const newQty = m.quantity + delta;
                return newQty > 0 ? { ...m, quantity: newQty } : m;
            }
            return m;
        }));
    };
    const handleRemoveMachine = (id) => setSelectedMachines(prev => prev.filter(m => m.id !== id));

    // Search State
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const handleRentRequest = (item) => {
        Alert.alert("Talep Alındı", `${item.name} için kiralama ekibimiz sizi arayacak.`);
    };

    // Corporate: Add Machine Logic
    const handleAddMachineToMarket = () => {
        if (!newMachine.name || !newMachine.price || !newMachine.categoryId) {
            Alert.alert("Eksik Bilgi", "Lütfen makine adı, fiyatı ve kategorisini giriniz.");
            return;
        }

        const updatedCategories = rentalCategories.map(cat => {
            if (cat.id === newMachine.categoryId) {
                return {
                    ...cat,
                    items: [{ name: newMachine.name, type: newMachine.type || 'Standart', isCorporateItem: true }, ...cat.items]
                };
            }
            return cat;
        });

        setRentalCategories(updatedCategories);
        setAddMachineModalVisible(false);
        setNewMachine({ name: '', type: '', price: '', categoryId: '' });
        Alert.alert("Başarılı", "Makine kiralama listesine eklendi.");
    };

    // Search Logic
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }

        const results = [];
        rentalCategories.forEach(cat => {
            cat.items.forEach(item => {
                if (item.name.toLowerCase().includes(text.toLowerCase()) ||
                    item.type.toLowerCase().includes(text.toLowerCase()) ||
                    cat.title.toLowerCase().includes(text.toLowerCase())) {
                    results.push({ ...item, categoryTitle: cat.title, categoryIcon: cat.icon });
                }
            });
        });
        setSearchResults(results);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    {viewMode === 'detail' ? (
                        <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}

                    <Text style={styles.headerTitle}>
                        {viewMode === 'list'
                            ? 'KİRALAMA SEÇENEKLERİ' // Changed header title for list view
                            : selectedCategory?.title}
                    </Text>

                    <TouchableOpacity
                        style={{
                            width: 50, height: 50, borderRadius: 14,
                            backgroundColor: '#FFD700', // Gold background
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: '#ca8a04'
                        }}
                        onPress={() => navigation.navigate('CorporateDashboard')}
                    >
                        <MaterialCommunityIcons
                            name="briefcase-check"
                            size={28}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>

                {/* Corporate Banner */}
                {isCorporateMode && (
                    <View style={styles.corporateBanner}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="domain" size={20} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.corporateBannerText}>KURUMSAL KİRALAMA ORTAĞI</Text>
                        </View>
                        <TouchableOpacity style={styles.addMachineBtnHeader} onPress={() => setAddMachineModalVisible(true)}>
                            <Ionicons name="add-circle" size={18} color="#fff" />
                            <Text style={styles.addMachineTextHeader}>MAKİNE EKLE</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* TOP NAVIGATION BUTTONS (New Feature) */}
                    {/* TOP NAVIGATION TABS */}
                    {viewMode === 'list' && (
                        <View style={styles.topNavContainer}>
                            {/* Left Tab: Süreli Kiralama */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topNavBtnLeft}
                                onPress={() => setActiveTab('periodic')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'periodic' ? ['#FFD700', '#FFC000'] : ['#1E1E1E', '#111']}
                                    style={activeTab === 'periodic' ? styles.topNavGradient : styles.topNavGradientDark}
                                >
                                    {activeTab === 'periodic' ? (
                                        <>
                                            <View style={styles.topNavIconBoxBlack}>
                                                <MaterialCommunityIcons name="clock-time-four" size={24} color="#FFD700" />
                                            </View>
                                            <Text style={styles.topNavTitleBlack}>SÜRELİ{'\n'}KİRALAMA</Text>
                                            <Ionicons name="arrow-forward-circle" size={24} color="#000" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }} />
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.topNavIconBoxGold}>
                                                <MaterialCommunityIcons name="clock-time-four" size={24} color="#000" />
                                            </View>
                                            <Text style={styles.topNavTitleGold}>SÜRELİ{'\n'}KİRALAMA</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Right Tab: Proje Bazlı Çözümler */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topNavBtnRight}
                                onPress={() => setActiveTab('project')}
                            >
                                <LinearGradient
                                    colors={activeTab === 'project' ? ['#FFD700', '#FFC000'] : ['#1E1E1E', '#111']}
                                    style={activeTab === 'project' ? styles.topNavGradient : styles.topNavGradientDark}
                                >
                                    {activeTab === 'project' ? (
                                        <>
                                            <View style={styles.topNavIconBoxBlack}>
                                                <MaterialCommunityIcons name="crane" size={24} color="#FFD700" />
                                            </View>
                                            <Text style={styles.topNavTitleBlack}>PROJE BAZLI{'\n'}ÇÖZÜMLER</Text>
                                            <Ionicons name="arrow-down-circle" size={24} color="#000" style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }} />
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.topNavIconBoxGold}>
                                                <MaterialCommunityIcons name="crane" size={24} color="#000" />
                                            </View>
                                            <Text style={styles.topNavTitleGold}>PROJE BAZLI{'\n'}ÇÖZÜMLER</Text>
                                            <View style={styles.projeTag}>
                                                <Text style={styles.projeTagText}>TEKLİF AL</Text>
                                            </View>
                                        </>
                                    )}
                                </LinearGradient>
                                {activeTab !== 'project' && <View style={styles.glowBorder} pointerEvents="none" />}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* PERIODIC RENTAL CONTENT (LIST) */}
                    {viewMode === 'list' && activeTab === 'periodic' && (
                        <View style={styles.listContainer}>
                            {/* DETAYLI ARAMA BUTTON (Inserted) */}
                            <TouchableOpacity
                                style={{
                                    marginHorizontal: 0,
                                    marginBottom: 20,
                                    shadowColor: '#FFD700',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                                activeOpacity={0.8}
                                onPress={() => setSearchVisible(true)}
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFC000']}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.2)'
                                    }}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <MaterialCommunityIcons name="magnify" size={24} color="#000" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>DETAYLI İŞ MAKİNESİ ARAMA</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {rentalCategories.map((cat) => (
                                <TouchableOpacity key={cat.id} style={styles.cardContainer} onPress={() => handleCategorySelect(cat)} activeOpacity={0.8}>
                                    <LinearGradient colors={['#1E1E1E', '#111']} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <View style={styles.iconCircle}>
                                            <MaterialCommunityIcons name={cat.icon} size={28} color="#FFD700" />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.cardTitle}>{cat.title}</Text>
                                            <Text style={styles.cardSubtitle}>{cat.subtitle} • {cat.items.length} Model</Text>
                                        </View>
                                        <View style={styles.arrowBox}>
                                            <Ionicons name="chevron-forward" size={18} color="#444" />
                                        </View>
                                    </LinearGradient>
                                    <View style={styles.glowBorder} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* PROJECT BASED CONTENT (FORM) */}
                    {viewMode === 'list' && activeTab === 'project' && (
                        <View style={{ paddingVertical: 10 }}>
                            {/* SECTION 1: FIELD PHOTOS */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>1. Saha Görselleri</Text>
                                <Text style={styles.sectionSub}>Detaylı teklif için farklı açılardan çekin</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
                                    <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                                        <MaterialCommunityIcons name="camera-plus" size={32} color="#FFD700" />
                                        <Text style={styles.addPhotoText}>EKLE</Text>
                                    </TouchableOpacity>
                                    {photos.map((photo) => (
                                        <View key={photo.id} style={styles.photoContainer}>
                                            <Image source={{ uri: photo.uri }} style={styles.photo} />
                                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemovePhoto(photo.id)}>
                                                <Ionicons name="close" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* SECTION 2: LOCATION */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>2. Proje Konumu</Text>
                                <View style={styles.locationInputContainer}>
                                    <MaterialCommunityIcons name="map-marker" size={24} color="#FFD700" style={styles.locationIcon} />
                                    <TextInput style={styles.locationInput} value={address} onChangeText={setAddress} placeholder="Adres giriniz..." placeholderTextColor="#666" />
                                    <TouchableOpacity style={styles.gpsButton} onPress={() => setAddress('Mevcut Konum Bulundu...')}>
                                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFD700" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* SECTION 3: DESCRIPTION */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>3. Yapılacak İş / Notlar</Text>
                                <View style={styles.textAreaContainer}>
                                    <TextInput style={styles.textArea} placeholder="Eski fabrika binası yıkımı..." placeholderTextColor="#666" multiline textAlignVertical="top" value={description} onChangeText={setDescription} />
                                </View>
                            </View>

                            {/* SECTION 4: MACHINE PREFERENCES */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>4. Makine Tercihleriniz (Opsiyonel)</Text>
                                {selectedMachines.map(machine => (
                                    <View key={machine.id} style={styles.machineCard}>
                                        <View style={styles.machineInfo}>
                                            <View style={styles.machineIconBox}>
                                                <MaterialCommunityIcons name={machine.icon} size={24} color="#FFD700" />
                                            </View>
                                            <Text style={styles.machineName}>{machine.name}</Text>
                                        </View>
                                        <View style={styles.machineActions}>
                                            <View style={styles.qtyContainer}>
                                                <TouchableOpacity onPress={() => handleUpdateQuantity(machine.id, -1)} style={styles.qtyBtn}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
                                                <Text style={styles.qtyValue}>{machine.quantity}</Text>
                                                <TouchableOpacity onPress={() => handleUpdateQuantity(machine.id, 1)} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveMachine(machine.id)} style={styles.removeMachineBtn}><Ionicons name="trash-outline" size={20} color="#CF3335" /></TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addMachineBtn} onPress={() => setMachineModalVisible(true)}>
                                    <Ionicons name="add" size={24} color="#FFD700" />
                                    <Text style={styles.addMachineText}>Başka Makine / Ekipman Ekle</Text>
                                </TouchableOpacity>
                            </View>

                            {/* SUBMIT BUTTON (Within ScrollView for simplicity) */}
                            <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert("Teklif Alındı", "Proje detaylarınız teknik ekibimize iletilmiştir.")}>
                                <LinearGradient colors={['#FFD700', '#FFC000']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    <Text style={styles.submitText}>PROJENİZ İÇİN TEKLİF ALIN</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            {selectedCategory.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    activeOpacity={0.9}
                                    onPress={() => handleRentRequest(item)}
                                >
                                    <LinearGradient
                                        colors={['#1E1E1E', '#111']}
                                        style={styles.itemCard}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.itemInfo}>
                                            <View style={styles.itemIconBox}>
                                                <MaterialCommunityIcons name={selectedCategory.icon} size={24} color="#FFD700" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemType}>{item.type}</Text>
                                            </View>
                                        </View>
                                        <View
                                            style={[styles.rentButton, { backgroundColor: '#FFD700' }]} // Default to gold for now
                                        >
                                            <Text style={[styles.rentText, { color: '#000' }]}>
                                                FİYAT
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                </ScrollView>

                {/* SEARCH FAB */}
                {viewMode === 'list' && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setSearchVisible(true)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FFC000']}
                            style={styles.fabGradient}
                        >
                            <Ionicons name="search" size={28} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
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
                                    <Ionicons name="search" size={20} color="#FFD700" style={{ marginRight: 10 }} />
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
                                                <MaterialCommunityIcons name={item.categoryIcon} size={24} color="#FFD700" />
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
                                            <MaterialCommunityIcons name={cat.icon} size={20} color="#FFD700" style={{ marginRight: 8 }} />
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

                {/* ADD MACHINE MODAL (CORPORATE) */}
                <Modal
                    visible={addMachineModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddMachineModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>MAKİNE ENVANTERİ EKLE</Text>
                                <TouchableOpacity onPress={() => setAddMachineModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 10 }}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Kategori Seçin</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {rentalCategories.map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[styles.categoryChip, newMachine.categoryId === cat.id && styles.categoryChipActive]}
                                                onPress={() => setNewMachine({ ...newMachine, categoryId: cat.id })}
                                            >
                                                <Text style={[styles.categoryChipText, newMachine.categoryId === cat.id && styles.categoryChipTextActive]}>{cat.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Makine Modeli / Adı</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: 2023 JCB 3CX Beko Loder"
                                        placeholderTextColor="#666"
                                        value={newMachine.name}
                                        onChangeText={(t) => setNewMachine({ ...newMachine, name: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Tipi / Özellik</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Kırıcı Hatlı, Klimalı"
                                        placeholderTextColor="#666"
                                        value={newMachine.type}
                                        onChangeText={(t) => setNewMachine({ ...newMachine, type: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Saatlik / Günlük Fiyat (₺)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newMachine.price}
                                        onChangeText={(t) => setNewMachine({ ...newMachine, price: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleAddMachineToMarket}>
                                    <Text style={styles.submitBtnText}>ENVANTERE EKLE</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', textAlign: 'center', flex: 1, letterSpacing: 0.5 },
    scrollContent: { paddingBottom: 140 }, // Increased padding for bottom FAB

    // Top Navigation
    topNavContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10, // Adjusted margin
        marginTop: 10,
        gap: 12,
    },
    topNavBtnLeft: {
        flex: 1,
        borderRadius: 20,
        height: 140, // Taller buttons as requested
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

    // Premium Card Design
    listContainer: { paddingHorizontal: 20, paddingTop: 0 }, // Adjusted padding
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        height: 80,
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
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
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

    // Corporate Styles
    corporateBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10
    },
    corporateBannerText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
    addMachineBtnHeader: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6
    },
    addMachineTextHeader: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

    // Form Styles (Reusing similar look)
    formGroup: { marginBottom: 15 },
    label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#111', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },
    categoryChip: { padding: 8, borderRadius: 8, backgroundColor: '#222', marginRight: 8, borderWidth: 1, borderColor: '#333' },
    categoryChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    categoryChipText: { color: '#888', fontSize: 11 },
    categoryChipTextActive: { color: '#000', fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Detail View
    detailContainer: { padding: 20 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.15)' // Gold Border for Details too
    },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    itemIconBox: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    itemName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    itemType: { color: '#888', fontSize: 11, marginTop: 2 },
    rentButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rentButtonProject: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    rentText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 120, // Raised above Floating Tab Bar
        right: 20,
        zIndex: 9999, // Ensure on top
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '90%', // Large sheet
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeBtn: {
        padding: 4,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },

    // --- PROJECT PROPOSAL STYLES ---
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
    sectionSub: { fontSize: 12, color: '#888', marginBottom: 16 },

    // Gallery
    galleryContainer: { alignItems: 'center', paddingVertical: 4 },
    addPhotoBtn: {
        width: 100, height: 100, borderRadius: 12, borderWidth: 2, borderColor: '#FFD700',
        borderStyle: 'dashed', backgroundColor: 'rgba(255, 215, 0, 0.05)',
        alignItems: 'center', justifyContent: 'center', marginRight: 16
    },
    addPhotoText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    photoContainer: { width: 100, height: 100, borderRadius: 12, marginRight: 12, position: 'relative' },
    photo: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#222' },
    deleteBtn: {
        position: 'absolute', top: -6, right: -6, backgroundColor: '#CF3335',
        width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#fff'
    },

    // Location
    locationInputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 12, borderWidth: 1, borderColor: '#333', height: 56, paddingHorizontal: 12
    },
    locationIcon: { marginRight: 12 },
    locationInput: { flex: 1, color: '#fff', fontSize: 15, height: '100%' },
    gpsButton: { padding: 8 },

    // Description
    textAreaContainer: {
        backgroundColor: '#1E1E1E', borderRadius: 12, borderWidth: 1, borderColor: '#333',
        height: 120, padding: 12
    },
    textArea: { flex: 1, color: '#fff', fontSize: 15, lineHeight: 22 },

    // Machine Selection
    machineCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, marginBottom: 10,
        borderWidth: 1, borderColor: '#333'
    },
    machineInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    machineIconBox: {
        width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    machineName: { color: '#fff', fontSize: 14, fontWeight: 'bold', width: '60%' },
    machineActions: { flexDirection: 'row', alignItems: 'center' },
    qtyContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 8, height: 32, marginRight: 10
    },
    qtyBtn: { width: 28, alignItems: 'center', justifyContent: 'center' },
    qtyText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
    qtyValue: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginHorizontal: 4 },
    removeMachineBtn: { padding: 4 },
    addMachineBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed',
        borderRadius: 12, height: 50, backgroundColor: 'rgba(255,255,255,0.05)'
    },
    addMachineText: { color: '#ccc', marginLeft: 8, fontSize: 14 },

    // Submit
    submitBtn: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 20, marginBottom: 40 },
    submitGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    submitText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.5 },

    // Modal Specifics
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalCategory: { marginBottom: 20 },
    modalCatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    modalCatTitle: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
    modalItemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    modalItemBadge: {
        backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: '#333', marginRight: 8, marginBottom: 8
    },
    modalItemText: { color: '#ccc', fontSize: 13 }
});
