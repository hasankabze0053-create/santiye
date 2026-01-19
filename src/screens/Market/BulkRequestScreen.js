import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BulkRequestScreen() {
    const navigation = useNavigation();

    // WIZARD STATE
    const [wizardStep, setWizardStep] = useState(1);
    const [inputTab, setInputTab] = useState('manual');

    // UNIT SELECTION STATE
    const [unitModalVisible, setUnitModalVisible] = useState(false);
    const [activeItemId, setActiveItemId] = useState(null);

    const UNIT_OPTIONS = [
        "Adet", "m²", "m³", "Ton", "Kg", "Levha", "Paket", "Torba", "Metre", "Boy"
    ];

    // FORM DATA
    const [rfqData, setRfqData] = useState({
        items: [{ id: 1, name: '', quantity: '', unit: 'Adet' }],
        fastText: '',
        fastImage: null,
        location: '',
        deliveryType: 'immediate',
        dateRange: '',
        notes: '',
        paymentMethod: 'cash'
    });

    // --- ACTIONS ---

    const handleAddItem = () => {
        const newId = rfqData.items.length > 0 ? Math.max(...rfqData.items.map(i => i.id)) + 1 : 1;
        setRfqData({ ...rfqData, items: [...rfqData.items, { id: newId, name: '', quantity: '', unit: 'Adet' }] });
    };

    const handleRemoveItem = (id) => {
        if (rfqData.items.length === 1) return;
        setRfqData({ ...rfqData, items: rfqData.items.filter(i => i.id !== id) });
    };

    const updateItem = (id, field, value) => {
        const newItems = rfqData.items.map(item => {
            if (item.id === id) return { ...item, [field]: value };
            return item;
        });
        setRfqData({ ...rfqData, items: newItems });
    };

    const openUnitModal = (id) => {
        setActiveItemId(id);
        setUnitModalVisible(true);
    };

    const selectUnit = (unit) => {
        if (activeItemId !== null) {
            updateItem(activeItemId, 'unit', unit);
        }
        setUnitModalVisible(false);
        setActiveItemId(null);
    };

    const handleNext = () => {
        if (wizardStep === 1) {
            if (inputTab === 'manual') {
                const validItems = rfqData.items.filter(i => i.name.trim() !== '' && i.quantity.trim() !== '');
                if (validItems.length === 0) {
                    Alert.alert("Eksik Bilgi", "Lütfen en az bir malzeme ve miktar giriniz.");
                    return;
                }
            } else {
                if (!rfqData.fastText.trim() && !rfqData.fastImage) {
                    Alert.alert("Eksik Bilgi", "Lütfen listenizi yazın veya fotoğraf ekleyin.");
                    return;
                }
            }
        }
        if (wizardStep === 2) {
            if (!rfqData.location.trim()) {
                Alert.alert("Konum Seçilmedi", "Lütfen şantiye konumu veya teslimat adresi giriniz.");
                return;
            }
        }
        setWizardStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (wizardStep === 1) {
            navigation.goBack();
        } else {
            setWizardStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        // Navigate to new Success Screen instead of Alert
        navigation.navigate('MarketSuccess');
    };

    // --- RENDER HELPERS ---

    const renderStepIndicator = () => {
        const steps = ["Malzeme", "Lojistik", "Ödeme"];
        return (
            <View style={styles.stepIndicatorContainer}>
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = wizardStep === stepNum;
                    const isCompleted = wizardStep > stepNum;

                    return (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCompleted && styles.stepCircleCompleted
                            ]}>
                                <Text style={[
                                    styles.stepNumber,
                                    (isActive || isCompleted) && styles.stepNumberActive
                                ]}>{stepNum}</Text>
                            </View>
                            {index < steps.length - 1 && (
                                <View style={[
                                    styles.stepLine,
                                    isCompleted && styles.stepLineCompleted
                                ]} />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderActionButtons = () => (
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerBtn, styles.nextBtn]} onPress={wizardStep === 3 ? handleSubmit : handleNext}>
                <Text style={styles.nextBtnText}>{wizardStep === 3 ? "TEKLİF İSTE" : "DEVAM ET"}</Text>
                {wizardStep !== 3 && <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />}
            </TouchableOpacity>
        </View>
    );

    // --- STEP VIEWS ---
    const renderContent = () => {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* STEP 1 CONTENT: TABBED INPUT */}
                {wizardStep === 1 && (
                    <View>
                        {/* TOP TABS */}
                        <View style={styles.tabHeader}>
                            <TouchableOpacity
                                style={[styles.tabButton, styles.tabButtonLeft, inputTab === 'fast' && styles.tabButtonActive]}
                                onPress={() => setInputTab('fast')}
                            >
                                <MaterialCommunityIcons name="camera-plus" size={20} color={inputTab === 'fast' ? '#000' : '#888'} />
                                <View>
                                    <Text style={[styles.tabTitle, inputTab === 'fast' && styles.tabTitleActive]}>HIZLI YÜKLE</Text>
                                    <Text style={styles.tabSubtitle}>The Lazy Way</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, styles.tabButtonRight, inputTab === 'manual' && styles.tabButtonActive]}
                                onPress={() => setInputTab('manual')}
                            >
                                <MaterialCommunityIcons name="playlist-edit" size={20} color={inputTab === 'manual' ? '#000' : '#888'} />
                                <View>
                                    <Text style={[styles.tabTitle, inputTab === 'manual' && styles.tabTitleActive]}>MANUEL OLUŞTUR</Text>
                                    <Text style={styles.tabSubtitle}>The Pro Way</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {inputTab === 'manual' ? (
                            // MANUAL LIST VIEW
                            <>
                                <Text style={styles.sectionHeader}>Malzeme Listesi</Text>
                                {rfqData.items.map((item, index) => (
                                    <View key={item.id} style={styles.itemRow}>
                                        <View style={styles.itemIndex}>
                                            <Text style={styles.itemIndexText}>{index + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Malzeme Adı (Örn: C30 Beton)"
                                                placeholderTextColor="#666"
                                                value={item.name}
                                                onChangeText={(t) => updateItem(item.id, 'name', t)}
                                                onFocus={() => setFocusedInputType('text')}
                                                onBlur={() => setFocusedInputType(null)}
                                                returnKeyType="done"
                                                onSubmitEditing={Keyboard.dismiss}
                                            />
                                            <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1 }]}
                                                    placeholder="Miktar"
                                                    placeholderTextColor="#666"
                                                    keyboardType="numeric"
                                                    value={item.quantity}
                                                    onChangeText={(t) => updateItem(item.id, 'quantity', t)}
                                                    onFocus={() => setFocusedInputType('numeric')}
                                                    onBlur={() => setFocusedInputType(null)}
                                                />
                                                <TouchableOpacity
                                                    style={styles.unitBox}
                                                    onPress={() => openUnitModal(item.id)}
                                                >
                                                    <Text style={styles.unitText}>{item.unit}</Text>
                                                    <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveItem(item.id)}>
                                            <MaterialCommunityIcons name="close" size={20} color="#FF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#000" />
                                    <Text style={styles.addItemText}>SATIR EKLE</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // FAST LIST VIEW
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionHeader}>Fotoğraf veya Metin</Text>
                                <View style={styles.fastInputContainer}>
                                    <TextInput
                                        style={[styles.textArea]}
                                        multiline
                                        placeholder="İhtiyaçlarınız buraya yazabilir veya kağıt listenizin fotoğrafını çekip yükleyebilirsiniz..."
                                        placeholderTextColor="#555"
                                        value={rfqData.fastText}
                                        onChangeText={(t) => setRfqData({ ...rfqData, fastText: t })}
                                        onFocus={() => setFocusedInputType('multiline')}
                                        onBlur={() => setFocusedInputType(null)}
                                    />
                                    <TouchableOpacity style={styles.cameraBtn} onPress={() => Alert.alert("Kamera", "Fotoğraf modülü açılacak")}>
                                        <MaterialCommunityIcons name="camera" size={24} color="#000" />
                                        <Text style={styles.cameraBtnText}>FOTOĞRAF EKLE</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                )
                }

                {/* STEP 2: LOGISTICS */}
                {
                    wizardStep === 2 && (
                        <View>
                            <Text style={styles.stepTitle}>Lojistik & Teslimat</Text>
                            <Text style={styles.stepDescription}>Nereye ve ne zaman lazım?</Text>

                            {/* Location */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>ŞANTİYE KONUMU</Text>
                                <TouchableOpacity style={styles.locationBtn}>
                                    <MaterialCommunityIcons name="map-marker" size={20} color="#D4AF37" />
                                    <TextInput
                                        style={[styles.inputNoBorder, { flex: 1 }]}
                                        placeholder="Adres veya Konum Seçin"
                                        placeholderTextColor="#666"
                                        value={rfqData.location}
                                        onChangeText={(t) => setRfqData({ ...rfqData, location: t })}
                                    />
                                    <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Date */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>TESLİMAT ZAMANI</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.optionBtn, rfqData.deliveryType === 'immediate' && styles.optionBtnActive]}
                                        onPress={() => setRfqData({ ...rfqData, deliveryType: 'immediate' })}
                                    >
                                        <MaterialCommunityIcons name="lightning-bolt" size={20} color={rfqData.deliveryType === 'immediate' ? '#000' : '#888'} />
                                        <Text style={[styles.optionText, rfqData.deliveryType === 'immediate' && styles.optionTextActive]}>Hemen / Acil</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.optionBtn, rfqData.deliveryType === 'date' && styles.optionBtnActive]}
                                        onPress={() => setRfqData({ ...rfqData, deliveryType: 'date' })}
                                    >
                                        <MaterialCommunityIcons name="calendar" size={20} color={rfqData.deliveryType === 'date' ? '#000' : '#888'} />
                                        <Text style={[styles.optionText, rfqData.deliveryType === 'date' && styles.optionTextActive]}>Tarih Seç</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Notes */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>ÖZEL NOTLAR / GEREKSİNİMLER</Text>
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                    placeholder="Örn: 42m pompa gerekli, transmikser sahaya girebilir..."
                                    placeholderTextColor="#666"
                                    multiline
                                    value={rfqData.notes}
                                    onChangeText={(t) => setRfqData({ ...rfqData, notes: t })}
                                />
                            </View>
                        </View>
                    )
                }

                {/* STEP 3: PAYMENT */}
                {
                    wizardStep === 3 && (
                        <View>
                            <Text style={styles.stepTitle}>Ödeme Yöntemi</Text>
                            <Text style={styles.stepDescription}>Size özel vadelendirme için seçiniz.</Text>

                            {['cash', 'credit_card', 'check_30', 'check_60'].map((method) => {
                                const isSelected = rfqData.paymentMethod === method;
                                let title = "", icon = "", subtitle = "";

                                switch (method) {
                                    case 'cash': title = "Nakit / Havale"; icon = "cash-multiple"; subtitle = "%2-5 Ekstra İskonto"; break;
                                    case 'credit_card': title = "Kredi Kartı"; icon = "credit-card"; subtitle = "Taksit İmkanı"; break;
                                    case 'check_30': title = "30 Gün Vade / Çek"; icon = "file-document-outline"; subtitle = "Standart Vade"; break;
                                    case 'check_60': title = "60+ Gün Vade"; icon = "calendar-clock"; subtitle = "Finansman Farkı Olabilir"; break;
                                }

                                return (
                                    <TouchableOpacity
                                        key={method}
                                        style={[styles.paymentCard, isSelected && styles.paymentCardActive]}
                                        onPress={() => setRfqData({ ...rfqData, paymentMethod: method })}
                                    >
                                        <View style={[styles.paymentIconBox, isSelected && styles.paymentIconBoxActive]}>
                                            <MaterialCommunityIcons name={icon} size={24} color={isSelected ? '#000' : '#888'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.paymentTitle, isSelected && styles.paymentTitleActive]}>{title}</Text>
                                            <Text style={styles.paymentSubtitle}>{subtitle}</Text>
                                        </View>
                                        {isSelected && <MaterialCommunityIcons name="check-circle" size={24} color="#D4AF37" />}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    )
                }
            </ScrollView >
        );
    };

    const renderUnitModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={unitModalVisible}
            onRequestClose={() => setUnitModalVisible(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setUnitModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Birim Seç</Text>
                    <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        {UNIT_OPTIONS.map((unit, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.modalOption}
                                onPress={() => selectUnit(unit)}
                            >
                                <Text style={styles.modalOptionText}>{unit}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // --- KEYBOARD LISTENER ---
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [focusedInputType, setFocusedInputType] = useState(null);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            setKeyboardVisible(true);
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardVisible(false);
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header - Fixed at Top */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TEKLİF TOPLA</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress - Fixed below Header */}
                {renderStepIndicator()}

                {/* Content - Scrollable & Keyboard Aware */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                >
                    <View style={{ flex: 1 }}>
                        {/* Dynamic Content */}
                        <View style={styles.contentArea}>
                            {renderContent()}
                        </View>
                    </View>
                </KeyboardAvoidingView>

                {/* Custom Keyboard Dismiss Button (Visible only when keyboard is open AND input is numeric OR multiline) */}
                {isKeyboardVisible && (focusedInputType === 'numeric' || focusedInputType === 'multiline') && (
                    <View style={[styles.keyboardAccessoryBar, { bottom: keyboardHeight }]}>
                        <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryBtn}>
                            <Text style={styles.accessoryBtnText}>BİTTİ</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Footer Actions - Fixed at Bottom (Behind Keyboard) */}
                {!isKeyboardVisible && renderActionButtons()}

                {/* Unit Selection Modal */}
                {renderUnitModal()}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    // Input Accessory
    keyboardAccessoryBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1A1A1A',
        borderTopWidth: 1,
        borderTopColor: '#333',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 12,
        zIndex: 100
    },
    accessoryBtn: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8
    },
    accessoryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14
    },
    // Header - Fixed padding/alignment
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 60,
        zIndex: 10
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A' },
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    // Step Indicator
    stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, paddingHorizontal: 20, height: 40 },
    stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#444' },
    stepCircleActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    stepCircleCompleted: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
    stepNumber: { color: '#888', fontWeight: 'bold', fontSize: 12 },
    stepNumberActive: { color: '#000' },
    stepLine: { width: 30, height: 2, backgroundColor: '#333', marginHorizontal: 4 },
    stepLineCompleted: { backgroundColor: '#4ADE80' },

    contentArea: { flex: 1, paddingHorizontal: 16 },

    // Top Tabs (New)
    tabHeader: { flexDirection: 'row', marginBottom: 20, gap: 12 },
    tabButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12,
        backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333',
        gap: 10
    },
    tabButtonLeft: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
    tabButtonRight: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
    tabButtonActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    tabTitle: { color: '#888', fontSize: 13, fontWeight: '900' },
    tabTitleActive: { color: '#000' },
    tabSubtitle: { color: '#555', fontSize: 10, fontWeight: 'bold' },

    sectionHeader: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },

    // Fast Input Styles
    fastInputContainer: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    textArea: { color: '#fff', fontSize: 15, height: 150, textAlignVertical: 'top', marginBottom: 16 },
    cameraBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D4AF37', padding: 12, borderRadius: 12, gap: 8 },
    cameraBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

    // Common Step Text
    stepTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    stepDescription: { color: '#888', fontSize: 14, marginBottom: 24 },

    // Step 1: Materials (Manual)
    itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    itemIndex: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 12 },
    itemIndexText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
    input: { backgroundColor: '#111', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#333', textAlignVertical: 'center' },
    unitBox: { width: 80, backgroundColor: '#222', borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: '#333' },
    unitText: { color: '#DDD', fontSize: 13, marginRight: 4 },
    removeBtn: { padding: 8, marginLeft: 8 },
    addItemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D4AF37', borderStyle: 'dashed', marginTop: 8 },
    addItemText: { color: '#D4AF37', fontWeight: 'bold', marginLeft: 8 },

    // Step 2: Logistics
    formGroup: { marginBottom: 20 },
    label: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
    locationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    inputNoBorder: { color: '#FFF', fontSize: 15, marginLeft: 10 },
    optionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#333' },
    optionBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    optionText: { color: '#888', fontWeight: 'bold' },
    optionTextActive: { color: '#000' },

    // Step 3: Payment
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    paymentCardActive: { borderColor: '#D4AF37', backgroundColor: '#1A1A1A' },
    paymentIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    paymentIconBoxActive: { backgroundColor: '#D4AF37' },
    paymentTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    paymentTitleActive: { color: '#D4AF37' },
    paymentSubtitle: { color: '#666', fontSize: 12, marginTop: 2 },

    // Footer
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#000' },
    footerBtn: { padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    nextBtn: { backgroundColor: '#D4AF37', flexDirection: 'row', gap: 8 },
    nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
    modalContent: { width: '80%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
    modalOptionText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
});
