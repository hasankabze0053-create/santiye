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
import { useTheme } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { DISTRICTS as ALL_DISTRICTS, getSortedCities } from '../../constants/TurkeyLocations';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- DATA ---
const CITIES = getSortedCities();

const PRESETS = [
    { label: 'Ekonomik', value: 29000 }, // Dull Bronze Text
    { label: 'Standart', value: 35000 },   // Modern -> Standart
    { label: 'Lüks', value: 47000 }
];

// --- COMPONENTS ---

const SelectionModal = ({ visible, onClose, title, items, onSelect, lockedPredicate, T, styles, isDarkMode }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (visible) {
            setSearchText('');
            Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    const filteredItems = items.filter(val => val.toLocaleLowerCase('tr').includes(searchText.toLocaleLowerCase('tr')));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
                <TouchableOpacity activeOpacity={1} style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }) }] }]}>
                        <LinearGradient colors={isDarkMode ? ['#1a1a1a', '#0a0a0a'] : ['#FFFFFF', '#FDFBF7']} style={styles.modalGradient}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.modalTitle}>{title}</Text>
                                    <View style={styles.titleUnderline} />
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={28} color={T?.goldPrimary || '#D4AF37'} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchContainer}>
                                <MaterialCommunityIcons name="magnify" size={20} color={T?.goldPrimary || '#D4AF37'} style={{ marginRight: 10 }} />
                                <TextInput allowFontScaling={false}
                                    style={styles.searchInput}
                                    placeholder="Ara..."
                                    placeholderTextColor={T?.textSecondary || '#555'}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCorrect={false}
                                />
                            </View>

                            <FlatList
                                data={filteredItems}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => {
                                    const isLocked = lockedPredicate ? lockedPredicate(item) : false;
                                    const isPriority = ['İstanbul', 'Ankara', 'İzmir'].includes(item);
                                    
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                <Text allowFontScaling={false} style={[styles.modalItemText, isLocked && { color: T?.textSecondary || '#888' }]}>{item}</Text>
                                            </View>
                                            {isLocked ? (
                                                <MaterialCommunityIcons name="lock" size={16} color={T?.goldPrimary || '#D4AF37'} style={{ opacity: 0.5 }} />
                                            ) : (
                                                <MaterialCommunityIcons name="chevron-right" size={16} color={isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 130, 15, 0.3)'} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// Ruler Background Component
const RulerTrack = ({ styles }) => (
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
const GoldBorderContainer = ({ children, style, focused, T, styles }) => (
    <LinearGradient
        colors={[T.goldPrimary, '#FDB931', '#FFFFE0', '#D4AF37', '#C5A028']}
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
    const { isDarkMode } = useTheme();
    const T = {
        bg: isDarkMode ? '#000000' : '#FDFBF7',
        textPrimary: isDarkMode ? '#FFFFFF' : '#111111',
        textSecondary: isDarkMode ? '#666666' : '#888888',
        card: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        border: isDarkMode ? '#333333' : '#E8E0D0',
        goldPrimary: '#D4AF37',
        iconColor: '#D4AF37',
        pillBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        pillBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        inputBg: isDarkMode ? '#1E1E1E' : '#F9F6F0',
        presetBgNormal: isDarkMode ? ['#2E2E2E', '#1C1C1C', '#0F0F0F'] : ['#F4EFE5', '#EAE3D3', '#E0D6C1'],
        presetBgActive: isDarkMode ? [T.goldPrimary, '#FDB931', '#D4AF37', '#B8860B'] : ['#D4AF37', '#C5A028', '#B8820F'],
        presetTextNormal: isDarkMode ? '#6B5B55' : '#8C7B75',
        presetTextActive: isDarkMode ? '#000000' : '#FFFFFF',
        premiumActionBg: isDarkMode ? '#0F0F0F' : '#FFFFFF',
    };
    const styles = getStyles(T, isDarkMode);

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
        if (modalType === 'district' && city) {
            const rawDistricts = ALL_DISTRICTS[city] || ['Merkez'];
            return Array.from(new Set(['Tümü', ...rawDistricts]));
        }
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

                        {/* Location Selection with Button-like Labels */}
                        <View style={styles.locationSelectionRow}>
                            <View style={styles.locationBlock}>
                                <Text allowFontScaling={false} style={styles.locationButtonLabel}>İL</Text>
                                <TouchableOpacity onPress={openCityModal} style={styles.locationPill}>
                                    <Text allowFontScaling={false} style={styles.locationPillTextCity}>{city}</Text>
                                    <Ionicons name="chevron-down" size={12} color={T.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.locationBlock}>
                                <Text allowFontScaling={false} style={styles.locationButtonLabel}>İLÇE</Text>
                                <TouchableOpacity onPress={openDistrictModal} style={styles.locationPill}>
                                    <Text allowFontScaling={false} style={styles.locationPillTextDistrict}>{district || 'İlçe Seç'}</Text>
                                    <Ionicons name="chevron-down" size={12} color={T.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Header */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={T.textPrimary} />
                            </TouchableOpacity>
                            <View style={styles.headerTitleContainer}>
                                <Text allowFontScaling={false} style={styles.headerTitle}>KONUT İNŞAATI</Text>
                            </View>
                            <View style={styles.currencyToggle}>
                                <Text allowFontScaling={false} style={[styles.currencyLabel, !isUSD && styles.activeCurrency]}>₺</Text>
                                <Switch
                                    trackColor={{ false: "#333", true: "#1C1C1E" }}
                                    thumbColor={isUSD ? T.goldPrimary : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => setIsUSD(!isUSD)}
                                    value={isUSD}
                                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                />
                                <Text allowFontScaling={false} style={[styles.currencyLabel, isUSD && styles.activeCurrency]}>$</Text>
                            </View>
                        </View>

                        {/* Area Section */}
                        <GlassCard style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="resize" size={20} color={T.iconColor} />
                                <Text allowFontScaling={false} style={styles.cardTitle}>TOPLAM İNŞAAT ALANI</Text>
                            </View>

                            {/* Editable Box Perception: Matches LuxuryCard Border Radius and Style */}
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => inputRef.current?.focus()}
                            >
                                <GoldBorderContainer T={T} styles={styles} focused={isInputFocused || isSliding} style={{
                                        marginBottom: 16,
                                        shadowColor: isSliding ? T.goldPrimary : "transparent",
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: isSliding ? 0.5 : 0,
                                        shadowRadius: 10,
                                        elevation: isSliding ? 10 : 0
                                    }}
                                >
                                    <View style={styles.inputBoxContent}>
                                        <View style={styles.inputInner}>
                                            <TextInput allowFontScaling={false}
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
                                            <Text allowFontScaling={false} style={styles.unitText}>m²</Text>
                                        </View>

                                        <View>
                                            <MaterialCommunityIcons name="pencil-circle" size={24} color={T.iconColor} style={{ opacity: 0.8 }} />
                                        </View>
                                    </View>
                                </GoldBorderContainer>
                            </TouchableOpacity>

                            <Text allowFontScaling={false} style={styles.helperText}>Yazarak veya sürükleyerek değiştirebilirsiniz</Text>

                            {/* Ruler Slider */}
                            <View style={styles.sliderContainer}>
                                <RulerTrack styles={styles} />
                                {/* Custom Thin & Shiny Track */}
                                <View style={{
                                    ...StyleSheet.absoluteFillObject,
                                    justifyContent: 'center',
                                    paddingHorizontal: 10, // Match slider thumb separation
                                    zIndex: 5,
                                }}>
                                    <View style={{
                                        width: '100%',
                                        height: 2,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: 1,
                                    }}>
                                        {/* Filled Track Gradient Simulation */}
                                        <View style={{
                                            width: `${((parseFloat(area) - 10) / (5000 - 10)) * 100}%`,
                                            height: '100%',
                                            backgroundColor: T.goldPrimary,
                                            borderRadius: 1,
                                            shadowColor: T.goldPrimary,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 1,
                                            shadowRadius: 8,
                                            elevation: 10,
                                        }} />
                                    </View>
                                </View>

                                {/* Custom Premium Thumb (Ghost Follower) */}
                                <View style={{
                                    ...StyleSheet.absoluteFillObject,
                                    zIndex: 6,
                                    justifyContent: 'center',
                                    paddingHorizontal: 10, // Match track padding
                                    pointerEvents: 'none',
                                }}>
                                    <View style={{
                                        position: 'absolute',
                                        left: `${((parseFloat(area) - 10) / (5000 - 10)) * 100}%`,
                                        marginLeft: 10 - 14,
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: T.goldPrimary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 10,
                                        elevation: 10,
                                    }}>
                                        <LinearGradient
                                            colors={['#996515', '#FFD700', '#FDB931']} // Reverted to Gradient
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: 14,
                                                borderWidth: 1,
                                                borderColor: 'rgba(255,255,255,0.4)',
                                            }}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        />
                                    </View>
                                </View>

                                <Slider
                                    style={{ width: '100%', height: '100%', zIndex: 10 }}
                                    minimumValue={10}
                                    maximumValue={5000}
                                    step={10}
                                    value={parseFloat(area) || 0}
                                    onValueChange={(val) => setArea(val.toString())}
                                    onSlidingStart={() => setIsSliding(true)}
                                    onSlidingComplete={() => setIsSliding(false)}
                                    minimumTrackTintColor="transparent"
                                    maximumTrackTintColor="transparent"
                                    thumbTintColor="transparent" // Hide native thumb
                                />
                            </View>

                            <View style={styles.sliderLabels}>
                                <Text allowFontScaling={false} style={styles.sliderLabel}>10 m²</Text>
                                <Text allowFontScaling={false} style={styles.sliderLabel}>5000 m²</Text>
                            </View>
                        </GlassCard>

                        {/* Unit Price Section */}
                        <GlassCard style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="pricetag" size={20} color={T.iconColor} />
                                <Text allowFontScaling={false} style={styles.cardTitle}>YAPI SINIFI VE FİYAT</Text>
                            </View>

                            <View style={styles.presetsContainer}>
                                {PRESETS.map((preset) => {
                                    const currentPrice = parseFloat(unitPrice.replace(/\./g, '')) || 0;
                                    const presetPrice = preset.value;
                                    const isActive = currentPrice === presetPrice;

                                    return (
                                        <TouchableOpacity
                                            key={preset.label}
                                            style={[
                                                styles.presetButtonWrapper,
                                                isActive && styles.activeWrapper
                                            ]}
                                            onPress={() => handlePreset(preset.value)}
                                            activeOpacity={0.9}
                                        >
                                            <LinearGradient
                                                colors={isActive ? T.presetBgActive : T.presetBgNormal}
                                                style={isActive ? styles.presetGradient : styles.presetNormal}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Text allowFontScaling={false} style={[styles.presetLabel, { color: isActive ? T.presetTextActive : T.presetTextNormal }]}>
                                                        {preset.label}
                                                    </Text>
                                                    {preset.label === 'Lüks' && (
                                                        <MaterialCommunityIcons name="diamond" size={14} color={isActive ? T.presetTextActive : T.presetTextNormal} style={{ opacity: 0.8 }} />
                                                    )}
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Secondary Input with Thin Gold Border */}
                            <GoldBorderContainer T={T} styles={styles} style={{ borderRadius: 12, padding: 1 }} focused={true}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 16 }}>
                                    <TextInput allowFontScaling={false}
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
                                        <Text allowFontScaling={false} style={{ color: T.goldPrimary, fontWeight: '600', marginLeft: 8 }}>
                                            {isUSD ? '$/m²' : 'TL/m²'}
                                        </Text>
                                    )}
                                </View>
                            </GoldBorderContainer>
                        </GlassCard>

                        {/* Result Section */}
                        <View style={styles.resultContainer}>
                            <Text allowFontScaling={false} style={styles.resultLabelSmall}>TAHMİNİ</Text>
                            <Text allowFontScaling={false} style={styles.resultLabel}>ANAHTAR TESLİM KONUT MALİYETİ</Text>
                            <Animated.Text style={[styles.resultValue, { opacity: fadeResult }]}>
                                {formatCurrency(result)}
                            </Animated.Text>
                        </View>

                        <View style={styles.premiumActionCard}>
                            <View style={styles.premiumActionHeader}>
                                <View style={styles.premiumActionIconBox}>
                                    <MaterialCommunityIcons name="crane" size={24} color="#000" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.premiumActionTitle}>Anahtar Teslim İnşaat Teklifi</Text>
                                    <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Lisanslı müteahhitlerden resmi teklif alın.</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                activeOpacity={0.9} 
                                onPress={() => navigation.navigate('ConstructionOffer', {
                                    location: { city, district: district },
                                    initialArea: area
                                })}
                            >
                                <LinearGradient
                                    colors={['#B8820F', '#D4AF37', '#8C6A30']}
                                    style={styles.premiumActionButton}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    <Text allowFontScaling={false} style={styles.premiumActionButtonText}>HEMEN TEKLİF AL</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Selection Modal */}
                <SelectionModal visible={modalVisible} onClose={() => setModalVisible(false)} title={modalType === 'city' ? 'İL SEÇİN' : 'İLÇE SEÇİN'} items={getModalItems()} onSelect={handleSelectLocation} lockedPredicate={(item) => modalType === 'district' && item !== 'Tümü'} T={T} styles={styles} isDarkMode={isDarkMode} />

                {/* InputAccessoryView for iOS Numeric Keyboard - Moved to bottom */}
                {/* InputAccessoryView for Area Input */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_area">
                        <View style={styles.accessoryContainer}>
                            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryButton}>
                                <Text allowFontScaling={false} style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}

                {/* InputAccessoryView for Price Input */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_price">
                        <View style={styles.accessoryContainer}>
                            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryButton}>
                                <Text allowFontScaling={false} style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}
            </SafeAreaView>
        </PremiumBackground >
    );
}

