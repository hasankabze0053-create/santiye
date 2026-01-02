import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, ImageBackground, Keyboard, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// ... existing code ...

const handleSubmit = () => {
    if (!durationValues.type) {
        Alert.alert("Eksik Bilgi", "Lütfen projenin tahmini süresini seçiniz.");
        return;
    }
    if (!locationValues.locationSet) {
        Alert.alert("Eksik Bilgi", "Lütfen proje konumunu haritadan seçip onaylayınız.");
        return;
    }
    setStep(5);
};

const { width, height } = Dimensions.get('window');

// CAT DATA FOR MACHINE SELECTION
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

const PROJECT_DURATION_OPTIONS = [
    { id: 'short_term', title: 'Kısa Dönemli / Özel', icon: 'hammer-wrench', sub: 'Yıkım, Montaj vb. (4-5 Gün)', basePrice: 50000, operatorPrice: 10000 },
    { id: 'mid_term', title: '6-12 Ay', icon: 'calendar-clock', sub: 'Orta vadeli projeler', basePrice: 500000, operatorPrice: 100000 },
    { id: 'long_term', title: '1 Yıl +', icon: 'calendar-multiselect', sub: 'Uzun soluklu şantiyeler', basePrice: 1200000, operatorPrice: 200000 },
    { id: 'indefinite', title: 'Belirsiz Süre', icon: 'infinity', sub: 'Proje bitimine kadar açık sözleşme', basePrice: 100000, operatorPrice: 20000 },
];

const PROJECT_TYPES = [
    { id: 'demolition', title: 'Bina Yıkımı', icon: 'wall' },
    { id: 'excavation', title: 'Hafriyat Alımı', icon: 'dump-truck' },
    { id: 'housing', title: 'Konut / Rezidans', icon: 'home-city' },
    { id: 'infrastructure', title: 'Altyapı / Yol', icon: 'road-variant' },
    { id: 'industrial', title: 'Endüstriyel Tesis', icon: 'factory' },
    { id: 'other', title: 'Diğer', icon: 'dots-horizontal' },
];

