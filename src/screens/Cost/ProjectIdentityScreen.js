import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LuxuryCard from '../../components/LuxuryCard';
import PremiumBackground from '../../components/PremiumBackground';

const { height } = Dimensions.get('window');

// --- DATA ---
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Kastamonu', 'Antalya', 'Bursa'];

const DISTRICTS = {
    'İstanbul': [
        'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
        'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy',
        'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
        'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli',
        'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'
    ],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Güzelbahçe'],
    'Kastamonu': ['Merkez', 'Tosya', 'Taşköprü', 'Cide', 'İnebolu', 'Bozkurt', 'Abana', 'Daday']
};

// --- COMPONENTS ---
const SelectionModal = ({ visible, onClose, title, items, onSelect }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={localStyles.modalOverlay}>
                <Animated.View style={[localStyles.modalContent, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
                    <LinearGradient colors={['#1a1a1a', '#0F0F0F']} style={localStyles.modalGradient}>
                        <View style={localStyles.modalHeader}>
                            <Text style={localStyles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
                                <Ionicons name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={localStyles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                                    <Text style={localStyles.modalItemText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(212, 175, 55, 0.3)" />
                                </TouchableOpacity>
                            )}
                        />
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default function ProjectIdentityScreen({ navigation, route }) {
    // Location State
    const [location, setLocation] = useState(route.params?.location || { city: 'İstanbul', district: 'Tümü' });

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('city'); // 'city' or 'district'

    // --- MODES ---
    const [isManualMode, setIsManualMode] = useState(false);

    // --- FORM STATE ---
    const [manualArea, setManualArea] = useState('');
    const [baseArea, setBaseArea] = useState(''); // Default empty for placeholder
    const [floorsAbove, setFloorsAbove] = useState(5);
    const [basementFloors, setBasementFloors] = useState(1);
    const [shelterType, setShelterType] = useState('none');
    const [parkingType, setParkingType] = useState('open');
    const [estimatedArea, setEstimatedArea] = useState(0);

    // --- CALCULATION ---
    const calculateTotalArea = useCallback(() => {
        const base = parseFloat(baseArea) || 0;

        // 1. Above Ground
        const aboveGround = base * floorsAbove;

        // 2. Underground
        let underGround = base * basementFloors;

        // Shelter Effect
        if (shelterType === 'half') underGround += base * 0.5;
        if (shelterType === 'full') underGround += base;

        // Parking Effect
        let extraParking = 0;
        if (parkingType === 'closed_under') {
            extraParking = base; // Acts like +1 basement floor area
        }

        const total = aboveGround + underGround + extraParking;
        setEstimatedArea(Math.round(total));
    }, [baseArea, floorsAbove, basementFloors, shelterType, parkingType]);

    useEffect(() => {
        calculateTotalArea();
    }, [calculateTotalArea]);

    // --- HANDLERS ---
    const handleNext = () => {
        // SAFEGUARD: Ensure numbers are not NaN
        const projectData = {
            baseArea: parseFloat(baseArea) || 0,
            floorsAbove: floorsAbove || 0,
            basementFloors: basementFloors || 0,
            shelterType,
            parkingType,
            estimatedArea: estimatedArea || 0
        };

        const targetArea = isManualMode ? (parseFloat(manualArea) || 0) : estimatedArea;

        if (targetArea === 0) {
            alert("Lütfen geçerli bir alan giriniz.");
            return;
        }

        navigation.navigate('DetailedCost', {
            area: targetArea.toFixed(2),
            perimeter: (Math.sqrt(targetArea) * 4).toFixed(2), // Generic perimeter
            shape: isManualMode ? 'manual' : 'auto',
            location,
            projectData
        });
    };

    const goToSketch = () => {
        const baseVal = parseFloat(baseArea) || 120; // Default fallback for sketch
        navigation.navigate('SmartSketch', {
            location,
            projectData: { baseArea: baseVal },
            initialBaseArea: baseVal.toString()
        });
    };

    const openLocationModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleLocationSelect = (item) => {
        if (modalType === 'city') {
            setLocation({ city: item, district: 'Tümü' });
        } else {
            setLocation({ ...location, district: item });
        }
    };

    const getModalItems = () => {
        if (modalType === 'city') return CITIES;
        if (modalType === 'district') return DISTRICTS[location.city] || [];
        return [];
    };

    // --- SUB-COMPONENTS ---
    const Stepper = ({ label, value, onChange, min = 0 }) => (
        <View style={localStyles.stepperRow}>
            <Text style={localStyles.stepperLabel}>{label}</Text>
            <View style={localStyles.stepperControls}>
                <TouchableOpacity style={localStyles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
                    <Ionicons name="remove" size={20} color="#D4AF37" />
                </TouchableOpacity>
                <Text style={localStyles.stepValue}>{value}</Text>
                <TouchableOpacity style={localStyles.stepBtn} onPress={() => onChange(value + 1)}>
                    <Ionicons name="add" size={20} color="#D4AF37" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const SegmentOption = ({ label, selected, onPress }) => (
        <TouchableOpacity style={[localStyles.segmentBtn, selected && localStyles.segmentBtnActive]} onPress={onPress}>
            <Text style={[localStyles.segmentText, selected && localStyles.segmentTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                    {/* CUSTOM HEADER (Clean - No Title) */}
                    <View style={localStyles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                        </TouchableOpacity>

                        <View style={localStyles.headerContent}>
                            {/* Title removed as requested */}
                            <View style={localStyles.locationRow}>
                                {/* City Selector (Gold Filled) */}
                                <TouchableOpacity style={localStyles.locBox} onPress={() => openLocationModal('city')}>
                                    <Ionicons name="map" size={14} color="#000" />
                                    <Text style={localStyles.locText}>{location.city}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={14} color="#000" />
                                </TouchableOpacity>

                                {/* District Selector (Gold Filled) */}
                                <TouchableOpacity style={localStyles.locBox} onPress={() => openLocationModal('district')}>
                                    <Ionicons name="location" size={14} color="#000" />
                                    <Text style={localStyles.locText}>{location.district || 'İlçe Seç'}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={14} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

                        {/* MODE SWITCH */}
                        <LuxuryCard style={localStyles.modeCard}>
                            <View style={localStyles.rowBetween}>
                                <View>
                                    <Text style={localStyles.modeTitle}>Elimde Hazır Metraj Var</Text>
                                    <Text style={localStyles.modeSubtitle}>Çizim yapmadan direkt maliyete geç</Text>
                                </View>
                                <Switch
                                    value={isManualMode}
                                    onValueChange={setIsManualMode}
                                    trackColor={{ false: "#333", true: "rgba(212, 175, 55, 0.5)" }}
                                    thumbColor={isManualMode ? "#D4AF37" : "#f4f3f4"}
                                />
                            </View>
                        </LuxuryCard>

                        {isManualMode ? (
                            <View style={{ marginTop: 20 }}>
                                <LuxuryCard style={{ padding: 24, alignItems: 'center' }}>
                                    <Text style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: 16 }}>TOPLAM İNŞAAT ALANI (m²)</Text>
                                    <TextInput
                                        style={localStyles.largeInput}
                                        value={manualArea}
                                        onChangeText={setManualArea}
                                        placeholder="Örn: 2500"
                                        placeholderTextColor="#444"
                                        keyboardType="numeric"
                                        inputAccessoryViewID="toolbar_project_identity"
                                    // Removed autoFocus as it can cause issues on some transitions
                                    />
                                </LuxuryCard>
                            </View>
                        ) : (
                            <View style={{ gap: 20, marginTop: 10 }}>

                                {/* A. TABAN ALANI */}
                                <LuxuryCard>
                                    <View style={localStyles.cardHeader}>
                                        <MaterialCommunityIcons name="floor-plan" size={20} color="#D4AF37" />
                                        <Text style={localStyles.cardTitle}>TEMEL / TABAN ALANI</Text>
                                    </View>
                                    <View style={localStyles.rowCenter}>
                                        <TextInput
                                            style={localStyles.largeInput}
                                            value={baseArea}
                                            onChangeText={setBaseArea}
                                            keyboardType="numeric"
                                            placeholder="Örn: 120"
                                            placeholderTextColor="#444"
                                            inputAccessoryViewID="toolbar_project_identity"
                                        />
                                        <Text style={localStyles.unitTextLarge}>m²</Text>
                                    </View>
                                    <Text style={localStyles.hintTextCenter}>Binanın toprağa bastığı alan</Text>

                                    {/* ENLARGED SKETCH BUTTON */}
                                    <TouchableOpacity style={localStyles.sketchButtonLarge} onPress={goToSketch}>
                                        <MaterialCommunityIcons name="pencil-ruler" size={20} color="#000" />
                                        <Text style={localStyles.sketchButtonTextLarge}>DETAYLI ÇİZEREK HESAPLA</Text>
                                    </TouchableOpacity>
                                </LuxuryCard>

                                {/* B. ZEMİN ÜSTÜ */}
                                <LuxuryCard>
                                    <View style={localStyles.cardHeader}>
                                        <MaterialCommunityIcons name="office-building" size={20} color="#D4AF37" />
                                        <Text style={localStyles.cardTitle}>ZEMİN ÜSTÜ KATLAR</Text>
                                    </View>
                                    <Stepper label="Kat Sayısı (Zemin + Normal)" value={floorsAbove} onChange={setFloorsAbove} min={1} />
                                </LuxuryCard>

                                {/* C. TOPRAK ALTI */}
                                <LuxuryCard>
                                    <View style={localStyles.cardHeader}>
                                        <MaterialCommunityIcons name="arrow-down-bold-box" size={20} color="#D4AF37" />
                                        <Text style={localStyles.cardTitle}>TOPRAK ALTI</Text>
                                    </View>
                                    <Stepper label="Bodrum Kat Sayısı" value={basementFloors} onChange={setBasementFloors} />
                                    <View style={localStyles.divider} />
                                    <Text style={localStyles.subLabel}>Sığınak Durumu:</Text>
                                    <View style={localStyles.segmentRow}>
                                        <SegmentOption label="Yok" selected={shelterType === 'none'} onPress={() => setShelterType('none')} />
                                        <SegmentOption label="Yarım Kat" selected={shelterType === 'half'} onPress={() => setShelterType('half')} />
                                        <SegmentOption label="Tam Kat" selected={shelterType === 'full'} onPress={() => setShelterType('full')} />
                                    </View>
                                </LuxuryCard>

                                {/* D. OTOPARK */}
                                <LuxuryCard>
                                    <View style={localStyles.cardHeader}>
                                        <MaterialCommunityIcons name="car" size={20} color="#D4AF37" />
                                        <Text style={localStyles.cardTitle}>OTOPARK ÇÖZÜMÜ</Text>
                                    </View>
                                    <View style={localStyles.verSegmentContainer}>
                                        <SegmentOption label="Açık / Yok" selected={parkingType === 'open'} onPress={() => setParkingType('open')} />
                                        <SegmentOption label="Kapalı (Bina Altına Kat İnilecek)" selected={parkingType === 'closed_under'} onPress={() => setParkingType('closed_under')} />
                                    </View>
                                    {parkingType === 'closed_under' &&
                                        <Text style={localStyles.warningText}>ℹ️ Hesaplamaya +1 Kat (Taban Alanı kadar) eklendi.</Text>
                                    }
                                </LuxuryCard>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* GOLD DONE BUTTON ACCESSORY */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_project_identity">
                        <View style={localStyles.accessoryContainer}>
                            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={localStyles.accessoryButton}>
                                <Text style={localStyles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}

                {/* FOOTER */}
                <View style={localStyles.footer}>
                    {!isManualMode && (
                        <View style={localStyles.estimationBox}>
                            <Text style={localStyles.estLabel}>TAHMİNİ TOPLAM ALAN</Text>
                            <Text style={localStyles.estValue}>{estimatedArea} m²</Text>
                        </View>
                    )}
                    <TouchableOpacity style={localStyles.confirmBtn} onPress={handleNext}>
                        <LinearGradient colors={['#D4AF37', '#AA8C2C']} style={localStyles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={localStyles.btnText}>ANALİZİ BAŞLAT</Text>
                            <Ionicons name="rocket-outline" size={24} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* MODAL */}
                <SelectionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalType === 'city' ? "İL SEÇİN" : "İLÇE SEÇİN"}
                    items={getModalItems()}
                    onSelect={handleLocationSelect}
                />
            </SafeAreaView>
        </PremiumBackground>
    );
}

const localStyles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#222' },
    backButton: { marginRight: 16 },
    headerContent: { flex: 1 },
    locationRow: { flexDirection: 'row', gap: 10 },

    locBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#D4AF37', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10
    },
    locText: { color: '#000', fontSize: 13, fontWeight: 'bold' },

    modeCard: { padding: 16, borderColor: '#D4AF37', borderWidth: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modeTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modeSubtitle: { color: '#888', fontSize: 12 },

    largeInput: {
        fontSize: 32, color: '#fff', fontWeight: 'bold',
        borderBottomWidth: 2, borderBottomColor: '#D4AF37',
        width: '60%', textAlign: 'center', paddingBottom: 8
    },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

    rowCenter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12 },
    unitTextLarge: { color: '#D4AF37', fontSize: 24, marginBottom: 8, fontWeight: 'bold' },
    hintTextCenter: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 },

    // Enlarged Sketch Button Styles
    sketchButtonLarge: {
        marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#D4AF37', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12,
        alignSelf: 'stretch', marginHorizontal: 20,
        shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4
    },
    sketchButtonTextLarge: { color: '#000', fontWeight: 'bold', fontSize: 14, marginLeft: 8, letterSpacing: 0.5 },

    stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
    stepperLabel: { color: '#ccc', fontSize: 14 },
    stepperControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
    stepBtn: { padding: 10 },
    stepValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', width: 32, textAlign: 'center' },

    divider: { height: 1, backgroundColor: '#222', marginVertical: 12 },
    subLabel: { color: '#666', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },

    segmentRow: { flexDirection: 'row', gap: 8 },
    segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },
    segmentBtnActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.15)' },
    segmentText: { color: '#666', fontSize: 12, fontWeight: '600' },
    segmentTextActive: { color: '#D4AF37' },

    verSegmentContainer: { gap: 8 },
    warningText: { color: '#E1B000', fontSize: 11, marginTop: 8 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222', padding: 20 },
    estimationBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    estLabel: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    estValue: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },

    confirmBtn: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 12 },
    btnText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { height: height * 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    modalGradient: { flex: 1, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.2)', paddingBottom: 16 },
    modalTitle: { fontSize: 16, color: '#D4AF37', fontWeight: 'bold', letterSpacing: 2 },
    closeButton: { padding: 4 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalItemText: { color: '#eee', fontSize: 16, fontWeight: '300', letterSpacing: 0.5 },

    // Gold Accessory Style
    accessoryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        padding: 8,
    },
    accessoryButton: {
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    accessoryText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
