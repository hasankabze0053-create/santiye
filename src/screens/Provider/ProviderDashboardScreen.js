import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PermissionService } from '../../services/PermissionService';

const { width } = Dimensions.get('window');

// --- THEME ---
const T = {
    bg: '#070B14',
    card: '#0F1629',
    cardBorder: '#1A2340',
    gold: '#D4AF37',
    goldLight: '#FFD700',
    goldDim: 'rgba(212, 175, 55, 0.15)',
    green: '#4ADE80',
    greenDim: 'rgba(74, 222, 128, 0.15)',
    red: '#EF4444',
    redDim: 'rgba(239, 68, 68, 0.12)',
    blue: '#38BDF8',
    blueDim: 'rgba(56, 189, 248, 0.15)',
    orange: '#F59E0B',
    orangeDim: 'rgba(245, 158, 11, 0.15)',
    text: '#F1F5F9',
    textDim: '#64748B',
    textMid: '#94A3B8',
};

// --- SECTION HEADER ---
const SectionHeader = ({ icon, title, actionText, onAction, badgeCount }) => (
    <View style={s.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name={icon} size={20} color={T.gold} />
            <Text allowFontScaling={false} style={s.sectionTitle}>{title}</Text>
            {badgeCount > 0 && (
                <View style={s.sectionBadge}>
                    <Text allowFontScaling={false} style={s.sectionBadgeText}>{badgeCount}</Text>
                </View>
            )}
        </View>
        {actionText && (
            <TouchableOpacity onPress={onAction}>
                <Text allowFontScaling={false} style={s.sectionAction}>{actionText}</Text>
            </TouchableOpacity>
        )}
    </View>
);

export default function ProviderDashboardScreen() {
    const navigation = useNavigation();
    const { profile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Real Data State
    const [companyData, setCompanyData] = useState(null);
    const [companyPhotos, setCompanyPhotos] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeServices, setActiveServices] = useState([]);

    // Category Selection Modal State
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [categoryActionType, setCategoryActionType] = useState('requests'); // 'requests' or 'tenders'

    // Pending state for unapproved corporate users
    if (profile?.user_type === 'corporate' && profile?.approval_status !== 'approved') {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={[T.bg, '#0F1629']} style={StyleSheet.absoluteFillObject} />

                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: T.orangeDim, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Ionicons name="time-outline" size={40} color={T.orange} />
                </View>
                <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Hesabınız Onay Aşamasında</Text>
                <Text allowFontScaling={false} style={{ color: T.textMid, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
                    Firma paneline erişebilmek için hesap başvurunuzun admin tarafından onaylanması gerekmektedir.
                </Text>

                <TouchableOpacity
                    style={{ backgroundColor: T.card, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: T.cardBorder }}
                    onPress={() => navigation.goBack()}
                >
                    <Text allowFontScaling={false} style={{ color: '#fff', fontWeight: 'bold' }}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    useFocusEffect(
        useCallback(() => {
            loadAllData();
        }, [])
    );

    const loadAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadCompanyData(),
                loadConversations(),
                loadActiveServices(),
            ]);
        } catch (e) {
            console.warn('Provider dashboard load error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
                setCompanyData(company);
                // Load company photos if available
                if (company.photos && Array.isArray(company.photos)) {
                    setCompanyPhotos(company.photos);
                } else if (company.logo_url) {
                    setCompanyPhotos([company.logo_url]);
                }
            }
        } catch (e) {
            console.warn('Company data error:', e);
        }
    };

    const loadConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Try to load real conversations
            const { data, error } = await supabase
                .from('conversations')
                .select('*, messages(*)')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setConversations(data);
            } else {
                setConversations([]);
            }
        } catch (e) {
            // Table might not exist yet
            setConversations([]);
        }
    };

    const loadActiveServices = async () => {
        try {
            const permissions = await PermissionService.getActivePermissions();
            setActiveServices(permissions);
        } catch (e) {
            setActiveServices([]);
        }
    };

    const firstName = profile?.full_name?.split(' ')[0] || 'Misafir';

    // Service type to provider screen mapping
    const SERVICE_MAP = {
        urban_transformation: { screen: 'ContractorProvider', label: 'Kentsel Dönüşüm', icon: 'home-city' },
        renovation_office: { screen: 'RenovationProvider', label: 'Tadilat Ofisi', icon: 'hammer-wrench' },
        market_seller: { screen: 'MarketProvider', label: 'Market / Satış', icon: 'shopping' },
        logistics_company: { screen: 'LogisticsProvider', label: 'Lojistik / Nakliye', icon: 'truck-delivery' },
        machine_renter: { screen: 'MachineryProvider', label: 'İş Makinesi Kiralama', icon: 'excavator' },
        lawyer: { screen: 'LawProvider', label: 'Hukuki Destek', icon: 'gavel' },
        technical_office: { screen: 'TechnicalProvider', label: 'Teknik Ofis', icon: 'compass-outline' },
    };

    const getMyServices = () => {
        if (activeServices.includes('admin_all')) {
            return Object.keys(SERVICE_MAP);
        }
        return activeServices.filter(s => SERVICE_MAP[s]);
    };

    const myServices = getMyServices();

    const handleCategoryAction = (type) => {
        if (myServices.length === 0) {
            Alert.alert('Yetki Yok', 'Henüz admin tarafından size atanmış bir hizmet yetkisi bulunmuyor.');
            return;
        }

        if (myServices.length === 1) {
            const target = SERVICE_MAP[myServices[0]];
            if (target) navigation.navigate(target.screen);
        } else {
            setCategoryActionType(type);
            setIsCategoryModalVisible(true);
        }
    };

    const CategorySelectionModal = () => (
        <Modal
            visible={isCategoryModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsCategoryModalVisible(false)}
        >
            <TouchableOpacity 
                style={s.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setIsCategoryModalVisible(false)}
            >
                <View style={s.modalContent}>
                    <View style={s.modalHeader}>
                        <View style={s.modalIndicator} />
                        <Text allowFontScaling={false} style={s.modalTitle}>
                            {categoryActionType === 'requests' ? 'İncelemek İstediğiniz Alanı Seçin' : 'Teklif Verdiğiniz Alanı Seçin'}
                        </Text>
                        <Text allowFontScaling={false} style={s.modalSub}>Birden fazla alanda yetkilisiniz, lütfen devam etmek istediğiniz kategoriyi seçin.</Text>
                    </View>

                    <ScrollView style={s.modalList} showsVerticalScrollIndicator={false}>
                        {myServices.map((key) => {
                            const info = SERVICE_MAP[key];
                            if (!info) return null;
                            return (
                                <TouchableOpacity 
                                    key={key} 
                                    style={s.modalItem}
                                    onPress={() => {
                                        setIsCategoryModalVisible(false);
                                        navigation.navigate(info.screen);
                                    }}
                                >
                                    <View style={s.modalItemIcon}>
                                        <MaterialCommunityIcons name={info.icon} size={24} color={T.gold} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={s.modalItemLabel}>{info.label}</Text>
                                        <Text allowFontScaling={false} style={s.modalItemSub}>Bu alandaki tüm {categoryActionType === 'requests' ? 'talepleri' : 'tekliflerinizi'} yönetin</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={T.textDim} />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity 
                        style={s.modalCloseBtn}
                        onPress={() => setIsCategoryModalVisible(false)}
                    >
                        <Text allowFontScaling={false} style={s.modalCloseText}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[T.bg, '#0A0F1E']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* ═══════════ HEADER ═══════════ */}
                <View style={s.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                            <Ionicons name="arrow-back" size={22} color={T.text} />
                        </TouchableOpacity>
                        <View>
                            <Text allowFontScaling={false} style={s.headerLabel}>Hizmet Paneli</Text>
                            <Text allowFontScaling={false} style={s.headerName}>Hoşgeldin, {firstName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={s.bellBtn} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="briefcase-outline" size={22} color={T.gold} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAllData(); }} tintColor={T.gold} />
                    }
                >
                    {/* ═══════════ HIZLI İŞLEMLER GRİD ═══════════ */}
                    <View style={s.px}>
                        <SectionHeader icon="view-grid-outline" title="Hızlı İşlemler" />
                        <View style={s.gridContainer}>
                            {[
                                { icon: 'store-edit-outline', label: 'Sayfamı\nDüzenle', color: T.gold, onPress: () => navigation.navigate('ProviderProfileEdit') },
                                { icon: 'chat-processing-outline', label: 'Sohbet\nKutusu', color: T.blue, onPress: () => navigation.navigate('Chat') },
                                { icon: 'shield-crown-outline', label: 'Abonelik\nBilgileri', color: T.green },
                                { icon: 'chart-box-outline', label: 'Gelişmiş\nRaporlar', color: T.orange },
                                { icon: 'file-document-outline', label: 'Sözleşme-\nlerim', color: '#A78BFA' },
                                { icon: 'robot-outline', label: 'Yapay Zeka\nKeşif', color: '#F472B6' },
                            ].map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={s.gridItem}
                                    activeOpacity={0.7}
                                    onPress={item.onPress}
                                >
                                    <View style={[s.gridIconBox, { backgroundColor: `${item.color}15` }]}>
                                        <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                                    </View>
                                    <Text allowFontScaling={false} style={s.gridLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ═══════════ SAYFAMI DÜZENLE ═══════════ */}
                    <View style={s.px}>
                        <SectionHeader 
                            icon="store-edit-outline" 
                            title="Sayfamı Düzenle" 
                            actionText="Önizleme" 
                            onAction={() => navigation.navigate('ProviderPublicProfile', { isPreview: true })} 
                        />
                        <TouchableOpacity style={s.editPageCard} activeOpacity={0.8} onPress={() => navigation.navigate('ProviderProfileEdit')}>
                            {/* Photos */}
                            {companyPhotos.length > 0 ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 14 }}>
                                    {companyPhotos.map((uri, i) => (
                                        <View key={i} style={s.galleryImgWrap}>
                                            <Image source={{ uri }} style={s.galleryImg} />
                                        </View>
                                    ))}
                                    <TouchableOpacity style={s.galleryAdd}>
                                        <Ionicons name="add-circle-outline" size={28} color={T.gold} />
                                        <Text allowFontScaling={false} style={s.galleryAddText}>Ekle</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            ) : (
                                <View style={s.emptyPhotos}>
                                    <Ionicons name="images-outline" size={36} color={T.textDim} />
                                    <Text allowFontScaling={false} style={s.emptyPhotosText}>Henüz fotoğraf eklenmedi</Text>
                                    <Text allowFontScaling={false} style={s.emptyPhotosSub}>Müşterilerinizin göreceği proje fotoğraflarınızı ekleyin</Text>
                                </View>
                            )}

                            {/* Company Details Preview */}
                            <View style={s.companyPreview}>
                                <View style={s.companyPreviewRow}>
                                    <MaterialCommunityIcons name="domain" size={16} color={T.gold} />
                                    <Text allowFontScaling={false} style={s.companyPreviewLabel}>Firma:</Text>
                                    <Text allowFontScaling={false} style={s.companyPreviewValue} numberOfLines={1}>{companyData?.name || profile?.full_name || 'Belirtilmedi'}</Text>
                                </View>
                                {companyData?.phone && (
                                    <View style={s.companyPreviewRow}>
                                        <Ionicons name="call-outline" size={16} color={T.gold} />
                                        <Text allowFontScaling={false} style={s.companyPreviewLabel}>Tel:</Text>
                                        <Text allowFontScaling={false} style={s.companyPreviewValue}>{companyData.phone}</Text>
                                    </View>
                                )}
                                {(companyData?.city || companyData?.district) && (
                                    <View style={s.companyPreviewRow}>
                                        <Ionicons name="location-outline" size={16} color={T.gold} />
                                        <Text allowFontScaling={false} style={s.companyPreviewLabel}>Konum:</Text>
                                        <Text allowFontScaling={false} style={s.companyPreviewValue}>{companyData.district ? `${companyData.district}, ` : ''}{companyData.city || ''}</Text>
                                    </View>
                                )}
                                {profile?.bio && (
                                    <View style={[s.companyPreviewRow, { marginTop: 4 }]}>
                                        <MaterialCommunityIcons name="text" size={16} color={T.gold} />
                                        <Text allowFontScaling={false} style={s.companyPreviewLabel}>Hakkında:</Text>
                                        <Text allowFontScaling={false} style={s.companyPreviewValue} numberOfLines={2}>{profile.bio}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={s.editPageAction}>
                                <TouchableOpacity 
                                    style={s.previewBtn} 
                                    onPress={() => navigation.navigate('ProviderPublicProfile', { isPreview: true })}
                                >
                                    <Ionicons name="eye-outline" size={18} color={T.gold} />
                                    <Text allowFontScaling={false} style={s.editPageActionText}>Önizleme</Text>
                                </TouchableOpacity>
                                <View style={{ width: 15 }} />
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                    onPress={() => navigation.navigate('ProviderProfileEdit')}
                                >
                                    <Text allowFontScaling={false} style={s.editPageActionText}>Düzenle</Text>
                                    <Ionicons name="chevron-forward" size={18} color={T.gold} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* ═══════════ SOHBET KUTUSU ═══════════ */}
                    <View style={s.px}>
                        <SectionHeader icon="chat-processing-outline" title="Sohbet Kutusu" badgeCount={0} />
                        {conversations.length > 0 ? (
                            <View style={s.chatList}>
                                {conversations.map((chat) => (
                                    <TouchableOpacity key={chat.id} style={s.chatItem} activeOpacity={0.7}>
                                        <LinearGradient colors={['#D4AF37', '#8C6A30']} style={s.chatAvatar}>
                                            <Text allowFontScaling={false} style={s.chatAvatarText}>
                                                {(chat.user1_name || chat.user2_name || '?').substring(0, 2).toUpperCase()}
                                            </Text>
                                        </LinearGradient>
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={s.chatName} numberOfLines={1}>{chat.user1_name || chat.user2_name || 'Sohbet'}</Text>
                                            <Text allowFontScaling={false} style={s.chatMsg} numberOfLines={1}>
                                                {chat.messages?.[0]?.content || 'Mesaj yok'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={T.textDim} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={s.emptyCard}>
                                <MaterialCommunityIcons name="chat-outline" size={32} color={T.textDim} />
                                <Text allowFontScaling={false} style={s.emptyTitle}>Henüz sohbet yok</Text>
                                <Text allowFontScaling={false} style={s.emptySub}>Müşterilerle iletişime geçtiğinizde sohbetleriniz burada görünecek.</Text>
                            </View>
                        )}
                    </View>

                    {/* ═══════════ ANA İŞLEM BUTONLARI ═══════════ */}
                    <View style={s.px}>
                        <SectionHeader icon="lightning-bolt" title="Hizmet Operasyonları" />

                        {/* Potansiyel Talepler */}
                        <TouchableOpacity
                            style={s.bigActionBtn}
                            activeOpacity={0.8}
                            onPress={() => handleCategoryAction('requests')}
                        >
                            <LinearGradient
                                colors={['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.04)']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={s.bigActionGradient}
                            >
                                <View style={s.bigActionIconBox}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={28} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.bigActionTitle}>Potansiyel Talepler</Text>
                                    <Text allowFontScaling={false} style={s.bigActionSub}>Yetkili olduğunuz alandaki yeni iş fırsatlarını inceleyin</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={22} color={T.gold} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Verilen Teklifler */}
                        <TouchableOpacity
                            style={[s.bigActionBtn, { marginTop: 12 }]}
                            activeOpacity={0.8}
                            onPress={() => handleCategoryAction('tenders')}
                        >
                            <LinearGradient
                                colors={['rgba(74,222,128,0.10)', 'rgba(74,222,128,0.03)']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={s.bigActionGradient}
                            >
                                <View style={[s.bigActionIconBox, { backgroundColor: T.greenDim }]}>
                                    <MaterialCommunityIcons name="file-document-edit-outline" size={28} color={T.green} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={[s.bigActionTitle, { color: T.green }]}>Verilen Teklifler</Text>
                                    <Text allowFontScaling={false} style={s.bigActionSub}>Gönderdiğiniz tekliflerin durumunu takip edin</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={22} color={T.green} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Yetkili Olduğum Alanlar (service-specific navigation) */}
                        {myServices.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text allowFontScaling={false} style={s.servicesLabel}>Yetkili Olduğum Paneller</Text>
                                <View style={s.servicesGrid}>
                                    {myServices.map((serviceKey) => {
                                        const info = SERVICE_MAP[serviceKey];
                                        if (!info) return null;
                                        return (
                                            <TouchableOpacity
                                                key={serviceKey}
                                                style={s.serviceChip}
                                                activeOpacity={0.7}
                                                onPress={() => navigation.navigate(info.screen)}
                                            >
                                                <MaterialCommunityIcons name={info.icon} size={20} color={T.gold} />
                                                <Text allowFontScaling={false} style={s.serviceChipText}>{info.label}</Text>
                                                <Ionicons name="chevron-forward" size={16} color={T.textDim} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ═══════════ FİRMA BİLGİLERİM ═══════════ */}
                    <View style={s.px}>
                        <SectionHeader icon="information-outline" title="Firma Bilgilerim" />
                        <View style={s.firmInfoCard}>
                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <MaterialCommunityIcons name="domain" size={22} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>Firma Adı</Text>
                                    <Text allowFontScaling={false} style={s.firmValue}>{companyData?.name || profile?.full_name || '—'}</Text>
                                </View>
                            </View>

                            <View style={s.firmDivider} />

                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <Ionicons name="mail-outline" size={20} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>E-Posta</Text>
                                    <Text allowFontScaling={false} style={s.firmValue}>{profile?.email || '—'}</Text>
                                </View>
                            </View>

                            <View style={s.firmDivider} />

                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <Ionicons name="call-outline" size={20} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>Telefon</Text>
                                    <Text allowFontScaling={false} style={s.firmValue}>{companyData?.phone || profile?.phone || '—'}</Text>
                                </View>
                            </View>

                            <View style={s.firmDivider} />

                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <Ionicons name="location-outline" size={20} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>Konum</Text>
                                    <Text allowFontScaling={false} style={s.firmValue}>
                                        {companyData?.city ? `${companyData.district || ''} ${companyData.city}` : '—'}
                                    </Text>
                                </View>
                            </View>

                            <View style={s.firmDivider} />

                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>Hesap Durumu</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                        <View style={[s.statusDot, { backgroundColor: profile?.approval_status === 'approved' ? T.green : T.orange }]} />
                                        <Text allowFontScaling={false} style={[s.firmValue, { color: profile?.approval_status === 'approved' ? T.green : T.orange }]}>
                                            {profile?.approval_status === 'approved' ? 'Onaylı' : 'Beklemede'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={s.firmDivider} />

                            <View style={s.firmRow}>
                                <View style={s.firmIconBox}>
                                    <MaterialCommunityIcons name="tag-multiple-outline" size={20} color={T.gold} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={s.firmLabel}>Aktif Hizmetler</Text>
                                    <Text allowFontScaling={false} style={s.firmValue}>
                                        {myServices.length > 0
                                            ? myServices.map(k => SERVICE_MAP[k]?.label).filter(Boolean).join(', ')
                                            : 'Henüz atanmadı'
                                        }
                                    </Text>
                                </View>
                            </View>

                            {/* İlanı Düzenle Butonu */}
                            <TouchableOpacity
                                style={s.firmEditBtn}
                                onPress={() => navigation.navigate('ProviderWizard')}
                            >
                                <Ionicons name="create-outline" size={18} color={T.gold} />
                                <Text allowFontScaling={false} style={s.firmEditText}>Firma Bilgilerini Güncelle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
                <CategorySelectionModal />
            </SafeAreaView>
        </View>
    );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    px: { paddingHorizontal: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.cardBorder },
    headerLabel: { color: T.gold, fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    headerName: { color: T.text, fontSize: 24, fontWeight: 'bold', marginTop: 2 },
    bellBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.cardBorder },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 14 },
    sectionTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
    sectionAction: { color: T.gold, fontSize: 13, fontWeight: '600' },
    sectionBadge: { backgroundColor: T.red, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    sectionBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // Edit Page Card
    editPageCard: { backgroundColor: T.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.cardBorder },
    galleryImgWrap: { width: 90, height: 70, borderRadius: 12, overflow: 'hidden' },
    galleryImg: { width: '100%', height: '100%' },
    galleryAdd: { width: 70, height: 70, borderRadius: 12, borderWidth: 1.5, borderColor: T.gold, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    galleryAddText: { color: T.gold, fontSize: 10, fontWeight: '600', marginTop: 4 },

    emptyPhotos: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
    emptyPhotosText: { color: T.textMid, fontSize: 14, fontWeight: '600', marginTop: 8 },
    emptyPhotosSub: { color: T.textDim, fontSize: 12, marginTop: 4, textAlign: 'center' },

    companyPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.cardBorder },
    companyPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    companyPreviewLabel: { color: T.textDim, fontSize: 14, fontWeight: '600', width: 75 },
    companyPreviewValue: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },

    editPageAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.cardBorder },
    previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    editPageActionText: { color: T.gold, fontSize: 13, fontWeight: '700' },

    // Chat
    chatList: { backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.cardBorder, overflow: 'hidden' },
    chatItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: T.cardBorder },
    chatAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    chatAvatarText: { color: '#000', fontWeight: '800', fontSize: 14 },
    chatName: { color: T.text, fontWeight: '700', fontSize: 14 },
    chatMsg: { color: T.textMid, fontSize: 12, marginTop: 2 },

    // Empty State
    emptyCard: { backgroundColor: T.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: T.cardBorder, alignItems: 'center' },
    emptyTitle: { color: T.textMid, fontSize: 14, fontWeight: '600', marginTop: 10 },
    emptySub: { color: T.textDim, fontSize: 12, marginTop: 4, textAlign: 'center', lineHeight: 18 },

    // Big Action Buttons
    bigActionBtn: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: T.cardBorder },
    bigActionGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    bigActionIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: T.goldDim, alignItems: 'center', justifyContent: 'center' },
    bigActionTitle: { color: T.gold, fontSize: 17, fontWeight: '800', marginBottom: 4 },
    bigActionSub: { color: T.textDim, fontSize: 12, lineHeight: 17 },

    // Services Grid
    servicesLabel: { color: T.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
    servicesGrid: { gap: 8 },
    serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: T.cardBorder },
    serviceChipText: { color: T.text, fontSize: 14, fontWeight: '600', flex: 1 },

    // Firma Bilgileri
    firmInfoCard: { backgroundColor: T.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: T.cardBorder },
    firmRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
    firmIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.goldDim, alignItems: 'center', justifyContent: 'center' },
    firmLabel: { color: T.textDim, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
    firmValue: { color: T.text, fontSize: 15, fontWeight: '500', marginTop: 2 },
    firmDivider: { height: 1, backgroundColor: T.cardBorder, marginVertical: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    firmEditBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', backgroundColor: T.goldDim },
    firmEditText: { color: T.gold, fontSize: 14, fontWeight: '700' },

    // Quick Actions Grid
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: (width - 64) / 3, backgroundColor: T.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: T.cardBorder },
    gridIconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    gridLabel: { color: T.text, fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: T.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: T.goldDim },
    modalHeader: { alignItems: 'center', marginBottom: 24 },
    modalIndicator: { width: 40, height: 4, backgroundColor: T.cardBorder, borderRadius: 2, marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    modalSub: { color: T.textMid, fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
    modalList: { maxHeight: 400 },
    modalItem: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: T.cardBorder, gap: 16 },
    modalItemIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: T.goldDim, alignItems: 'center', justifyContent: 'center' },
    modalItemLabel: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
    modalItemSub: { color: T.textDim, fontSize: 12 },
    modalCloseBtn: { marginTop: 10, paddingVertical: 16, alignItems: 'center' },
    modalCloseText: { color: T.textMid, fontSize: 15, fontWeight: '600' },
});

