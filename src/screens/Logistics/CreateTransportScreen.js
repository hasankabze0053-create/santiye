import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, InputAccessoryView, Keyboard, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// --- DATA ---
const LOAD_TYPES = [
    { id: 'long', title: 'Uzun Malzeme', subtitle: 'Demir, Profil, Boru', icon: 'i-beam' },
    { id: 'pallet', title: 'Paletli / Paketli', subtitle: 'Tuğla, Bims, Seramik', icon: 'package-variant-closed' },
    { id: 'bulk', title: 'Dökme Yük', subtitle: 'Kum, Mıcır, Moloz', icon: 'dump-truck' },
    { id: 'machine', title: 'İş Makinesi', subtitle: 'Bobcat, Jeneratör', icon: 'excavator' },
    { id: 'box', title: 'Hırdavat / Koli', subtitle: 'Boya, El Aletleri', icon: 'cube-outline' },
];

const VEHICLES = [
    { id: 1, title: 'Açık Kasa Kamyonet', cap: '1.5 Ton', price: 1800, desc: 'Kısa malzemeler ve hırdavat için.', icon: 'truck-delivery-outline' },
    { id: 2, title: 'Vinçli Kamyon (Hi-Up)', cap: '10 Ton', price: 4500, desc: 'Paletli yükleri indirmek için.', icon: 'boom-gate' },
    { id: 3, title: 'Damperli Kamyon', cap: '15 Ton', price: 3500, desc: 'Kum, mıcır, moloz nakliyesi.', icon: 'dump-truck' },
    { id: 4, title: 'Tır / Uzun Dorse', cap: '27 Ton', price: 6000, desc: '12m+ demir ve ağır tonaj.', icon: 'truck-flatbed' },
    { id: 5, title: 'Panelvan', cap: '1 Ton', price: 1200, desc: 'Yağmurdan korunacak hassas yük.', icon: 'van-utility' },
];

