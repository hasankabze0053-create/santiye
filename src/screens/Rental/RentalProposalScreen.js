import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, ImageBackground, Keyboard, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// MOCK DATA FOR WIZARD
const DURATION_OPTIONS = [
    { id: 'hourly', title: 'Saatlik Kiralama', icon: 'clock-outline', sub: 'Kısa süreli işler (Min. 4 Saat)', basePrice: 1500, operatorPrice: 500 },
    { id: 'daily', title: 'Günlük Kiralama', icon: 'weather-sunny', sub: '1-6 gün arası standart işler', basePrice: 12000, operatorPrice: 2500 },
    { id: 'weekly', title: 'Haftalık Kiralama', icon: 'calendar-week', sub: 'Uzun süreli işler için avantajlı', basePrice: 70000, operatorPrice: 15000 },
    { id: 'monthly', title: 'Proje Bazlı / Aylık', icon: 'office-building', sub: 'Şantiye kurulumu ve uzun vade', basePrice: 250000, operatorPrice: 50000 },
];

export default function RentalProposalScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { item, supplier } = route.params || {};

    const [step, setStep] = useState(1);

    // Selections
    const [durationValues, setDurationValues] = useState({
        type: null,
        startDate: new Date(),
        count: 1,
    });

    // Location State
    const [locationValues, setLocationValues] = useState({
        locationSet: false,
        address: "Konum Seçilmedi",
        transportIncluded: false,
    });
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [serviceValues, setServiceValues] = useState({
        operatorIncluded: true,
        fuelIncluded: false,
    });

    // Price Calculation State
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // Animations
    const fadeAnimStep2 = useRef(new Animated.Value(0)).current;
    const fadeAnimStep3 = useRef(new Animated.Value(0)).current;
    const fadeAnimSummary = useRef(new Animated.Value(0)).current;

    // Calculate Price whenever dependencies change
    useEffect(() => {
        calculateTotal();
    }, [durationValues, serviceValues, locationValues]);

    const calculateTotal = () => {
        if (!durationValues.type) return;

        const option = DURATION_OPTIONS.find(d => d.id === durationValues.type);
        if (!option) return;

        let base = option.basePrice * durationValues.count;
        let operator = serviceValues.operatorIncluded ? (option.operatorPrice * durationValues.count) : 0;
        let total = base + operator;

        // Mock Item specifics if available
        if (item?.price) {
            // If item has a specific price, we could use it, but for now we use the mock basePrice 
            // to ensure consistent "working" logic for the demo.
        }

        setEstimatedPrice(total);
    };

    const formatCurrency = (amount) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₺";
    };

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

            // Simulate API Search Delay
            setTimeout(() => {
                setIsSearching(false);
                const mockAddress = `${searchText} Mah. Merkez Sok. No:1, İstanbul`;
                setLocationValues(prev => ({ ...prev, address: mockAddress }));
                Alert.alert("Konum Bulundu", `Harita ${searchText} bölgesine odaklandı.`);
            }, 1500);
        }
    };

    const handleGPS = () => {
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            const gpsAddress = "Şantiye Sahası (Enlem: 41.0082, Boylam: 28.9784)";
            setLocationValues(prev => ({ ...prev, address: gpsAddress }));
            setSearchText("Mevcut Konum");
            Alert.alert("GPS Başarılı", "Mevcut konumunuz haritaya işlendi.");
        }, 1200);
    };

    const handleLocationConfirm = () => {
        if (!locationValues.locationSet) {
            setLocationValues(prev => ({
                ...prev,
                locationSet: true,
                address: prev.address === "Konum Seçilmedi" ? "Maslak Mah. Büyükdere Cad. No:1, Sarıyer/İSTANBUL" : prev.address
            }));
        }

        // Proceed to next step
        if (step < 3) {
            setStep(3);
            Animated.timing(fadeAnimStep3, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    };

    const handleServiceConfirm = () => {
        if (step < 4) {
            setStep(4);
            Animated.timing(fadeAnimSummary, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    };

    const renderDurationStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>1. Ne kadar süreyle ihtiyacınız var?</Text>

            {DURATION_OPTIONS.map((opt) => {
                const isSelected = durationValues.type === opt.id;
                return (
                    <View key={opt.id}>
                        <TouchableOpacity
                            style={[
                                styles.optionRow,
                                isSelected && styles.optionRowSelected,
                                step > 1 && !isSelected && { opacity: 0.5 }
                            ]}
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

                        {/* ACCORDION DETAIL FOR ALL TYPES */}
                        {isSelected && (
                            <View style={styles.detailArea}>
                                <Text style={styles.detailLabel}>
                                    {opt.id === 'hourly' ? 'Kaç Saat' :
                                        opt.id === 'daily' ? 'Kaç Gün' :
                                            opt.id === 'weekly' ? 'Kaç Hafta' : 'Kaç Ay'} ve Ne Zaman?
                                </Text>
                                <View style={styles.detailRow}>
                                    <TouchableOpacity style={styles.dateBtn}>
                                        <MaterialCommunityIcons name="calendar" size={20} color="#D4AF37" />
                                        <Text style={styles.dateBtnText}>Başlangıç Seç</Text>
                                    </TouchableOpacity>

                                    <View style={styles.counterContainer}>
                                        <TouchableOpacity onPress={() => setDurationValues(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}>
                                            <MaterialCommunityIcons name="minus-circle-outline" size={28} color="#666" />
                                        </TouchableOpacity>
                                        <Text style={styles.counterText}>
                                            {durationValues.count} {
                                                opt.id === 'hourly' ? 'Saat' :
                                                    opt.id === 'daily' ? 'Gün' :
                                                        opt.id === 'weekly' ? 'Hafta' : 'Ay'
                                            }
                                        </Text>
                                        <TouchableOpacity onPress={() => setDurationValues(prev => ({ ...prev, count: prev.count + 1 }))}>
                                            <MaterialCommunityIcons name="plus-circle" size={28} color="#D4AF37" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.estimateText}>Tahmini Bitiş: 2 Şubat Pazartesi</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );

    const renderLocationStep = () => {
        if (step < 2) return null;
        return (
            <Animated.View style={[styles.stepContainer, { opacity: fadeAnimStep2, transform: [{ translateY: fadeAnimStep2.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <Text style={styles.questionTitle}>2. Makine nerede çalışacak?</Text>

                {/* NEW MAP UI */}
                <View style={[styles.mapContainer, locationValues.locationSet && { borderColor: '#D4AF37' }]}>
                    {/* Dark Map Background */}
                    <ImageBackground
                        source={require('../../assets/map_bg.png')}
                        style={styles.mapImage}
                        imageStyle={{ opacity: 0.4 }} // Dim it down
                    >
                        {/* Dark Overlay for "Night Mode" feel */}
                        <View style={styles.mapDarkOverlay} />

                        {/* Floating Search Bar */}
                        <View style={styles.searchBarFloating}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Şantiye adresi veya ilçe ara..."
                                placeholderTextColor="#999"
                                value={searchText}
                                onChangeText={setSearchText}
                                onSubmitEditing={handleSearchSubmit}
                                returnKeyType="search"
                            />
                            {isSearching && <ActivityIndicator size="small" color="#D4AF37" style={{ marginLeft: 8 }} />}
                        </View>

                        {/* Center Pin (Uber Style) */}
                        <View style={styles.centerPinContainer}>
                            <MaterialCommunityIcons name="map-marker" size={48} color="#D4AF37" style={styles.pinShadow} />
                        </View>

                        {/* GPS Button */}
                        <TouchableOpacity style={styles.gpsButton} onPress={handleGPS}>
                            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#000" />
                        </TouchableOpacity>

                        {/* Bottom Action Area */}
                        <View style={styles.mapBottomBar}>
                            <View style={styles.addressContainer}>
                                <Text style={styles.addressLabel}>Seçilen Konum:</Text>
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {locationValues.address}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.confirmLocationBtn} onPress={handleLocationConfirm}>
                                <Text style={styles.confirmLocationText}>
                                    {locationValues.locationSet ? "GÜNCELLE" : "KONUM İŞARETLE"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </ImageBackground>
                </View>

                {locationValues.locationSet && (
                    <View style={styles.transportToggleRow}>
                        <View>
                            <Text style={styles.toggleLabel}>Nakliye organizasyonunu biz yapalım mı?</Text>
                            {locationValues.transportIncluded && <Text style={styles.warningText}>+ Nakliye bedeli teklife eklenecektir</Text>}
                        </View>
                        <Switch
                            trackColor={{ false: "#333", true: "rgba(212, 175, 55, 0.3)" }}
                            thumbColor={locationValues.transportIncluded ? "#D4AF37" : "#f4f3f4"}
                            onValueChange={(val) => setLocationValues(prev => ({ ...prev, transportIncluded: val }))}
                            value={locationValues.transportIncluded}
                        />
                    </View>
                )}
            </Animated.View>
        );
    };

    const renderServiceStep = () => {
        if (step < 2 || !locationValues.locationSet) return null;

        return (
            <Animated.View style={[styles.stepContainer, { opacity: fadeAnimStep3, transform: [{ translateY: fadeAnimStep3.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <Text style={styles.questionTitle}>3. Operatör ve Yakıt durumu</Text>

                <View style={styles.serviceRow}>
                    <Text style={styles.serviceQuestion}>Operatör desteği istiyor musunuz?</Text>
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, serviceValues.operatorIncluded && styles.segmentBtnActive]}
                            onPress={() => setServiceValues(prev => ({ ...prev, operatorIncluded: true }))}
                        >
                            <Text style={[styles.segmentText, serviceValues.operatorIncluded && styles.segmentTextActive]}>EVET (Dahil)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, !serviceValues.operatorIncluded && styles.segmentBtnActive]}
                            onPress={() => setServiceValues(prev => ({ ...prev, operatorIncluded: false }))}
                        >
                            <Text style={[styles.segmentText, !serviceValues.operatorIncluded && styles.segmentTextActive]}>HAYIR</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.serviceRow, { marginTop: 16 }]}>
                    <Text style={styles.serviceQuestion}>Yakıt durumu?</Text>
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, !serviceValues.fuelIncluded && styles.segmentBtnActive]}
                            onPress={() => {
                                setServiceValues(prev => ({ ...prev, fuelIncluded: false }));
                                handleServiceConfirm();
                            }}
                        >
                            <Text style={[styles.segmentText, !serviceValues.fuelIncluded && styles.segmentTextActive]}>HARİÇ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, serviceValues.fuelIncluded && styles.segmentBtnActive]}
                            onPress={() => {
                                setServiceValues(prev => ({ ...prev, fuelIncluded: true }));
                                handleServiceConfirm();
                            }}
                        >
                            <Text style={[styles.segmentText, serviceValues.fuelIncluded && styles.segmentTextActive]}>DAHİL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const renderSummary = () => {
        if (step < 4) return null;
        return (
            <Animated.View style={[styles.summaryContainer, { opacity: fadeAnimSummary, transform: [{ translateY: fadeAnimSummary.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
                {/* Receipt visual style */}
                <View style={styles.receiptHeader}>
                    <View style={styles.receiptHole} />
                    <View style={styles.receiptHole} />
                    <View style={styles.receiptHole} />
                    <View style={styles.receiptHole} />
                    <View style={styles.receiptHole} />
                    <View style={styles.receiptHole} />
                </View>

                <View style={styles.receiptBody}>
                    <Text style={styles.receiptTitle}>TALEP ÖZETİ</Text>

                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Hizmet:</Text>
                        <Text style={styles.receiptValue}>{item?.name || 'Vinç Kiralama'}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Firma:</Text>
                        <Text style={styles.receiptValue}>{supplier?.name || 'Tedarikçi'}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Süre:</Text>
                        <Text style={styles.receiptValue}>
                            {DURATION_OPTIONS.find(d => d.id === durationValues.type)?.title}
                            {` (${durationValues.count} ${durationValues.type === 'hourly' ? 'Saat' :
                                    durationValues.type === 'daily' ? 'Gün' :
                                        durationValues.type === 'weekly' ? 'Hafta' : 'Ay'
                                })`}
                        </Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Adres:</Text>
                        <Text style={styles.receiptValue} numberOfLines={1}>{locationValues.address}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Operatör:</Text>
                        <Text style={styles.receiptValue}>{serviceValues.operatorIncluded ? 'DAHİL' : 'HARİÇ'}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Nakliye:</Text>
                        <Text style={styles.receiptValue}>{locationValues.transportIncluded ? 'DAHİL (Hesaplanacak)' : 'HARİÇ'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tahmini Tutar:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(estimatedPrice)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert("Başarılı", "Talebiniz firmaya iletildi! Firma sizinle iletişime geçecektir.")}>
                    <Text style={styles.submitBtnText}>TEKLİFİ ONAYLA VE GÖNDER</Text>
                    <MaterialCommunityIcons name="send" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#111']} style={styles.gradient}>
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>AKILLI TALEP SİHİRBAZI</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {renderDurationStep()}
                        {renderLocationStep()}
                        {renderServiceStep()}
                        {renderSummary()}
                    </ScrollView>
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

    // STEP STYLES
    stepContainer: { marginBottom: 30 },
    questionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },

    optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    optionRowSelected: { borderColor: '#D4AF37', backgroundColor: '#222' },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    iconBoxSelected: { backgroundColor: '#D4AF37' },
    optionTitle: { color: '#ccc', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    optionTitleSelected: { color: '#fff' },
    optionSub: { color: '#666', fontSize: 12 },

    // DETAIL AREA
    detailArea: { marginLeft: 60, marginTop: -4, marginBottom: 16, backgroundColor: '#151515', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 12, borderWidth: 1, borderColor: '#D4AF37', borderTopWidth: 0 },
    detailLabel: { color: '#fff', fontSize: 13, marginBottom: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    dateBtnText: { color: '#ccc', fontSize: 12, marginLeft: 6 },
    counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 8, padding: 4 },
    counterText: { color: '#D4AF37', marginHorizontal: 12, fontWeight: 'bold' },
    estimateText: { color: '#D4AF37', fontSize: 11, fontStyle: 'italic', marginTop: 8, textAlign: 'right' },

    // MAP & LOCATION - NEW
    mapContainer: { height: 320, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    mapImage: { width: '100%', height: '100%' },
    mapDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },

    searchBarFloating: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },

    centerPinContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 40, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    pinShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6 },

    gpsButton: { position: 'absolute', right: 20, bottom: 100, backgroundColor: '#D4AF37', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },

    mapBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(20,20,20,0.95)', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
    addressContainer: { marginBottom: 12 },
    addressLabel: { color: '#666', fontSize: 11, marginBottom: 2 },
    addressText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    confirmLocationBtn: { backgroundColor: '#D4AF37', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    confirmLocationText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    transportToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16 },
    toggleLabel: { color: '#fff', fontSize: 14 },
    warningText: { color: '#D4AF37', fontSize: 10, marginTop: 4 },

    // SERVICE STEP
    serviceRow: { marginBottom: 16 },
    serviceQuestion: { color: '#ccc', fontSize: 15, marginBottom: 10 },
    segmentContainer: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 4 },
    segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    segmentBtnActive: { backgroundColor: '#D4AF37' },
    segmentText: { color: '#666', fontWeight: 'bold' },
    segmentTextActive: { color: '#000' },

    // SUMMARY AREA
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
});
