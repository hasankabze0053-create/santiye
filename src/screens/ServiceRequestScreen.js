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
    Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

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
    const [requestFile, setRequestFile] = useState(null);
    const [phone, setPhone] = useState('');
    const [originalPhone, setOriginalPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/png', 'image/jpeg'] });
            if (!res.canceled && res.assets && res.assets.length > 0) {
                setRequestFile(res.assets[0]);
            }
        } catch (e) {
            console.log(e);
        }
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

            let uploadedFileUrl = null;
            if (requestFile) {
                const fileExt = requestFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${tableName}/${user.id}/${fileName}`;
                
                const response = await fetch(requestFile.uri);
                const blob = await response.blob();
                
                const { error: uploadError } = await supabase.storage
                    .from('service_documents')
                    .upload(filePath, blob);
                    
                if (uploadError) {
                    console.log("Upload Error:", uploadError);
                } else {
                    const { data: publicUrlData } = supabase.storage.from('service_documents').getPublicUrl(filePath);
                    uploadedFileUrl = publicUrlData.publicUrl;
                }
            }

            const { error: insertError } = await supabase.from(tableName).insert({
                user_id: user.id,
                service_title: serviceTitle,
                description: requestText,
                file_urls: uploadedFileUrl ? [uploadedFileUrl] : [],
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

                        <Text allowFontScaling={false} style={[styles.label, { color: T.textPrimary, marginTop: 24 }]}>Belge Yükle (İsteğe Bağlı)</Text>
                        <Text allowFontScaling={false} style={[styles.labelSub, { color: T.textSecondary }]}>Görsel veya PDF formatında destekleyici evrak yükleyebilirsiniz.</Text>

                        <TouchableOpacity 
                            style={[styles.uploadBox, { borderColor: T.goldPrimary + '55' }]} 
                            onPress={handlePickFile}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.uploadIconWrap, { backgroundColor: T.goldPrimary + '15' }]}>
                                <MaterialCommunityIcons name="cloud-upload-outline" size={28} color={T.goldPrimary} />
                            </View>
                            <Text allowFontScaling={false} style={[styles.uploadMainText, { color: requestFile ? T.goldPrimary : T.textPrimary }]}>
                                {requestFile ? requestFile.name : 'Dosya Seçmek İçin Tıklayın'}
                            </Text>
                            {!requestFile && <Text allowFontScaling={false} style={[styles.uploadSubText, { color: T.textSecondary }]}>PDF, PNG veya JPG (Maks. 10MB)</Text>}
                        </TouchableOpacity>

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
    uploadBox: { borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 20, backgroundColor: 'rgba(212,175,55,0.03)' },
    uploadIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    uploadMainText: { fontSize: 14, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
    uploadSubText: { fontSize: 11 },
    bottomAction: { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 0 : 16 },
    submitBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});