export default function CreateTransportScreen({ navigation }) {
    const [step, setStep] = useState(1);

    // FORM STATE
    const [route, setRoute] = useState({ from: 'Mevcut Konum (Şantiye A)', to: '', dist: '24 km', time: '35 dk' });
    const [stops, setStops] = useState([]); // Array of intermediate stops
    const [load, setLoad] = useState({ type: null, length: '', crane: false, weight: '' });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [services, setServices] = useState({ porter: false, insurance: false, returnLoad: false });
    const [contact, setContact] = useState('me'); // 'me' or 'chief'
    const [phone, setPhone] = useState('');

    const [payment, setPayment] = useState('card');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // MOCK SUGGESTIONS
    const SUGGESTIONS = [
        { id: '1', title: 'Gebze Organize Sanayi', sub: 'Gebze, Kocaeli' },
        { id: '2', title: 'Kadıköy Rıhtım Şantiye', sub: 'Kadıköy, İstanbul' },
        { id: '3', title: 'Maslak 1453 Projesi', sub: 'Sarıyer, İstanbul' }
    ];

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardShowListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const keyboardHideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
        return () => {
            keyboardHideListener.remove();
            keyboardShowListener.remove();
        };
    }, []);

    // --- STEP 1: ROUTE ---
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>1. ROTA BELİRLEME</Text>
            <Text style={styles.stepSub}>Nereden nereye gidilecek?</Text>

            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <LinearGradient colors={['#1a1a1a', '#000']} style={StyleSheet.absoluteFill} />
                <View style={styles.mapGrid} />
                <MaterialCommunityIcons name="map-marker-radius" size={40} color={COLORS.neon} />
                <Text style={{ color: '#666', marginTop: 10, fontSize: 12, fontStyle: 'italic' }}>Canlı Harita (Demo Modu)</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                    <Ionicons name="location" size={20} color={COLORS.neon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>ÇIKIŞ NOKTASI</Text>
                        <TextInput
                            style={styles.input}
                            value={route.from}
                            onChangeText={(t) => setRoute({ ...route, from: t })}
                            placeholderTextColor="#555"
                            inputAccessoryViewID="toolbar_create_transport"
                        />
                    </View>
                </View>

                {/* Render Intermediate Stops */}
                {stops.map((stop, index) => (
                    <View key={stop.id}>
                        <View style={styles.divider} />
                        <View style={styles.inputRow}>
                            <MaterialCommunityIcons name="flag-triangle" size={20} color="#FFD700" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>{index + 1}. DURAK</Text>
                                <TextInput
                                    style={styles.input}
                                    value={stop.address}
                                    onChangeText={(t) => {
                                        const newStops = [...stops];
                                        newStops[index].address = t;
                                        setStops(newStops);
                                    }}
                                    placeholder="Durak Adresi..."
                                    placeholderTextColor="#555"
                                    inputAccessoryViewID="toolbar_create_transport"
                                />
                            </View>
                            <TouchableOpacity onPress={() => {
                                const newStops = stops.filter(s => s.id !== stop.id);
                                setStops(newStops);
                            }}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.divider} />
                <View style={styles.inputRow}>
                    <Ionicons name="navigate-circle" size={20} color={COLORS.accent} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>VARIŞ NOKTASI</Text>
                        <TextInput
                            style={styles.input}
                            value={route.to}
                            onChangeText={(t) => {
                                setRoute({ ...route, to: t });
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Adres veya Konum Ara..."
                            placeholderTextColor="#555"
                            inputAccessoryViewID="toolbar_create_transport"
                        />
                    </View>
                </View>
            </View>

            {/* Mock Suggestions Dropdown */}
            {showSuggestions && route.to.length < 10 && (
                <View style={styles.suggestionsBox}>
                    {SUGGESTIONS.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={styles.suggestionItem}
                            onPress={() => {
                                setRoute({ ...route, to: s.title, dist: '45 km', time: '50 dk' });
                                setShowSuggestions(false);
                            }}
                        >
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <View>
                                <Text style={styles.sugTitle}>{s.title}</Text>
                                <Text style={styles.sugSub}>{s.sub}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={styles.addStopBtn}
                onPress={() => setStops([...stops, { id: Date.now(), address: '' }])}
            >
                <Ionicons name="add-circle-outline" size={20} color="#888" />
                <Text style={{ color: '#888' }}>+ Durak Ekle</Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
                <Text style={styles.infoText}>Tahmini Mesafe: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{route.dist}</Text></Text>
                <Text style={styles.infoText}>Süre: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{route.time}</Text></Text>
            </View>
        </View>
    );

    // --- STEP 2: LOAD ---
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. YÜK TİPİ VE DETAYLAR</Text>
            <Text style={styles.stepSub}>Ne taşıyoruz?</Text>

            <View style={styles.gridContainer}>
                {LOAD_TYPES.map(item => {
                    const isSelected = load.type === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.gridItem, isSelected && styles.gridItemActive]}
                            onPress={() => setLoad({ ...load, type: item.id })}
                        >
                            <MaterialCommunityIcons name={item.icon} size={28} color={isSelected ? '#000' : COLORS.accent} />
                            <Text style={[styles.gridTitle, isSelected && { color: '#000' }]}>{item.title}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Conditional Inputs */}
            {load.type === 'long' && (
                <View style={styles.questionBox}>
                    <Text style={styles.qText}>Malzeme boyu kaç metre?</Text>
                    <TextInput
                        style={styles.subInput}
                        placeholder="Örn: 6m - 12m"
                        placeholderTextColor="#555"
                        value={load.length}
                        onChangeText={t => setLoad({ ...load, length: t })}
                        inputAccessoryViewID="toolbar_create_transport"
                    />
                </View>
            )}

            {load.type === 'pallet' && (
                <View style={styles.questionBox}>
                    <Text style={styles.qText}>İndirme için Vinç (Hi-Up) gerekli mi?</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <TouchableOpacity
                            style={[styles.choiceBtn, load.crane && styles.choiceBtnActive]}
                            onPress={() => setLoad({ ...load, crane: true })}
                        >
                            <Text style={[styles.choiceText, load.crane && { color: '#000' }]}>EVET (Gerekli)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.choiceBtn, !load.crane && styles.choiceBtnActive]}
                            onPress={() => setLoad({ ...load, crane: false })}
                        >
                            <Text style={[styles.choiceText, !load.crane && { color: '#000' }]}>HAYIR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>TAHMİNİ AĞIRLIK (KG/TON)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: 500 kg"
                    placeholderTextColor="#555"
                    value={load.weight}
                    onChangeText={t => setLoad({ ...load, weight: t })}
                    inputAccessoryViewID="toolbar_create_transport"
                />

                {/* Photo Upload Mock */}
                <TouchableOpacity style={styles.photoBtn} onPress={() => Alert.alert("Kamera", "Fotoğraf çekme modülü açılıyor...")}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={24} color={COLORS.accent} />
                    <Text style={styles.photoText}>Yük Fotoğrafı Ekle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // --- STEP 3: VEHICLE ---
    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>3. ARAÇ SEÇİMİ</Text>
            <Text style={styles.stepSub}>Yüke uygun aracı seçin.</Text>

            <ScrollView style={{ flex: 1 }}>
                {VEHICLES.map(v => {
                    const isSelected = selectedVehicle?.id === v.id;
                    return (
                        <TouchableOpacity
                            key={v.id}
                            style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
                            onPress={() => setSelectedVehicle(v)}
                        >
                            <View style={styles.vIconBox}>
                                <MaterialCommunityIcons name={v.icon} size={32} color={isSelected ? COLORS.neon : COLORS.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.vTitle}>{v.title}</Text>
                                <Text style={styles.vDesc}>{v.desc}</Text>
                                <Text style={styles.vCap}>Kapasite: {v.cap}</Text>
                            </View>
                            <Text style={styles.vPrice}>{v.price}₺</Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    );

    // --- STEP 4: SERVICES ---
    const renderStep4 = () => {
        const Toggle = ({ label, value, onToggle }) => (
            <TouchableOpacity style={styles.toggleRow} onPress={onToggle}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <View style={[styles.switch, value && { backgroundColor: COLORS.success }]}>
                    <View style={[styles.switchKnob, value && { transform: [{ translateX: 20 }] }]} />
                </View>
            </TouchableOpacity>
        );

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>4. EK HİZMETLER & İLETİŞİM</Text>
                <Text style={styles.stepSub}>Operasyon detayları.</Text>

                <View style={styles.sectionBox}>
                    <Toggle
                        label="Taşıma Personeli / Hamal İstiyorum"
                        value={services.porter}
                        onToggle={() => setServices({ ...services, porter: !services.porter })}
                    />
                    <View style={styles.div} />
                    <Toggle
                        label="Nakliye Sigortası İstiyorum (+%5)"
                        value={services.insurance}
                        onToggle={() => setServices({ ...services, insurance: !services.insurance })}
                    />
                    <View style={styles.div} />
                    <Toggle
                        label="Geri Dönüşlü Yük (Boş Dönmeyecek)"
                        value={services.returnLoad}
                        onToggle={() => setServices({ ...services, returnLoad: !services.returnLoad })}
                    />
                </View>

                <Text style={[styles.label, { marginTop: 20 }]}>MALZEMEYİ KİM TESLİM ALACAK?</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                        style={[styles.contactBtn, contact === 'me' && styles.contactBtnActive]}
                        onPress={() => setContact('me')}
                    >
                        <MaterialCommunityIcons name="account" size={20} color={contact === 'me' ? '#000' : '#ccc'} />
                        <Text style={[styles.contactText, contact === 'me' && { color: '#000' }]}>Ben Alacağım</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactBtn, contact === 'chief' && styles.contactBtnActive]}
                        onPress={() => setContact('chief')}
                    >
                        <MaterialCommunityIcons name="hard-hat" size={20} color={contact === 'chief' ? '#000' : '#ccc'} />
                        <Text style={[styles.contactText, contact === 'chief' && { color: '#000' }]}>Şantiye Şefi</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 20 }]}>İLETİŞİM NUMARASI</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0532 999 88 77"
                    placeholderTextColor="#555"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    inputAccessoryViewID="toolbar_create_transport"
                />
            </View>
        );
    }

    // --- STEP 5: SUMMARY ---
    const renderStep5 = () => {
        if (!selectedVehicle) return <Text style={{ color: '#fff' }}>Lütfen araç seçiniz.</Text>;

        // API Endpoint: /calculate-price-step-by-step 
        const basePrice = selectedVehicle.price;
        const tax = basePrice * 0.20;
        const total = basePrice + tax;

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>5. ÖZET VE ONAY</Text>
                <Text style={styles.stepSub}>Siparişi kontrol et ve onayla.</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.sumRow}>
                        <Ionicons name="location-outline" size={18} color="#888" />
                        <Text style={styles.sumText} numberOfLines={1}>{route.from} {'>'} {route.to || 'Seçilmedi'}</Text>
                    </View>
                    <View style={styles.sumRow}>
                        <MaterialCommunityIcons name="truck-outline" size={18} color="#888" />
                        <Text style={styles.sumText}>{selectedVehicle.title}</Text>
                    </View>
                    <View style={styles.sumRow}>
                        <MaterialCommunityIcons name="cube-outline" size={18} color="#888" />
                        <Text style={styles.sumText}>
                            {load.type ? LOAD_TYPES.find(x => x.id === load.type).title : 'Seçilmedi'}
                            {load.weight ? ` (${load.weight})` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.priceBox}>
                    <View style={styles.priceRow}><Text style={styles.pLabel}>Araç Bedeli</Text><Text style={styles.pValue}>{basePrice} ₺</Text></View>
                    <View style={styles.priceRow}><Text style={styles.pLabel}>KDV (%20)</Text><Text style={styles.pValue}>{tax} ₺</Text></View>
                    <View style={styles.div} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.pLabel, { color: COLORS.neon }]}>TOPLAM</Text>
                        <Text style={[styles.pValue, { fontSize: 24, color: COLORS.neon }]}>{total} ₺</Text>
                    </View>
                </View>

                <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>ÖDEME YÖNTEMİ</Text>
                <View style={styles.paymentMethods}>
                    {['Kredi Kartı', 'Cari Hesap', 'Nakit'].map((m) => {
                        const id = m === 'Kredi Kartı' ? 'card' : m === 'Cari Hesap' ? 'account' : 'cash';
                        const isActive = payment === id;
                        return (
                            <TouchableOpacity
                                key={id}
                                style={[styles.payMethod, isActive && styles.payMethodActive]}
                                onPress={() => setPayment(id)}
                            >
                                <Text style={[styles.payMethodText, isActive && { color: '#000' }]}>{m}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => {
                        if (phone.length < 10) { Alert.alert("Eksik Bilgi", "Lütfen iletişim numarasını giriniz."); return; }

                        // WhatsApp Logic
                        const targetPhone = '905380860202';
                        const msg = `🚛 YENİ NAKLİYE (#TR-PRO)\n\n📍 ${route.from} -> ${route.to}\n📦 ${load.type ? LOAD_TYPES.find(x => x.id === load.type).title : ''}, ${load.weight}\n🚛 ${selectedVehicle.title}\n💰 TOPLAM: ${total} TL\n\n📞 Müşteri: ${phone}\n💳 Ödeme: ${payment}`;

                        Linking.openURL(`whatsapp://send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`);
                    }}
                >
                    <LinearGradient colors={[COLORS.neon, '#AACC00']} style={styles.payGradient}>
                        <MaterialCommunityIcons name="whatsapp" size={24} color="#000" />
                        <Text style={styles.payText}>WHATSAPP İLE ÇAĞIR</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    // --- NAVIGATION LOGIC ---
    const nextStep = () => {
        if (step < 5) setStep(step + 1);
    };
    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else navigation.goBack();
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header - Fixed Outside KAV */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.progressBox}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <View key={s} style={[styles.dot, step >= s && styles.dotActive]} />
                        ))}
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content - Removing KAV for Stability */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.content, { paddingBottom: 150 }]}
                    // Stable Keyboard Handling for iOS 17+
                    automaticallyAdjustKeyboardInsets={true}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </ScrollView>

                {/* Footer (Dynamic) */}
                {/* Footer (Dynamic) */}
                {step < 5 && !isKeyboardVisible && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                            <Text style={styles.nextText}>DEVAM ET</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* GOLD DONE BUTTON ACCESSORY */}
                {Platform.OS === 'ios' && (
                    <InputAccessoryView nativeID="toolbar_create_transport">
                        <View style={styles.accessoryContainer}>
                            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
                                <Text style={styles.accessoryText}>Bitti</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                )}

            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    progressBox: { flexDirection: 'row', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
    dotActive: { backgroundColor: COLORS.neon, width: 20 },

    content: { flexGrow: 1, padding: 20 },
    stepContainer: { flex: 1 },
    stepTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: 0.5 },
    stepSub: { fontSize: 14, color: '#888', marginBottom: 20 },

    // STEP 1
    mapPlaceholder: { height: 150, borderRadius: 16, overflow: 'hidden', marginBottom: 20, alignItems: 'center', justifyContent: 'center', borderColor: '#333', borderWidth: 1 },
    mapGrid: { position: 'absolute', width: '200%', height: '200%', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: '15deg' }] },
    inputGroup: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    label: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
    input: { color: '#fff', fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 4 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 8, marginLeft: 32 },
    addStopBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginVertical: 15 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 12, borderRadius: 12, marginTop: 10 },
    infoText: { color: '#888', fontSize: 12 },

    suggestionsBox: { backgroundColor: '#202020', borderRadius: 12, marginTop: 4, padding: 4, borderWidth: 1, borderColor: '#333' },
    suggestionItem: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
    sugTitle: { color: '#ddd', fontSize: 13, fontWeight: 'bold' },
    sugSub: { color: '#888', fontSize: 11 },

    // STEP 2
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridItem: { width: (width - 50) / 2, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', gap: 8 },
    gridItemActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    gridTitle: { color: '#888', fontWeight: 'bold', fontSize: 12 },
    questionBox: { marginTop: 20, padding: 16, backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
    qText: { color: COLORS.accent, fontWeight: 'bold' },
    subInput: { borderBottomWidth: 1, borderBottomColor: COLORS.accent, color: '#fff', paddingVertical: 5, marginTop: 5 },
    choiceBtn: { flex: 1, padding: 10, backgroundColor: '#222', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    choiceBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    choiceText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
    photoBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 15, borderWidth: 1, borderColor: COLORS.accent, borderRadius: 12, borderStyle: 'dashed', backgroundColor: 'rgba(255,193,7,0.05)' },
    photoText: { color: COLORS.accent, fontSize: 13 },

    // STEP 3
    vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
    vehicleCardActive: { borderColor: COLORS.neon, backgroundColor: 'rgba(204, 255, 0, 0.05)' },
    vIconBox: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222', borderRadius: 25, marginRight: 12 },
    vTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    vDesc: { color: '#888', fontSize: 11, fontStyle: 'italic' },
    vCap: { color: COLORS.accent, fontSize: 11, fontWeight: 'bold', marginTop: 4 },
    vPrice: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // STEP 4
    sectionBox: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    toggleLabel: { color: '#ddd', fontSize: 14 },
    switch: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#333', padding: 2 },
    switchKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    div: { height: 1, backgroundColor: '#252525' },
    contactBtn: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
    contactBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    contactText: { color: '#ccc', fontWeight: 'bold' },

    // STEP 5
    summaryCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333', gap: 12 },
    sumRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    sumText: { color: '#eee', fontSize: 14 },
    priceBox: { marginTop: 20, backgroundColor: '#000', borderRadius: 16, padding: 20, gap: 8 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    pLabel: { color: '#888' },
    pValue: { color: '#fff', fontWeight: 'bold' },
    paymentMethods: { flexDirection: 'row', gap: 10 },
    payMethod: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#1A1A1A' },
    payMethodActive: { backgroundColor: COLORS.neon, borderColor: COLORS.neon },
    payMethodText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    payBtn: { marginTop: 30, height: 56, borderRadius: 28, overflow: 'hidden' },
    payGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    payText: { fontSize: 16, fontWeight: '900', color: '#000' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#252525' },
    nextBtn: { backgroundColor: COLORS.neon, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
    nextText: { fontWeight: 'bold', fontSize: 16, color: '#000' },

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
