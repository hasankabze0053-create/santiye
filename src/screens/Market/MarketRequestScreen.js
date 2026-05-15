import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Image, InputAccessoryView, Keyboard, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';
import { useTheme } from '../../context/ThemeContext';
import { searchMaterials } from '../../utils/MarketCatalog';

const UNITS = ['Adet', 'Kg', 'Ton', 'M3', 'Paket', 'Metre', 'm²', 'Torba', 'Rulo', 'Teneke'];

const PAYMENT_METHODS = [
    { id: 'cash_transfer', title: 'Nakit / Havale / EFT', icon: 'cash-outline', desc: 'Teslimatta nakit veya banka transferi' },
    { id: 'credit_card', title: 'Kredi Kartı', icon: 'card-outline', desc: 'Teslimatta veya online güvenli ödeme' },
];

const areEqual = (prevProps, nextProps) => {
    return prevProps.item === nextProps.item &&
           prevProps.index === nextProps.index &&
           prevProps.itemsLength === nextProps.itemsLength;
};

const MemoizedItemCard = React.memo(({ item, index, itemsLength, handleRemoveItem, updateItem, clearSuggestions, selectCatalogItem, openUnitPicker, styles, T, isDarkMode }) => {
    return (
        <View style={[styles.itemCard, { zIndex: 1000 - index }]}>
            {itemsLength > 1 && (
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
            )}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: itemsLength > 1 ? 32 : 0 }}>
                {/* Index Indicator */}
                <View style={styles.indexCircle}>
                    <Text allowFontScaling={false} style={styles.indexText}>{index + 1}</Text>
                </View>

                {/* Form Fields */}
                <View style={{ flex: 1, gap: 12 }}>
                    {/* Row 1: Name Input + Autocomplete Suggestions */}
                    <View style={{ zIndex: 10 }}>
                        <View style={styles.premiumInputContainer}>
                            <TextInput allowFontScaling={false}
                                style={styles.premiumInput}
                                placeholder="Malzeme (Örn: C30, Tuğla)"
                                placeholderTextColor={T.textSecondary}
                                value={item.name}
                                onChangeText={(t) => updateItem(item.id, 'name', t)}
                            />
                            {item.name.length > 0 && (
                                <TouchableOpacity onPress={() => updateItem(item.id, 'name', '')} style={styles.deleteBtn}>
                                    <Ionicons name="close-circle" size={20} color={T.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Suggestions Dropdown */}
                        {item.suggestions && item.suggestions.length > 0 && (
                            <View style={[styles.suggestionsCard, { zIndex: 100 }]}>
                                {/* Pinned Custom Option at the Top */}
                                <TouchableOpacity 
                                    style={[styles.suggestionItem, { borderBottomWidth: 1, borderBottomColor: T.border, backgroundColor: isDarkMode ? 'rgba(212,175,55,0.05)' : 'rgba(184,130,15,0.05)' }]}
                                    onPress={() => clearSuggestions(item.id)}
                                >
                                    <Ionicons name="pencil-outline" size={14} color={T.goldPrimary} style={{ marginRight: 8 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={[styles.suggestionName, { color: T.goldPrimary }]}>"{item.name}" Olarak Kullan</Text>
                                        <Text allowFontScaling={false} style={styles.suggestionCat}>Özel Malzeme Girişi</Text>
                                    </View>
                                    <View style={[styles.suggestionUnitBadge, { backgroundColor: 'transparent', paddingHorizontal: 0 }]}>
                                        <Ionicons name="chevron-forward" size={16} color={T.goldPrimary} />
                                    </View>
                                </TouchableOpacity>

                                {/* Scrollable Catalog Options */}
                                <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                                    {item.suggestions.map((sug, i) => (
                                        <TouchableOpacity 
                                            key={i} 
                                            style={styles.suggestionItem}
                                            onPress={() => selectCatalogItem(item.id, sug)}
                                        >
                                            <Ionicons name="search" size={14} color={T.goldPrimary} style={{ marginRight: 8 }} />
                                            <View style={{ flex: 1 }}>
                                                <Text allowFontScaling={false} style={styles.suggestionName}>{sug.name}</Text>
                                                <Text allowFontScaling={false} style={styles.suggestionCat}>{sug.category}</Text>
                                            </View>
                                            <View style={styles.suggestionUnitBadge}>
                                                <Text allowFontScaling={false} style={styles.suggestionUnitText}>{sug.unit}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Row 2: Quantity + Unit */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={[styles.premiumInputContainer, { flex: 1, flexDirection: 'column', justifyContent: 'center' }]}>
                            <TextInput allowFontScaling={false}
                                style={[styles.premiumInput, { width: '100%' }]}
                                placeholder="Miktar"
                                placeholderTextColor={T.textSecondary}
                                keyboardType="numeric"
                                value={item.qty}
                                onChangeText={(t) => updateItem(item.id, 'qty', t)}
                                inputAccessoryViewID="DoneKeyboard"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.unitButton}
                            onPress={() => openUnitPicker(item.id)}
                        >
                            <Text allowFontScaling={false} style={styles.unitText}>{item.unit}</Text>
                            <Ionicons name="chevron-down" size={14} color={T.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Row 3: Optional Brand & Tech Spec */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <View style={[styles.premiumInputContainer, { flex: 1 }]}>
                            <TextInput allowFontScaling={false}
                                style={styles.premiumInput}
                                placeholder="Marka (Opsiyonel)"
                                placeholderTextColor={T.textSecondary}
                                value={item.brand}
                                onChangeText={(t) => updateItem(item.id, 'brand', t)}
                            />
                        </View>
                        <View style={[styles.premiumInputContainer, { flex: 1 }]}>
                            <TextInput allowFontScaling={false}
                                style={styles.premiumInput}
                                placeholder="Poz No / Özellik"
                                placeholderTextColor={T.textSecondary}
                                value={item.techSpec}
                                onChangeText={(t) => updateItem(item.id, 'techSpec', t)}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}, areEqual);

export default function MarketRequestScreen() {
    const { isDarkMode } = useTheme();
    const T = {
        bg: isDarkMode ? '#000000' : '#FDFBF7',
        card: isDarkMode ? '#111111' : '#FFFFFF',
        textPrimary: isDarkMode ? '#FFFFFF' : '#111111',
        textSecondary: isDarkMode ? '#AAAAAA' : '#777777',
        border: isDarkMode ? '#333333' : '#E8E0D0',
        inputBg: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
        searchBg: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        goldPrimary: isDarkMode ? '#D4AF37' : '#B8820F',
        goldShadow: isDarkMode ? '#AA8230' : '#8C6200',
    };
    const styles = getStyles(T, isDarkMode);

    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('manual'); // 'fast' | 'manual'

    // Camera / Image State
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

    // Form Data
    const [title, setTitle] = useState(''); // Step 2 or auto-gen
    const [items, setItems] = useState([
        { id: Date.now(), name: '', qty: '', unit: 'Adet', suggestions: [], brand: '', techSpec: '' }
    ]);
    // Step 2 Data
    const [location, setLocation] = useState('İstanbul Bayrampaşa (Varsayılan)');
    const [deliveryTime, setDeliveryTime] = useState('urgent'); // 'urgent' | 'scheduled'
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [maturityDays, setMaturityDays] = useState('');
    const [maturityUnit, setMaturityUnit] = useState('Gün'); // 'Gün' | 'Ay'

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setItems(prev => {
                if (prev.some(it => it.suggestions && it.suggestions.length > 0)) {
                    return prev.map(it => ({...it, suggestions: []}));
                }
                return prev;
            });
        });
        return () => keyboardDidHideListener.remove();
    }, []);

    // Unit Modal State
    const [unitModalVisible, setUnitModalVisible] = useState(false);
    const [activeItemId, setActiveItemId] = useState(null);

    // --- CAMERA HANDLERS ---
    const handleTakePhoto = async () => {
        if (!cameraPermission || !cameraPermission.granted) {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
                Alert.alert('İzin Gerekli', 'Kamerayı kullanmak için izin vermeniz gerekiyor.');
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
            // Otomatik başlık önerisi
            if (!title) setTitle('Hızlı Fotoğraflı Talep');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
            if (!title) setTitle('Hızlı Fotoğraflı Talep');
        }
    };

    // --- FORM HANDLERS ---
    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', qty: '', unit: 'Adet', suggestions: [], brand: '', techSpec: '' }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(it => it.id !== id));
        }
    };

    const updateItem = useCallback((id, field, value) => {
        let newSuggestions = null;
        if (field === 'name') {
            newSuggestions = value.length >= 2 ? searchMaterials(value) : [];
        }

        setItems(prev => prev.map(it => {
            if (it.id !== id) return it;
            const updated = { ...it, [field]: value };
            
            if (field === 'name' && newSuggestions !== null) {
                updated.suggestions = newSuggestions;
            }
            return updated;
        }));
    }, []);

    const clearSuggestions = (id) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, suggestions: [] } : it));
    };

    const selectCatalogItem = (id, sug) => {
        setItems(prev => prev.map(it => it.id === id ? { 
            ...it, 
            name: sug.name, 
            unit: sug.unit, 
            suggestions: [] 
        } : it));
    };

    const openUnitPicker = (id) => {
        setActiveItemId(id);
        setUnitModalVisible(true);
    };

    const handleNextStep = () => {
        // Validation for Step 1
        if (mode === 'manual') {
            const hasEmpty = items.some(it => !it.name || !it.qty);
            if (hasEmpty) {
                Alert.alert('Eksik Bilgi', 'Lütfen malzeme adı ve miktarını giriniz.');
                return;
            }
        } else {
            if (!capturedImage) {
                Alert.alert('Fotoğraf Gerekli', 'Lütfen listenizin fotoğrafını çekin veya galeriden seçin.');
                return;
            }
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!paymentMethod) {
            Alert.alert('Ödeme Yöntemi', 'Lütfen bir ödeme yöntemi seçiniz.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Başlığı otomatik oluştur (Örn: "Tuğla, Beton Talebi")
            const itemNames = items.map(it => it.name).filter(n => n).join(', ');
            const finalTitle = mode === 'fast' ? 'Fotoğraflı Hızlı Talep' : (itemNames || 'Yeni Market Talebi');

            const requestData = {
                title: finalTitle,
                items: items.map(it => ({
                    product_name: it.name,
                    quantity: parseFloat(it.qty) || 0,
                    unit: it.unit // Database'de bu alan varsa gönderilir
                })),
                location,
                delivery_time: deliveryTime,
                notes,
                payment_method: paymentMethod,
                image_url: capturedImage || null
            };

            const result = await MarketService.createRequest(requestData);

            if (!result.success) throw result.error;

            // Başarılı ise direkt premium başarı sayfasına yönlendir
            navigation.navigate('MarketSuccess');
        } catch (err) {
            console.error('Submit Error:', err);
            Alert.alert("Hata", "Talep oluşturulurken bir sorun oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                <Text allowFontScaling={false} style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                <Text allowFontScaling={false} style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
            </View>
        </View>
    );

    const renderStep1_Manual = () => (
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled" 
            keyboardDismissMode="interactive"
            nestedScrollEnabled={true} 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            onScrollBeginDrag={() => {
                Keyboard.dismiss();
                setItems(prev => prev.map(it => ({...it, suggestions: []})));
            }}
        >
            
                    <Text allowFontScaling={false} style={styles.sectionTitle}>MALZEME LİSTESİ</Text>

                    {items.map((item, index) => (
                        <MemoizedItemCard 
                            key={item.id} 
                            item={item} 
                            index={index} 
                            itemsLength={items.length}
                            handleRemoveItem={handleRemoveItem}
                            updateItem={updateItem}
                            clearSuggestions={clearSuggestions}
                            selectCatalogItem={selectCatalogItem}
                            openUnitPicker={openUnitPicker}
                            styles={styles}
                            T={T}
                            isDarkMode={isDarkMode}
                        />
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
                        <Text allowFontScaling={false} style={styles.addBtnText}>+ SATIR EKLE</Text>
                    </TouchableOpacity>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={isDarkMode ? ['#000000', '#0a0a0a'] : ['#FDFBF7', '#F7F1E4']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={T.textPrimary} />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>TEKLİF TOPLA</Text>
                    <View style={{ width: 40 }} />
                </View>

                {renderStepIndicator()}

                {/* Mode Tabs (Only on Step 1) */}
                {step === 1 && (
                    <View style={styles.modeContainer}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setMode('fast')}>
                            <LinearGradient 
                                colors={mode === 'fast' ? [T.goldPrimary, T.goldShadow] : (isDarkMode ? ['#1A1A1A', '#0D0D0D'] : ['#FFFFFF', '#F0F0F0'])} 
                                style={[styles.modeCard, mode === 'fast' ? styles.modeCardActive : {}]}
                            >
                                <MaterialCommunityIcons name="camera-outline" size={28} color={mode === 'fast' ? '#FFF' : '#888'} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text allowFontScaling={false} style={[styles.modeTitle, mode === 'fast' && { color: '#FFF' }]}>HIZLI YÜKLE</Text>
                                    <Text allowFontScaling={false} style={[styles.modeSub, mode === 'fast' && { color: 'rgba(255,255,255,0.8)' }]}>Fotoğraf ile hızlıca</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setMode('manual')}>
                            <LinearGradient 
                                colors={mode === 'manual' ? [T.goldPrimary, T.goldShadow] : (isDarkMode ? ['#1A1A1A', '#0D0D0D'] : ['#FFFFFF', '#F0F0F0'])} 
                                style={[styles.modeCard, mode === 'manual' ? styles.modeCardActive : {}]}
                            >
                                <MaterialCommunityIcons name="playlist-edit" size={28} color={mode === 'manual' ? '#FFF' : '#888'} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text allowFontScaling={false} style={[styles.modeTitle, mode === 'manual' && { color: '#FFF' }]}>DİJİTAL TALEP</Text>
                                    <Text allowFontScaling={false} style={[styles.modeSub, mode === 'manual' && { color: 'rgba(255,255,255,0.8)' }]}>Gelişmiş Giriş</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.content}>
                    {step === 1 && mode === 'manual' && renderStep1_Manual()}

                    {step === 1 && mode === 'fast' && (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {capturedImage ? (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Image source={{ uri: capturedImage }} style={{ width: '100%', height: 300, borderRadius: 16, marginBottom: 20 }} resizeMode="cover" />
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TouchableOpacity onPress={() => setCapturedImage(null)} style={{ padding: 12, backgroundColor: T.border, borderRadius: 12 }}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setCapturedImage(null)} style={{ padding: 12, backgroundColor: T.goldPrimary, borderRadius: 12, paddingHorizontal: 32 }}>
                                            <Text allowFontScaling={false} style={{ fontWeight: 'bold' }}>YENİDEN ÇEK</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={handleTakePhoto}
                                        style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: T.goldPrimary }}
                                    >
                                        <MaterialCommunityIcons name="camera" size={40} color={T.goldPrimary} />
                                    </TouchableOpacity>
                                    <Text allowFontScaling={false} style={{ color: T.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Fotoğraf Çek</Text>
                                    <Text allowFontScaling={false} style={{ color: T.textSecondary, textAlign: 'center', maxWidth: 250 }}>İhtiyacınız olan malzemenin veya yapılacak işin fotoğrafını çekin, gerisini bize bırakın.</Text>

                                    <TouchableOpacity onPress={pickImage} style={{ marginTop: 30 }}>
                                        <Text allowFontScaling={false} style={{ color: T.textSecondary, textDecorationLine: 'underline' }}>Galeriden Seç</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {step === 2 && (
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>

                            <Text allowFontScaling={false} style={styles.stepTitle}>Lojistik & Teslimat</Text>
                            <Text allowFontScaling={false} style={styles.stepSubtitle}>Nereye ve ne zaman lazım?</Text>

                            {/* Location */}
                            <Text allowFontScaling={false} style={styles.labelSmall}>ŞANTİYE KONUMU</Text>
                            <View style={styles.locationInput}>
                                <Ionicons name="location" size={20} color={T.goldPrimary} />
                                <TextInput allowFontScaling={false}
                                    style={{ flex: 1, color: T.textPrimary, marginLeft: 10 }}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor={T.textSecondary}
                                />
                                <Ionicons name="locate-outline" size={20} color={T.textSecondary} />
                            </View>

                            {/* Notes */}
                            <Text allowFontScaling={false} style={[styles.labelSmall, { marginTop: 24 }]}>ÖZEL NOTLAR / GEREKSİNİMLER</Text>
                            <TextInput allowFontScaling={false}
                                style={styles.notesInput}
                                placeholder="Örn: 42m pompa gerekli, transmikser sahaya girebilir..."
                                placeholderTextColor="#555"
                                multiline
                                value={notes}
                                onChangeText={setNotes}
                            />

                            <Text allowFontScaling={false} style={[styles.stepTitle, { marginTop: 40 }]}>Ödeme Yöntemi</Text>
                            <Text allowFontScaling={false} style={styles.stepSubtitle}>Tercih ettiğiniz ödeme şekli</Text>

                            <View style={{ gap: 12 }}>
                                {PAYMENT_METHODS.map((pm) => (
                                    <TouchableOpacity
                                        key={pm.id}
                                        style={[styles.paymentCard, paymentMethod === pm.id && styles.paymentCardActive]}
                                        onPress={() => setPaymentMethod(pm.id)}
                                    >
                                        <View style={[styles.paymentIconBox, paymentMethod === pm.id && { backgroundColor: T.goldPrimary }]}>
                                            <Ionicons name={pm.icon} size={24} color={paymentMethod === pm.id ? '#000' : '#666'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={[styles.paymentTitle, paymentMethod === pm.id && { color: T.goldPrimary }]}>{pm.title}</Text>
                                            <Text allowFontScaling={false} style={styles.paymentDesc}>{pm.desc}</Text>
                                        </View>
                                        {paymentMethod === pm.id && (
                                            <Ionicons name="checkmark-circle" size={24} color={T.goldPrimary} />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                {paymentMethod === 'check' && (
                                    <View style={styles.maturityContainer}>
                                        <Text allowFontScaling={false} style={styles.labelSmall}>VADE SÜRESİ</Text>
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, height: 50 }}>
                                            <TextInput allowFontScaling={false}
                                                style={[styles.premiumInput, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: T.border, paddingHorizontal: 16, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}
                                                placeholder="Örn: 30"
                                                placeholderTextColor={T.textSecondary}
                                                keyboardType="numeric"
                                                value={maturityDays}
                                                onChangeText={setMaturityDays}
                                                inputAccessoryViewID="DoneKeyboard"
                                            />
                                            <View style={{ flexDirection: 'row', backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, overflow: 'hidden' }}>
                                                <TouchableOpacity 
                                                    style={[{ paddingHorizontal: 16, justifyContent: 'center' }, maturityUnit === 'Gün' && { backgroundColor: T.goldPrimary }]}
                                                    onPress={() => setMaturityUnit('Gün')}
                                                >
                                                    <Text allowFontScaling={false} style={[{ color: T.textSecondary, fontWeight: 'bold' }, maturityUnit === 'Gün' && { color: '#000' }]}>GÜN</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[{ paddingHorizontal: 16, justifyContent: 'center' }, maturityUnit === 'Ay' && { backgroundColor: T.goldPrimary }]}
                                                    onPress={() => setMaturityUnit('Ay')}
                                                >
                                                    <Text allowFontScaling={false} style={[{ color: T.textSecondary, fontWeight: 'bold' }, maturityUnit === 'Ay' && { color: '#000' }]}>AY</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]} 
                        onPress={step === 1 ? handleNextStep : handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text allowFontScaling={false} style={styles.nextBtnText}>
                            {isSubmitting ? 'GÖNDERİLİYOR...' : (step === 1 ? 'DEVAM ET' : 'TALEBİ GÖNDER')}
                        </Text>
                        {!isSubmitting && <Ionicons name="arrow-forward" size={20} color={isDarkMode ? '#000' : '#FFF'} />}
                    </TouchableOpacity>
                </View>
                </View>
                </View>

                {/* Unit Picker Modal */}
                <Modal visible={unitModalVisible} transparent animationType="slide">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setUnitModalVisible(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHandle} />
                            <Text allowFontScaling={false} style={styles.modalHeaderTitle}>Birim Seçin</Text>
                            <ScrollView>
                                {UNITS.map((u) => (
                                    <TouchableOpacity 
                                        key={u} 
                                        style={styles.modalOption}
                                        onPress={() => {
                                            const activeItem = items.find(it => it.id === activeItemId);
                                            if (activeItem) {
                                                setItems(prev => prev.map(it => it.id === activeItemId ? { ...it, unit: u } : it));
                                            }
                                            setUnitModalVisible(false);
                                        }}
                                    >
                                        <Text allowFontScaling={false} style={styles.modalOptionText}>{u}</Text>
                                        {activeItemId && items.find(it => it.id === activeItemId)?.unit === u && (
                                            <Ionicons name="checkmark" size={20} color={T.goldPrimary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

export function getStyles(T, isDarkMode) { return StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: T.searchBg, borderWidth: 1, borderColor: T.border },
    headerTitle: { color: T.goldPrimary, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
    stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
    stepDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border },
    stepDotActive: { backgroundColor: T.goldPrimary, borderColor: T.goldPrimary },
    stepText: { color: T.textSecondary, fontWeight: 'bold' },
    stepTextActive: { color: '#000' },
    stepLine: { width: 40, height: 2, backgroundColor: T.card, marginHorizontal: 8 },
    stepLineActive: { backgroundColor: T.goldPrimary },
    modeContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
    modeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: T.border },
    modeCardActive: { borderColor: T.goldPrimary, shadowColor: T.goldPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    modeTitle: { color: T.textSecondary, fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
    modeSub: { color: T.textSecondary, fontSize: 10, marginTop: 2 },
    content: { flex: 1, paddingHorizontal: 20 },
    sectionTitle: { color: T.goldPrimary, fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
    itemCard: { backgroundColor: 'transparent', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: T.border },
    indexCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.goldPrimary, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    indexText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
    premiumInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.inputBg, borderRadius: 12, borderWidth: 1, borderColor: T.border, paddingHorizontal: 12, height: 50 },
    premiumInput: { flex: 1, color: T.textPrimary, fontSize: 13 },
    deleteBtn: { marginLeft: 8 },
    unitButton: { width: 80, height: 50, backgroundColor: T.inputBg, borderRadius: 12, borderWidth: 1, borderColor: T.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    unitText: { color: T.textPrimary, fontSize: 13, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: T.border, borderStyle: 'dashed', backgroundColor: 'transparent', gap: 8, marginTop: 4 },
    addBtnText: { color: T.goldPrimary, fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
    suggestionsCard: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.goldPrimary, marginTop: 4, padding: 4, maxHeight: 220, zIndex: 9999, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 15 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: T.border },
    suggestionName: { color: T.textPrimary, fontSize: 14, fontWeight: 'bold' },
    suggestionCat: { color: T.textSecondary, fontSize: 11, marginTop: 2 },
    suggestionUnitBadge: { backgroundColor: isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(184,130,15,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    suggestionUnitText: { color: T.goldPrimary, fontSize: 12, fontWeight: '900' },
    footer: { padding: 20, paddingTop: 10 },
    nextBtn: { height: 56, borderRadius: 28, backgroundColor: T.goldPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
    nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    stepTitle: { color: T.goldPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    stepSubtitle: { color: T.textSecondary, fontSize: 14, marginBottom: 24 },
    labelSmall: { color: T.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
    locationInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, paddingHorizontal: 16, height: 56 },
    toggleContainer: { flexDirection: 'row', gap: 12 },
    toggleBtn: { flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, gap: 8 },
    toggleBtnActive: { backgroundColor: T.goldPrimary, borderColor: T.goldPrimary },
    toggleText: { color: T.textSecondary, fontWeight: 'bold', fontSize: 13 },
    toggleTextActive: { color: '#000', fontWeight: 'bold', fontSize: 13 },
    notesInput: { backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 16, height: 120, textAlignVertical: 'top', color: T.textPrimary, fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: T.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '50%' },
    modalHandle: { width: 40, height: 4, backgroundColor: T.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalHeaderTitle: { color: T.goldPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.border },
    modalOptionText: { color: T.textPrimary, fontSize: 16 },
    paymentCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: T.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: T.border },
    paymentCardActive: { borderColor: T.goldPrimary, backgroundColor: T.searchBg },
    paymentIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
    paymentTitle: { color: T.textPrimary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    paymentDesc: { color: T.textSecondary, fontSize: 12 },
    maturityContainer: { marginTop: 20 },
});
}