export function getStyles(T, isDarkMode) {
    return StyleSheet.create({
    content: { padding: 20, paddingTop: 10 },
    locationSelectionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
        marginTop: 10,
    },
    locationBlock: {
        alignItems: 'center',
        gap: 8,
    },
    locationButtonLabel: {
        color: T.goldPrimary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    locationPill: {
        backgroundColor: T.pillBg,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: T.pillBorder,
    },
    locationPillTextCity: {
        color: T.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    locationPillTextDistrict: {
        color: T.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
        backgroundColor: T.pillBg,
        borderRadius: 12,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: T.textPrimary,
        letterSpacing: 1.5, textTransform: 'uppercase',
        
    },
    currencyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.pillBg,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: T.pillBorder
    },
    currencyLabel: {
        fontSize: 14,
        color: T.textSecondary,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    activeCurrency: {
        color: T.goldPrimary,
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
        color: T.textSecondary,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    gradientBorder: {
        padding: 1.5,
        borderRadius: 16,
    },
    innerSurface: {
        backgroundColor: T.inputBg,
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
        color: T.textPrimary,
        minWidth: 50,
    },
    unitText: {
        fontSize: 16,
        color: T.textSecondary,
        marginLeft: 8,
        fontWeight: '500',
        marginTop: 8,
    },
    helperText: {
        fontSize: 10,
        color: T.textSecondary,
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
        backgroundColor: isDarkMode ? '#444' : '#E8E0D0',
    },
    rulerTickMajor: {
        height: 20,
        backgroundColor: T.goldPrimary,
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
        color: T.textSecondary,
    },
    presetsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        backgroundColor: isDarkMode ? '#050505' : 'rgba(0,0,0,0.02)',
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
        shadowColor: T.goldPrimary,
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
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 16,
        color: T.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    resultContainer: {
        marginTop: 10,
        alignItems: 'center',
        padding: 10,
    },
    resultLabel: {
        color: T.textSecondary,
        fontSize: 13,
        letterSpacing: 1,
        marginBottom: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    resultLabelSmall: {
        color: T.textSecondary,
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 1,
    },
    resultValue: {
        color: T.goldPrimary,
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 1,
        textShadowColor: 'rgba(212, 175, 55, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    // Premium Action Card Styles
    premiumActionCard: { backgroundColor: T.premiumActionBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border, marginTop: 10, marginBottom: 40 },
    premiumActionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    premiumActionIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#B8820F', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    premiumActionTitle: { color: T.textPrimary, fontSize: 16, fontWeight: 'bold' },
    premiumActionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    premiumActionButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    accessoryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: isDarkMode ? '#000' : '#FDFBF7',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    accessoryButton: {
        backgroundColor: T.card,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    accessoryText: {
        color: T.goldPrimary,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: SCREEN_HEIGHT * 0.6,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    modalGradient: {
        flex: 1,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        color: T.goldPrimary,
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: '#D4AF37',
        marginTop: 4,
        borderRadius: 2,
    },
    closeButton: {
        padding: 4,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
    },
    modalItemText: {
        color: T.textPrimary,
        fontSize: 16,
        fontWeight: '400',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 130, 15, 0.2)',
        height: 54,
    },
    searchInput: {
        flex: 1,
        color: T.textPrimary,
        fontSize: 16,
        paddingVertical: 8,
    },
});
}



