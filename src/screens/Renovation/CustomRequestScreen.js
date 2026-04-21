import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { uploadImageToSupabase } from '../../services/PhotoUploadService';
import BudgetSelector from '../../components/BudgetSelector';
import TurkeyLocationPicker from '../../components/TurkeyLocationPicker';

const { width } = Dimensions.get('window');

// --- THEME CONSTANTS ---
const THEME = {
    background: '#050505',
    cardBg: '#1A1A1A',
    goldPrimary: '#D4AF37',
    goldHighlight: '#F7E5A8',
    textSecondary: '#888',
    inputBg: '#1A1A1A',
    placeholder: '#666',
};

const BTN_GRADIENT = ['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30'];

export default function CustomRequestScreen({ navigation, route }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [inspirationImages, setInspirationImages] = useState([]);
    const [budget, setBudget] = useState('Standart');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
    const { area, propertyType, selectedStyle } = route.params || {};

    const handlePickImage = async (type) => {
        Alert.alert(
            "Fotoğraf Ekle",
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
                            mediaTypes: ImagePicker.MediaType.Images,
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            if (type === 'current') setCurrentImages(prev => [...prev, result.assets[0].uri]);
                            else setInspirationImages(prev => [...prev, result.assets[0].uri]);
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
                            mediaTypes: ImagePicker.MediaType.Images,
                            quality: 0.8,
                            allowsMultipleSelection: true
                        });
                        if (!result.canceled) {
                            const newUris = result.assets.map(a => a.uri);
                            if (type === 'current') setCurrentImages(prev => [...prev, ...newUris]);
                            else setInspirationImages(prev => [...prev, ...newUris]);
                        }
                    }
                },
                { text: "İptal", style: "cancel" }
            ]
        );
    };

    const handleRemoveImage = (type, index) => {
        if (type === 'current') {
            setCurrentImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setInspirationImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const renderUploadSlot = (label, isGold = true, type) => (
        <TouchableOpacity
            style={[
                styles.uploadSlot,
                { borderColor: isGold ? THEME.goldPrimary : '#444' }
            ]}
            activeOpacity={0.7}
            onPress={() => handlePickImage(type)}
        >
            <MaterialCommunityIcons
                name="camera-plus-outline"
                size={24}
                color={isGold ? THEME.goldPrimary : '#888'}
            />
            <Text allowFontScaling={false} style={[
                styles.uploadText,
                { color: isGold ? THEME.goldPrimary : '#888' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderImageItem = (uri, index, type) => (
        <View key={`${type}-${index}`} style={styles.thumbnailWrap}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity style={styles.removeCircle} onPress={() => handleRemoveImage(type, index)}>
                <Ionicons name="close" size={14} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const handleSubmit = async () => {
        if (!city || !district) {
            Alert.alert("Eksik Bilgi", "Lütfen projenin yapılacağı ili ve ilçeyi seçin.");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Hata", "Lütfen önce giriş yapın.");
                setLoading(false);
                return;
            }

            // Upload all images
            const currentUrls = await Promise.all(currentImages.map(uri => uploadImageToSupabase(uri)));
            const inspirationUrls = await Promise.all(inspirationImages.map(uri => uploadImageToSupabase(uri)));
            
            // Build comprehensive description with professional markers
            let fullDescription = `[PROJE TİPİ] Anahtar Teslim Tadilat\n`;
            fullDescription += `[MEKAN] ${propertyType || 'Belirtilmedi'} (${area || 0} m²)\n`;
            fullDescription += `[TASARIM] ${selectedStyle || 'Belirtilmedi'}\n`;
            fullDescription += `[BÜTÇE] ${budget}\n`;
            fullDescription += `[LOKASYON] ${city} / ${district}\n\n`;
            
            if (note) fullDescription += `[NOTLARI]\n${note}\n`;

            const allDocumentUrls = [...currentUrls, ...inspirationUrls];

            const { error } = await supabase
                .from('construction_requests')
                .insert({
                    user_id: user.id,
                    city: city,
                    district: district,
                    neighborhood: 'Tümü',
                    ada: '', parsel: '', pafta: '',
                    full_address: `${city}, ${district} - Tadilat`,
                    offer_type: 'anahtar_teslim_tadilat',
                    description: fullDescription,
                    status: 'pending',
                    document_urls: allDocumentUrls,
                    deed_image_url: allDocumentUrls.length > 0 ? allDocumentUrls[0] : null,
                    current_situation_urls: currentUrls,
                    inspiration_urls: inspirationUrls
                });

            if (error) throw error;

            navigation.navigate('RenovationSuccess');
        } catch (error) {
            console.error('Submit Error:', error);
            Alert.alert("Hata", "Talebiniz alınırken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text allowFontScaling={false} style={styles.headerTitle}>Detaylar &</Text>
                        <Text allowFontScaling={false} style={[styles.headerTitle, { color: THEME.goldPrimary }]}> İstekler</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* SECTION 0: LOCATION PICKER */}
                        <View style={styles.section}>
                            <Text allowFontScaling={false} style={styles.sectionLabel}>Proje Konumu</Text>
                            <TouchableOpacity 
                                style={styles.locationBtn}
                                onPress={() => setIsLocationPickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name="location" size={22} color={THEME.goldPrimary} />
                                    <Text allowFontScaling={false} style={{ color: city ? '#FFF' : THEME.placeholder, fontSize: 16, fontWeight: 'bold' }}>
                                        {city ? `${city} / ${district}` : 'İl ve İlçe Seçin'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color={THEME.placeholder} />
                            </TouchableOpacity>
                        </View>

                        <TurkeyLocationPicker 
                            visible={isLocationPickerVisible}
                            onClose={() => setIsLocationPickerVisible(false)}
                            onSelect={(c, d) => {
                                setCity(c);
                                setDistrict(d);
                            }}
                            currentCity={city}
                            currentDistrict={district}
                        />

                        {/* SECTION 1: BUDGET SELECTION */}
                        <View style={styles.section}>
                            <Text allowFontScaling={false} style={styles.sectionLabel}>Tahmini Bütçe Segmenti</Text>
                            <Text allowFontScaling={false} style={styles.sectionSubLabel}>Hizmet kalitesi ve malzeme seçimlerini belirler.</Text>
                            <BudgetSelector 
                                selectedSegment={budget} 
                                onSelect={setBudget} 
                            />
                        </View>

                        {/* SECTION 2: CURRENT STATE UPLOAD */}
                        <View style={styles.section}>
                            <Text allowFontScaling={false} style={styles.sectionLabel}>Mevcut Alan Fotoğrafları</Text>
                            <Text allowFontScaling={false} style={styles.sectionSubLabel}>Proje yapılacak alanın şu anki hali (Opsiyonel).</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {currentImages.map((uri, i) => renderImageItem(uri, i, 'current'))}
                                {renderUploadSlot('Alan Ekle', false, 'current')}
                                <View style={{ width: 20 }} />
                            </ScrollView>
                        </View>

                        {/* SECTION 3: SPECIAL NOTES */}
                        <View style={styles.section}>
                            <Text allowFontScaling={false} style={styles.sectionLabel}>Özel İstekleriniz</Text>
                            <View style={styles.inputContainer}>
                                <TextInput allowFontScaling={false}
                                    style={styles.textInput}
                                    placeholder="Örn: Salonda şömine istiyorum, zemin mermer olsun..."
                                    placeholderTextColor={THEME.placeholder}
                                    multiline
                                    textAlignVertical="top"
                                    value={note}
                                    onChangeText={setNote}
                                />
                                {/* Mic Icon Overlay */}
                                <TouchableOpacity style={styles.micButton}>
                                    <Ionicons name="mic" size={20} color={THEME.goldPrimary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* SECTION 4: INSPIRATION UPLOAD */}
                        <View style={[styles.section, { marginBottom: 100 }]}>
                            <Text allowFontScaling={false} style={styles.sectionLabel}>İlham Aldığınız Görseller</Text>
                            <Text allowFontScaling={false} style={styles.sectionSubLabel}>Beğendiğiniz tasarımları ekleyin.</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {inspirationImages.map((uri, i) => renderImageItem(uri, i, 'inspiration'))}
                                {renderUploadSlot('Örnek Ekle', true, 'inspiration')}
                                <View style={{ width: 20 }} />
                            </ScrollView>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>


                {/* FOOTER BUTTON */}
                <View style={styles.footerContainer}>
                    <LinearGradient colors={['transparent', '#000']} style={styles.bottomFade} pointerEvents="none" />

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={BTN_GRADIENT}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Text allowFontScaling={false} style={styles.buttonText}>KEŞİF & TEKLİF İSTE</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10
    },
    backButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20
    },
    headerTitleContainer: { flexDirection: 'row' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },

    scrollContent: { padding: 20 },

    section: { marginBottom: 30 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 8, letterSpacing: 0.5 },
    sectionSubLabel: { fontSize: 12, color: '#666', marginBottom: 15 },

    locationBtn: {
        backgroundColor: '#1A1A1C',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    inputContainer: { position: 'relative' },
    textInput: {
        backgroundColor: THEME.inputBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)', // Subtle gold border
        color: '#FFF',
        fontSize: 14,
        padding: 15,
        paddingRight: 45, // Space for mic
        height: 150,
    },
    micButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },

    horizontalScroll: { flexDirection: 'row', marginHorizontal: -10, paddingHorizontal: 10 },
    uploadSlot: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    uploadText: { fontSize: 11, marginTop: 5, fontWeight: '500' },

    footerContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 30, paddingBottom: 40,
        alignItems: 'center'
    },
    bottomFade: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    },
    continueButton: {
        width: '100%', borderRadius: 30, overflow: 'hidden',
        shadowColor: THEME.goldPrimary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
    },
    gradientButton: {
        height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    thumbnailWrap: { width: 100, height: 100, borderRadius: 12, marginRight: 15, position: 'relative' },
    thumbnail: { width: '100%', height: '100%', borderRadius: 12 },
    removeCircle: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' }
});
