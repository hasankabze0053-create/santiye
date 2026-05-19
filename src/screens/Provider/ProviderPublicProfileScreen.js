import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    green: '#10B981',
    blue: '#3B82F6'
};

export default function ProviderPublicProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isPreview, providerId, fromOffer } = route.params || {};
    
    const [loading, setLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const [projects, setProjects] = useState([]);
    
    // Custom JSON properties
    const [logoUrl, setLogoUrl] = useState('');
    const [publicBrandName, setPublicBrandName] = useState('');
    const [publicTaxOffice, setPublicTaxOffice] = useState('');
    const [publicPhones, setPublicPhones] = useState('');
    const [publicAddress, setPublicAddress] = useState('');
    const [publicWebsite, setPublicWebsite] = useState('');
    
    const [bio, setBio] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [projectCount, setProjectCount] = useState('');
    const [services, setServices] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const targetId = providerId || (await supabase.auth.getUser()).data.user?.id;
            if (!targetId) return;

            const [{ data: company }, { data: fetchedProjects }] = await Promise.all([
                supabase.from('companies').select('*').eq('owner_id', targetId).single(),
                supabase.from('provider_projects').select('*').eq('provider_id', targetId).order('created_at', { ascending: false })
            ]);

            setCompanyData(company);
            setProjects(fetchedProjects || []);
            
            if (company && company.custom_services) {
                let cs = {};
                if (typeof company.custom_services === 'string') {
                    try { cs = JSON.parse(company.custom_services); } catch (e) {}
                } else {
                    cs = company.custom_services;
                }
                setLogoUrl(cs.logo_url || company?.logo_url || '');
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
        } catch (e) {
            console.warn('Load preview error:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', backgroundColor: T.bg }]}>
                <ActivityIndicator size="large" color={T.gold} />
            </View>
        );
    }

    const displayName = publicBrandName || companyData?.company_name || 'Firma Ünvanı Yok';

    return (
        <View style={s.container}>
            <StatusBar barStyle="dark-content" />
            
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={T.textDark} />
                    </TouchableOpacity>
                    
                    <Text allowFontScaling={false} style={s.headerTitle}>Firma Profili</Text>
                    
                    <View style={s.headerRight}>
                        <TouchableOpacity style={s.headerBtn}>
                            <Ionicons name="share-social-outline" size={22} color={T.textDark} />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.headerBtn}>
                            <Ionicons name="ellipsis-horizontal" size={22} color={T.textDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                    
                    {/* Main Company Card */}
                    <View style={s.card}>
                        <View style={s.mainProfileRow}>
                            <View style={s.logoContainer}>
                                {logoUrl ? (
                                    <Image source={{ uri: logoUrl }} style={s.logoImage} />
                                ) : (
                                    <View style={s.logoPlaceholder}>
                                        <Text allowFontScaling={false} style={s.logoText}>{displayName?.substring(0,2).toLocaleUpperCase('tr-TR')}</Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={s.profileInfo}>
                                <View style={s.nameRow}>
                                    <Text allowFontScaling={false} style={s.companyNameText} numberOfLines={1}>{displayName}</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={18} color={T.blue} />
                                </View>
                                <Text allowFontScaling={false} style={s.subtitleText}>Onaylı Kurumsal Firma</Text>
                                
                                <View style={s.locationRow}>
                                    <Ionicons name="location-outline" size={14} color={T.textMid} />
                                    <Text allowFontScaling={false} style={s.locationText}>{(publicAddress || companyData?.address || 'İstanbul').split(',')[0]}</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity style={s.bookmarkBtn}>
                                <Ionicons name="bookmark-outline" size={22} color={T.goldDark} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={s.divider} />
                        
                        <View style={s.statsRow}>
                            <View style={s.statItem}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={T.goldDark} style={s.statIcon} />
                                <View>
                                    <Text allowFontScaling={false} style={s.statValue}>{experienceYears || '-'}</Text>
                                    <Text allowFontScaling={false} style={s.statLabel}>Deneyim (Yıl)</Text>
                                </View>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statItem}>
                                <MaterialCommunityIcons name="office-building-outline" size={22} color={T.goldDark} style={s.statIcon} />
                                <View>
                                    <Text allowFontScaling={false} style={s.statValue}>{projectCount || projects.length || '-'}</Text>
                                    <Text allowFontScaling={false} style={s.statLabel}>Tamamlanan İş</Text>
                                </View>
                            </View>
                        </View>
                        
                    </View>

                    {/* Hakkında Card */}
                    {bio ? (
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <View style={s.cardIconBox}>
                                    <MaterialCommunityIcons name="text-account" size={20} color={T.goldDark} />
                                </View>
                                <Text allowFontScaling={false} style={s.cardTitle}>HAKKINDA</Text>
                            </View>
                            <Text allowFontScaling={false} style={s.bioText}>{bio}</Text>
                        </View>
                    ) : null}

                    {/* Kurumsal ve İletişim Bilgileri */}
                    {(publicTaxOffice || publicPhones || publicAddress || publicWebsite) ? (
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <View style={s.cardIconBox}>
                                    <MaterialCommunityIcons name="card-account-phone-outline" size={20} color={T.goldDark} />
                                </View>
                                <Text allowFontScaling={false} style={s.cardTitle}>İLETİŞİM VE VİTRİN BİLGİLERİ</Text>
                            </View>
                            
                            {publicPhones ? (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <Ionicons name="call-outline" size={18} color={T.textMid} style={{ marginRight: 10, marginTop: 2 }} />
                                    <View>
                                        <Text allowFontScaling={false} style={{ color: T.textDim, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>İletişim Telefonları</Text>
                                        <Text allowFontScaling={false} style={{ color: T.textDark, fontSize: 14 }}>{publicPhones}</Text>
                                    </View>
                                </View>
                            ) : null}

                            {publicWebsite ? (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <Ionicons name="globe-outline" size={18} color={T.textMid} style={{ marginRight: 10, marginTop: 2 }} />
                                    <View>
                                        <Text allowFontScaling={false} style={{ color: T.textDim, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>Web Sitesi</Text>
                                        <Text allowFontScaling={false} style={{ color: T.blue, fontSize: 14 }}>{publicWebsite}</Text>
                                    </View>
                                </View>
                            ) : null}

                            {publicTaxOffice ? (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <Ionicons name="document-text-outline" size={18} color={T.textMid} style={{ marginRight: 10, marginTop: 2 }} />
                                    <View>
                                        <Text allowFontScaling={false} style={{ color: T.textDim, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>Kayıtlı Vergi Dairesi</Text>
                                        <Text allowFontScaling={false} style={{ color: T.textDark, fontSize: 14 }}>{publicTaxOffice}</Text>
                                    </View>
                                </View>
                            ) : null}

                            {publicAddress ? (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Ionicons name="location-outline" size={18} color={T.textMid} style={{ marginRight: 10, marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: T.textDim, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>Firma Adresi</Text>
                                        <Text allowFontScaling={false} style={{ color: T.textDark, fontSize: 14 }}>{publicAddress}</Text>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    {/* Uzmanlık Alanları */}
                    {services.length > 0 ? (
                        <View style={s.card}>
                            <View style={s.cardHeader}>
                                <View style={s.cardIconBox}>
                                    <Ionicons name="briefcase-outline" size={20} color={T.goldDark} />
                                </View>
                                <Text allowFontScaling={false} style={s.cardTitle}>UZMANLIK ALANLARI</Text>
                            </View>
                            <View style={s.servicesWrapper}>
                                {services.map((srv, i) => (
                                    <View key={i} style={s.servicePill}>
                                        <Text allowFontScaling={false} style={s.servicePillText}>{srv}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {/* Tamamlanan Projeler */}
                    {projects.length > 0 && (
                        <View style={[s.card, { paddingRight: 0 }]}>
                            <View style={[s.cardHeader, { paddingRight: 16 }]}>
                                <View style={s.cardIconBox}>
                                    <MaterialCommunityIcons name="home-city-outline" size={20} color={T.goldDark} />
                                </View>
                                <Text allowFontScaling={false} style={s.cardTitle}>TAMAMLANAN PROJELER</Text>
                                <TouchableOpacity style={s.viewAllBtn}>
                                    <Text allowFontScaling={false} style={s.viewAllText}>Tümünü Gör</Text>
                                    <Ionicons name="chevron-forward" size={14} color={T.goldDark} />
                                </TouchableOpacity>
                            </View>
                            
                            <FlatList
                                data={projects}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 10 }}
                                renderItem={({ item }) => {
                                    const coverPhoto = item.photos?.[0] ? item.photos[0] : 'https://picsum.photos/400/250?random=1';
                                    
                                    return (
                                        <View style={s.projectCard}>
                                            <Image source={{ uri: coverPhoto }} style={s.projectImage} />
                                            <View style={s.projectInfoBox}>
                                                <Text allowFontScaling={false} style={s.projectTitleText} numberOfLines={1}>{item.title}</Text>
                                                <Text allowFontScaling={false} style={s.projectSubText}>{item.description ? item.description.substring(0,20)+'...' : 'Detaylar'}</Text>
                                            </View>
                                        </View>
                                    );
                                }}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        </View>
                    )}

                    {/* Belgeler ve Güvence */}
                    <View style={s.card}>
                        <View style={[s.cardHeader, { marginBottom: 15 }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={T.goldDark} />
                            <Text allowFontScaling={false} style={[s.cardTitle, { marginLeft: 8 }]}>BELGELER & GÜVENCE</Text>
                        </View>
                        
                        {['Yetki Belgeleri Doğrulandı', 'Vergi / Şirket Bilgileri Onaylandı', 'Sigorta ve Sözleşme Desteği'].map((item, idx) => (
                            <View key={idx} style={s.docItemRow}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={T.green} />
                                <Text allowFontScaling={false} style={s.docItemText}>{item}</Text>
                                <Ionicons name="chevron-forward" size={16} color={T.textDim} style={{ marginLeft: 'auto' }} />
                            </View>
                        ))}
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Bottom Actions */}
            <View style={s.bottomBar}>
                {fromOffer ? (
                    <View style={s.bottomActionsRow}>
                        <TouchableOpacity style={[s.actionBtn, s.btnOutline]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={T.goldDark} />
                            <Text allowFontScaling={false} style={[s.actionBtnText, { color: T.goldDark }]}>Mesaj Gönder</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[s.actionBtn, s.btnSolid]} onPress={() => navigation.goBack()}>
                            <Ionicons name="document-text-outline" size={20} color="#FFF" />
                            <Text allowFontScaling={false} style={[s.actionBtnText, { color: '#FFF' }]}>Teklifi İncele</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={s.bottomActionsRow}>
                        <TouchableOpacity style={[s.actionBtn, s.btnSolid, { flex: 1 }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
                            <Text allowFontScaling={false} style={[s.actionBtnText, { color: '#FFF' }]}>Mesaj Gönder</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerRight: { flexDirection: 'row', gap: 10 },
    headerTitle: { color: T.goldDark, fontSize: 16, fontWeight: '700' },
    
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 },
    
    card: { backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: T.border },
    
    mainProfileRow: { flexDirection: 'row', alignItems: 'flex-start' },
    logoContainer: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', marginRight: 16 },
    logoImage: { width: '100%', height: '100%' },
    logoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#1A232E', alignItems: 'center', justifyContent: 'center' },
    logoText: { color: T.gold, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
    profileInfo: { flex: 1, justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    companyNameText: { color: T.textDark, fontSize: 18, fontWeight: '800', flexShrink: 1, marginRight: 6 },
    subtitleText: { color: T.textMid, fontSize: 12, marginBottom: 6 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    locationText: { color: T.textMid, fontSize: 12, marginLeft: 4 },
    bookmarkBtn: { padding: 4 },
    
    divider: { height: 1, backgroundColor: T.border, marginVertical: 16 },
    
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 6 },
    statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    statIcon: { marginRight: 8 },
    statValue: { color: T.textDark, fontSize: 16, fontWeight: '800' },
    statLabel: { color: T.textMid, fontSize: 10 },
    statDivider: { width: 1, height: 24, backgroundColor: T.border },
    
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: T.goldDim },
    cardTitle: { color: T.textDark, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    
    bioText: { color: T.textMid, fontSize: 13, lineHeight: 22 },
    
    servicesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    servicePill: { backgroundColor: '#FFFCF5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    servicePillText: { color: T.goldDark, fontSize: 12, fontWeight: '600' },
    
    viewAllBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
    viewAllText: { color: T.goldDark, fontSize: 11, fontWeight: '600', marginRight: 2 },
    
    projectCard: { width: 220, backgroundColor: T.bg, borderRadius: 12, overflow: 'hidden', marginRight: 12, borderWidth: 1, borderColor: T.border },
    projectImage: { width: '100%', height: 120 },
    projectInfoBox: { padding: 12 },
    projectTitleText: { color: T.textDark, fontSize: 13, fontWeight: '700', marginBottom: 4 },
    projectSubText: { color: T.textMid, fontSize: 11 },
    
    docItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
    docItemText: { color: T.textMid, fontSize: 12, marginLeft: 10, fontWeight: '500' },
    
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, borderTopWidth: 1, borderTopColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
    bottomActionsRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: T.goldDark },
    btnSolid: { backgroundColor: '#D4AF37' },
    actionBtnText: { fontSize: 15, fontWeight: '700' }
});
