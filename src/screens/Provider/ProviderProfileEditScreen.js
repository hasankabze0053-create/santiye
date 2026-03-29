import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const T = {
    bg: '#070B14',
    card: '#0F1629',
    cardBorder: '#1A2340',
    gold: '#D4AF37',
    goldLight: '#FFD700',
    goldDim: 'rgba(212, 175, 55, 0.15)',
    text: '#F1F5F9',
    textDim: '#64748B',
    textMid: '#94A3B8',
    red: '#EF4444',
};

export default function ProviderProfileEditScreen() {
    const navigation = useNavigation();
    const { profile, refreshProfile } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [companyName, setCompanyName] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        if (profile) {
            setBio(profile.bio || '');
            loadCompanyData();
        }
    }, [profile]);

    const loadCompanyData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            const { data: company } = await supabase
                .from('companies')
                .select('*')
                .eq('owner_id', user.id)
                .single();
                
            if (company) {
                setCompanyName(company.name || '');
                setPhone(company.phone || '');
                setPhotos(company.photos || []);
            }
        } catch (e) {
            console.warn('Load company error:', e);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update Profile Bio
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ bio })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update Company Details
            const { error: companyError } = await supabase
                .from('companies')
                .upsert({ 
                    owner_id: user.id,
                    name: companyName,
                    phone: phone,
                    photos: photos
                });

            if (companyError) throw companyError;

            await refreshProfile();
            Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Hata", "Güncelleme sırasında bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[T.bg, '#0A0F1E']} style={StyleSheet.absoluteFillObject} />
            
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={s.headerTitle}>Sayfamı Düzenle</Text>
                    <TouchableOpacity 
                        style={s.previewBtnHeader}
                        onPress={() => navigation.navigate('ProviderPublicProfile', { isPreview: true })}
                    >
                        <Text allowFontScaling={false} style={s.previewBtnText}>Önizleme</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCompanyData(); setRefreshing(false); }} tintColor={T.gold} />}
                >
                    {/* Photos Section */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="image-multiple" size={20} color={T.gold} />
                            <Text allowFontScaling={false} style={s.sectionTitle}>Fotoğraflarım</Text>
                        </View>
                        <Text allowFontScaling={false} style={s.hint}>Müşterilerinizin göreceği proje fotoğraflarını yönetin.</Text>
                        
                        <View style={s.galleryGrid}>
                            <TouchableOpacity style={s.addPhotoBox}>
                                <Ionicons name="camera" size={32} color={T.gold} />
                                <Text allowFontScaling={false} style={s.addPhotoText}>Yeni Ekle</Text>
                            </TouchableOpacity>
                            {photos.map((uri, i) => (
                                <View key={i} style={s.photoWrap}>
                                    <Image source={{ uri }} style={s.photo} />
                                    <TouchableOpacity style={s.deletePhoto}>
                                        <Ionicons name="close-circle" size={22} color={T.red} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Basic Info */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="domain" size={20} color={T.gold} />
                            <Text allowFontScaling={false} style={s.sectionTitle}>Firma Bilgileri</Text>
                        </View>
                        
                        <Text allowFontScaling={false} style={s.label}>Firma Adı</Text>
                        <TextInput 
                            value={companyName}
                            onChangeText={setCompanyName}
                            style={s.input}
                            placeholder="Örn: ABC İnşaat Ltd."
                            placeholderTextColor={T.textDim}
                        />

                        <Text allowFontScaling={false} style={s.label}>İletişim Telefonu</Text>
                        <TextInput 
                            value={phone}
                            onChangeText={setPhone}
                            style={s.input}
                            keyboardType="phone-pad"
                            placeholder="05xx xxx xx xx"
                            placeholderTextColor={T.textDim}
                        />

                        <Text allowFontScaling={false} style={s.label}>Firma Hakkında / Bio</Text>
                        <TextInput 
                            value={bio}
                            onChangeText={setBio}
                            style={[s.input, s.textArea]}
                            multiline
                            numberOfLines={4}
                            placeholder="Hizmetleriniz, tecrübeniz ve ekibinizden bahsedin..."
                            placeholderTextColor={T.textDim}
                        />
                    </View>

                    {/* Documents */}
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <MaterialCommunityIcons name="certificate" size={20} color={T.gold} />
                            <Text allowFontScaling={false} style={s.sectionTitle}>Sertifika & Belgeler</Text>
                        </View>
                        <TouchableOpacity style={s.uploadBox}>
                            <Ionicons name="cloud-upload-outline" size={32} color={T.gold} />
                            <Text allowFontScaling={false} style={s.uploadText}>ISO, TSE veya Yetki Belgesi Yükle</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Bottom Actions */}
            <BlurView intensity={20} tint="dark" style={s.bottomBar}>
                <TouchableOpacity 
                    style={s.saveBtn} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[T.gold, '#8C6A30']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={s.saveGradient}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <Text allowFontScaling={false} style={s.saveText}>Değişiklikleri Kaydet</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    previewBtnHeader: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: T.goldDim, borderWidth: 1, borderColor: T.gold },
    previewBtnText: { color: T.gold, fontSize: 12, fontWeight: '700' },
    
    section: { marginBottom: 30, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    sectionTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    hint: { color: T.textDim, fontSize: 13, marginBottom: 15 },
    
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    addPhotoBox: { width: (width - 64) / 3, height: 100, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: T.gold, alignItems: 'center', justifyContent: 'center' },
    addPhotoText: { color: T.gold, fontSize: 11, fontWeight: '700', marginTop: 4 },
    photoWrap: { width: (width - 64) / 3, height: 100, borderRadius: 16, overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    deletePhoto: { position: 'absolute', top: 4, right: 4, backgroundColor: T.bg, borderRadius: 12 },
    
    label: { color: T.gold, fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: T.card, borderRadius: 14, padding: 15, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: T.cardBorder },
    textArea: { height: 120, textAlignVertical: 'top' },
    
    uploadBox: { height: 120, borderRadius: 16, borderWidth: 1.5, borderColor: T.cardBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
    uploadText: { color: T.textMid, fontSize: 13, fontWeight: '500', marginTop: 10 },
    
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    saveBtn: { borderRadius: 16, overflow: 'hidden' },
    saveGradient: { paddingVertical: 18, alignItems: 'center' },
    saveText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
