import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Alert, Image, InputAccessoryView, Keyboard, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';
import { searchMaterials } from '../../utils/MarketCatalog';

const UNITS = ['Adet', 'Kg', 'Ton', 'M3', 'Paket', 'Metre', 'm²', 'Torba', 'Rulo', 'Teneke'];

const PAYMENT_METHODS = [
    { id: 'cash_transfer', title: 'Nakit / Havale / EFT', icon: 'cash-outline', desc: 'Teslimatta nakit veya banka transferi' },
    { id: 'credit_card', title: 'Kredi Kartı', icon: 'card-outline', desc: 'Teslimatta veya online güvenli ödeme' },
    { id: 'check', title: 'Çek / Senet', icon: 'document-text-outline', desc: 'Vadeli ödeme seçenekleri' },
];

const areEqual = (prevProps, nextProps) => {
    return prevProps.item === nextProps.item &&
           prevProps.index === nextProps.index &&
           prevProps.itemsLength === nextProps.itemsLength;
};

const MemoizedItemCard = React.memo(({ item, index, itemsLength, handleRemoveItem, updateItem, clearSuggestions, selectCatalogItem, openUnitPicker, styles }) => {
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
                                placeholderTextColor="#888"
                                value={item.name}
                                onChangeText={(t) => updateItem(item.id, 'name', t)}
                            />
                            {item.name.length > 0 && (
                                <TouchableOpacity onPress={() => updateItem(item.id, 'name', '')} style={styles.deleteBtn}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Suggestions Dropdown */}
                        {item.suggestions && item.suggestions.length > 0 && (
                            <View style={[styles.suggestionsCard, { zIndex: 100 }]}>
                                {/* Pinned Custom Option at the Top */}
                                <TouchableOpacity 
                                    style={[styles.suggestionItem, { borderBottomWidth: 1, borderBottomColor: '#333', backgroundColor: 'rgba(212,175,55,0.05)' }]}
                                    onPress={() => clearSuggestions(item.id)}
                                >
                                    <Ionicons name="pencil-outline" size={14} color="#D4AF37" style={{ marginRight: 8 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={[styles.suggestionName, { color: '#D4AF37' }]}>"{item.name}" Olarak Kullan</Text>
                                        <Text allowFontScaling={false} style={styles.suggestionCat}>Özel Malzeme Girişi</Text>
                                    </View>
                                    <View style={[styles.suggestionUnitBadge, { backgroundColor: 'transparent', paddingHorizontal: 0 }]}>
                                        <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
                                    </View>
                                </TouchableOpacity>

                                {/* Scrollable Catalog Options */}
                                <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                                    {item.suggestions.map((sug, i) => (
                                        <TouchableOpacity 
                                            key={i} 
                                            style={styles.suggestionItem}
                                            onPress={() => selectCatalogItem(item.id, sug)}
                                        >
                                            <Ionicons name="search" size={14} color="#D4AF37" style={{ marginRight: 8 }} />
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
                                placeholderTextColor="#888"
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
                            <Ionicons name="chevron-down" size={14} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* Row 3: Optional Brand & Tech Spec */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <View style={[styles.premiumInputContainer, { flex: 1 }]}>
                            <TextInput allowFontScaling={false}
                                style={styles.premiumInput}
                                placeholder="Marka (Opsiyonel)"
                                placeholderTextColor="#666"
                                value={item.brand}
                                onChangeText={(t) => updateItem(item.id, 'brand', t)}
                            />
                        </View>
                        <View style={[styles.premiumInputContainer, { flex: 1 }]}>
                            <TextInput allowFontScaling={false}
                                style={styles.premiumInput}
                                placeholder="Poz No / Özellik"
                                placeholderTextColor="#666"
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
            if (!title) setTitle('Hızlı Fotoğraflı Talep');
        }
    };

    // --- HANDLERS ---
    const handleAddItem = useCallback(() => {
        setItems(prev => [...prev, { id: Date.now() + Math.random(), name: '', qty: '', unit: 'Adet', suggestions: [], brand: '', techSpec: '' }]);
    }, []);

    const handleRemoveItem = useCallback((id) => {
        setItems(prev => {
            if (prev.length > 1) {
                return prev.filter(i => i.id !== id);
            }
            return [{ id: Date.now(), name: '', qty: '', unit: 'Adet', suggestions: [], brand: '', techSpec: '' }];
        });
    }, []);

    const updateItem = useCallback((id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                if (field === 'name') {
                    if (value.length >= 2) {
                         const results = searchMaterials(value);
                         updatedItem.suggestions = results;
                    } else {
                         updatedItem.suggestions = []; 
                    }
                }
                
                return updatedItem;
            }
            return item;
        }));
    }, []);

    const selectCatalogItem = useCallback((id, catalogItem) => {
        setItems(prev => prev.map(item => 
            item.id === id 
                ? { ...item, name: catalogItem.name, unit: catalogItem.unit, suggestions: [] } 
                : item
        ));
    }, []);

    // Custom clear function for memoized card
    const clearSuggestions = useCallback((id) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, suggestions: [] } : it));
    }, []);

    const openUnitPicker = useCallback((id) => {
        setActiveItemId(id);
        setUnitModalVisible(true);
    }, []);

    const selectUnit = useCallback((unit) => {
        if (activeItemId) {
            updateItem(activeItemId, 'unit', unit);
        }
        setUnitModalVisible(false);
        setActiveItemId(null);
    }, [activeItemId, updateItem]);

    const handleNext = () => {
        // Validation
        const validItems = items.filter(i => i.name.trim().length > 0 && i.qty.trim().length > 0);

        if (validItems.length === 0) {
            Alert.alert("Eksik Bilgi", "Lütfen en az bir malzeme giriniz.");
            return;
        }

        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Uniform premium title for all market requests
        let finalTitle = title.trim();
        if (!finalTitle) {
            finalTitle = 'Toptan Malzeme Talebi';
        }

        if (!paymentMethod) {
            Alert.alert("Eksik Bilgi", "Lütfen bir ödeme yöntemi seçin.");
            return;
        }

        if (paymentMethod === 'check' && !maturityDays.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen çek/senet için vade süresini belirtin.");
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = null;

            // Include maturityDays in notes if applicable
            let finalNotes = notes.trim();
            if (paymentMethod === 'check' && maturityDays.trim()) {
                finalNotes += finalNotes ? `\n\n[Sistem Notu: İstenen Vade: ${maturityDays.trim()} ${maturityUnit}]` : `[Sistem Notu: İstenen Vade: ${maturityDays.trim()} ${maturityUnit}]`;
            }

            // Eğer resim seçildiyse önce onu yükle
            if (capturedImage) {
                uploadedImageUrl = await MarketService.uploadImage(capturedImage);
            }

            const result = await MarketService.createRequest({
                title: finalTitle,
                items: items.filter(i => i.name && i.qty).map(i => {
                    let finalName = i.name.trim();
                    if (i.brand && i.brand.trim()) finalName += ` [Marka: ${i.brand.trim()}]`;
                    if (i.techSpec && i.techSpec.trim()) finalName += ` [Özellik: ${i.techSpec.trim()}]`;
                    return {
                        product_name: finalName,
                        quantity: `${i.qty} ${i.unit}`
                    };
                }),
                delivery_time: deliveryTime,
                location: location,
                notes: finalNotes,
                payment_method: paymentMethod,
                image_url: uploadedImageUrl // Resim URL'sini gönder
            });

            if (result.success) {
                // Success - could go to Step 3 or back
                // Success - Go to Success Screen
                navigation.navigate('MarketSuccess');
            } else {
                Alert.alert("Hata", "Talep oluşturulamadı - Lütfen SQL iznini çalıştırdığınızdan emin olun.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Sunucu Hatası", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDERERS ---

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}><Text allowFontScaling={false} style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text></View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}><Text allowFontScaling={false} style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text></View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}><Text allowFontScaling={false} style={[styles.stepText, step >= 3 && styles.stepTextActive]}>3</Text></View>
        </View>
    );

    const renderStep1_Manual = () => (
        <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled" 
            nestedScrollEnabled={true} 
            contentContainerStyle={{ paddingBottom: 100 }}
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
            <LinearGradient colors={['#000', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
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
                                colors={mode === 'fast' ? ['#D4AF37', '#AA7C11'] : ['#1A1A1A', '#0D0D0D']} 
                                style={[styles.modeCard, mode === 'fast' ? styles.modeCardActive : {}]}
                            >
                                <MaterialCommunityIcons name="camera-outline" size={28} color={mode === 'fast' ? '#000' : '#888'} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text allowFontScaling={false} style={[styles.modeTitle, mode === 'fast' && { color: '#000' }]}>HIZLI YÜKLE</Text>
                                    <Text allowFontScaling={false} style={[styles.modeSub, mode === 'fast' && { color: '#333' }]}>Fotoğraf ile hızlıca</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setMode('manual')}>
                            <LinearGradient 
                                colors={mode === 'manual' ? ['#D4AF37', '#AA7C11'] : ['#1A1A1A', '#0D0D0D']} 
                                style={[styles.modeCard, mode === 'manual' ? styles.modeCardActive : {}]}
                            >
                                <MaterialCommunityIcons name="playlist-edit" size={28} color={mode === 'manual' ? '#000' : '#888'} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text allowFontScaling={false} style={[styles.modeTitle, mode === 'manual' && { color: '#000' }]}>DİJİTAL TALEP</Text>
                                    <Text allowFontScaling={false} style={[styles.modeSub, mode === 'manual' && { color: '#333' }]}>Gelişmiş Giriş</Text>
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
                                        <TouchableOpacity onPress={() => setCapturedImage(null)} style={{ padding: 12, backgroundColor: '#333', borderRadius: 12 }}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setCapturedImage(null)} style={{ padding: 12, backgroundColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 32 }}>
                                            <Text allowFontScaling={false} style={{ fontWeight: 'bold' }}>YENİDEN ÇEK</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={handleTakePhoto}
                                        style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#D4AF37' }}
                                    >
                                        <MaterialCommunityIcons name="camera" size={40} color="#D4AF37" />
                                    </TouchableOpacity>
                                    <Text allowFontScaling={false} style={{ color: '#DDD', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Fotoğraf Çek</Text>
                                    <Text allowFontScaling={false} style={{ color: '#666', textAlign: 'center', maxWidth: 250 }}>İhtiyacınız olan malzemenin veya yapılacak işin fotoğrafını çekin, gerisini bize bırakın.</Text>

                                    <TouchableOpacity onPress={pickImage} style={{ marginTop: 30 }}>
                                        <Text allowFontScaling={false} style={{ color: '#666', textDecorationLine: 'underline' }}>Galeriden Seç</Text>
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
                                <Ionicons name="location" size={20} color="#D4AF37" />
                                <TextInput allowFontScaling={false}
                                    style={{ flex: 1, color: '#fff', marginLeft: 10 }}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor="#666"
                                />
                                <Ionicons name="locate-outline" size={20} color="#666" />
                            </View>

                            {/* Delivery Time - REMOVED AS REQUESTED
                            <Text allowFontScaling={false} style={[styles.labelSmall, { marginTop: 24 }]}>TESLİMAT ZAMANI</Text>
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, deliveryTime === 'urgent' && styles.toggleBtnActive]}
                                    onPress={() => setDeliveryTime('urgent')}
                                >
                                    <Ionicons name="flash" size={18} color={deliveryTime === 'urgent' ? '#000' : '#666'} />
                                    <Text allowFontScaling={false} style={deliveryTime === 'urgent' ? styles.toggleTextActive : styles.toggleText}>Hemen / Acil</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.toggleBtn, deliveryTime === 'scheduled' && styles.toggleBtnActive]}
                                    onPress={() => setDeliveryTime('scheduled')}
                                >
                                    <Ionicons name="calendar" size={18} color={deliveryTime === 'scheduled' ? '#000' : '#666'} />
                                    <Text allowFontScaling={false} style={deliveryTime === 'scheduled' ? styles.toggleTextActive : styles.toggleText}>Tarih Seç</Text>
                                </TouchableOpacity>
                            </View>
                            */}

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
                        </ScrollView>
                    )}

                    {step === 3 && (
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>
                            <Text allowFontScaling={false} style={styles.stepTitle}>Ödeme Yöntemi</Text>
                            <Text allowFontScaling={false} style={styles.stepSubtitle}>Tercih ettiğiniz ödeme şekli</Text>

                            <View style={{ gap: 12 }}>
                                {PAYMENT_METHODS.map((pm) => (
                                    <TouchableOpacity
                                        key={pm.id}
                                        style={[styles.paymentCard, paymentMethod === pm.id && styles.paymentCardActive]}
                                        onPress={() => setPaymentMethod(pm.id)}
                                    >
                                        <View style={[styles.paymentIconBox, paymentMethod === pm.id && { backgroundColor: '#D4AF37' }]}>
                                            <Ionicons name={pm.icon} size={24} color={paymentMethod === pm.id ? '#000' : '#666'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={[styles.paymentTitle, paymentMethod === pm.id && { color: '#D4AF37' }]}>{pm.title}</Text>
                                            <Text allowFontScaling={false} style={styles.paymentDesc}>{pm.desc}</Text>
                                        </View>
                                        {paymentMethod === pm.id && (
                                            <Ionicons name="checkmark-circle" size={24} color="#D4AF37" />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                {/* Conditional Vade (Maturity) Input for Check/Senet */}
                                {paymentMethod === 'check' && (
                                    <View style={styles.maturityContainer}>
                                        <Text allowFontScaling={false} style={styles.labelSmall}>VADE SÜRESİ</Text>
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, height: 50 }}>
                                            <TextInput allowFontScaling={false}
                                                style={[styles.premiumInput, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}
                                                placeholder="Örn: 30"
                                                placeholderTextColor="#666"
                                                keyboardType="numeric"
                                                value={maturityDays}
                                                onChangeText={setMaturityDays}
                                                inputAccessoryViewID="DoneKeyboard"
                                            />
                                            {Platform.OS === 'ios' && (
                                                <InputAccessoryView nativeID="DoneKeyboard">
                                                    <View style={{ backgroundColor: '#1E1E1E', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#333' }}>
                                                        <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                                                            <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 16 }}>Bitti</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </InputAccessoryView>
                                            )}
                                            <View style={{ flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden' }}>
                                                <TouchableOpacity 
                                                    style={[{ paddingHorizontal: 16, justifyContent: 'center' }, maturityUnit === 'Gün' && { backgroundColor: '#D4AF37' }]}
                                                    onPress={() => setMaturityUnit('Gün')}
                                                >
                                                    <Text allowFontScaling={false} style={[{ color: '#888', fontWeight: 'bold' }, maturityUnit === 'Gün' && { color: '#000' }]}>GÜN</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[{ paddingHorizontal: 16, justifyContent: 'center' }, maturityUnit === 'Ay' && { backgroundColor: '#D4AF37' }]}
                                                    onPress={() => setMaturityUnit('Ay')}
                                                >
                                                    <Text allowFontScaling={false} style={[{ color: '#888', fontWeight: 'bold' }, maturityUnit === 'Ay' && { color: '#000' }]}>AY</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.suggestionCat, { marginTop: 8, opacity: 0.8 }]}>* Satıcılar tekliflerini bu vadeye göre düzenleyecektir.</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}
                    </View>
                </View>

                {/* Footer Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={isSubmitting}>
                        <Text allowFontScaling={false} style={styles.nextBtnText}>{isSubmitting ? 'GÖNDERİLİYOR...' : step === 3 ? 'TEKLİF İSTE' : 'DEVAM ET'}</Text>
                        {!isSubmitting && <Ionicons name={step === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#000" />}
                    </TouchableOpacity>
                </View>
                </View>

                {/* --- UNIT SELECTION MODAL --- */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={unitModalVisible}
                    onRequestClose={() => setUnitModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setUnitModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHandle} />
                            <Text allowFontScaling={false} style={styles.modalHeaderTitle}>Birim Seçiniz</Text>

                            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                                {UNITS.map((u, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.modalOption}
                                        onPress={() => selectUnit(u)}
                                    >
                                        <Text allowFontScaling={false} style={styles.modalOptionText}>{u}</Text>
                                        {activeItemId && items.find(it => it.id === activeItemId)?.unit === u && (
                                            <Ionicons name="checkmark" size={20} color="#D4AF37" />
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
    headerTitle: { color: '#D4AF37', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },

    // Steps
    stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
    stepDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    stepDotActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    stepText: { color: '#444', fontWeight: 'bold' },
    stepTextActive: { color: '#000' },
    stepLine: { width: 40, height: 2, backgroundColor: '#222', marginHorizontal: 8 },
    stepLineActive: { backgroundColor: '#D4AF37' },

    // Modes
    modeContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
    modeCard: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
        paddingVertical: 18, paddingHorizontal: 10, 
        borderRadius: 16, borderWidth: 1, borderColor: '#333' 
    },
    modeCardActive: { borderColor: '#FFF', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    modeTitle: { color: '#888', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
    modeSub: { color: '#555', fontSize: 10, marginTop: 2 },

    // Content
    content: { flex: 1, paddingHorizontal: 20 },
    sectionTitle: { color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },

    // Item Card (Orijinal Tasarım)
    itemCard: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    indexCircle: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#D4AF37',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 12
    },
    indexText: { color: '#000', fontSize: 13, fontWeight: 'bold' },

    // Inputs inside card
    premiumInputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        height: 50,
    },
    premiumInput: { flex: 1, color: '#FFF', fontSize: 13 },

    deleteBtn: { marginLeft: 8 },

    unitButton: {
        width: 80, height: 50,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6
    },
    unitText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', backgroundColor: 'transparent', gap: 8, marginTop: 4 },
    addBtnText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },

    // Autocomplete Dropdown
    suggestionsCard: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1, borderColor: '#D4AF37',
        marginTop: 4,
        padding: 4,
        maxHeight: 220,
        zIndex: 9999,
        // absolute positioning yapıldı ki alttaki inputu itmesin. Z-index eklendi.
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 15,
    },
    suggestionItem: {
        flexDirection: 'row', alignItems: 'center',
        padding: 12, borderBottomWidth: 1, borderBottomColor: '#333',
    },
    suggestionName: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    suggestionCat: { color: '#888', fontSize: 11, marginTop: 2 },
    suggestionUnitBadge: { backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    suggestionUnitText: { color: '#D4AF37', fontSize: 12, fontWeight: '900' },

    // Footer
    footer: { padding: 20, paddingTop: 10 },
    nextBtn: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#D4AF37',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10,
        // Shadow for premium feel
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    // Step 2 Styles
    stepTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    stepSubtitle: { color: '#666', fontSize: 14, marginBottom: 24 },
    labelSmall: { color: '#666', fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

    locationInput: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#161616',
        borderRadius: 12, borderWidth: 1, borderColor: '#333',
        paddingHorizontal: 16, height: 56
    },

    toggleContainer: { flexDirection: 'row', gap: 12 },
    toggleBtn: { flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#161616', borderRadius: 12, borderWidth: 1, borderColor: '#333', gap: 8 },
    toggleBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    toggleText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
    toggleTextActive: { color: '#000', fontWeight: 'bold', fontSize: 13 },

    notesInput: {
        backgroundColor: '#161616',
        borderRadius: 12, borderWidth: 1, borderColor: '#333',
        padding: 16, height: 120, textAlignVertical: 'top',
        color: '#fff', fontSize: 14
    },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '50%' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalHeaderTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
    modalOptionText: { color: '#fff', fontSize: 16 },

    // Step 3: Payment Styles
    paymentCard: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: '#161616', padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: '#333'
    },
    paymentCardActive: { borderColor: '#D4AF37', backgroundColor: '#1A1A1A' },
    paymentIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    paymentTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    paymentDesc: { color: '#666', fontSize: 12 },
});
