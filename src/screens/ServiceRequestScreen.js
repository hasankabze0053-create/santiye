import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { CITIES_DISTRICTS, CITY_NAMES } from '../utils/cityData';

function getTheme(theme) {
    const isDark = theme.isDarkMode;
    return {
        bg: isDark ? '#121212' : '#F8F9FA',
        cardBg: isDark ? ['#1A1A1A', '#242424'] : ['#FFFFFF', '#FDFDFD'],
        textPrimary: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#A0A0A0' : '#666666',
        goldPrimary: '#D4AF37',
        border: isDark ? '#333333' : '#E5E5E5',
    };
}

export default function ServiceRequestScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const theme = useTheme();
    const isDarkMode = theme.isDarkMode;
    const T = getTheme(theme);
    
    // Params: { serviceTitle: 'Sözleşme Kontrolü', tableName: 'law_requests' }
    const { serviceTitle = 'Hizmet', tableName = 'law_requests' } = route.params || {};

    const [requestText, setRequestText] = useState('');
    const [requestFiles, setRequestFiles] = useState([]);
    const [phone, setPhone] = useState('');
    const [originalPhone, setOriginalPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Lokasyon States
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [isRemote, setIsRemote] = useState(false); // Tüm Türkiye / Uzaktan
    
    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('city'); // 'city' or 'district'
    const [searchText, setSearchText] = useState('');

    const filteredData = React.useMemo(() => {
        const sourceData = modalType === 'city' ? CITY_NAMES : (CITIES_DISTRICTS[selectedCity] || []).sort((a,b) => a.localeCompare(b, 'tr'));
        if (!searchText) return sourceData;
        const normSearch = searchText.toLocaleLowerCase('tr').trim();
        return sourceData.filter(item => item.toLocaleLowerCase('tr').includes(normSearch));
    }, [modalType, selectedCity, searchText]);

    const handleSelect = (item) => {
        if (modalType === 'city') {
            setSelectedCity(item);
            setSelectedDistrict('');
            setSearchText('');
            setModalType('district');
        } else {
            setSelectedDistrict(item);
            setSearchText('');
            setModalVisible(false);
        }
    };

    useEffect(() => {
        fetchProfilePhone();
    }, []);

    const fetchProfilePhone = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
                if (data && data.phone) {
                    setPhone(data.phone);
                    setOriginalPhone(data.phone);
                }
            }
        } catch (e) {
            console.log("Phone fetch error", e);
        }
    };

    const handlePickFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/png', 'image/jpeg'], multiple: true });
            if (!res.canceled && res.assets && res.assets.length > 0) {
                setRequestFiles(prev => [...prev, ...res.assets]);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleRemoveFile = (index) => {
        setRequestFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!requestText.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen talebinizle ilgili bir açıklama yazın.');
            return;
        }
        if (!phone.trim()) {
            Alert.alert('Eksik Bilgi', 'Uzmanlarımızın size ulaşabilmesi için lütfen telefon numaranızı girin.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Giriş yapmanız gerekiyor.");

            let uploadedFileUrls = [];
            if (requestFiles.length > 0) {
                for (const file of requestFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${tableName}/${user.id}/${fileName}`;
                    
                    const response = await fetch(file.uri);
                    const blob = await response.blob();
                    
                    const { error: uploadError } = await supabase.storage
                        .from('service_documents')
                        .upload(filePath, blob);
                        
                    if (!uploadError) {
                        const { data: publicUrlData } = supabase.storage.from('service_documents').getPublicUrl(filePath);
                        uploadedFileUrls.push(publicUrlData.publicUrl);
                    }
                }
            }

            const { error: insertError } = await supabase.from(tableName).insert({
                user_id: user.id,
                service_title: serviceTitle,
                description: requestText,
                file_urls: uploadedFileUrls,
                city: isRemote ? 'Tüm Türkiye' : selectedCity || null,
                district: isRemote ? 'Uzaktan' : selectedDistrict || null,
                status: 'pending'
            });

            if (insertError) throw insertError;

            // Update profile phone if changed
            if (phone.trim() && phone.trim() !== originalPhone) {
                await supabase.from('profiles').update({ phone: phone.trim() }).eq('id', user.id);
            }

            Alert.alert('Talebiniz Alındı', 'Uzmanlarımız en kısa sürede sizinle iletişime geçecektir.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
            
        } catch (error) {
            Alert.alert('Hata', 'Talebiniz gönderilirken bir sorun oluştu: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <SafeAreaView style={{ flex: 1 }}>
                
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.cardBg[0] }]}>
                        <Ionicons name="arrow-back" size={20} color={T.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text allowFontScaling={false} style={[styles.headerTitle, { color: T.textPrimary }]}>Yeni Talep</Text>
                        <Text allowFontScaling={false} style={[styles.headerSub, { color: T.goldPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                            {serviceTitle.replace(/\n/g, ' ')}
                        </Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* CONTENT */}
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <LinearGradient colors={T.cardBg} style={styles.card} borderRadius={24}>
                        <Text allowFontScaling={false} style={[styles.label, { color: T.textPrimary }]}>Talebinizi Detaylandırın</Text>
                        <Text allowFontScaling={false} style={[styles.labelSub, { color: T.textSecondary }]}>Bu hizmet kapsamında ihtiyacınız olan desteği açıklayın.</Text>
                        
                        <View style={[styles.inputContainer, { borderColor: T.border, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]}>
                            <TextInput
                                style={[styles.input, { color: T.textPrimary }]}
                                multiline
                                placeholder="Tüm detayları buraya yazabilirsiniz..."
                                placeholderTextColor={T.textSecondary}
                                value={requestText}
                                onChangeText={setRequestText}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text allowFontScaling={false} style={[styles.label, { color: T.textPrimary, marginBottom: 2 }]}>Lokasyon Seçimi (İsteğe Bağlı)</Text>
                                <Text allowFontScaling={false} style={[styles.labelSub, { color: T.textSecondary, marginBottom: 0 }]}>Hizmeti nerede almak istiyorsunuz?</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => { setIsRemote(!isRemote); if(!isRemote) { setSelectedCity(''); setSelectedDistrict(''); } }} 
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isRemote ? T.goldPrimary + '22' : 'transparent', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: isRemote ? T.goldPrimary : T.border }}
                            >
                                <MaterialCommunityIcons name={isRemote ? "check-circle" : "checkbox-blank-circle-outline"} size={18} color={isRemote ? T.goldPrimary : T.textSecondary} />
                                <Text allowFontScaling={false} style={{ color: isRemote ? T.goldPrimary : T.textSecondary, fontSize: 12, fontWeight: '600' }}>Uzaktan</Text>
                            </TouchableOpacity>
                        </View>

                        {!isRemote && (
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                                <TouchableOpacity 
                                    style={[styles.locationBtn, { borderColor: selectedCity ? T.goldPrimary : T.border, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]}
                                    onPress={() => { setModalType('city'); setSearchText(''); setModalVisible(true); }}
                                >
                                    <View>
                                        <Text allowFontScaling={false} style={{ color: T.textSecondary, fontSize: 10, fontWeight: '600', marginBottom: 2 }}>İl</Text>
                                        <Text allowFontScaling={false} style={{ color: selectedCity ? T.textPrimary : T.textSecondary, fontSize: 14, fontWeight: selectedCity ? '700' : '400' }} numberOfLines={1}>
                                            {selectedCity || 'Seçiniz'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={16} color={T.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.locationBtn, { borderColor: selectedDistrict ? T.goldPrimary : T.border, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', opacity: selectedCity ? 1 : 0.5 }]}
                                    onPress={() => { setModalType('district'); setSearchText(''); setModalVisible(true); }}
                                    disabled={!selectedCity}
                                >
                                    <View>
                                        <Text allowFontScaling={false} style={{ color: T.textSecondary, fontSize: 10, fontWeight: '600', marginBottom: 2 }}>İlçe</Text>
                                        <Text allowFontScaling={false} style={{ color: selectedDistrict ? T.textPrimary : T.textSecondary, fontSize: 14, fontWeight: selectedDistrict ? '700' : '400' }} numberOfLines={1}>
                                            {selectedDistrict || 'Seçiniz'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={16} color={T.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text allowFontScaling={false} style={[styles.label, { color: T.textPrimary, marginTop: 24 }]}>Belge Yükle (İsteğe Bağlı)</Text>
                        <Text allowFontScaling={false} style={[styles.labelSub, { color: T.textSecondary }]}>Görsel veya PDF formatında destekleyici evrak yükleyebilirsiniz.</Text>

                        <TouchableOpacity 
                            style={[styles.uploadBox, { borderColor: T.goldPrimary + '55' }]} 
                            onPress={handlePickFile}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.uploadIconWrap, { backgroundColor: T.goldPrimary + '15' }]}>
                                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={T.goldPrimary} />
                            </View>
                            <View style={styles.uploadTextWrap}>
                                <Text allowFontScaling={false} style={[styles.uploadMainText, { color: requestFiles.length > 0 ? T.goldPrimary : T.textPrimary }]} numberOfLines={1}>
                                    {requestFiles.length > 0 ? `${requestFiles.length} Belge Seçildi (Daha Ekle)` : 'Dosya Seçmek İçin Tıklayın'}
                                </Text>
                                <Text allowFontScaling={false} style={[styles.uploadSubText, { color: T.textSecondary }]}>PDF, PNG veya JPG (Maks. 10MB)</Text>
                            </View>
                        </TouchableOpacity>

                        {requestFiles.length > 0 && (
                            <View style={{ marginTop: 12, gap: 8 }}>
                                {requestFiles.map((file, idx) => (
                                    <View key={idx} style={[styles.fileChip, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderColor: T.border }]}>
                                        <Ionicons name="document-text-outline" size={16} color={T.textSecondary} style={{ marginRight: 8 }} />
                                        <Text allowFontScaling={false} style={{ flex: 1, color: T.textPrimary, fontSize: 13 }} numberOfLines={1}>{file.name}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveFile(idx)} style={{ padding: 4 }}>
                                            <Ionicons name="close-circle" size={18} color={T.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Text allowFontScaling={false} style={[styles.label, { color: T.textPrimary, marginTop: 24 }]}>İletişim Numaranız</Text>
                        <Text allowFontScaling={false} style={[styles.labelSub, { color: T.textSecondary }]}>Uzmanlarımızın size ulaşabilmesi için gereklidir.</Text>

                        <View style={[styles.inputContainer, { borderColor: T.border, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
                            <Ionicons name="call-outline" size={20} color={T.textSecondary} style={{ marginRight: 10 }} />
                            <TextInput
                                style={[styles.input, { minHeight: 56, padding: 0, paddingVertical: 0, flex: 1, color: T.textPrimary }]}
                                placeholder="0 (5XX) XXX XX XX"
                                placeholderTextColor={T.textSecondary}
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={{ height: 30 }} />
                    </LinearGradient>
                </ScrollView>

                {/* LOCATION MODAL */}
                {modalVisible && (
                    <View style={StyleSheet.absoluteFill}>
                        <BlurView intensity={isDarkMode ? 40 : 20} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { backgroundColor: T.cardBg[0], borderColor: T.border }]}>
                                <View style={styles.modalHeader}>
                                    <Text allowFontScaling={false} style={{ color: T.textPrimary, fontSize: 16, fontWeight: '700' }}>
                                        {modalType === 'city' ? 'İl Seçimi' : 'İlçe Seçimi'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                        <Ionicons name="close" size={24} color={T.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#111' : '#F5F5F5', borderColor: T.border }]}>
                                    <Ionicons name="search" size={18} color={T.goldPrimary} style={{ marginLeft: 12 }} />
                                    <TextInput
                                        style={{ flex: 1, paddingHorizontal: 12, height: 44, color: T.textPrimary, fontSize: 14 }}
                                        placeholder="Ara..."
                                        placeholderTextColor={T.textSecondary}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        autoCorrect={false}
                                    />
                                </View>
                                <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                                    {filteredData.map(item => {
                                        const isSelected = modalType === 'city' ? selectedCity === item : selectedDistrict === item;
                                        return (
                                            <TouchableOpacity 
                                                key={item} 
                                                style={[styles.modalItem, { borderBottomColor: T.border }]} 
                                                onPress={() => handleSelect(item)}
                                            >
                                                <Text allowFontScaling={false} style={{ color: isSelected ? T.goldPrimary : T.textPrimary, fontSize: 15, fontWeight: isSelected ? '700' : '500' }}>
                                                    {item}
                                                </Text>
                                                {isSelected && <Ionicons name="checkmark-circle" size={20} color={T.goldPrimary} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {filteredData.length === 0 && (
                                        <Text allowFontScaling={false} style={{ color: T.textSecondary, textAlign: 'center', marginTop: 30, fontSize: 13 }}>Sonuç bulunamadı</Text>
                                    )}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                )}

                {/* BOTTOM ACTION */}
                <View style={[styles.bottomAction, { borderTopColor: T.border, backgroundColor: T.bg }]}>
                    <TouchableOpacity 
                        style={[styles.submitBtn, { backgroundColor: T.goldPrimary }, isSubmitting && { opacity: 0.7 }]} 
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text allowFontScaling={false} style={styles.submitBtnText}>TALEBİ GÖNDER</Text>
                        )}
                    </TouchableOpacity>
                </View>
                </KeyboardAvoidingView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    headerSub: { fontSize: 16, fontWeight: '800', marginTop: 2 },
    scroll: { padding: 16, paddingBottom: 40 },
    card: { padding: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)' },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    labelSub: { fontSize: 12, marginBottom: 16 },
    inputContainer: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    input: { minHeight: 140, padding: 16, fontSize: 15, lineHeight: 22 },
    locationBtn: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
    uploadBox: { borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(212,175,55,0.03)' },
    uploadIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    uploadTextWrap: { flex: 1, justifyContent: 'center' },
    uploadMainText: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    uploadSubText: { fontSize: 11 },
    fileChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
    bottomAction: { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 0 : 16 },
    submitBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    modalContent: { height: '80%', borderRadius: 24, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12, borderWidth: 1 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 0.5 },
});
