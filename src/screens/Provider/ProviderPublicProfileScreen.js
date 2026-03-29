import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { PermissionService } from '../../services/PermissionService';

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
    green: '#4ADE80'
};

export default function ProviderPublicProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isPreview, providerId } = route.params || {};
    
    const [loading, setLoading] = useState(true);
    const [providerData, setProviderData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [activeServices, setActiveServices] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const targetId = providerId || (await supabase.auth.getUser()).data.user?.id;
            if (!targetId) return;

            const [{ data: profile }, { data: company }, permissions] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', targetId).single(),
                supabase.from('companies').select('*').eq('owner_id', targetId).single(),
                PermissionService.getActivePermissions(targetId)
            ]);

            setProviderData(profile);
            setCompanyData(company);
            setActiveServices(permissions);
        } catch (e) {
            console.warn('Load preview error:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={T.gold} />
            </View>
        );
    }

    const SERVICE_LABELS = {
        urban_transformation: 'Kentsel Dönüşüm',
        renovation_office: 'Tadilat Ofisi',
        market_seller: 'Yapı Malzemeleri',
        logistics_company: 'Lojistik & Nakliye',
        machine_renter: 'İş Makinesi Kiralama',
        lawyer: 'Hukuki Destek',
        technical_office: 'Teknik Ofis'
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero / Header Section */}
                <View style={s.hero}>
                    <Image 
                        source={{ uri: companyData?.photos?.[0] || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000' }} 
                        style={s.heroBg} 
                        blurRadius={isPreview ? 5 : 0}
                    />
                    <LinearGradient 
                        colors={['transparent', 'rgba(7,11,20,0.8)', T.bg]} 
                        style={s.heroOverlay} 
                    />
                    
                    <SafeAreaView style={s.heroContent}>
                        <View style={s.navRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={s.navCircle}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            {isPreview && (
                                <View style={s.previewBadge}>
                                    <Text allowFontScaling={false} style={s.previewText}>Müşteri Önizlemesi</Text>
                                </View>
                            )}
                            <TouchableOpacity style={s.navCircle}>
                                <Ionicons name="share-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={s.profileHeader}>
                            <View style={s.avatarContainer}>
                                <Image 
                                    source={{ uri: providerData?.avatar_url || 'https://ui-avatars.com/api/?name=' + (providerData?.full_name || 'Firma') }} 
                                    style={s.avatar} 
                                />
                                <View style={s.verifiedBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                </View>
                            </View>
                            <Text allowFontScaling={false} style={s.companyName}>{companyData?.name || providerData?.full_name}</Text>
                            <View style={s.ratingRow}>
                                <Ionicons name="star" size={16} color={T.gold} />
                                <Text allowFontScaling={false} style={s.ratingText}>4.9</Text>
                                <Text allowFontScaling={false} style={s.reviewCount}>(42 Değerlendirme)</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={s.content}>
                    {/* Stats */}
                    <View style={s.statsRow}>
                        <View style={s.statItem}>
                            <Text allowFontScaling={false} style={s.statValue}>150+</Text>
                            <Text allowFontScaling={false} style={s.statLabel}>Tamamlanan İş</Text>
                        </View>
                        <View style={s.statDivider} />
                        <View style={s.statItem}>
                            <Text allowFontScaling={false} style={s.statValue}>12 Yıl</Text>
                            <Text allowFontScaling={false} style={s.statLabel}>Deneyim</Text>
                        </View>
                        <View style={s.statDivider} />
                        <View style={s.statItem}>
                            <Text allowFontScaling={false} style={s.statValue}>%100</Text>
                            <Text allowFontScaling={false} style={s.statLabel}>Müşteri Memnuniyeti</Text>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={s.section}>
                        <Text allowFontScaling={false} style={s.sectionTitle}>Firma Hakkında</Text>
                        <Text allowFontScaling={false} style={s.bioText}>
                            {providerData?.bio || 'Bu firma henüz bir açıklama eklememiş.'}
                        </Text>
                    </View>

                    {/* Services */}
                    <View style={s.section}>
                        <Text allowFontScaling={false} style={s.sectionTitle}>Hizmet Alanları</Text>
                        <View style={s.servicesContainer}>
                            {activeServices.length > 0 ? activeServices.map((sKey, i) => (
                                <View key={i} style={s.serviceTag}>
                                    <Ionicons name="checkmark-circle" size={16} color={T.gold} />
                                    <Text allowFontScaling={false} style={s.serviceTagText}>{SERVICE_LABELS[sKey] || sKey}</Text>
                                </View>
                            )) : (
                                <Text allowFontScaling={false} style={s.textDim}>Aktif hizmet belirtilmemiş.</Text>
                            )}
                        </View>
                    </View>

                    {/* Gallery */}
                    <View style={s.section}>
                        <Text allowFontScaling={false} style={s.sectionTitle}>Proje Galerisi</Text>
                        <FlatList 
                            data={companyData?.photos || []}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={s.galleryPhoto} />
                            )}
                            ListEmptyComponent={() => (
                                <View style={s.emptyGallery}>
                                    <Text allowFontScaling={false} style={s.textDim}>Henüz proje fotoğrafı eklenmemiş.</Text>
                                </View>
                            )}
                        />
                    </View>

                    {/* Reviews Simulation */}
                    <View style={s.section}>
                        <Text allowFontScaling={false} style={s.sectionTitle}>Müşteri Yorumları</Text>
                        <View style={s.reviewCard}>
                            <View style={s.reviewHeader}>
                                <Text allowFontScaling={false} style={s.reviewerName}>Koray K.</Text>
                                <View style={s.stars}>
                                    {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={12} color={T.gold} />)}
                                </View>
                            </View>
                            <Text allowFontScaling={false} style={s.reviewText}>Zamanında teslimat ve kaliteli işçilik için teşekkürler.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar (Simulated Contact) */}
            <BlurView intensity={30} tint="dark" style={s.contactBar}>
                <TouchableOpacity style={s.messageBtn}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
                    <Text allowFontScaling={false} style={s.messageBtnText}>Mesaj Gönder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.callBtn}>
                    <Ionicons name="call" size={24} color={T.gold} />
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: T.bg },
    hero: { height: 420 },
    heroBg: { width: '100%', height: '100%' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
    heroContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
    
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    navCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    previewBadge: { backgroundColor: T.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    previewText: { color: '#000', fontSize: 12, fontWeight: '800' },
    
    profileHeader: { alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: T.gold, padding: 3, marginBottom: 15 },
    avatar: { width: '100%', height: '100%', borderRadius: 47 },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: T.green, width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: T.bg, alignItems: 'center', justifyContent: 'center' },
    companyName: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    ratingText: { color: T.gold, fontSize: 16, fontWeight: '800' },
    reviewCount: { color: T.textDim, fontSize: 13 },
    
    content: { paddingHorizontal: 20, marginTop: -20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: T.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: T.cardBorder, marginBottom: 30 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: T.textDim, fontSize: 11, marginTop: 4, textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: T.cardBorder, height: '80%', alignSelf: 'center' },
    
    section: { marginBottom: 35 },
    sectionTitle: { color: T.gold, fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 15 },
    bioText: { color: T.textMid, fontSize: 15, lineHeight: 24 },
    
    servicesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    serviceTag: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.goldDim, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: T.gold },
    serviceTagText: { color: T.gold, fontSize: 13, fontWeight: '700' },
    
    galleryPhoto: { width: width * 0.7, height: 180, borderRadius: 16, marginRight: 15 },
    emptyGallery: { padding: 40, alignItems: 'center', justifyContent: 'center', width: width - 40 },
    
    reviewCard: { backgroundColor: T.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.cardBorder },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    reviewerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
    stars: { flexDirection: 'row', gap: 2 },
    reviewText: { color: T.textMid, fontSize: 13, lineHeight: 20 },
    
    contactBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, paddingBottom: 40, flexDirection: 'row', gap: 12 },
    messageBtn: { flex: 1, backgroundColor: T.gold, borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    messageBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
    callBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: T.goldDim, borderWidth: 1, borderColor: T.gold, alignItems: 'center', justifyContent: 'center' },
    textDim: { color: T.textDim }
});
