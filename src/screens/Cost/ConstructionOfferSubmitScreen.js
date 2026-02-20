import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import BuildingSchema from '../../components/BuildingSchema';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

import FloorEditor from '../../components/FloorEditor';
import OfferSummaryCard from '../../components/OfferSummaryCard';

// Premium Stepper Component (Keeping this as it's small, or move it too if preferred, but user only asked for FloorEditor)
// USER ASKED FOR FLOOREDITOR EXTRACTION. StepperInput is small helper.
const StepperInput = ({ value, onChange, min = 0, max = 100, label }) => (
    <View style={styles.premiumStepperContainer}>
        {label && <Text style={styles.stepperLabel}>{label}</Text>}
        <View style={styles.stepperControls}>
            <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                    const newValue = (parseInt(value) || 0) - 1;
                    if (newValue >= min) onChange(newValue.toString());
                }}
            >
                <MaterialCommunityIcons name="minus" size={20} color="#D4AF37" />
            </TouchableOpacity>
            <View style={styles.stepperValueContainer}>
                <Text style={styles.stepperValue}>{value}</Text>
            </View>
            <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                    const newValue = (parseInt(value) || 0) + 1;
                    if (newValue <= max) onChange(newValue.toString());
                }}
            >
                <MaterialCommunityIcons name="plus" size={20} color="#D4AF37" />
            </TouchableOpacity>
        </View>
    </View>
);

export default function ConstructionOfferSubmitScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};

    // Robust check for Flat for Land
    const isFlatForLand =
        request?.offer_type === 'kat_karsiligi' ||
        request?.offer_model === 'kat_karsiligi' ||
        request?.offer_type === 'Kat Karşılığı' ||
        request?.offer_model === 'Kat Karşılığı';

    // Debugging
    console.log('DEBUG: Offer Details', {
        id: request?.id,
        offer_type: request?.offer_type,
        offer_model: request?.offer_model,
        isFlatForLand
    });

    const [price, setPrice] = useState('');
    const [details, setDetails] = useState('');
    const [totalArea, setTotalArea] = useState('');
    const [unitBreakdown, setUnitBreakdown] = useState([]);
    const [campaignPolicy, setCampaignPolicy] = useState('standard');
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState({ type: '2+1', area: '', count: '' });

    // New Technical Fields
    const [floorCount, setFloorCount] = useState('');
    const [basementCount, setBasementCount] = useState('0');
    const [isBasementResidential, setIsBasementResidential] = useState(false);
    const [totalApartments, setTotalApartments] = useState('');
    const [floorDesignType, setFloorDesignType] = useState('');

    // Detailed Floor Configuration
    const [groundFloorType, setGroundFloorType] = useState('apartment');
    const [floorDetails, setFloorDetails] = useState({}); // Now stores arrays! { 1: [{type:'apt', name:'D1', area:'100'}] }
    const [floorConfigModalVisible, setFloorConfigModalVisible] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);

    const [unitPrice, setUnitPrice] = useState(''); // Changed to state for bi-directional calc
    const [loading, setLoading] = useState(false);

    // Flat-for-Land Specific State
    const [selectedUnits, setSelectedUnits] = useState([]); // Array of IDs owned by contractor
    const [cashAdjustmentType, setCashAdjustmentType] = useState('request'); // 'request' (Müteahhit ister) | 'payment' (Müteahhit öder)
    const [cashAdjustmentAmount, setCashAdjustmentAmount] = useState('');
    const [grantOwnership, setGrantOwnership] = useState('landowner'); // 'landowner' | 'contractor'
    const [savedStrategies, setSavedStrategies] = useState([]); // Store list of saved offers
    const [editingStrategy, setEditingStrategy] = useState(null); // Track currently editing strategy

    useEffect(() => {
        fetchSavedStrategies();
    }, []);

    const fetchSavedStrategies = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('construction_offers')
                .select('*')
                .eq('request_id', request.id)
                .eq('contractor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('DEBUG: fetched strategies', data ? data.length : 0);
            setSavedStrategies(data || []);
        } catch (error) {
            console.error('Error fetching saved offers:', error);
        }
    };



    const handleDeleteStrategy = (strategyId) => {
        Alert.alert(
            'Teklifi Sil',
            'Bu kayıtlı teklif seçeneğini silmek istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const {
                                data: { user }
                            } = await supabase.auth.getUser();
                            if (!user) return;

                            const { error } = await supabase
                                .from('construction_offers')
                                .delete()
                                .eq('id', strategyId)
                                .eq('contractor_id', user.id);

                            if (error) throw error;

                            // Update local state
                            setSavedStrategies(prev => prev.filter(s => s.id !== strategyId));
                        } catch (error) {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    // Helpers
    const handleUnitSelect = (unit) => {
        if (!unit || !unit.id) return;

        setSelectedUnits(prev => {
            if (prev.includes(unit.id)) {
                return prev.filter(id => id !== unit.id);
            } else {
                return [...prev, unit.id];
            }
        });
    };
    const formatCurrency = (val) => {
        if (!val) return '';
        // Remove non-digits
        const nums = val.replace(/\D/g, '');
        // Add dots
        return nums.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseCurrency = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(/\./g, ''));
    };

    const numberToTurkishWords = (num) => {
        if (!num || isNaN(num)) return '';

        const ones = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
        const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
        const groups = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];

        // Split into 3-digit groups
        const numStr = Math.floor(num).toString();
        const parts = [];
        let i = numStr.length;

        while (i > 0) {
            parts.push(numStr.substring(Math.max(0, i - 3), i));
            i -= 3;
        }

        let words = [];

        parts.forEach((part, index) => {
            const p = parseInt(part);
            if (p > 0) {
                let partWords = [];
                const h = Math.floor(p / 100);
                const t = Math.floor((p % 100) / 10);
                const o = p % 10;

                if (h > 0) {
                    if (h > 1) partWords.push(ones[h]);
                    partWords.push('Yüz');
                }

                if (t > 0) partWords.push(tens[t]);

                if (o > 0) {
                    if (index === 1 && p === 1) {
                        // Special case: "Bir Bin" -> "Bin"
                    } else {
                        partWords.push(ones[o]);
                    }
                }

                if (groups[index]) {
                    partWords.push(groups[index]);
                }

                words.unshift(partWords.join(' '));
            }
        });

        return 'Yalnız: ' + words.join(' ') + ' Türk Lirası';
    };

    // Handlers
    const handlePriceChange = (text) => {
        const formatted = formatCurrency(text);
        setPrice(formatted);

        const priceVal = parseCurrency(formatted);
        const areaVal = parseFloat(totalArea) || 0;

        if (priceVal && areaVal > 0) {
            // Calculate integer unit price
            const calculatedUnit = Math.round(priceVal / areaVal);
            setUnitPrice(formatCurrency(calculatedUnit.toString()));
        }
    };

    const handleUnitPriceChange = (text) => {
        const formatted = formatCurrency(text);
        setUnitPrice(formatted);

        const unitVal = parseCurrency(formatted);
        const areaVal = parseFloat(totalArea) || 0;

        if (unitVal && areaVal > 0) {
            const calculatedTotal = Math.round(unitVal * areaVal);
            setPrice(formatCurrency(calculatedTotal.toString()));
        }
    };

    const handleAreaChange = (text) => {
        setTotalArea(text);
        const areaVal = parseFloat(text) || 0;
        const priceVal = parseCurrency(price);

        // Standard: Update Unit Price, keep Total Price constant
        if (priceVal > 0 && areaVal > 0) {
            const calculatedUnit = Math.round(priceVal / areaVal);
            setUnitPrice(formatCurrency(calculatedUnit.toString()));
        }
    };

    // Unified Auto-Generator for Floor Plan
    useEffect(() => {
        // Only auto-generate if we are NOT loading an existing offer/strategy
        // and only if the essential fields are present.
        if (!editingStrategy && floorCount && floorDesignType) {
            generateDefaultFloorMap();
        }
    }, [floorCount, basementCount, isBasementResidential, groundFloorType, floorDesignType]);

    const generateDefaultFloorMap = () => {
        const count = parseInt(floorCount) || 0;
        const bCount = parseInt(basementCount) || 0;
        const unitsPerFloor = parseInt(floorDesignType) || 0;

        const newMap = {}; // Reset map to ensure correct sequential re-calculation
        let currentApartmentNumber = 1;

        // Helper
        const generateUnits = (count, typePrefix = 'Daire', type = 'apartment', floorIdx) => {
            return Array.from({ length: count }).map((_, i) => {
                let name = `${typePrefix} ${i + 1}`;

                // If it's an apartment, use the running counter
                if (type === 'apartment') {
                    name = `Daire ${currentApartmentNumber}`;
                    currentApartmentNumber++;
                }

                return {
                    id: `f${floorIdx}_u${i}_${type}`,
                    type: type,
                    name: name,
                    area: ''
                };
            });
        };

        // 1. Basement Floors (Usually specific types)
        if (bCount > 0) {
            for (let b = bCount; b >= 1; b--) { // Start from deepest basement
                const idx = -b;
                // Check if user wants residential basements (e.g. bahçe katı)
                if (isBasementResidential) {
                    newMap[idx] = generateUnits(unitsPerFloor || 1, 'Daire', 'apartment', idx);
                } else {
                    // Non-residential basements don't consume apartment numbers
                    newMap[idx] = Array.from({ length: 1 }).map((_, i) => ({
                        id: `f${idx}_u${i}_shelter`,
                        type: 'shelter',
                        name: 'Sığınak / Depo',
                        area: ''
                    }));
                }
            }
        }

        // 2. Ground Floor (Zemin)
        if (groundFloorType === 'apartment') {
            newMap[0] = generateUnits(unitsPerFloor || 1, 'Daire', 'apartment', 0);
        } else if (groundFloorType === 'shop') {
            newMap[0] = Array.from({ length: unitsPerFloor || 1 }).map((_, i) => ({
                id: `f0_u${i}_shop`,
                type: 'shop',
                name: `Dükkan ${i + 1}`,
                area: ''
            }));
        } else {
            newMap[0] = Array.from({ length: 1 }).map((_, i) => ({
                id: `f0_u${i}_parking`,
                type: 'parking',
                name: 'Otopark',
                area: ''
            }));
        }

        // 3. Upper Floors (1 to N)
        if (count > 0) {
            for (let i = 1; i <= count; i++) {
                newMap[i] = generateUnits(unitsPerFloor, 'Daire', 'apartment', i);
            }
        }

        setFloorDetails(newMap);
        return newMap;
    };

    const loadOffer = (offer) => {
        // Load data from offer object
        const breakdown = offer.unit_breakdown || {};

        // 1. Restore Selected Units
        if (breakdown.selected_units) {
            setSelectedUnits(breakdown.selected_units);
        }

        // 2. Restore Cash Adjustment
        if (breakdown.cash_adjustment) {
            setCashAdjustmentType(breakdown.cash_adjustment.type);
            setCashAdjustmentAmount(breakdown.cash_adjustment.amount ? breakdown.cash_adjustment.amount.toString() : '');
        }

        // 3. Restore Details
        // If details was stored in offer_details text column? 
        // We didn't explicitly map it in insert but usually it's there. 
        // Let's assume offer.offer_details holds the text.
        if (offer.offer_details) {
            setDetails(offer.offer_details);
        }

        // 4. Load Architecture Fields
        if (offer.floor_count) setFloorCount(offer.floor_count.toString());
        if (typeof offer.basement_count !== 'undefined') setBasementCount(offer.basement_count.toString());
        if (offer.floor_design_type) setFloorDesignType(offer.floor_design_type);
        if (typeof offer.is_basement_residential !== 'undefined') setIsBasementResidential(offer.is_basement_residential);
        if (offer.total_apartments) setTotalApartments(offer.total_apartments.toString());

        if (offer.floor_details_json) {
            setGroundFloorType(offer.floor_details_json.groundFloor || 'apartment');
            setFloorDetails(offer.floor_details_json.floors || {});
        }

        // 5. Set Editing Mode
        setEditingStrategy(offer);

        Alert.alert('Düzenleme Modu', 'Teklif detayları yüklendi. Değişiklikleri yaptıktan sonra "TEKLİFİ GÜNCELLE" butonunu kullanabilirsiniz.');
    };

    const handleCancelEdit = () => {
        setEditingStrategy(null);
        // Optional: Clear form? Or just leave it? 
        // User might want to start fresh.
        setSelectedUnits([]);
        setCashAdjustmentAmount('');
        setDetails('');
        setPrice(''); // If used
        setTotalArea(''); // If used
        // Reset floor map? Maybe not needed if valid.
        Alert.alert('Yeni Teklif', 'Form temizlendi, yeni bir teklif oluşturabilirsiniz.');
    };

    const handleSubmit = async (shouldExit = true) => {
        console.log('DEBUG: handleSubmit called', { shouldExit, savedStrategiesLen: savedStrategies.length, isFlatForLand });
        // REMOVED local isFlatForLand redeclaration that was overriding the robust one

        // Validation
        // Check if current form is empty
        const isCurrentFormEmpty = isFlatForLand
            ? (selectedUnits.length === 0 && !cashAdjustmentAmount && !details)
            : (!price && !details);

        // If we have saved strategies and the current form is empty, we can just proceed (exit)
        if (shouldExit && savedStrategies.length > 0 && isCurrentFormEmpty) {
            // CRITICAL FIX: Ensure drafts are updated to pending before exiting
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error: updateError } = await supabase
                        .from('construction_offers')
                        .update({ status: 'pending' })
                        .eq('request_id', request.id)
                        .eq('contractor_id', user.id)
                        .eq('status', 'draft');

                    if (updateError) console.error("Error updating drafts:", updateError);
                }
            } catch (err) {
                console.error("Draft update error:", err);
            }

            Alert.alert('Teklif Gönderimi', `${savedStrategies.length} adet kaydedilmiş teklif seçeneği iletildi.`, [
                { text: 'Tamam', onPress: () => navigation.navigate('MainTabs', { screen: 'Requests' }) }
            ]);
            return;
        }

        if (!isFlatForLand && !price) {
            Alert.alert('Eksik Bilgi', 'Lütfen fiyat teklifi giriniz.');
            return;
        }

        if (isFlatForLand && selectedUnits.length === 0 && !cashAdjustmentAmount) {
            Alert.alert('Eksik Bilgi', 'Lütfen en az bir daire seçiniz veya nakit tutarı giriniz.');
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
                return;
            }

            // Ensure floorDetails is captured even if state hasn't updated or was empty
            let finalFloorDetails = floorDetails;
            if (Object.keys(floorDetails).length === 0) {
                finalFloorDetails = generateDefaultFloorMap();
            }

            const offerData = {
                request_id: request.id,
                contractor_id: user.id,
                offer_details: details,
                total_area: parseFloat(totalArea) || 0,
                campaign_policy: campaignPolicy,
                floor_count: floorCount ? parseInt(floorCount) : null,
                basement_count: basementCount ? parseInt(basementCount) : 0,
                is_basement_residential: isBasementResidential,
                total_apartments: totalApartments ? parseInt(totalApartments) : null,
                floor_design_type: floorDesignType,
                floor_details_json: {
                    groundFloor: groundFloorType,
                    floors: finalFloorDetails
                },
                status: shouldExit ? 'pending' : 'draft',
            };

            // Unify metadata: Always save if selectedUnits exists, regardless of model
            const metadata = {
                selected_units: selectedUnits,
                grant_ownership: grantOwnership,
                cash_adjustment: {
                    type: cashAdjustmentType,
                    amount: cashAdjustmentAmount ? parseCurrency(cashAdjustmentAmount) : 0
                }
            };

            if (isFlatForLand) {
                offerData.price_estimate = 0;
                offerData.unit_price = 0;
                offerData.unit_breakdown = metadata;
            } else {
                // Standard/Turnkey Offer
                offerData.price_estimate = parseCurrency(price);
                offerData.unit_price = parseCurrency(unitPrice) || 0;
                // Merge current selections into unit_breakdown if they exist
                offerData.unit_breakdown = selectedUnits.length > 0 ? metadata : unitBreakdown;
            }

            if (editingStrategy) {
                // UPDATE logic
                const { error } = await supabase
                    .from('construction_offers')
                    .update(offerData)
                    .eq('id', editingStrategy.id)
                    .eq('contractor_id', user.id);

                if (error) throw error;
            } else {
                // INSERT logic
                const { error } = await supabase
                    .from('construction_offers')
                    .insert(offerData);

                if (error) throw error;
            }



            if (shouldExit) {
                // If it's a final submit, update ALL draft offers for this request/user to pending
                // This ensures saved strategies become visible
                const { error: updateError } = await supabase
                    .from('construction_offers')
                    .update({ status: 'pending' })
                    .eq('request_id', request.id)
                    .eq('contractor_id', user.id)
                    .eq('status', 'draft');

                if (updateError) console.error('Error updating drafts:', updateError);

                console.log('DEBUG: Final submission success, navigating...');
                Alert.alert('Başarılı', 'Teklifiniz başarıyla iletildi!', [
                    { text: 'Tamam', onPress: () => navigation.navigate('MainTabs', { screen: 'Requests' }) }
                ]);

                // Fallback navigation if alert is blocked
                setTimeout(() => {
                    if (navigation.canGoBack()) {
                        navigation.navigate('MainTabs', { screen: 'Requests' });
                    }
                }, 1500);
            } else {

                await fetchSavedStrategies(); // Refresh list

                if (editingStrategy) {
                    Alert.alert('Güncellendi', 'Teklif başarıyla güncellendi.', [
                        { text: 'Tamam', onPress: () => { } }
                    ]);
                    // Keep editing mode? Or exit? Usually users want to stay or verify.
                    // Let's keep it but maybe refresh the editingStrategy object if needed.
                    // Actually, let's exit edit mode to show it in list updated.
                    setEditingStrategy(null);
                    // Clear form after update?
                    setSelectedUnits([]);
                    setCashAdjustmentAmount('');
                    setDetails('');
                } else {
                    // Reset Form
                    setSelectedUnits([]);
                    setCashAdjustmentAmount('');
                    setDetails('');

                    Alert.alert('Kaydedildi', 'Bu teklif seçeneği kaydedildi. Form temizlendi, şimdi yeni bir seçenek (strateji) oluşturabilirsiniz.', [
                        { text: 'Devam Et', onPress: () => { } }
                    ]);
                }
            }

        } catch (error) {
            console.error('Offer submission error:', error);
            Alert.alert('Hata', 'Teklif gönderilemedi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFinancialDetails = () => (
        <>
            <Text style={styles.sectionHeader}>FİNANSAL DETAYLAR</Text>
            <GlassCard style={styles.card}>
                <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>TAHMİNİ FİYAT (TL)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={handlePriceChange}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>TOPLAM ALAN (m²)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={totalArea}
                            onChangeText={handleAreaChange}
                        />
                    </View>
                </View>

                {/* Amount in Words */}
                {price ? (
                    <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 4, marginBottom: 16, fontStyle: 'italic', paddingHorizontal: 4 }}>
                        {numberToTurkishWords(parseCurrency(price))}
                    </Text>
                ) : null}

                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>BİRİM FİYAT (TL/m²)</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, color: '#FFD700', fontWeight: 'bold' }]}
                            placeholder="0.00"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={unitPrice}
                            onChangeText={handleUnitPriceChange}
                        />
                    </View>
                </View>

                {request?.is_campaign_active && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>HİBE + KREDİ DURUMU</Text>
                        <View style={styles.segmentContainer}>
                            {['included', 'excluded'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.segmentButton,
                                        campaignPolicy === option && styles.segmentButtonActive
                                    ]}
                                    onPress={() => setCampaignPolicy(option)}
                                >
                                    <Text style={[
                                        styles.segmentText,
                                        campaignPolicy === option && styles.segmentTextActive
                                    ]}>
                                        {option === 'included' ? 'Fiyata Dahil' : 'Fiyata Hariç'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Grant Deduction Logic */}
                        {campaignPolicy === 'included' && price && (
                            <View style={{ marginTop: 16, backgroundColor: 'rgba(50, 205, 50, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(50, 205, 50, 0.3)' }}>
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: 8, fontSize: 13 }}>DEVLET DESTEĞİ DETAYI</Text>

                                {/* Housing Grant */}
                                {(request.campaign_unit_count || 0) > 0 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: '#CCC', fontSize: 12 }}>
                                            {request.campaign_unit_count} Konut (x 1.750.000 TL)
                                        </Text>
                                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                                            {formatCurrency(((request.campaign_unit_count || 0) * 1750000).toString())} TL
                                        </Text>
                                    </View>
                                )}

                                {/* Commercial Grant */}
                                {(request.campaign_commercial_count || 0) > 0 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: '#CCC', fontSize: 12 }}>
                                            {request.campaign_commercial_count} Dükkan (x 875.000 TL)
                                        </Text>
                                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                                            {formatCurrency(((request.campaign_commercial_count || 0) * 875000).toString())} TL
                                        </Text>
                                    </View>
                                )}

                                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 }} />

                                {/* Net Payable */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold', flex: 1 }}>
                                        DEVLET DESTEĞİ HARİÇ ÖDENECEK TUTAR
                                    </Text>
                                    <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: 'bold' }}>
                                        {formatCurrency((
                                            parseCurrency(price) -
                                            ((request.campaign_unit_count || 0) * 1750000) -
                                            ((request.campaign_commercial_count || 0) * 875000)
                                        ).toString())} TL
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </GlassCard>
        </>
    );

    const renderFlatForLandDetails = () => (
        <>
            <Text style={styles.sectionHeader}>PAYLAŞIM VE FİNANSAL YAPI</Text>
            <GlassCard style={styles.card}>
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>DAİRE PAYLAŞIMI</Text>
                    <Text style={{ color: '#DDD', fontSize: 13, marginBottom: 8 }}>
                        Aşağıdaki şemadan <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>MÜTEAHHİT OLARAK SİZE KALACAK</Text> daireleri seçiniz.
                    </Text>
                </View>

                {/* Grant Display (Read-Only) */}
                {request?.is_campaign_active && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.inputLabel}>DEVLET HİBE VE KREDİ DESTEĞİ</Text>
                        <GlassCard style={{ backgroundColor: 'rgba(50, 205, 50, 0.1)', borderColor: 'rgba(50, 205, 50, 0.3)', padding: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <MaterialCommunityIcons name="bank-transfer" size={24} color="#4CAF50" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 13 }}>HAKEDİŞ: MÜTEAHHİT HESABINA</Text>
                            </View>

                            <Text style={{ color: '#CCC', fontSize: 12, marginBottom: 8 }}>
                                Kentsel dönüşüm kapsamında devlet tarafından sağlanan aşağıdaki toplam tutar, inşaat ilerlemesine hak ediş olarak <Text style={{ fontWeight: 'bold', color: '#FFF' }}>sizin hesabınıza</Text> yatırılacaktır.
                            </Text>

                            <View style={{ height: 1, backgroundColor: 'rgba(50, 205, 50, 0.3)', marginVertical: 8 }} />

                            {/* Housing Grant Calculation */}
                            {(request.campaign_unit_count || 0) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ color: '#DDD', fontSize: 12 }}>
                                        {request.campaign_unit_count} Konut (x 1.750.000 TL)
                                    </Text>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                                        {formatCurrency(((request.campaign_unit_count || 0) * 1750000).toString())} TL
                                    </Text>
                                </View>
                            )}

                            {/* Commercial Grant Calculation */}
                            {(request.campaign_commercial_count || 0) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ color: '#DDD', fontSize: 12 }}>
                                        {request.campaign_commercial_count} Dükkan (x 875.000 TL)
                                    </Text>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                                        {formatCurrency(((request.campaign_commercial_count || 0) * 875000).toString())} TL
                                    </Text>
                                </View>
                            )}

                            <View style={{ height: 1, backgroundColor: 'rgba(50, 205, 50, 0.3)', marginVertical: 8 }} />

                            {/* Total */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: 'bold' }}>TOPLAM DESTEK TUTARI</Text>
                                <Text style={{ color: '#4CAF50', fontSize: 16, fontWeight: 'bold' }}>
                                    {formatCurrency((
                                        ((request.campaign_unit_count || 0) * 1750000) +
                                        ((request.campaign_commercial_count || 0) * 875000)
                                    ).toString())} TL
                                </Text>
                            </View>
                        </GlassCard>
                    </View>
                )}

                <View style={styles.divider} />

                <View>
                    <Text style={styles.inputLabel}>NAKİT DENGESİ (ÜSTE PARA)</Text>
                    <View style={styles.segmentContainer}>
                        {['request', 'payment'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.segmentButton,
                                    cashAdjustmentType === option && styles.segmentButtonActive
                                ]}
                                onPress={() => setCashAdjustmentType(option)}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    cashAdjustmentType === option && styles.segmentTextActive
                                ]}>
                                    {option === 'request' ? 'Talep Ediyorum' : 'Ödeme Yapacağım'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <TextInput
                            style={[styles.input, { color: cashAdjustmentType === 'request' ? '#4CAF50' : '#FF5252' }]}
                            placeholder="0"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={cashAdjustmentAmount}
                            onChangeText={(t) => setCashAdjustmentAmount(formatCurrency(t))}
                        />
                        <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                            {numberToTurkishWords(parseCurrency(cashAdjustmentAmount))}
                        </Text>
                    </View>
                </View>
            </GlassCard>
        </>
    );

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#D4AF37" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TEKLİF OLUŞTUR</Text>
                    <View style={{ width: 44 }} />
                </View>

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 120 : 100}
                    contentContainerStyle={[styles.content, { paddingBottom: 150 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    enableAutomaticScroll={true}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            {/* Summary Card */}
                            <GlassCard style={styles.summaryCard}>
                                <View style={styles.summaryHeader}>
                                    <View style={styles.summaryIcon}>
                                        <MaterialCommunityIcons name="file-document-outline" size={20} color="#D4AF37" />
                                    </View>
                                    <View>
                                        <Text style={styles.summaryLabel}>PROJE NO</Text>
                                        <Text style={styles.summaryValue}>#{request?.id?.slice(0, 8).toUpperCase()}</Text>
                                    </View>
                                </View>
                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>KONUM</Text>
                                        <Text style={styles.summaryValue} numberOfLines={1}>{request?.district}</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>MODEL</Text>
                                        <Text style={styles.summaryValue}>{request?.offer_type === 'kat_karsiligi' ? 'Kat Karşılığı' : 'Anahtar Teslim'}</Text>
                                    </View>
                                </View>

                                {/* Ada / Parsel / Pafta Row - Always Visible */}
                                <View style={[styles.summaryGrid, { marginTop: 12 }]}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>ADA / PARSEL</Text>
                                        <Text style={[
                                            styles.summaryValue,
                                            (!request?.ada && !request?.parsel) && { color: '#666', fontStyle: 'italic' }
                                        ]}>
                                            {(request?.ada || request?.parsel) ? `${request?.ada || '-'} / ${request?.parsel || '-'}` : 'Belirtilmemiş'}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>PAFTA</Text>
                                        <Text style={[
                                            styles.summaryValue,
                                            !request?.pafta && { color: '#666', fontStyle: 'italic' }
                                        ]}>
                                            {request?.pafta || 'Belirtilmemiş'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Full Address - Always Visible */}
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.summaryLabel}>ADRES</Text>
                                    <Text style={[
                                        styles.summaryValue,
                                        { fontSize: 12 },
                                        !request?.full_address && { color: '#666', fontStyle: 'italic' }
                                    ]} numberOfLines={2}>
                                        {request?.full_address || 'Açık adres belirtilmemiş.'}
                                    </Text>
                                </View>

                                {/* Campaign Units (Hibe/Kredi) */}
                                {request?.is_campaign_active && (
                                    <View style={{ marginTop: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 8, borderRadius: 8 }}>
                                        <Text style={[styles.summaryLabel, { color: '#D4AF37', marginBottom: 4 }]}>HİBE / KREDİ KAPSAMI ({request?.campaign_unit_count + request?.campaign_commercial_count} Bağımsız Bölüm)</Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            {request?.campaign_unit_count > 0 && (
                                                <Text style={[styles.summaryValue, { fontSize: 13 }]}>• {request.campaign_unit_count} Konut</Text>
                                            )}
                                            {request?.campaign_commercial_count > 0 && (
                                                <Text style={[styles.summaryValue, { fontSize: 13 }]}>• {request.campaign_commercial_count} Dükkan/Ticari</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </GlassCard>

                            {/* Project Notes & Details */}
                            <Text style={styles.sectionHeader}>PROJE NOTLARI</Text>
                            <GlassCard style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                    <MaterialCommunityIcons name="comment-text-outline" size={24} color="#D4AF37" style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.summaryValue,
                                            { fontSize: 13, lineHeight: 20, color: '#DDD' },
                                            !request?.description && { color: '#666', fontStyle: 'italic' }
                                        ]}>
                                            {request?.description || 'Müşteri herhangi bir proje notu veya detay belirtmemiş.'}
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>

                            {isFlatForLand ? renderFlatForLandDetails() : renderFinancialDetails()}

                            <Text style={styles.sectionHeader}>MİMARİ YAPILANDIRMA</Text>
                            <GlassCard style={styles.card}>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.inputLabel}>KAT SAYISI</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Zemin Üstü"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={floorCount}
                                            onChangeText={setFloorCount}
                                            onBlur={() => generateDefaultFloorMap()}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.inputLabel}>STANDART DAİRE</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Kat Başına"
                                            placeholderTextColor="#555"
                                            keyboardType="numeric"
                                            value={floorDesignType}
                                            onChangeText={setFloorDesignType}
                                            onBlur={() => generateDefaultFloorMap()}
                                        />
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <StepperInput
                                    label="BODRUM KAT SAYISI"
                                    value={basementCount}
                                    onChange={(val) => {
                                        setBasementCount(val);
                                        generateDefaultFloorMap();
                                    }}
                                    min={0}
                                    max={10}
                                />

                                <View style={{ marginTop: 20 }}>
                                    <TouchableOpacity
                                        style={styles.configButton}
                                        onPress={() => {
                                            if (!floorCount) {
                                                Alert.alert('Uyarı', 'Önce kat sayısını giriniz.');
                                            } else {
                                                generateDefaultFloorMap();
                                                setFloorConfigModalVisible(true);
                                            }
                                        }}
                                    >
                                        <LinearGradient
                                            colors={['#D4AF37', '#B8860B']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.configButtonGradient}
                                        >
                                            <MaterialCommunityIcons name="floor-plan" size={24} color="#000" />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.configButtonTitle}>DETAYLI KAT PLANI DÜZENLE</Text>
                                                <Text style={styles.configButtonSubtitle}>Dükkan, Daire m² ve İsim Ekleme</Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={24} color="#000" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </GlassCard>

                            {/* Visualization */}

                            <View style={styles.schemaContainer}>
                                <BuildingSchema
                                    floorCount={floorCount}
                                    floorDetails={floorDetails}
                                    groundFloorType={groundFloorType}
                                    isBasementResidential={isBasementResidential}
                                    basementCount={basementCount}
                                    selectable={true}
                                    selectedUnits={selectedUnits}
                                    onUnitSelect={handleUnitSelect}
                                    campaignData={{
                                        unitCount: request?.campaign_unit_count || 0,
                                        commercialCount: request?.campaign_commercial_count || 0
                                    }}
                                    cashAdjustment={{
                                        type: cashAdjustmentType, // 'request' or 'payment'
                                        amount: parseCurrency(cashAdjustmentAmount) || 0
                                    }}
                                    isFlatForLand={isFlatForLand}
                                    turnkeyData={{
                                        totalPrice: parseCurrency(price) || 0,
                                        campaignPolicy: campaignPolicy
                                    }}
                                />
                            </View>

                            {/* Dynamic Offer Summary */}
                            <OfferSummaryCard
                                selectedUnits={selectedUnits}
                                floorDetails={floorDetails}
                                cashAdjustmentType={cashAdjustmentType}
                                cashAdjustmentAmount={cashAdjustmentAmount}
                                campaignUnitCount={request?.campaign_unit_count}
                                campaignCommercialCount={request?.campaign_commercial_count}
                                isFlatForLand={isFlatForLand}
                                totalPrice={price}
                                campaignPolicy={campaignPolicy}
                            />


                            <Text style={styles.sectionHeader}>AÇIKLAMA VE DETAYLAR</Text>
                            <GlassCard style={styles.card}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Teklifinizin kapsamı, malzeme kalitesi ve diğer detayları buraya yazınız..."
                                    placeholderTextColor="#555"
                                    multiline
                                    textAlignVertical="top"
                                    value={details}
                                    onChangeText={setDetails}
                                />
                                <View style={{ marginBottom: 20 }}>
                                    {editingStrategy ? (
                                        <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D4AF37' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                <MaterialCommunityIcons name="pencil-circle" size={24} color="#D4AF37" style={{ marginRight: 8 }} />
                                                <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 14 }}>DÜZENLEME MODU AKTİF</Text>
                                            </View>
                                            <Text style={{ color: '#DDD', fontSize: 13, marginBottom: 16 }}>
                                                Şu an kayıtlı bir teklifi düzenliyorsunuz. Değişiklikleri kaydetmek için aşağıdaki güncelleme butonunu kullanın.
                                            </Text>

                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', padding: 10, borderRadius: 8, alignSelf: 'flex-start' }}
                                                onPress={handleCancelEdit}
                                            >
                                                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>VAZGEÇ / YENİ EKLE</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.sectionHeader}>KAYDEDİLEN TEKLİFLER (STRATEJİLER)</Text>
                                            {(!savedStrategies || savedStrategies.length === 0) ? (
                                                <Text style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 }}>Henüz kaydedilmiş bir seçenek yok.</Text>
                                            ) : (
                                                savedStrategies.map((offer, index) => {
                                                    const breakdown = offer.unit_breakdown || {};
                                                    const unitCount = breakdown.selected_units ? breakdown.selected_units.length : 0;
                                                    const cash = breakdown.cash_adjustment ? breakdown.cash_adjustment.amount : 0;
                                                    const type = breakdown.cash_adjustment ? breakdown.cash_adjustment.type : 'none';

                                                    return (
                                                        <View
                                                            key={offer.id}
                                                            style={[styles.summaryCard, { flexDirection: 'row', alignItems: 'center', paddingRight: 6, paddingVertical: 8 }]}
                                                        >
                                                            <TouchableOpacity
                                                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                                                onPress={() => loadOffer(offer)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <View style={[styles.summaryIcon, { backgroundColor: '#333', marginRight: 12 }]}>
                                                                    <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>{savedStrategies.length - index}</Text>
                                                                </View>

                                                                <View style={{ marginRight: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 6, borderRadius: 20 }}>
                                                                    <MaterialCommunityIcons name="pencil" size={16} color="#D4AF37" />
                                                                </View>

                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                                                                        {unitCount > 0 ? `${unitCount} Daire` : 'Daire Yok'}
                                                                        {cash > 0 ? (type === 'request' ? ` + ${formatCurrency(cash.toString())} TL (Alacak)` : ` - ${formatCurrency(cash.toString())} TL (Ödeme)`) : ''}
                                                                    </Text>
                                                                    <Text style={{ color: '#888', fontSize: 11 }}>
                                                                        {new Date(offer.created_at).toLocaleString('tr-TR')}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={{
                                                                    padding: 8,
                                                                    backgroundColor: 'rgba(255, 82, 82, 0.1)',
                                                                    borderRadius: 12,
                                                                    borderWidth: 1,
                                                                    borderColor: 'rgba(255, 82, 82, 0.3)',
                                                                    marginLeft: 8
                                                                }}
                                                                onPress={() => handleDeleteStrategy(offer.id)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    );
                                                })
                                            )}
                                        </>
                                    )}
                                </View>

                                <View style={{ marginBottom: 40, marginTop: 10 }}>
                                    {/* Secondary Action: Save & Add New Option */}

                                    <TouchableOpacity
                                        style={[styles.secondaryActionBtn, editingStrategy && { borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.05)' }]}
                                        onPress={() => handleSubmit(false)} // Pass false to shrink/stay
                                        disabled={loading}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <MaterialCommunityIcons name={editingStrategy ? "content-save-edit" : "content-save-plus"} size={20} color={editingStrategy ? "#4CAF50" : "#D4AF37"} />
                                            <Text style={[styles.secondaryActionText, editingStrategy && { color: '#4CAF50' }]}>
                                                {loading ? 'İŞLEM YAPILIYOR...' : (editingStrategy ? 'TEKLİFİ GÜNCELLE' : 'SEÇENEK OLARAK KAYDET')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Primary Action: Submit & Exit (Only show if NOT editing) */}
                                    {!editingStrategy && (
                                        <TouchableOpacity
                                            onPress={() => handleSubmit(true)}
                                            disabled={loading}
                                            style={[styles.submitBtnContainer, { marginVertical: 0 }]}
                                        >
                                            <LinearGradient
                                                colors={['#D4AF37', '#FFD700', '#FDB931', '#D4AF37']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.submitBtn}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#000" />
                                                ) : (
                                                    <Text style={styles.submitBtnText}>
                                                        {savedStrategies.length > 0
                                                            ? `${savedStrategies.length} FARKLI SEÇENEK İLE GÖNDER`
                                                            : 'TEKLİFİ GÖNDER VE ÇIK'}
                                                    </Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </GlassCard>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAwareScrollView >

                {/* Floor Config Top Level Modal */}
                < Modal visible={floorConfigModalVisible} transparent animationType="slide" onRequestClose={() => setFloorConfigModalVisible(false)
                }>
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.fullScreenModal}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setFloorConfigModalVisible(false)} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>KAT PLANLAMASI</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            <ScrollView style={{ padding: 20 }}>
                                <Text style={styles.helperText}>Düzenlemek istediğiniz kata dokunun.</Text>

                                {/* Upper Floors */}
                                {Array.from({ length: parseInt(floorCount) || 0 }).map((_, index) => {
                                    const floorNum = (parseInt(floorCount) || 0) - index;
                                    const floorData = floorDetails[floorNum];
                                    let summary = 'Veri yok';

                                    if (Array.isArray(floorData)) {
                                        summary = `${floorData.length} Birim`;
                                        if (floorData.length > 0) {
                                            const types = [...new Set(floorData.map(u => u.type))];
                                            summary = types.map(t => {
                                                const count = floorData.filter(u => u.type === t).length;
                                                return `${count} ${t === 'apartment' ? 'Daire' : (t === 'shop' ? 'Dükkan' : t)}`;
                                            }).join(', ');
                                        }
                                    } else if (typeof floorData === 'number') {
                                        summary = `${floorData} Daire`;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={floorNum}
                                            style={styles.floorListItem}
                                            onPress={() => setEditingFloor({ num: floorNum, data: floorDetails[floorNum] })}
                                        >
                                            <View style={styles.floorBadge}>
                                                <Text style={styles.floorBadgeText}>{floorNum}</Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.floorListTitle}>{floorNum}. Normal Kat</Text>
                                                <Text style={styles.floorListSubtitle}>{summary || 'Boş'}</Text>
                                            </View>
                                            <MaterialCommunityIcons name="pencil-circle" size={28} color="#D4AF37" />
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Ground Floor */}
                                <TouchableOpacity
                                    style={[styles.floorListItem, { borderColor: '#D4AF37', borderWidth: 1, backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}
                                    onPress={() => setEditingFloor({ num: 0, data: floorDetails[0] })}
                                >
                                    <View style={[styles.floorBadge, { backgroundColor: '#D4AF37' }]}>
                                        <Text style={[styles.floorBadgeText, { color: '#000' }]}>Z</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.floorListTitle, { color: '#D4AF37' }]}>Zemin Kat</Text>
                                        <Text style={styles.floorListSubtitle}>
                                            {Array.isArray(floorDetails[0]) ? `${floorDetails[0].length} Birim` : 'Boş'}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="pencil-circle" size={28} color="#D4AF37" />
                                </TouchableOpacity>

                                {/* Basements */}
                                {Array.from({ length: parseInt(basementCount) || 0 }).map((_, index) => {
                                    const bNum = index + 1;
                                    const bIdx = -bNum;
                                    const floorData = floorDetails[bIdx];
                                    return (
                                        <TouchableOpacity
                                            key={bIdx}
                                            style={styles.floorListItem}
                                            onPress={() => setEditingFloor({ num: bIdx, data: floorDetails[bIdx] })}
                                        >
                                            <View style={[styles.floorBadge, { backgroundColor: '#444' }]}>
                                                <Text style={styles.floorBadgeText}>-{bNum}</Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.floorListTitle}>{bNum}. Bodrum Kat</Text>
                                                <Text style={styles.floorListSubtitle}>
                                                    {Array.isArray(floorData) ? `${floorData.length} Birim` : 'Boş'}
                                                </Text>
                                            </View>
                                            <MaterialCommunityIcons name="pencil-circle" size={28} color="#D4AF37" />
                                        </TouchableOpacity>
                                    );
                                })}
                                <View style={{ height: 40 }} />
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.floatingDoneBtn}
                                onPress={() => setFloorConfigModalVisible(false)}
                            >
                                <Text style={styles.floatingDoneBtnText}>TAMAMLA</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nested Editor */}
                    {
                        editingFloor && (
                            <FloorEditor
                                floorNum={editingFloor.num}
                                currentData={editingFloor.data}
                                onSave={(num, newData) => {
                                    // 1. Update the specific floor
                                    const updatedDetails = { ...floorDetails, [num]: newData };

                                    // 2. Helper to normalize floor data to array
                                    const normalize = (data, defaultType = 'apartment') => {
                                        if (!data) return [];
                                        if (Array.isArray(data)) return data;
                                        if (typeof data === 'number' || typeof data === 'string') {
                                            return Array.from({ length: parseInt(data) || 0 }).map((_, i) => ({
                                                id: `f${num}_u${i}_${defaultType}`, type: defaultType, name: `${defaultType === 'apartment' ? 'Daire' : 'Birim'} ${i + 1}`, area: ''
                                            }));
                                        }
                                        return [];
                                    };

                                    // 3. Global Renumbering (Bottom-to-Top)
                                    const renumberFloors = (details) => {
                                        let aptCounter = 1;
                                        const sortedKeys = Object.keys(details).sort((a, b) => parseInt(a) - parseInt(b));

                                        const newDetails = { ...details };

                                        sortedKeys.forEach(key => {
                                            // Ensure array format
                                            let units = normalize(newDetails[key], parseInt(key) < 0 ? 'shelter' : (parseInt(key) === 0 ? 'shop' : 'apartment'));

                                            // Update apartment names
                                            const updatedUnits = units.map(u => {
                                                if (u.type === 'apartment') {
                                                    const newName = `Daire ${aptCounter}`;
                                                    aptCounter++;
                                                    return { ...u, name: newName };
                                                }
                                                return u;
                                            });

                                            newDetails[key] = updatedUnits;
                                        });

                                        return newDetails;
                                    };

                                    // 4. Apply and Save
                                    const finalDetails = renumberFloors(updatedDetails);
                                    setFloorDetails(finalDetails);
                                    setEditingFloor(null);
                                }}
                                onClose={() => setEditingFloor(null)}
                            />
                        )
                    }
                </Modal >

            </SafeAreaView >
        </PremiumBackground >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2
    },
    content: {
        padding: 20,
        paddingBottom: 100
    },
    summaryCard: {
        padding: 16,
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    summaryIcon: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    summaryItem: {
        flex: 1
    },
    summaryLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2
    },
    summaryValue: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600'
    },
    sectionHeader: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 4
    },
    card: {
        padding: 16,
        marginBottom: 20,
        borderRadius: 16
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12
    },
    inputWrapper: {
        flex: 1
    },
    inputLabel: {
        color: '#AAA',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 4
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: '#FFF',
        fontSize: 16,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        fontWeight: '500'
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    infoLabel: { color: '#888', fontSize: 12 },
    infoValue: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
    segmentContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 12
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    segmentButtonActive: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37'
    },
    segmentText: { color: '#888', fontSize: 12, fontWeight: '600' },
    segmentTextActive: { color: '#000' },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 16
    },
    configButton: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 60
    },
    configButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12
    },
    configButtonTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14 // Reduced font size slightly
    },
    configButtonSubtitle: {
        color: '#333',
        fontSize: 11
    },
    premiumStepperContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    stepperLabel: {
        color: '#AAA',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    stepperBtn: {
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    stepperValueContainer: {
        minWidth: 40,
        alignItems: 'center'
    },
    stepperValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    schemaContainer: {
        marginVertical: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 10
    },
    textArea: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: '#FFF',
        fontSize: 14,
        padding: 12,
        borderRadius: 10,
        height: 120,
        textAlignVertical: 'top'
    },
    submitBtnContainer: {
        marginVertical: 20,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    submitBtn: {
        paddingVertical: 18,
        alignItems: 'center'
    },
    submitBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#111',
        marginTop: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden' // Important for border radius
    },
    modalHeader: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        backgroundColor: '#151515'
    },
    closeButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        alignItems: 'center', justifyContent: 'center'
    },
    modalTitle: {
        color: '#D4AF37',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    helperText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20
    },
    floorListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        marginBottom: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A2A'
    },
    floorBadge: {
        width: 36, height: 36,
        borderRadius: 12,
        backgroundColor: '#333',
        alignItems: 'center', justifyContent: 'center'
    },
    floorBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14
    },
    floorListTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14
    },
    floorListSubtitle: {
        color: '#888',
        fontSize: 11,
        marginTop: 2
    },
    floatingDoneBtn: {
        backgroundColor: '#D4AF37',
        margin: 20,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center'
    },
    floatingDoneBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 11
    },
    floorEditorCard: {
        backgroundColor: '#1A1A1A',
        width: '90%',
        alignSelf: 'center',
        marginBottom: height * 0.1,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D4AF37',
        overflow: 'hidden'
    },
    modalSubtitle: {
        color: '#666',
        fontSize: 11,
        marginTop: 4
    },
    addButtonsContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        backgroundColor: '#1E1E1E'
    },
    addTypeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        gap: 4
    },
    addTypeBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 11
    },
    unitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333'
    },
    unitIcon: {
        width: 32, height: 32,
        borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10
    },
    unitNameInput: {
        flex: 2,
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: '#FFF',
        fontSize: 13,
        padding: 8,
        borderRadius: 6,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#333'
    },
    unitAreaInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: '#FFF',
        fontSize: 13,
        padding: 8,
        borderRadius: 6,
        marginRight: 8,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    deleteBtn: {
        padding: 8
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 12
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#151515',
        borderTopWidth: 1,
        borderTopColor: '#222',
        gap: 12
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#2A2A2A'
    },
    cancelButtonText: { color: '#888', fontWeight: 'bold', fontSize: 13 },
    saveButton: {
        flex: 2,
        borderRadius: 8,
        overflow: 'hidden'
    },
    gradientButton: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
    secondaryActionBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        borderStyle: 'dashed',
        marginBottom: 16,
        backgroundColor: 'rgba(212, 175, 55, 0.05)'
    },
    secondaryActionText: {
        color: '#D4AF37',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1
    }
});
