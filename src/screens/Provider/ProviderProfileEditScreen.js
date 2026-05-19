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
    RefreshControl,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const T = {
    bg: '#FAF8F5',
    card: '#FFFFFF',
    textDark: '#1E293B',
    textMid: '#475569',
    textDim: '#94A3B8',
    gold: '#D4AF37',
    goldDark: '#B48A28',
    goldDim: 'rgba(212, 175, 55, 0.1)',
    border: '#F1F5F9',
    red: '#EF4444',
    redDim: 'rgba(239, 68, 68, 0.1)',
};

export default function ProviderProfileEditScreen() {
    const navigation = useNavigation();
    const { refreshProfile } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Custom Services JSONB Info (Public Profile Settings)
    const [logoUrl, setLogoUrl] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const [publicBrandName, setPublicBrandName] = useState('');
    const [publicTaxOffice, setPublicTaxOffice] = useState('');
    const [publicPhones, setPublicPhones] = useState('');
    const [publicAddress, setPublicAddress] = useState('');
    const [publicWebsite, setPublicWebsite] = useState('');
    
    const [bio, setBio] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [projectCount, setProjectCount] = useState('');
    const [services, setServices] = useState([]);
    
    const [newServiceInput, setNewServiceInput] = useState('');
    const [projects, setProjects] = useState([]);
    
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [currentProject, setCurrentProject] = useState({ id: null, title: '', description: '', photos: [] });
    const [savingProject, setSavingProject] = useState(false);

    useEffect(() => {
        loadCompanyData();
    }, []);

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
                let cs = {};
                if (typeof company.custom_services === 'string') {
                    try { cs = JSON.parse(company.custom_services); } catch (e) {}
                } else if (company.custom_services) {
                    cs = company.custom_services;
                }
                
                // Load public display data from custom_services
                setLogoUrl(cs.logo_url || '');
                setPublicBrandName(cs.public_brand_name || '');
                setPublicTaxOffice(cs.public_tax_office || '');
                setPublicPhones(cs.public_phones || '');
                setPublicAddress(cs.public_address || '');
                setPublicWebsite(cs.website || '');
                
                setBio(cs.bio || '');
                setExperienceYears(cs.experience_years || '');
                setProjectCount(cs.project_count || '');
                setServices(Array.isArray(cs.services) ? cs.services : []);
            }

            const { data: projData } = await supabase
                .from('provider_projects')
                .select('*')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });
                
            if (projData) setProjects(projData);
        } catch (e) {
            console.warn('Load company error:', e);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const customServicesObj = {
                logo_url: logoUrl,
                public_brand_name: publicBrandName,
                public_tax_office: publicTaxOffice,
                public_phones: publicPhones,
                public_address: publicAddress,
                website: publicWebsite,
                bio,
                experience_years: experienceYears,
                project_count: projectCount,
                services
            };

            const { error: companyError } = await supabase
                .from('companies')
                .update({ 
                    custom_services: JSON.stringify(customServicesObj)
                })
                .eq('owner_id', user.id);

            if (companyError) throw companyError;

            await refreshProfile();
            Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
        } catch (e) {
            Alert.alert("Hata", "Güncelleme sırasında bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handlePickLogo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Hata', 'Galeri izni gerekiyor.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLogoUploading(true);
                const uri = result.assets[0].uri;
                let ext = uri.substring(uri.lastIndexOf('.') + 1).toLowerCase();
                if (ext === 'jpg') ext = 'jpeg';
                const fileName = `logos/firm_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                
                const formData = new FormData();
                formData.append('file', {
                    uri: uri,
                    name: fileName,
                    type: `image/${ext}`
                });

                const { data, error } = await supabase.storage
                    .from('construction-documents')
                    .upload(fileName, formData, { contentType: `image/${ext}` });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('construction-documents')
                    .getPublicUrl(fileName);

                setLogoUrl(publicUrl);
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            Alert.alert('Hata', 'Logo yüklenirken bir sorun oluştu.');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleAddService = () => {
        const trimmed = newServiceInput.trim();
        if (trimmed && !services.includes(trimmed)) {
            setServices([...services, trimmed]);
            setNewServiceInput('');
        }
    };

    const handleRemoveService = (srv) => {
        setServices(services.filter(s => s !== srv));
    };

    const handleSaveProject = async () => {
        if (!currentProject.title.trim()) {
            Alert.alert("Hata", "Lütfen proje adı giriniz.");
            return;
        }
        try {
            setSavingProject(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            const projectData = {
                provider_id: user.id,
                title: currentProject.title,
                description: currentProject.description,
                photos: currentProject.photos
            };

            if (currentProject.id) {
                await supabase.from('provider_projects').update(projectData).eq('id', currentProject.id);
            } else {
                await supabase.from('provider_projects').insert(projectData);
            }
            
            setShowProjectModal(false);
            loadCompanyData();
        } catch (e) {
            Alert.alert("Hata", "Proje kaydedilemedi.");
        } finally {
            setSavingProject(false);
        }
    };

    const handleDeleteProject = (projectId) => {
        Alert.alert("Projeyi Sil", "Bu projeyi silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            { 
                text: "Sil", 
                style: "destructive",
                onPress: async () => {
                    await supabase.from('provider_projects').delete().eq('id', projectId);
                    loadCompanyData();
                }
            }
        ]);
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await loadCompanyData();
        } catch (error) {
            console.warn('ProviderProfileEditScreen refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const openProjectModal = (proj = null) => {
        if (proj) {
            setCurrentProject(proj);
        } else {
            setCurrentProject({ id: null, title: '', description: '', photos: [] });
        }
        setShowProjectModal(true);
    };

    const handleAddProjectPhoto = () => {
        if (currentProject.photos.length >= 10) {
            Alert.alert("Sınır", "En fazla 10 fotoğraf yükleyebilirsiniz.");
            return;
        }
        const newPhotos = [...currentProject.photos, 'https://picsum.photos/400/300?random=' + Math.random()];
        setCurrentProject(prev => ({ ...prev, photos: newPhotos }));
    };

    const removeProjectPhoto = (index) => {
        const newPhotos = [...currentProject.photos];
        newPhotos.splice(index, 1);
        setCurrentProject(prev => ({ ...prev, photos: newPhotos }));
    };

    return (
        <SafeAreaProvider>
            <View style={s.container}>
                <StatusBar barStyle="dark-content" />
                
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* Header */}
                    <View style={s.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={T.textDark} />
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
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={s.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.goldDark} />}
                    >
                        {/* Temel Bilgiler Kartı */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <MaterialCommunityIcons name="office-building" size={20} color={T.goldDark} />
                                <Text allowFontScaling={false} style={s.cardTitle}>VİTRİN VE İLETİŞİM BİLGİLERİ</Text>
                            </View>

                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <TouchableOpacity 
                                    activeOpacity={0.8} 
                                    onPress={handlePickLogo}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 50,
                                        backgroundColor: T.bg,
                                        borderWidth: 2,
                                        borderColor: T.border,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {logoUploading ? (
                                        <ActivityIndicator size="small" color={T.gold} />
                                    ) : logoUrl ? (
                                        <Image source={{ uri: logoUrl }} style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color={T.textDim} />
                                            <Text allowFontScaling={false} style={{ fontSize: 10, color: T.textDim, marginTop: 4, fontWeight: 'bold' }}>Logo Yükle</Text>
                                        </View>
                                    )}
                                    {logoUrl && !logoUploading && (
                                        <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, alignItems: 'center' }}>
                                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Değiştir</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <Text allowFontScaling={false} style={s.label}>GÖRÜNÜR MARKA ADI / ÜNVAN</Text>
                            <TextInput value={publicBrandName} onChangeText={setPublicBrandName} style={s.input} placeholder="Müşterilerin göreceği isim" placeholderTextColor={T.textDim} />

                            <Text allowFontScaling={false} style={s.label}>VERGİ DAİRESİ (OPSİYONEL)</Text>
                            <TextInput value={publicTaxOffice} onChangeText={setPublicTaxOffice} style={s.input} placeholderTextColor={T.textDim} />

                            <Text allowFontScaling={false} style={s.label}>İLETİŞİM TELEFONLARI</Text>
                            <TextInput value={publicPhones} onChangeText={setPublicPhones} style={s.input} placeholder="Örn: 0555..., 0212..." placeholderTextColor={T.textDim} keyboardType="phone-pad" />

                            <Text allowFontScaling={false} style={s.label}>WEB SİTESİ (OPSİYONEL)</Text>
                            <TextInput value={publicWebsite} onChangeText={setPublicWebsite} style={s.input} placeholder="www.firmaniz.com" placeholderTextColor={T.textDim} keyboardType="url" autoCapitalize="none" />

                            <Text allowFontScaling={false} style={s.label}>VİTRİN ADRESİ</Text>
                            <TextInput value={publicAddress} onChangeText={setPublicAddress} style={[s.input, { height: 80 }]} multiline placeholder="Müşterilerin göreceği açık adres" placeholderTextColor={T.textDim} />
                        </View>

                        {/* İstatistikler Kartı */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <Ionicons name="stats-chart" size={20} color={T.goldDark} />
                                <Text allowFontScaling={false} style={s.cardTitle}>İSTATİSTİKLER</Text>
                            </View>
                            
                            <View style={s.row}>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.label}>DENEYİM (YIL)</Text>
                                    <TextInput value={experienceYears} onChangeText={setExperienceYears} style={s.input} placeholder="Örn: 12" placeholderTextColor={T.textDim} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.label}>TAMAMLANAN İŞ</Text>
                                    <TextInput value={projectCount} onChangeText={setProjectCount} style={s.input} placeholder="Örn: 38" placeholderTextColor={T.textDim} keyboardType="numeric" />
                                </View>
                            </View>
                        </View>

                        {/* Hakkında Kartı */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <MaterialCommunityIcons name="text-box-outline" size={20} color={T.goldDark} />
                                <Text allowFontScaling={false} style={s.cardTitle}>HAKKINDA</Text>
                            </View>
                            <TextInput value={bio} onChangeText={setBio} style={[s.input, { height: 100 }]} multiline placeholder="Müşterilerinize firmanızdan bahsedin..." placeholderTextColor={T.textDim} />
                        </View>

                        {/* Uzmanlık Alanları Kartı */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <Ionicons name="briefcase-outline" size={20} color={T.goldDark} />
                                <Text allowFontScaling={false} style={s.cardTitle}>UZMANLIK ALANLARI</Text>
                            </View>
                            <Text allowFontScaling={false} style={s.hint}>Müşterilerin sizi bulabilmesi için özel uzmanlık etiketleri ekleyin (Örn: Çelik Yapı, Anahtar Teslim)</Text>
                            
                            <View style={s.addTagRow}>
                                <TextInput 
                                    value={newServiceInput} 
                                    onChangeText={setNewServiceInput} 
                                    style={[s.input, { flex: 1, marginBottom: 0 }]} 
                                    placeholder="Yeni uzmanlık alanı yazın..." 
                                    placeholderTextColor={T.textDim}
                                    onSubmitEditing={handleAddService}
                                />
                                <TouchableOpacity style={s.addTagBtn} onPress={handleAddService}>
                                    <Ionicons name="add" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <View style={s.servicesWrapper}>
                                {services.map((srv, i) => (
                                    <View key={i} style={s.servicePill}>
                                        <Text allowFontScaling={false} style={s.servicePillText}>{srv}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveService(srv)} style={s.removeServiceBtn}>
                                            <Ionicons name="close-circle" size={16} color={T.red} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Tamamlanan Projeler Kartı */}
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <MaterialCommunityIcons name="home-city-outline" size={20} color={T.goldDark} />
                                <Text allowFontScaling={false} style={s.cardTitle}>TAMAMLANAN PROJELER</Text>
                            </View>
                            <Text allowFontScaling={false} style={s.hint}>Müşterilerinize sunduğunuz referans projeleri yönetin.</Text>
                            
                            {projects.map((proj, i) => (
                                <View key={proj.id} style={s.projectCardRow}>
                                    {proj.photos && proj.photos.length > 0 ? (
                                        <Image source={{ uri: proj.photos[0] }} style={s.projectThumb} />
                                    ) : (
                                        <View style={[s.projectThumb, { backgroundColor: T.border, alignItems: 'center', justifyContent: 'center' }]}>
                                            <MaterialCommunityIcons name="image-off" size={24} color={T.textDim} />
                                        </View>
                                    )}
                                    <View style={s.projectInfo}>
                                        <Text allowFontScaling={false} style={s.projectTitle}>{proj.title}</Text>
                                        <Text allowFontScaling={false} style={s.projectPhotoCount}>{proj.photos?.length || 0} Fotoğraf</Text>
                                    </View>
                                    <TouchableOpacity style={s.editProjectBtn} onPress={() => openProjectModal(proj)}>
                                        <Ionicons name="pencil" size={18} color={T.goldDark} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.deleteProjectBtn} onPress={() => handleDeleteProject(proj.id)}>
                                        <Ionicons name="trash" size={18} color={T.red} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={s.addProjectBtn} onPress={() => openProjectModal()}>
                                <Ionicons name="add-circle-outline" size={20} color={T.goldDark} style={{ marginRight: 6 }} />
                                <Text allowFontScaling={false} style={s.addProjectBtnText}>YENİ PROJE EKLE</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </SafeAreaView>

                {/* Bottom Actions */}
                <View style={s.bottomBar}>
                    <TouchableOpacity style={s.saveProfileBtn} onPress={handleSaveProfile} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text allowFontScaling={false} style={s.saveProfileText}>Değişiklikleri Kaydet</Text>}
                    </TouchableOpacity>
                </View>

            </View>

            {/* Project Edit Modal */}
            <Modal visible={showProjectModal} animationType="slide" transparent={true} onRequestClose={() => setShowProjectModal(false)}>
                <SafeAreaProvider>
                    <View style={{ flex: 1, backgroundColor: T.bg }}>
                        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                            <View style={s.modalHeader}>
                                <TouchableOpacity onPress={() => setShowProjectModal(false)} style={s.modalCloseBtn}>
                                    <Ionicons name="close" size={24} color={T.textDark} />
                                </TouchableOpacity>
                                <Text allowFontScaling={false} style={s.modalTitle}>{currentProject.id ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</Text>
                                <View style={{ width: 40 }} />
                            </View>
                            
                            <ScrollView contentContainerStyle={{ padding: 20 }}>
                                <Text allowFontScaling={false} style={s.label}>PROJE ADI</Text>
                                <TextInput 
                                    value={currentProject.title}
                                    onChangeText={t => setCurrentProject(p => ({...p, title: t}))}
                                    style={s.input}
                                    placeholder="Örn: Kentsel Dönüşüm - Kadıköy"
                                    placeholderTextColor={T.textDim}
                                />

                                <Text allowFontScaling={false} style={s.label}>PROJE DETAYLARI</Text>
                                <TextInput 
                                    value={currentProject.description}
                                    onChangeText={t => setCurrentProject(p => ({...p, description: t}))}
                                    style={[s.input, { height: 100 }]}
                                    multiline
                                    placeholder="Proje hakkında detaylar..."
                                    placeholderTextColor={T.textDim}
                                />

                                <Text allowFontScaling={false} style={[s.label, { marginTop: 10 }]}>FOTOĞRAFLAR ({currentProject.photos.length}/10)</Text>
                                <View style={s.galleryGrid}>
                                    {currentProject.photos.length < 10 && (
                                        <TouchableOpacity style={s.addPhotoBox} onPress={handleAddProjectPhoto}>
                                            <Ionicons name="camera" size={28} color={T.goldDark} />
                                            <Text allowFontScaling={false} style={s.addPhotoText}>Ekle</Text>
                                        </TouchableOpacity>
                                    )}
                                    {currentProject.photos.map((uri, i) => (
                                        <View key={i} style={s.photoWrap}>
                                            <Image source={{ uri }} style={s.photo} />
                                            <TouchableOpacity style={s.deletePhoto} onPress={() => removeProjectPhoto(i)}>
                                                <Ionicons name="close-circle" size={22} color={T.red} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>

                            <View style={[s.bottomBar, { position: 'relative' }]}>
                                <TouchableOpacity style={s.saveProfileBtn} onPress={handleSaveProject} disabled={savingProject}>
                                    {savingProject ? <ActivityIndicator color="#FFF" /> : <Text allowFontScaling={false} style={s.saveProfileText}>Projeyi Kaydet</Text>}
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </View>
                </SafeAreaProvider>
            </Modal>
        </SafeAreaProvider>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerTitle: { color: T.goldDark, fontSize: 16, fontWeight: '700' },
    previewBtnHeader: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: T.goldDim, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    previewBtnText: { color: T.goldDark, fontSize: 12, fontWeight: '700' },
    
    scrollContent: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 10 },
    
    card: { backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: T.border },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.border },
    cardTitle: { color: T.textDark, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    
    hint: { color: T.textMid, fontSize: 12, marginBottom: 12, lineHeight: 18 },
    row: { flexDirection: 'row', gap: 12 },
    
    label: { color: T.textMid, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 10 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, color: T.textDark, fontSize: 14, borderWidth: 1, borderColor: T.border, marginBottom: 6 },
    
    addTagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    addTagBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: T.goldDark, alignItems: 'center', justifyContent: 'center' },
    servicesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    servicePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFCF5', paddingLeft: 14, paddingRight: 8, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    servicePillText: { color: T.goldDark, fontSize: 12, fontWeight: '600', marginRight: 6 },
    removeServiceBtn: { padding: 2 },
    
    projectCardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg, borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: T.border },
    projectThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
    projectInfo: { flex: 1 },
    projectTitle: { color: T.textDark, fontSize: 13, fontWeight: '700', marginBottom: 2 },
    projectPhotoCount: { color: T.textDim, fontSize: 11 },
    editProjectBtn: { padding: 8, backgroundColor: T.goldDim, borderRadius: 8, marginRight: 8 },
    deleteProjectBtn: { padding: 8, backgroundColor: T.redDim, borderRadius: 8 },
    
    addProjectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: T.goldDark, borderStyle: 'dashed', backgroundColor: T.goldDim, marginTop: 5 },
    addProjectBtnText: { color: T.goldDark, fontSize: 13, fontWeight: '700' },
    
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, borderTopWidth: 1, borderTopColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
    saveProfileBtn: { height: 50, borderRadius: 12, backgroundColor: T.goldDark, alignItems: 'center', justifyContent: 'center' },
    saveProfileText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
    modalCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border },
    modalTitle: { color: T.textDark, fontSize: 16, fontWeight: '700' },
    
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    addPhotoBox: { width: (width - 62) / 3, height: 90, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: T.goldDark, alignItems: 'center', justifyContent: 'center', backgroundColor: T.goldDim },
    addPhotoText: { color: T.goldDark, fontSize: 11, fontWeight: '700', marginTop: 4 },
    photoWrap: { width: (width - 62) / 3, height: 90, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
    photo: { width: '100%', height: '100%' },
    deletePhoto: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
});
