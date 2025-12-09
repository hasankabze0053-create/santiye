import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    InputAccessoryView,
    InteractionManager,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform, ScrollView, StyleSheet,
    Switch, Text, TextInput, TouchableOpacity,
    UIManager, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- DATA ---
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Kastamonu'];
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

const PRESETS = [
    { label: 'Ekonomik', value: 15000, color: '#8C7B75' }, // Dull Bronze Text
    { label: 'Standart', value: 25000, color: '#FFD700' },   // Modern -> Standart
    { label: 'Lüks', value: 40000, color: '#FFD700' }
];

// --- COMPONENTS ---

const SelectionModal = ({ visible, onClose, title, items, onSelect, lockedPredicate }) => {
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
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
                    <LinearGradient colors={['#1a1a1a', '#0F0F0F']} style={styles.modalGradient}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isLocked = lockedPredicate ? lockedPredicate(item) : false;
                                return (
                                    <TouchableOpacity
                                        style={[styles.modalItem, isLocked && { opacity: 0.7 }]}
                                        onPress={() => {
                                            if (isLocked) {
                                                Alert.alert(
                                                    "Premium Özellik 🔒",
                                                    "İlçe bazlı hesaplama sadece Detaylı Analiz bölümünde yapılabilir. Hızlı hesaplamada sadece il geneli ortalama değerler kullanılır.",
                                                    [{ text: "Tamam", style: "cancel" }]
                                                );
                                            } else {
                                                onSelect(item);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={[styles.modalItemText, isLocked && { color: '#888' }]}>{item}</Text>
                                            {isLocked && (
                                                <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                                                    <Text style={{ fontSize: 9, color: '#D4AF37', fontWeight: '600' }}>DETAYLI ANALİZ</Text>
                                                </View>
                                            )}
                                        </View>
                                        {isLocked ? (
                                            <MaterialCommunityIcons name="lock" size={16} color="#D4AF37" style={{ opacity: 0.5 }} />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={16} color="rgba(212, 175, 55, 0.3)" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

// Ruler Background Component
const RulerTrack = () => (
    <View style={styles.rulerContainer}>
        {[...Array(20)].map((_, i) => (
            <View
                key={i}
                style={[
                    styles.rulerTick,
                    i % 5 === 0 ? styles.rulerTickMajor : null
                ]}
            />
        ))}
    </View>
);

// Gradient Border Component to match LuxuryCard stroke
const GoldBorderContainer = ({ children, style, focused }) => (
    <LinearGradient
        colors={['#FFD700', '#FDB931', '#FFFFE0', '#D4AF37', '#C5A028']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBorder, { opacity: focused ? 1 : 0.6 }, style]}
    >
        <View style={styles.innerSurface}>
            {children}
        </View>
    </LinearGradient>
);

export default function SimpleCostScreen({ navigation, route }) {
    const { location: initialLocation } = route.params || {};

    // State
    const [city, setCity] = useState(initialLocation?.city || 'İstanbul');
    const [district, setDistrict] = useState(initialLocation?.district || 'Tümü');

    const [area, setArea] = useState('100');
    const [unitPrice, setUnitPrice] = useState('');
    const [result, setResult] = useState(0);
    const [isUSD, setIsUSD] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('city');

    // Focus State
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    // Animation for result
    const fadeResult = useRef(new Animated.Value(1)).current;

    const EXCHANGE_RATE = 34.50;

    useEffect(() => {
        let taskCancel = null;
        // Check if user came with a specific district selection
        if (initialLocation?.district && initialLocation.district !== 'Tümü') {
            console.log("Restricting district selection from:", initialLocation.district);

            // Use InteractionManager to ensure navigation transition is fully complete
            taskCancel = InteractionManager.runAfterInteractions(() => {
                // Force revert to 'Tümü'
                setDistrict('Tümü');

                // Professional Alert
                Alert.alert(
                    "Bilgilendirme",
                    "İlçe seçiminiz 'Tümü' olarak güncellenmiştir. İlçe bazlı hesaplamayı Detaylı Analiz kısmından yapabilirsiniz.",
                    [{ text: "Tamam" }]
                );
            });
        }

        return () => {
            if (taskCancel) taskCancel.cancel();
        };
    }, [initialLocation]); // Add initialLocation to dependency to ensure it re-runs if params change

    useEffect(() => {
        calculate();
    }, [area, unitPrice, isUSD]);

    const calculate = () => {
        const areaVal = parseFloat(area);
        const priceVal = parseFloat(unitPrice.replace(/\./g, '').replace(',', '.'));

        if (!isNaN(areaVal) && !isNaN(priceVal)) {
            let total = areaVal * priceVal;
            if (isUSD) {
                total = total / EXCHANGE_RATE;
            }

            // Performance: Removed animation to prevent "freezing" on fast input
            setResult(total);
        } else {
            setResult(0);
        }
    };

    const handlePreset = (val) => {
        // Format the preset value like "25.000"
        const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setUnitPrice(formatted);
    };

    // Location Handlers
    const openCityModal = () => { setModalType('city'); setModalVisible(true); };
    const openDistrictModal = () => { setModalType('district'); setModalVisible(true); };

    const handleSelectLocation = (item) => {
        if (modalType === 'city') {
            setCity(item);
            setDistrict('Tümü');
        } else {
            setDistrict(item);
        }
    };

    const getModalItems = () => {
        if (modalType === 'city') return CITIES;
        // Return ALL districts, but visual logic will lock them
        if (modalType === 'district' && city) return ['Tümü', ...(DISTRICTS[city] || [])];
        return [];
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('tr-TR', {
            style: 'currency',
            currency: isUSD ? 'USD' : 'TRY',
            maximumFractionDigits: 0
        });
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "android" ? "height" : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag" // Dismiss keyboard on scroll
                    >

                        {/* Location Pills */}
                        <View style={styles.locationRow}>
                            <TouchableOpacity onPress={openCityModal} style={styles.locationPill}>
                                <Text style={styles.locationPillText}>{city}</Text>
                                <Ionicons name="chevron-down" size={12} color="#FFD700" />
                            </TouchableOpacity>
                            <Text style={{ color: '#444', marginHorizontal: 5 }}>/</Text>
                            <TouchableOpacity onPress={openDistrictModal} style={styles.locationPill}>
                                <Text style={styles.locationPillText}>{district || 'İlçe Seç'}</Text>
                                <Ionicons name="chevron-down" size={12} color="#FFD700" />
                            </TouchableOpacity>
                        </View>

                        {/* Header */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitle}>HIZLI HESAPLAMA</Text>
                            </View>
                            <View style={styles.currencyToggle}>
                                <Text style={[styles.currencyLabel, !isUSD && styles.activeCurrency]}>₺</Text>
                                <Switch
                                    trackColor={{ false: "#333", true: "#1C1C1E" }}
                                    thumbColor={isUSD ? "#FFD700" : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => setIsUSD(!isUSD)}
                                    value={isUSD}
                                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                                <Text style={[styles.currencyLabel, isUSD && styles.activeCurrency]}>$</Text>
                            </View>
                        </View>

                        {/* Area Section */}
                        <GlassCard style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="resize" size={20} color="#FFD700" />
                                <Text style={styles.cardTitle}>TOPLAM İNŞAAT ALANI</Text>
                            </View>

                            {/* Editable Box Perception: Matches LuxuryCard Border Radius and Style */}
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => inputRef.current?.focus()}
                            >
                                <GoldBorderContainer
                                    focused={isInputFocused || isSliding}
                                    style={{
                                        marginBottom: 16,
                                        shadowColor: isSliding ? "#FFD700" : "transparent",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: isSliding ? 0.5 : 0,
                                        shadowRadius: 10,
                                        elevation: isSliding ? 10 : 0
                                    }}
                                >
                                    <View style={styles.inputBoxContent}>
                                        <View style={styles.inputInner}>
                                            <TextInput
                                                ref={inputRef}
                                                style={[
                                                    styles.mainInput,
                                                    isSliding && {
                                                        textShadowColor: 'rgba(255, 215, 0, 0.8)',
                                                        textShadowOffset: { width: 0, height: 0 },
                                                        textShadowRadius: 15
                                                    }
                                                ]}
                                                value={area}
                                                onChangeText={(text) => {
                                                    const numericText = text.replace(/[^0-9]/g, '');
                                                    if (numericText === '') {
                                                        setArea('');
                                                        return;
                                                    }
                                                    const val = parseInt(numericText, 10);
                                                    if (val > 5000) {
                                                        setArea('5000');
                                                    } else {
                                                        setArea(numericText);
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="#666"
                                                onFocus={() => setIsInputFocused(true)}
                                                onBlur={() => setIsInputFocused(false)}
                                                inputAccessoryViewID="toolbar_area" // Unique toolbar for Area
                                            />
                                            <Text style={styles.unitText}>m²</Text>
                                        </View>

                                        <View>
                                            <MaterialCommunityIcons name="pencil-circle" size={24} color="#FFD700" style={{ opacity: 0.8 }} />
                                        </View>
                                    </View>
                                </GoldBorderContainer>
                            </TouchableOpacity>

                            <Text style={styles.helperText}>Yazarak veya sürükleyerek değiştirebilirsiniz</Text>

                            {/* Ruler Slider */}
                            <View style={styles.sliderContainer}>
                                <RulerTrack />
                                <Slider
                                    style={{ width: '100%', height: 40, zIndex: 10 }}
                                    minimumValue={10}
                                    maximumValue={5000}
                                    step={10}
                                    value={parseFloat(area) || 0}
                                    onValueChange={(val) => setArea(val.toString())}
                                    onSlidingStart={() => setIsSliding(true)}
                                    onSlidingComplete={() => setIsSliding(false)}
                                    minimumTrackTintColor="#FFD700"
                                    maximumTrackTintColor="rgba(255,255,255,0.1)"
                                    thumbTintColor="#FFD700"
                                />
                            </View>

                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>10 m²</Text>
                                <Text style={styles.sliderLabel}>5000 m²</Text>
                            </View>
                        </GlassCard>

                        {/* Unit Price Section */}
                        <GlassCard style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="pricetag" size={20} color="#FFD700" />
                                <Text style={styles.cardTitle}>YAPI SINIFI VE FİYAT</Text>
                            </View>

                            <LinearGradient
                                colors={['#0F0F0F', '#141414', '#0A0A0A']}
                                style={styles.presetsContainer}
                            >
                                {PRESETS.map((preset) => {
                                    // Robust Comparison: Remove dots and compare numeric values
                                    const currentPrice = parseFloat(unitPrice.replace(/\./g, '')) || 0;
                                    const presetPrice = preset.value;
                                    const isActive = currentPrice === presetPrice;

                                    return (
                                        <TouchableOpacity
                                            key={preset.label}
                                            style={[
                                                styles.presetButtonWrapper,
                                                isActive && styles.activeWrapper // For Halo
                                            ]}
                                            onPress={() => handlePreset(preset.value)}
                                            activeOpacity={0.9}
                                        >
                                            {isActive ? (
                                                <LinearGradient
                                                    colors={['#FFD700', '#FDB931', '#D4AF37', '#B8860B']}
                                                    style={styles.presetGradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 0, y: 1 }} // Vertical brushed look
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Text style={[styles.presetLabel, { color: '#000', textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 2 }]}>
                                                            {preset.label}
                                                        </Text>
                                                        {preset.label === 'Lüks' && (
                                                            <MaterialCommunityIcons name="diamond" size={14} color="#000" style={{ opacity: 0.8 }} />
                                                        )}
                                                    </View>
                                                </LinearGradient>
                                            ) : (
                                                <LinearGradient
                                                    colors={['#2E2E2E', '#1C1C1C', '#0F0F0F']}
                                                    style={styles.presetNormal}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 0, y: 1 }} // Vertical lighting
                                                >
                                                    <Text style={[styles.presetLabel, { color: '#6B5B55', textShadowColor: 'rgba(0,0,0,1)', textShadowRadius: 1 }]}>
                                                        {preset.label}
                                                    </Text>
                                                </LinearGradient>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </LinearGradient>

                            {/* Secondary Input with Thin Gold Border */}
                            <GoldBorderContainer style={{ borderRadius: 12, padding: 1 }} focused={true}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 16 }}>
                                    <TextInput
                                        style={[styles.secondaryInput, { borderWidth: 0, marginTop: 0, flex: 1 }]} // Remove default border
                                        value={unitPrice}
                                        onChangeText={(text) => {
                                            // Remove non-numeric characters
                                            const raw = text.replace(/[^0-9]/g, '');
                                            // Format with thousand separator
                                            const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                            setUnitPrice(formatted);
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Özel Birim Fiyat Giriniz"
                                        placeholderTextColor="#666"
                                        onFocus={() => {
                                            // User requested auto-scroll back.
                                            // Adding small delay to let keyboard start appearing for smooth transition.
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
                                        inputAccessoryViewID="toolbar_price" // Unique toolbar for Price
                                    />
                                    {unitPrice.length > 0 && (
                                        <Text style={{ color: '#FFD700', fontWeight: '600', marginLeft: 8 }}>
                                            {isUSD ? '$/m²' : 'TL/m²'}
                                        </Text>
                                    )}
                                </View>
                            </GoldBorderContainer>
                        </GlassCard>

                        {/* Result Section */}
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultLabel}>TAHMİNİ MALİYET</Text>
                            <Animated.Text style={[styles.resultValue, { opacity: fadeResult, color: '#FFD700' }]}>
                                {formatCurrency(result)}
                            </Animated.Text>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('DetailedCost', {
                                location: { city, district: district }, // Pass current location
                                initialArea: area // Pass current area
                            })}
                        >
                            <LinearGradient
                                colors={['#FFD700', '#FFAB00', '#B8860B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveButtonGradient}
                            >
                                <Text style={styles.saveButtonText}>DETAYLI RAPOR AL</Text>
                                <Ionicons name="document-text-outline" size={22} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Selection Modal */}
                <SelectionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalType === 'city' ? 'İL SEÇİN' : 'İLÇE SEÇİN'}
                    items={getModalItems()}
                    onSelect={handleSelectLocation}
                    lockedPredicate={(item) => modalType === 'district' && item !== 'Tümü'}
                />

                {/* InputAccessoryView for iOS Numeric Keyboard - Moved to bottom */}
                {/* InputAccessoryView for Area Input */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_area">
                        <View style={styles.accessoryContainer}>
                            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryButton}>
                                <Text style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}

                {/* InputAccessoryView for Price Input */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_price">
                        <View style={styles.accessoryContainer}>
                            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryButton}>
                                <Text style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}
            </SafeAreaView>
        </PremiumBackground >
    );
}

const styles = StyleSheet.create({
    content: { padding: 20, paddingTop: 10 },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationPill: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    locationPillText: {
        color: '#FFD700',
        fontWeight: '600',
        fontSize: 13,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '200',
        color: '#fff',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-thin' : 'System',
    },
    currencyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    currencyLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginHorizontal: 4,
    },
    activeCurrency: {
        color: '#FFD700',
    },
    card: {
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    cardTitle: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    gradientBorder: {
        padding: 1.5,
        borderRadius: 16,
    },
    innerSurface: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        flex: 1,
    },
    inputBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputInner: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    mainInput: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        minWidth: 50,
    },
    unitText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
        marginTop: 8,
    },
    helperText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 4,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    sliderContainer: {
        position: 'relative',
        justifyContent: 'center',
        height: 50,
    },
    rulerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 0,
        opacity: 0.5,
    },
    rulerTick: {
        width: 1,
        height: 10,
        backgroundColor: '#444',
    },
    rulerTickMajor: {
        height: 20,
        backgroundColor: '#FFD700',
        width: 2,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
        paddingHorizontal: 4
    },
    sliderLabel: {
        fontSize: 10,
        color: '#666',
    },
    presetsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        backgroundColor: '#050505',
        padding: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    presetButtonWrapper: {
        flex: 1,
        borderRadius: 14,
        overflow: 'visible',
    },
    activeWrapper: {
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 10,
    },
    presetNormal: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    presetGradient: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFE0',
    },
    presetLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    secondaryInput: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    resultContainer: {
        marginTop: 24,
        alignItems: 'center',
        padding: 24,
    },
    resultLabel: {
        color: '#8E8E93',
        fontSize: 13,
        letterSpacing: 2,
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    resultValue: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 1,
        textShadowColor: 'rgba(255, 215, 0, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    saveButton: {
        marginTop: 24,
        marginBottom: 40,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 8,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    accessoryContainer: {
        backgroundColor: '#1C1C1E',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    accessoryButton: {
        paddingHorizontal: 16,
    },
    accessoryText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        overflow: 'hidden',
    },
    modalGradient: {
        flex: 1,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,215,0,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '300',
        color: '#FFD700',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 8,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalItemText: {
        fontSize: 16,
        color: '#fff',
    }
});



