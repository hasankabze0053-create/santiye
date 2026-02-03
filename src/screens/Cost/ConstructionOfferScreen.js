import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Added ImagePicker
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image // Added Image
    ,











    InputAccessoryView,
    Keyboard,
    LayoutAnimation,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback, // Added for smooth transition
    UIManager,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { supabase } from '../../lib/supabase'; // Search for this file to confirm path
// React Native'de blob fetch ile alınır.


const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- DATA ---
const DISTRICTS = {
    'İstanbul': [
        'Tümü', 'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
        'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy',
        'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
        'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli',
        'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'
    ]
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

// iOS Specific 'Done' Button Component
const KeyboardDoneBar = () => {
    if (Platform.OS !== 'ios') return null;
    return (
        <InputAccessoryView nativeID="done_toolbar">
            <View style={styles.accessoryBar}>
                <TouchableOpacity onPress={Keyboard.dismiss} style={styles.accessoryButton}>
                    <Text style={styles.accessoryText}>BİTTİ</Text>
                </TouchableOpacity>
            </View>
        </InputAccessoryView>
    );
};

export default function ConstructionOfferScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // Default location İstanbul/Tümü if not passed
    const [location, setLocation] = useState(route.params?.location || { city: 'İstanbul', district: 'Tümü' });

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [neighborhood, setNeighborhood] = useState('');
    const [ada, setAda] = useState('');
    const [parsel, setParsel] = useState('');
    const [pafta, setPafta] = useState('');
    const [address, setAddress] = useState('');
    // const [hasDocument, setHasDocument] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state

    // Yarısı Bizden Campaign State
    const [hasYarisiBizden, setHasYarisiBizden] = useState(false);
    const [apartmentCount, setApartmentCount] = useState(0);
    const [commercialCount, setCommercialCount] = useState(0);

    // Offer Type State
    const [offerType, setOfferType] = useState(null); // 'anahtar_teslim' | 'kat_karsiligi'
    // const [katKarsiligiSubType, setKatKarsiligiSubType] = useState(null); // Removed: informational only

    // Additional Details State
    const [details, setDetails] = useState('');

    const handleOfferTypeSelect = (type) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOfferType(type);
    };

    const toggleCampaign = (value) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setHasYarisiBizden(value);
    };

    const updateCount = (type, action) => {
        if (type === 'apartment') {
            const newVal = action === 'inc' ? apartmentCount + 1 : Math.max(0, apartmentCount - 1);
            setApartmentCount(newVal);
        } else {
            const newVal = action === 'inc' ? commercialCount + 1 : Math.max(0, commercialCount - 1);
            setCommercialCount(newVal);
        }
    };

    // Refs for Smart Focus
    const adaRef = useRef(null);
    const parselRef = useRef(null);
    const paftaRef = useRef(null);
    const addressRef = useRef(null);

    const uploadImage = async (uri) => {
        try {
            const ext = uri.substring(uri.lastIndexOf('.') + 1);
            const fileName = `deed_${Date.now()}.${ext}`;
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: fileName,
                type: `image/${ext}`
            });

            const { data, error } = await supabase.storage
                .from('construction-documents')
                .upload(fileName, formData, {
                    contentType: `image/${ext}`,
                });

            if (error) {
                console.error('Upload Error:', error);
                throw error;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('construction-documents')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!ada || !parsel || !neighborhood) {
            Alert.alert('Eksik Bilgi', 'Lütfen Ada, Parsel ve Mahalle bilgilerini giriniz. Bu bilgiler doğru teklif için şarttır.');
            return;
        }

        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
                return;
            }

            let uploadedImageUrl = null;
            if (imageUri) {
                uploadedImageUrl = await uploadImage(imageUri);
            }

            const { error } = await supabase
                .from('construction_requests')
                .insert({
                    user_id: user.id,
                    city: 'İstanbul',
                    district: location.district,
                    neighborhood: neighborhood,
                    ada: ada,
                    parsel: parsel,
                    pafta: pafta,
                    full_address: address,
                    description: details, // Mapped to details/description
                    offer_type: offerType,
                    // Sub offer type is now informational only, so we might just save the generic type or the specific selection if it were interactive.
                    // Since it's informational, we just rely on offerType.

                    is_campaign_active: hasYarisiBizden,
                    campaign_unit_count: hasYarisiBizden ? apartmentCount : 0,
                    campaign_commercial_count: hasYarisiBizden ? commercialCount : 0,

                    deed_image_url: uploadedImageUrl,
                    status: 'pending'
                });

            if (error) throw error;

            navigation.navigate('ConstructionSuccess');
        } catch (error) {
            console.error('Submission Error:', error);
            Alert.alert('Hata', 'Talebiniz oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.\n' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async () => {
        Alert.alert(
            "Belge Yükle",
            "Lütfen bir yöntem seçiniz",
            [
                {
                    text: "Kamera",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekmektedir.');
                            return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 0.8,
                        });

                        if (!result.canceled) {
                            setImageUri(result.assets[0].uri);
                        }
                    }
                },
                {
                    text: "Galeri",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekmektedir.');
                            return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 0.8,
                        });

                        if (!result.canceled) {
                            setImageUri(result.assets[0].uri);
                        }
                    }
                },
                {
                    text: "İptal",
                    style: "cancel"
                }
            ]
        );
    };

    const handleRemoveImage = () => {
        Alert.alert(
            "Görseli Sil",
            "Yüklenen görseli silmek istediğinize emin misiniz?",
            [
                { text: "Vazgeç", style: "cancel" },
                { text: "Sil", style: "destructive", onPress: () => setImageUri(null) }
            ]
        );
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Fixed Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>PROJE KÜNYESİ</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Scroll View with Keyboard Handling */}
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={(Platform.OS === 'ios')}
                    extraHeight={150}
                    enableResetScrollToCoords={false}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Tap Outside to Dismiss Wrapper */}
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={styles.formContent}>

                            {/* 0. YARISI BİZDEN KAMPANYASI */}
                            <View style={styles.sectionContainer}>
                                <GlassCard style={[styles.card, hasYarisiBizden && { borderColor: '#D4AF37', borderWidth: 1 }]}>
                                    <Text style={styles.campaignTitle}>"Yarısı Bizden" Kampanyasından Faydalanacak mısınız?</Text>
                                    <Text style={styles.campaignSub}>Resmi hibe ve kredi desteği hesaplamaya dahil edilir.</Text>

                                    <View style={styles.toggleRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => toggleCampaign(true)}
                                            style={[styles.toggleBtn, hasYarisiBizden && styles.toggleActive]}
                                        >
                                            <MaterialCommunityIcons name="check" size={18} color={hasYarisiBizden ? '#000' : '#666'} />
                                            <Text style={[styles.toggleText, hasYarisiBizden && styles.toggleTextActive]}>EVET</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => toggleCampaign(false)}
                                            style={[styles.toggleBtn, !hasYarisiBizden && styles.toggleActive]}
                                        >
                                            <MaterialCommunityIcons name="close" size={18} color={!hasYarisiBizden ? '#000' : '#666'} />
                                            <Text style={[styles.toggleText, !hasYarisiBizden && styles.toggleTextActive]}>HAYIR</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {hasYarisiBizden && (
                                        <View style={styles.campaignDetails}>
                                            <View style={styles.counterRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.counterLabel}>Konut Sayısı</Text>
                                                    <Text style={styles.counterDesc}>1.750.000 TL Hibe + Kredi</Text>
                                                </View>
                                                <View style={styles.counterControls}>
                                                    <TouchableOpacity onPress={() => updateCount('apartment', 'dec')} style={styles.countBtn}>
                                                        <MaterialCommunityIcons name="minus" size={20} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.countVal}>{apartmentCount}</Text>
                                                    <TouchableOpacity onPress={() => updateCount('apartment', 'inc')} style={styles.countBtn}>
                                                        <MaterialCommunityIcons name="plus" size={20} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View style={[styles.divider, { marginVertical: 12 }]} />

                                            <View style={styles.counterRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.counterLabel}>Ticari Alan Sayısı</Text>
                                                    <Text style={styles.counterDesc}>875.000 TL Hibe + Kredi</Text>
                                                </View>
                                                <View style={styles.counterControls}>
                                                    <TouchableOpacity onPress={() => updateCount('commercial', 'dec')} style={styles.countBtn}>
                                                        <MaterialCommunityIcons name="minus" size={20} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.countVal}>{commercialCount}</Text>
                                                    <TouchableOpacity onPress={() => updateCount('commercial', 'inc')} style={styles.countBtn}>
                                                        <MaterialCommunityIcons name="plus" size={20} color="#D4AF37" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </GlassCard>
                            </View>

                            {/* 0.5 TEKLİF TÜRÜ SEÇİMİ */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="briefcase-edit-outline" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>TEKLİF TÜRÜ SEÇİMİ</Text>
                                </View>

                                {/* Option 1: Anahtar Teslim */}
                                <GlassCard
                                    style={[styles.offerCard, offerType === 'anahtar_teslim' && styles.offerCardActive]}
                                    onPress={() => handleOfferTypeSelect('anahtar_teslim')}
                                >
                                    <View style={styles.offerHeader}>
                                        <MaterialCommunityIcons
                                            name={offerType === 'anahtar_teslim' ? "radiobox-marked" : "radiobox-blank"}
                                            size={24}
                                            color={offerType === 'anahtar_teslim' ? "#D4AF37" : "#666"}
                                            style={{ marginTop: 2 }}
                                        />
                                        <Text style={[styles.offerTitle, offerType === 'anahtar_teslim' && styles.textActive]}>Komple Bina Yapım Teklifi{'\n'}(Anahtar Teslim Hizmet Bedeli)</Text>
                                    </View>
                                    <Text style={styles.offerDesc}>Maliyetin tamamı mülk sahibi tarafından karşılanır, inşaat firmasına herhangi bir taşınmaz (daire/dükkan) kalmaz.</Text>
                                </GlassCard>

                                <View style={{ height: 12 }} />

                                {/* Option 2: Kat Karşılığı */}
                                <GlassCard
                                    style={[styles.offerCard, offerType === 'kat_karsiligi' && styles.offerCardActive]}
                                    onPress={() => handleOfferTypeSelect('kat_karsiligi')}
                                >
                                    <View style={styles.offerHeader}>
                                        <MaterialCommunityIcons
                                            name={offerType === 'kat_karsiligi' ? "radiobox-marked" : "radiobox-blank"}
                                            size={24}
                                            color={offerType === 'kat_karsiligi' ? "#D4AF37" : "#666"}
                                        />
                                        <Text style={[styles.offerTitle, offerType === 'kat_karsiligi' && styles.textActive]}>Kat Karşılığı Yapım Teklifi</Text>
                                    </View>
                                    <Text style={styles.offerDesc}>İnşaat maliyeti karşılığında firmaya arsa payı/daire verilir.</Text>

                                    {/* Sub Options (Informational Only) */}
                                    {offerType === 'kat_karsiligi' && (
                                        <View style={styles.subOptionsContainer}>
                                            <Text style={styles.subOptionsHeader}>(Bilgilendirme) Bu modelin türleri şunlardır:</Text>
                                            {[
                                                { id: 'sadece_kat', label: 'Sadece Kat Karşılığı', desc: 'Herhangi bir nakit ödeme olmaksızın sadece pay paylaşımı.' },
                                                { id: 'nakit_mulk', label: 'Kat Karşılığı + Nakit (Mülk Sahibi)', desc: 'Pay yetmediği durumda firmaya ek ödeme yapılır.' },
                                                { id: 'nakit_muteahhit', label: 'Kat Karşılığı + Nakit (Müteahhit)', desc: 'Arsa değeri yüksekse, firma mülk sahibine ödeme yapar.' }
                                            ].map((opt) => (
                                                <View
                                                    key={opt.id}
                                                    style={styles.subOptionCard}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                        <MaterialCommunityIcons
                                                            name="circle-small"
                                                            size={24}
                                                            color="#D4AF37"
                                                        />
                                                        <Text style={styles.subOptionTitle}>{opt.label}</Text>
                                                    </View>
                                                    <Text style={styles.subOptionDesc}>{opt.desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </GlassCard>
                            </View>



                            {/* 0.8 EKLEMEK İSTEDİĞİNİZ DETAYLAR */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="text-box-plus-outline" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>EKLEMEK İSTEDİĞİNİZ DETAYLAR</Text>
                                </View>

                                <GlassCard style={styles.card}>
                                    <TextInput
                                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                        placeholder="Arsa boş durumda mı? İçinde kiracı var mı? Özel istekleriniz neler? Buraya yazabilirsiniz..."
                                        placeholderTextColor="#666"
                                        multiline
                                        value={details}
                                        onChangeText={setDetails}
                                        inputAccessoryViewID="done_toolbar"
                                    />
                                    <Text style={styles.hintText}>* Müteahhitler teklif verirken bu notları dikkate alacaktır.</Text>
                                </GlassCard>
                            </View>

                            {/* 1. KONUM BİLGİSİ */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>LOKASYON</Text>
                                </View>

                                <GlassCard style={styles.card}>
                                    <View style={styles.readOnlyRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>İL</Text>
                                            <Text style={styles.readOnlyValue}>İstanbul</Text>
                                        </View>
                                        <View style={styles.verticalDivider} />
                                        <TouchableOpacity
                                            style={{ flex: 1, paddingLeft: 12 }}
                                            onPress={() => setModalVisible(true)}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={styles.label}>İLÇE</Text>
                                                    <Text style={styles.readOnlyValue}>{location?.district || 'Tümü'}</Text>
                                                </View>
                                                <MaterialCommunityIcons name="chevron-down" size={20} color="#D4AF37" />
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.divider} />

                                    <Text style={styles.label}>MAHALLE</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Cumhuriyet Mah."
                                        placeholderTextColor="#666"
                                        value={neighborhood}
                                        onChangeText={setNeighborhood}
                                        returnKeyType="next"
                                        onSubmitEditing={() => adaRef.current?.focus()}
                                        blurOnSubmit={false}
                                    />
                                </GlassCard>
                            </View>

                            {/* 2. TEKNİK KİMLİK (ADA/PARSEL) */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="land-plots" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>TAPU / İMAR BİLGİLERİ</Text>
                                </View>

                                <GlassCard style={styles.card}>
                                    <View style={styles.rowTwo}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.label}>ADA NO</Text>
                                            <TextInput
                                                ref={adaRef}
                                                style={[styles.input, styles.numberInput]}
                                                placeholder="000"
                                                placeholderTextColor="#444"
                                                keyboardType="numeric"
                                                value={ada}
                                                onChangeText={(t) => setAda(t.replace(/[^0-9]/g, ''))}
                                                returnKeyType="next"
                                                onSubmitEditing={() => parselRef.current?.focus()}
                                                blurOnSubmit={false}
                                                inputAccessoryViewID="done_toolbar"
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={styles.label}>PARSEL NO</Text>
                                            <TextInput
                                                ref={parselRef}
                                                style={[styles.input, styles.numberInput]}
                                                placeholder="00"
                                                placeholderTextColor="#444"
                                                keyboardType="numeric"
                                                value={parsel}
                                                onChangeText={(t) => setParsel(t.replace(/[^0-9]/g, ''))}
                                                onSubmitEditing={() => paftaRef.current?.focus()}
                                                returnKeyType="next"
                                                blurOnSubmit={false}
                                                inputAccessoryViewID="done_toolbar"
                                            />
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 12 }}>
                                        <Text style={styles.label}>PAFTA (Opsiyonel)</Text>
                                        <TextInput
                                            ref={paftaRef}
                                            style={[styles.input, styles.numberInput, { fontSize: 16 }]} // Slightly smaller than Ada/Parsel
                                            placeholder="Varsa pafta no"
                                            placeholderTextColor="#666"
                                            keyboardType="numeric"
                                            value={pafta}
                                            onChangeText={(t) => setPafta(t.replace(/[^0-9]/g, ''))}
                                            returnKeyType="next"
                                            onSubmitEditing={() => addressRef.current?.focus()}
                                            blurOnSubmit={false}
                                            inputAccessoryViewID="done_toolbar"
                                        />
                                    </View>

                                    <View style={styles.infoBox}>
                                        <Ionicons name="information-circle" size={18} color="#FFD700" style={{ marginTop: 2 }} />
                                        <Text style={styles.infoText}>
                                            Bu bilgiler, müteahhitlerin belediye sisteminden imar durumunu (KAKS/TAKS) sorgulayıp size <Text style={{ fontWeight: 'bold', color: '#fff' }}>net teklif</Text> verebilmesi için zorunludur.
                                        </Text>
                                    </View>
                                </GlassCard>
                            </View>

                            {/* 3. ADRES DOĞRULAMA */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="sign-direction" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>AÇIK ADRES</Text>
                                </View>
                                <GlassCard style={styles.card}>
                                    <TextInput
                                        ref={addressRef}
                                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                        placeholder="Cadde, Sokak, Kapı No detaylarını yazınız..."
                                        placeholderTextColor="#666"
                                        multiline
                                        value={address}
                                        onChangeText={setAddress}
                                        inputAccessoryViewID="done_toolbar"
                                    />
                                </GlassCard>
                            </View>

                            {/* 4. BELGE YÜKLEME */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="file-document-outline" size={20} color="#D4AF37" />
                                    <Text style={styles.sectionTitle}>BELGE VE GÖRSEL</Text>
                                </View>

                                <GlassCard
                                    style={[styles.uploadCard, imageUri && styles.uploadCardActive]}
                                    onPress={imageUri ? handleRemoveImage : handleDocumentUpload}
                                >
                                    {imageUri ? (
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 12 }}
                                                resizeMode="cover"
                                            />
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                                                <Text style={[styles.uploadText, { color: '#4CAF50', fontSize: 14 }]}>Görsel Yüklendi</Text>
                                            </View>
                                            <Text style={[styles.uploadSubText, { color: '#FF4444', marginTop: 8 }]}>Silmek için dokunun</Text>
                                        </View>
                                    ) : (
                                        <View style={{ alignItems: 'center' }}>
                                            <View style={styles.iconCircle}>
                                                <MaterialCommunityIcons name="camera-plus" size={32} color="#D4AF37" />
                                            </View>
                                            <Text style={styles.uploadText}>Tapu / İmar Durumu Fotoğrafı Yükle</Text>
                                            <Text style={styles.uploadSubText}>(Opsiyonel ama Önerilir)</Text>
                                            <Text style={styles.uploadHint}>Talebinizin ciddiyetini artırır.</Text>
                                        </View>
                                    )}
                                </GlassCard>
                            </View>

                            {/* SUBMIT BUTTON */}
                            <TouchableOpacity
                                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                                activeOpacity={0.9}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#996515', '#FFD700', '#FDB931', '#996515']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={styles.submitGradient}
                                >
                                    <Text style={styles.submitText}>{loading ? 'GÖNDERİLİYOR...' : 'PROJEYİ MÜTEAHHİTLERE SUN'}</Text>
                                    <MaterialCommunityIcons name="briefcase-check" size={24} color="#000" />
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={{ height: 60 }} />
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAwareScrollView>

                {/* Single iOS Accessory Button Instance */}
                {Platform.OS === 'ios' && <KeyboardDoneBar />}

                {/* MODAL */}
                <SelectionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title="İLÇE SEÇİN"
                    items={DISTRICTS['İstanbul']}
                    onSelect={(item) => setLocation({ ...location, district: item })}
                />
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
        paddingBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
    },
    sectionContainer: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    sectionTitle: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
    card: { padding: 16, borderRadius: 16 },
    rowTwo: { flexDirection: 'row' },
    label: { color: '#E0E0E0', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
    readOnlyRow: { flexDirection: 'row', alignItems: 'center' },
    readOnlyValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
    verticalDivider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 12 },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    numberInput: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: '#FFD700',
        textAlign: 'center',
    },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
    infoBox: {
        marginTop: 16,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    infoText: { color: '#ccc', fontSize: 12, lineHeight: 18, flex: 1 },
    uploadCard: {
        padding: 30,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadCardActive: {
        borderColor: '#4CAF50',
        borderStyle: 'solid',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    uploadText: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold' },
    uploadSubText: { color: '#666', fontSize: 12, marginTop: 4 },
    uploadHint: { color: '#888', fontSize: 11, fontStyle: 'italic', marginTop: 12 },
    submitButton: { marginTop: 10, marginBottom: 40, shadowColor: "#FFD700", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    submitGradient: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', paddingVertical: 18,
        paddingHorizontal: 24, borderRadius: 30, gap: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    submitText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    // iOS Helper Styles
    accessoryBar: {
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 8,
    },
    accessoryButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    accessoryText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Campaign Styles
    campaignTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    campaignSub: { color: '#888', fontSize: 12, marginBottom: 16 },
    toggleRow: { flexDirection: 'row', gap: 12 },
    toggleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    toggleActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    toggleText: { color: '#666', fontWeight: 'bold' },
    toggleTextActive: { color: '#000' },
    campaignDetails: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    counterLabel: { color: '#fff', fontSize: 17, fontWeight: '700' },
    counterDesc: { color: '#D4AF37', fontSize: 13, marginTop: 4, fontWeight: '500' },
    counterControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    countBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
    countVal: { color: '#fff', width: 40, textAlign: 'center', fontSize: 16, fontWeight: 'bold' },

    // Offer Selection Styles
    offerCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' },
    offerCardActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.05)' },
    offerHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
    offerTitle: { color: '#e0e0e0', fontSize: 16, fontWeight: '700', flex: 1, lineHeight: 22 },
    offerDesc: { color: '#bbb', fontSize: 13.5, lineHeight: 20, paddingLeft: 34 },
    textActive: { color: '#FFD700' },

    subOptionsContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    subOptionsHeader: { color: '#888', fontSize: 12, marginBottom: 12, fontStyle: 'italic', marginLeft: 4 },
    subOptionCard: { padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    subOptionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 0 },
    subOptionDesc: { color: '#ccc', fontSize: 13.5, marginLeft: 24, marginTop: 4, lineHeight: 20 },

    hintText: { color: '#666', fontSize: 11, marginTop: 8, fontStyle: 'italic' },
});

const localStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { height: Dimensions.get('window').height * 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    modalGradient: { flex: 1, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(212, 175, 55, 0.2)', paddingBottom: 16 },
    modalTitle: { fontSize: 16, color: '#D4AF37', fontWeight: 'bold', letterSpacing: 2 },
    closeButton: { padding: 4 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalItemText: { color: '#eee', fontSize: 16, fontWeight: '300', letterSpacing: 0.5 },
});