export default function ProjectProposalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { category } = route.params || {};

    const [step, setStep] = useState(1);

    // Selections
    const [durationValues, setDurationValues] = useState({
        type: null,
        startDate: new Date(),
    });

    // Location State
    const [locationValues, setLocationValues] = useState({
        locationSet: false,
        address: "Konum Seçilmedi",
    });
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Project Details
    const [projectType, setProjectType] = useState(null);
    const [description, setDescription] = useState("");
    const [machineNeeds, setMachineNeeds] = useState("");


    // --- NEW FEATURES ---
    const [photos, setPhotos] = useState([]);
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [machineModalVisible, setMachineModalVisible] = useState(false);

    // Price Calculation State (Mock)
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // Animations
    const fadeAnimStep2 = useRef(new Animated.Value(0)).current;
    const fadeAnimStep3 = useRef(new Animated.Value(0)).current;
    const fadeAnimSummary = useRef(new Animated.Value(0)).current;

    // Map Animations
    const mapPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const mapScale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                mapPan.setOffset({ x: mapPan.x._value, y: mapPan.y._value });
                mapPan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: mapPan.x, dy: mapPan.y }], { useNativeDriver: false }),
            onPanResponderRelease: () => { mapPan.flattenOffset(); }
        })
    ).current;

    useEffect(() => {
        if (!durationValues.type) return;
        const option = PROJECT_DURATION_OPTIONS.find(d => d.id === durationValues.type);
        // Basic calc + machine count multiplier
        let base = option ? option.basePrice : 0;
        let machineExtra = selectedMachines.reduce((acc, m) => acc + (m.quantity * 5000), 0);
        setEstimatedPrice(base + machineExtra);
    }, [durationValues.type, selectedMachines]);

    const formatCurrency = (amount) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₺ (Tahmini)";
    };

    // --- HANDLERS ---

    const handleDurationSelect = (type) => {
        setDurationValues(prev => ({ ...prev, type }));
        if (step < 2) {
            setStep(2);
            Animated.timing(fadeAnimStep2, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    };

    const handleSearchSubmit = () => {
        if (searchText.length > 2) {
            setIsSearching(true);
            Keyboard.dismiss();
            setTimeout(() => {
                setIsSearching(false);
                const mockAddress = `${searchText} Mevkii, Şantiye Alanı No:1`;
                setLocationValues(prev => ({ ...prev, address: mockAddress }));
            }, 1000);
        }
    };

    const handleGPS = () => {
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            const gpsAddress = "Mevcut Konum (40.99, 29.02)";
            setLocationValues(prev => ({ ...prev, address: gpsAddress }));
            setSearchText("Mevcut Konum");
        }, 1200);
    };

    const handleLocationConfirm = () => {
        if (!locationValues.locationSet) {
            setLocationValues(prev => ({ ...prev, locationSet: true, address: prev.address === "Konum Seçilmedi" ? "İstanbul Geneli Şantiye Sahası" : prev.address }));
        }
        if (step < 3) {
            setStep(3);
            Animated.timing(fadeAnimStep3, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    };

    const handleProjectTypeSelect = (id) => {
        setProjectType(id);
    };

    const handleAddPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Kamera kullanımı için izin gerekiyor.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            const newPhoto = { id: Date.now(), uri: result.assets[0].uri };
            setPhotos([...photos, newPhoto]);
        }
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    const handleAddMachine = (machineName, categoryIcon) => {
        const existing = selectedMachines.find(m => m.name === machineName);
        if (existing) {
            handleUpdateQuantity(existing.id, 1);
        } else {
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

    const handleRemoveMachine = (id) => {
        setSelectedMachines(prev => prev.filter(m => m.id !== id));
    };

    const handleNextToSummary = () => {
        if (step < 4) {
            setStep(4);
            Animated.timing(fadeAnimSummary, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    };

    const handleSubmit = () => {
        setStep(5);
    };


    // --- RENDERS ---

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>1. Projenin tahmini süresi nedir?</Text>
            {PROJECT_DURATION_OPTIONS.map((opt) => {
                const isSelected = durationValues.type === opt.id;
                return (
                    <TouchableOpacity
                        key={opt.id}
                        style={[styles.optionRow, isSelected && styles.optionRowSelected, step > 1 && !isSelected && { opacity: 0.5 }]}
                        onPress={() => handleDurationSelect(opt.id)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                            <MaterialCommunityIcons name={opt.icon} size={24} color={isSelected ? '#000' : '#D4AF37'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{opt.title}</Text>
                            <Text style={styles.optionSub}>{opt.sub}</Text>
                        </View>
                        {isSelected && <MaterialCommunityIcons name="check-circle" size={24} color="#D4AF37" />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderStep2 = () => {
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.questionTitle}>2. Proje hangi konumda?</Text>

                <View style={[styles.mapContainer, locationValues.locationSet && { borderColor: '#D4AF37' }]}>
                    <View style={styles.mapMask} {...panResponder.panHandlers}>
                        <Animated.View style={[styles.pannableLayer, { transform: [{ translateX: mapPan.x }, { translateY: mapPan.y }, { scale: mapScale }] }]}>
                            <ImageBackground source={require('../../assets/map_bg.png')} style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.5 }}>
                                <View style={styles.mapDarkOverlay} />
                            </ImageBackground>
                        </Animated.View>
                    </View>

                    <View style={styles.searchBarFloating}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="İl, İlçe veya Proje Adı..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearchSubmit}
                            blurOnSubmit={true}
                            returnKeyType="search"
                        />
                        {isSearching && <ActivityIndicator size="small" color="#D4AF37" style={{ marginLeft: 8 }} />}
                    </View>

                    <View style={styles.centerPinContainer} pointerEvents="none">
                        <MaterialCommunityIcons name="map-marker-radius" size={54} color="#D4AF37" style={styles.pinShadow} />
                    </View>

                    <TouchableOpacity style={styles.gpsButton} onPress={handleGPS}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.mapBottomBar}>
                        <View style={styles.addressContainer}>
                            <Text style={styles.addressLabel}>Proje Konumu:</Text>
                            <Text style={styles.addressText} numberOfLines={2}>{locationValues.address}</Text>
                        </View>
                        <TouchableOpacity style={styles.confirmLocationBtn} onPress={handleLocationConfirm}>
                            <Text style={styles.confirmLocationText}>{locationValues.locationSet ? "GÜNCELLE" : "KONUMU ONAYLA"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderStep3 = () => {
        return (
            <View style={styles.stepContainer}>
                <Text style={styles.questionTitle}>3. Proje Detayları ve Ekipman</Text>

                <Text style={styles.subLabel}>Proje Tipi</Text>
                <View style={styles.gridContainer}>
                    {PROJECT_TYPES.map((pt, index) => {
                        const isSelected = projectType === pt.id;
                        // 2 column layout: Last 2 items are the last row
                        const isLastRow = index >= PROJECT_TYPES.length - 2;

                        return (
                            <TouchableOpacity
                                key={pt.id}
                                style={[
                                    styles.gridItem,
                                    isSelected && styles.gridItemSelected,
                                    isLastRow && { marginBottom: 0 }
                                ]}
                                onPress={() => handleProjectTypeSelect(pt.id)}
                            >
                                <MaterialCommunityIcons name={pt.icon} size={32} color={isSelected ? '#000' : '#D4AF37'} style={{ marginBottom: 6 }} />
                                <Text style={[styles.gridItemText, isSelected && { color: '#000' }]}>{pt.title}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* DESCRIPTION Section */}
                <Text style={[styles.subLabel, { marginTop: 8 }]}>Proje Açıklaması / Notlar (Opsiyonel)</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Projenizle ilgili detayları buraya yazabilirsiniz..."
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={setDescription}
                />

                {/* PHOTOS section (Optional) */}
                <View style={styles.dividerSmall} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.subLabel}>Saha Fotoğrafları (Opsiyonel)</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={handleAddPhoto}>
                        <MaterialCommunityIcons name="camera" size={18} color="#000" style={{ marginRight: 6 }} />
                        <Text style={styles.actionButtonText}>Fotoğraf Ekle</Text>
                    </TouchableOpacity>
                </View>
                {photos.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {photos.map(p => (
                            <View key={p.id} style={{ marginRight: 8, position: 'relative' }}>
                                <Image source={{ uri: p.uri }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#333' }} />
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemovePhoto(p.id)}>
                                    <Ionicons name="close" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* MACHINES Section (Optional) */}
                <View style={styles.dividerSmall} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.subLabel}>Makine Tercihleri (Opsiyonel)</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setMachineModalVisible(true)}>
                        <MaterialCommunityIcons name="excavator" size={18} color="#000" style={{ marginRight: 6 }} />
                        <Text style={styles.actionButtonText}>Makine Ekle</Text>
                    </TouchableOpacity>
                </View>



                {selectedMachines.length > 0 ? (
                    <View style={{ marginTop: 8 }}>
                        {selectedMachines.map(m => (
                            <View key={m.id} style={styles.machineRow}>
                                <Text style={{ color: '#ccc', flex: 1 }}>{m.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(m.id, -1)}><MaterialCommunityIcons name="minus" color="#666" size={20} /></TouchableOpacity>
                                    <Text style={{ color: '#D4AF37', marginHorizontal: 8, fontWeight: 'bold' }}>{m.quantity}</Text>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(m.id, 1)}><MaterialCommunityIcons name="plus" color="#D4AF37" size={20} /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleRemoveMachine(m.id)} style={{ marginLeft: 12 }}><MaterialCommunityIcons name="trash-can" color="#CF3335" size={20} /></TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>Henüz makine seçilmedi.</Text>
                )}

                <View style={{ height: 20 }} />
                {/* DEVAM ET button removed */}

            </View>
        );
    };

    const renderSummary = () => {
        // Removed step check: if (step < 4 || step === 5) return null;
        if (step === 5) return null;

        const durationOpt = PROJECT_DURATION_OPTIONS.find(d => d.id === durationValues.type);
        const typeOpt = PROJECT_TYPES.find(t => t.id === projectType);

        return (
            <Animated.View style={[styles.summaryContainer, { opacity: 1 }]}>
                {/* Removed fadeAnimSummary for now as it's static */}
                <View style={styles.receiptHeader}>
                    {[...Array(6)].map((_, i) => <View key={i} style={styles.receiptHole} />)}
                </View>

                <View style={styles.receiptBody}>
                    <Text style={styles.receiptTitle}>PROJE ÖZETİ</Text>

                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Süre:</Text>
                        <Text style={styles.receiptValue}>{durationOpt?.title || 'Seçilmedi'}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Proje Tipi:</Text>
                        <Text style={styles.receiptValue}>{typeOpt?.title || 'Belirtilmedi'}</Text>
                    </View>
                    {description ? (
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Not:</Text>
                            <Text style={styles.receiptValue} numberOfLines={3}>{description}</Text>
                        </View>
                    ) : null}
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Konum:</Text>
                        <Text style={styles.receiptValue} numberOfLines={1}>{locationValues.address}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Ekipman:</Text>
                        <Text style={styles.receiptValue}>{selectedMachines.length > 0 ? `${selectedMachines.length} Çeşit` : 'Seçilmedi'}</Text>
                    </View>
                    {photos.length > 0 && (
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Görsel:</Text>
                            <Text style={styles.receiptValue}>{photos.length} Adet</Text>
                        </View>
                    )}

                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tahmini Bütçe:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(estimatedPrice)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>TEKLİF TALEBİ OLUŞTUR</Text>
                    <MaterialCommunityIcons name="rocket-launch" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                <View style={{ height: 50 }} />
            </Animated.View>
        );
    };

    const renderSuccess = () => {
        if (step !== 5) return null;
        return (
            <View style={styles.successContainer}>
                <View style={styles.successContent}>
                    <MaterialCommunityIcons name="clipboard-check-outline" size={100} color="#D4AF37" />
                    <Text style={styles.successTitle}>PROJE KAYDEDİLDİ</Text>
                    <Text style={styles.successText}>
                        Proje talebiniz kurumsal satış ekibimize iletilmiştir.
                        {"\n\n"}
                        Özel proje danışmanımız en kısa sürede sizinle iletişime geçecektir.
                    </Text>

                    <TouchableOpacity
                        style={styles.exitBtn}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Ana Sayfa' })}
                    >
                        <Text style={styles.exitBtnText}>ANA MENÜYE DÖN</Text>
                        <MaterialCommunityIcons name="home" size={24} color="#000" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#111']} style={styles.gradient}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        {step !== 5 && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>{step === 5 ? 'BAŞARILI' : 'PROJE SİHİRBAZI'}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {step === 5 ? renderSuccess() : (
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Always render all steps and summary */}
                            {renderStep1()}
                            {renderStep2()}
                            {renderStep3()}
                            {renderSummary()}
                        </ScrollView>
                    )}


                    {/* MACHINE MODAL */}
                    <Modal visible={machineModalVisible} animationType="slide" transparent={true} onRequestClose={() => setMachineModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Makine Seçin</Text>
                                    <TouchableOpacity onPress={() => setMachineModalVisible(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
                                </View>
                                <ScrollView>
                                    {PROPOSAL_CATEGORIES.map(cat => (
                                        <View key={cat.id} style={{ marginBottom: 20 }}>
                                            <Text style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: 10 }}>{cat.title}</Text>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                {cat.items.map((item, idx) => (
                                                    <TouchableOpacity key={idx} style={styles.modalBadge} onPress={() => handleAddMachine(item, cat.icon)}>
                                                        <Text style={{ color: '#ccc', fontSize: 12 }}>{item}</Text>
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
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gradient: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backBtn: { padding: 4 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    stepContainer: { marginBottom: 30 },
    questionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    subLabel: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 6 },

    // Option Rows
    optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    optionRowSelected: { borderColor: '#D4AF37', backgroundColor: '#222' },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    iconBoxSelected: { backgroundColor: '#D4AF37' },
    optionTitle: { color: '#ccc', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    optionTitleSelected: { color: '#fff' },
    optionSub: { color: '#666', fontSize: 12 },

    // Map
    mapContainer: { height: 320, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    mapMask: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    pannableLayer: { width: '250%', height: '250%' },
    mapDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    searchBarFloating: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },
    centerPinContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 40, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    pinShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6 },
    gpsButton: { position: 'absolute', right: 20, bottom: 100, backgroundColor: '#D4AF37', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    mapBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(20,20,20,0.95)', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
    addressContainer: { marginBottom: 12 },
    addressLabel: { color: '#666', fontSize: 11, marginBottom: 2 },
    addressText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    confirmLocationBtn: { backgroundColor: '#D4AF37', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    confirmLocationText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    // Grid
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', aspectRatio: 1.55, backgroundColor: '#1A1A1A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#333', padding: 8 },
    gridItemSelected: { backgroundColor: '#D4AF37', borderColor: '#FFD700' },
    gridItemText: { color: '#ccc', fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginTop: 4, minHeight: 34, textAlignVertical: 'top' },
    dividerSmall: { height: 1, backgroundColor: '#333', marginVertical: 10 },  // Reduced from 16
    deleteBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#CF3335', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    // Machine Row
    machineRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
    continueBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    continueBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginRight: 8 },

    // Action Button
    actionButton: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
    actionButtonText: { color: '#000', fontSize: 13, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalBadge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#333' },

    // Receipt
    summaryContainer: { marginTop: 20 },
    receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', height: 10, overflow: 'hidden', marginHorizontal: 10 },
    receiptHole: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#000', marginTop: -12 },
    receiptBody: { backgroundColor: '#FFF', borderRadius: 0, marginHorizontal: 10, padding: 20, paddingTop: 30 },
    receiptTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    receiptLabel: { color: '#666', fontSize: 13, fontWeight: 'bold' },
    receiptValue: { color: '#000', fontSize: 13, fontWeight: '600', maxWidth: '70%', textAlign: 'right' },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    totalValue: { fontSize: 16, fontWeight: '900', color: '#D4AF37' },
    submitBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', marginHorizontal: 10, marginTop: -4, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingVertical: 18, justifyContent: 'center', alignItems: 'center', shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    submitBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    // Success
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    successContent: { width: '100%', alignItems: 'center', backgroundColor: '#111', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
    successTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 20, marginBottom: 10, letterSpacing: 1 },
    successText: { fontSize: 15, color: '#ccc', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
    exitBtn: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    exitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // Text Area
    textArea: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        minHeight: 150, // Increased from 100
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 14
    },
});
