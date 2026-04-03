import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ConstructionService } from '../../services/ConstructionService';
import { MarketService } from '../../services/MarketService';

export default function RequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};
    const type = route.params?.type || request?.type; // Support both ways

    const [items, setItems] = useState([]);
    const [bids, setBids] = useState([]);
    const [constructionOffers, setConstructionOffers] = useState([]); // Added state for construction offers
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // Full screen modal state
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Get current user to check ownership
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                    // Check if user is admin
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single();

                    setIsAdmin(profile?.is_admin || false);
                }
            } catch (err) {
                console.log('Auth check error (Network):', err.message);
            }
        };

        checkAuth();

        if (request?.id) {
            // Only fetch items if it's a MARKET request
            if (type !== 'construction') {
                fetchDetails();
            } else {
                fetchConstructionOffers(); // Fetch offers for construction requests
            }
        }
    }, [request, type]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('market_request_items')
                .select('*')
                .eq('request_id', request.id);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);

            // 2. Fetch Bids (if any)
            const { data: bidsData, error: bidsError } = await supabase
                .from('market_bids')
                .select('*, provider:profiles(full_name)')
                .eq('request_id', request.id);

            if (bidsError) console.log("Bids fetch note:", bidsError.message);
            setBids(bidsData || []);

        } catch (error) {
            console.error('Detail fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // New function to fetch construction offers
    const fetchConstructionOffers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, profiles:contractor_id(id, full_name, company_name, avatar_url)')
                .eq('request_id', request.id)
                .neq('status', 'draft') // Filter drafts
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback if relation fails
                const { data: simpleData } = await supabase
                    .from('construction_offers')
                    .select('*')
                    .eq('request_id', request.id)
                    .neq('status', 'draft')
                    .order('created_at', { ascending: false });
                setConstructionOffers(simpleData || []);
            } else {
                setConstructionOffers(data || []);
            }
        } catch (error) {
            console.error('Construction offers fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // isOwner check for both views
    const isOwner = currentUserId && request?.user_id === currentUserId;

    const handleDeleteRequest = () => {
        Alert.alert(
            'Talebi Sil',
            'Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        
                        let result;
                        if (type === 'construction') {
                            result = await ConstructionService.deleteRequest(request.id);
                        } else {
                            result = await MarketService.deleteRequest(request.id);
                        }
                        
                        setLoading(false);
                        if (result.success) {
                            Alert.alert('Başarılı', 'Talep başarıyla silindi.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } else {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu: ' + result.error?.message);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return '#FDCB58'; // Yellow
            case 'COMPLETED': return '#34C759'; // Green
            case 'CLOSED': return '#8E8E93'; // Gray
            case 'pending': return '#FDCB58';
            default: return '#FDCB58';
        }
    };

    const StatusBadge = ({ status }) => (
        <View style={[styles.statusBadge, { borderColor: getStatusColor(status) }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
            <Text allowFontScaling={false} style={[styles.statusText, { color: getStatusColor(status) }]}>
                {status === 'OPEN' || status === 'pending' ? 'TEKLİF BEKLENİYOR' : status}
            </Text>
        </View>
    );

    // --- CONSTRUCTION DETAIL VIEW ---
    // --- PROFOSYONEL PARSING MANTIĞI ---
    const getField = (tag) => {
        if (!request.description) return null;
        const regexNew = new RegExp(`\\[${tag}\\]\\s*(.*)`, 'i');
        const matchNew = request.description.match(regexNew);
        if (matchNew) return matchNew[1].trim();

        const regexOld = new RegExp(`${tag}:\\s*(.*)`, 'i');
        const matchOld = request.description.match(regexOld);
        if (matchOld) return matchOld[1].trim();
        return null;
    };

    // --- CONSTRUCTION DETAIL VIEW ---
    if (type === 'construction') {
        const projeTipi = getField('PROJE TİPİ') || (request.offer_type === 'anahtar_teslim_tadilat' ? 'Anahtar Teslim Tadilat' : 'İnşaat Projesi');
        const kapsam = getField('KAPSAM') || getField('HİZMETLER') || '-';
        const durum = getField('DURUM') || getField('YENİLEME') || '-';
        const teknik = getField('TEKNİK') || getField('MEKAN') || '-';
        const tarz = getField('TASARIM') || getField('TARZ') || 'Belirtilmedi';
        const butce = getField('BÜTÇE') || '-';
        const lokasyon = getField('LOKASYON') || (request.district ? `${request.district}, ${request.city}` : (request.city || 'Belirtilmedi'));

        let notes = 'Ek not bulunmuyor.';
        if (request.description?.includes('[NOT]')) {
            notes = request.description.split('[NOT]')[1]?.trim() || notes;
        } else if (request.description?.includes('NOT:')) {
            notes = request.description.split('NOT:')[1]?.trim() || notes;
        }

        const teknikItems = teknik.split('|').map(s => s.trim()).filter(Boolean);
        const hasPhotos = request.document_urls && request.document_urls.length > 0;

        // =============================================
        // KENTSEL DÖNÜŞÜM MODÜLÜ (Premium Tasarım)
        // =============================================
        if (request.offer_type !== 'anahtar_teslim_tadilat') {
            const isFlatForLand =
                request?.offer_type === 'kat_karsiligi' ||
                request?.offer_type === 'Kat Karşılığı' ||
                request?.offer_model === 'kat_karsiligi' ||
                request?.offer_model === 'Kat Karşılığı';
            const offerLabel = isFlatForLand ? 'Kat Karşılığı' : 'Komple Yapım (Anahtar Teslim)';
            const offerIcon = isFlatForLand ? 'handshake' : 'office-building-cog';

            return (
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <LinearGradient colors={['#000000', '#0A0A0A']} style={StyleSheet.absoluteFillObject} />
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center' }}>
                                <Text allowFontScaling={false} style={styles.headerTitle}>PROJE DETAYI</Text>
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                            </View>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                            {/* ── HERO KART ── */}
                            <LinearGradient
                                colors={['#1A1200', '#0D0D0D']}
                                style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 20, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', overflow: 'hidden' }}
                            >
                                <LinearGradient
                                    colors={['rgba(212,175,55,0)', 'rgba(212,175,55,0.7)', 'rgba(212,175,55,0)']}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                />
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <MaterialCommunityIcons name="home-city" size={28} color="#D4AF37" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 }}>Kentsel Dönüşüm</Text>
                                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{request.district || ''}{request.neighborhood ? `, ${request.neighborhood}` : ''}</Text>
                                    </View>
                                    <StatusBadge status={request.status || 'pending'} />
                                </View>
                                {/* Stat Satırı */}
                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)', paddingTop: 16 }}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="map-marker-radius" size={20} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 1 }}>ŞEHİR</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '800', marginTop: 3, textAlign: 'center' }} numberOfLines={1}>{request.city || '-'}</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: 'rgba(212,175,55,0.15)' }} />
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="handshake-outline" size={20} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 1 }}>MODEL</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 11, fontWeight: '800', marginTop: 3, textAlign: 'center' }} numberOfLines={2}>{isFlatForLand ? 'Kat Karşılığı' : 'Anahtar Teslim'}</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: 'rgba(212,175,55,0.15)' }} />
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="clock-outline" size={20} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 1 }}>DURUM</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 11, fontWeight: '800', marginTop: 3, textAlign: 'center' }}>
                                            {request.status === 'pending' || request.status === 'OPEN' ? 'Açık' : 'İşlemde'}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            {/* ── YARISİ BİZDEN ── */}
                            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                                <LinearGradient
                                    colors={request.is_campaign_active ? ['rgba(52,199,89,0.08)', '#111'] : ['#111', '#111']}
                                    style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: request.is_campaign_active ? 'rgba(52,199,89,0.3)' : '#222' }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: request.is_campaign_active ? 'rgba(52,199,89,0.15)' : 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <MaterialCommunityIcons name={request.is_campaign_active ? 'check-circle' : 'close-circle'} size={22} color={request.is_campaign_active ? '#34C759' : '#EF4444'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: request.is_campaign_active ? '#34C759' : '#EF4444', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                                            {request.is_campaign_active ? 'YARISI BİZDEN KAMPANYALI' : 'YARISI BİZDEN KAMPANYASI YOK'}
                                        </Text>
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 11, marginTop: 3 }}>
                                            {request.is_campaign_active ? 'Devlet destekli dönüşüm kapsamında' : 'Standart kentsel dönüşüm projesi'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* ── KAMPANYA BİRİMLERİ ── */}
                            {request.is_campaign_active && (
                                <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <MaterialCommunityIcons name="home-group" size={18} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>KAMPANYA KAPSAMINDAKİ BİRİMLER</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <LinearGradient colors={['#1A1200', '#0D0D0D']} style={{ flex: 1, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
                                            <MaterialCommunityIcons name="home-outline" size={24} color="#FFD700" />
                                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: '900', marginTop: 8, letterSpacing: 1 }}>KONUT</Text>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 32, fontWeight: '900', marginTop: 4 }}>{request.campaign_unit_count || 0}</Text>
                                        </LinearGradient>
                                        <LinearGradient colors={['#1A1200', '#0D0D0D']} style={{ flex: 1, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
                                            <MaterialCommunityIcons name="store-outline" size={24} color="#FFD700" />
                                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: '900', marginTop: 8, letterSpacing: 1 }}>TİCARİ</Text>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 32, fontWeight: '900', marginTop: 4 }}>{request.campaign_commercial_count || 0}</Text>
                                        </LinearGradient>
                                    </View>
                                </View>
                            )}

                            {/* ── TEKLİF MODELİ ── */}
                            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <MaterialCommunityIcons name="handshake" size={18} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>TEKLİF MODELİ</Text>
                                </View>
                                <View style={{ backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <MaterialCommunityIcons name={offerIcon} size={26} color="#D4AF37" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{offerLabel}</Text>
                                        {isFlatForLand && (
                                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4, lineHeight: 17 }}>Müteahhit firma arsa payı / daire karşılığında projeyi üstlenir.</Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* ── TAPU & KONUM ── */}
                            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <MaterialCommunityIcons name="map-legend" size={18} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>TAPU VE KONUM BİLGİLERİ</Text>
                                </View>
                                <View style={{ backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', gap: 14 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 13 }}>İl / İlçe</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>{request.city} / {request.district}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#1E1E1E' }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 13 }}>Mahalle</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>{request.neighborhood || '-'}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#1E1E1E' }} />
                                    {/* ADA / PARSEL / PAFTA */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        {[
                                            { label: 'ADA', val: request.ada },
                                            { label: 'PARSEL', val: request.parsel },
                                            { label: 'PAFTA', val: request.pafta },
                                        ].map((item, i) => (
                                            <View key={i} style={{ flex: 1, alignItems: 'center', backgroundColor: '#161616', borderRadius: 12, padding: 12, marginHorizontal: i === 1 ? 8 : 0, borderWidth: 1, borderColor: '#222' }}>
                                                <Text allowFontScaling={false} style={{ color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>{item.label}</Text>
                                                <Text allowFontScaling={false} style={{ color: item.val ? '#FFD700' : '#444', fontSize: 20, fontWeight: '900' }}>{item.val || '-'}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    {request.full_address && (
                                        <>
                                            <View style={{ height: 1, backgroundColor: '#1E1E1E' }} />
                                            <View>
                                                <Text allowFontScaling={false} style={{ color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 }}>AÇIK ADRES</Text>
                                                <Text allowFontScaling={false} style={{ color: '#CCC', fontSize: 13, lineHeight: 20 }}>{request.full_address}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>

                            {/* ── PROJE NOTLARI ── */}
                            {request.description && (
                                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <MaterialCommunityIcons name="message-text-outline" size={18} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>PROJE NOTLARI & DETAYLAR</Text>
                                    </View>
                                    <View style={{ backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222' }}>
                                        <Text allowFontScaling={false} style={{ color: '#CCC', fontSize: 14, lineHeight: 22 }}>{request.description}</Text>
                                    </View>
                                </View>
                            )}

                            {/* ── BELGELER ── */}
                            <View style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginHorizontal: 16 }}>
                                    <MaterialCommunityIcons name="file-document-multiple-outline" size={18} color="#FFD700" />
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>BELGELER VE GÖRSELLER</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 12 }}>
                                    {request.deed_image_url && (
                                        <TouchableOpacity onPress={() => setSelectedImage(request.deed_image_url)} activeOpacity={0.8}>
                                            <Image source={{ uri: request.deed_image_url }} style={{ width: 150, height: 150, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' }} />
                                            <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 10, textAlign: 'center', marginTop: 6, fontWeight: 'bold' }}>Tapu Görseli</Text>
                                        </TouchableOpacity>
                                    )}
                                    {hasPhotos && request.document_urls.map((url, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)} activeOpacity={0.8}>
                                            <Image source={{ uri: url }} style={{ width: 150, height: 150, borderRadius: 16, borderWidth: 1, borderColor: '#222' }} />
                                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, textAlign: 'center', marginTop: 6 }}>Belge #{idx + 1}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {!request.deed_image_url && !hasPhotos && (
                                        <View style={{ width: 220, height: 130, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 16 }}>
                                            <MaterialCommunityIcons name="image-off-outline" size={32} color="#444" />
                                            <Text allowFontScaling={false} style={{ color: '#555', marginTop: 8, fontSize: 12 }}>Belge yüklenmemiş</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>

                            {/* ── GELEN TEKLİFLER ── */}
                            {isOwner && (
                                <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <MaterialCommunityIcons name="email-multiple-outline" size={18} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>GELEN TEKLİFLER</Text>
                                    </View>
                                    {constructionOffers.length === 0 ? (
                                        <View style={{ padding: 30, backgroundColor: '#0A0A0A', borderRadius: 20, borderWidth: 1, borderColor: '#222', alignItems: 'center', borderStyle: 'dashed' }}>
                                            <MaterialCommunityIcons name="timer-sand" size={32} color="#333" />
                                            <Text allowFontScaling={false} style={{ color: '#555', fontSize: 13, marginTop: 12, textAlign: 'center', lineHeight: 20 }}>Henüz teklif gelmedi.{'\n'}Müteahhitler projenizi inceliyor.</Text>
                                        </View>
                                    ) : (
                                        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', overflow: 'hidden' }}>
                                            <LinearGradient colors={['#1A1200', '#0A0A0A']} style={StyleSheet.absoluteFillObject} />
                                            <LinearGradient colors={['rgba(212,175,55,0)', 'rgba(212,175,55,0.6)', 'rgba(212,175,55,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                                            <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, zIndex: 5 }}>
                                                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                                    <MaterialCommunityIcons name="email-multiple-outline" size={34} color="#E8B923" />
                                                </View>
                                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5, marginBottom: 24, textAlign: 'center' }}>
                                                    <Text style={{ color: '#FFD700', fontSize: 26 }}>{constructionOffers.length}</Text> ADET TEKLİF ALINDI
                                                </Text>
                                                <TouchableOpacity activeOpacity={0.8} style={{ width: '100%', overflow: 'hidden', borderRadius: 16 }}
                                                    onPress={() => {
                                                        const grouped = {};
                                                        constructionOffers.forEach(o => { if (!grouped[o.contractor_id]) grouped[o.contractor_id] = []; grouped[o.contractor_id].push(o); });
                                                        const ids = Object.keys(grouped);
                                                        if (ids.length === 1) { navigation.navigate('OfferDetail', { request, offers: grouped[ids[0]], contractor_id: ids[0], request_id: request.id }); }
                                                        else { navigation.navigate('MainTabs', { screen: 'Inbox' }); }
                                                    }}
                                                >
                                                    <LinearGradient colors={['#D4AF37', '#E8890C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 }}>TEKLİFLERİ İNCELE</Text>
                                                        <MaterialCommunityIcons name="arrow-right-circle" size={22} color="#000" />
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* ── TEKLİF VER (Müteahhit) ── */}
                            {(!isOwner || isAdmin) && (
                                <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
                                    <TouchableOpacity activeOpacity={0.85} style={{ overflow: 'hidden', borderRadius: 18 }} onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}>
                                        <LinearGradient colors={['#D4AF37', '#B8860B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#000" />
                                            <Text allowFontScaling={false} style={{ color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>TEKLİF VER</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    {isOwner && isAdmin && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'center', opacity: 0.7 }}>
                                            <MaterialCommunityIcons name="shield-account" size={14} color="#666" />
                                            <Text allowFontScaling={false} style={{ color: '#666', fontSize: 11 }}>Admin Test Modu Aktif</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* ── SİL ── */}
                            {isOwner && (
                                <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
                                    <TouchableOpacity style={{ backgroundColor: 'rgba(239,68,68,0.07)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }} onPress={handleDeleteRequest}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                            <Text allowFontScaling={false} style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 }}>TALEBİ İPTAL ET / SİL</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </ScrollView>

                        <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                            <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }} onPress={() => setSelectedImage(null)}>
                                    <Ionicons name="close-circle" size={40} color="white" />
                                </TouchableOpacity>
                                {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '80%', resizeMode: 'contain' }} />}
                            </View>
                        </Modal>
                    </SafeAreaView>
                </View>
            );
        }
        // =============================================
        // TADILAT (anahtar_teslim_tadilat) - Devam eder
        // =============================================

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={['#000000', '#0D0D0D']} style={StyleSheet.absoluteFillObject} />
                <SafeAreaView style={{ flex: 1 }}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={styles.headerTitle}>TALEBİMİN DETAYI</Text>
                            <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity style={styles.backBtn}>
                            <Ionicons name="share-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                        
                        {/* 1. ÖZET KART */}
                        <LinearGradient colors={['#1F1F1F', '#111']} style={styles.mainSummaryCard}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={22} color="#FFD700" />
                                    <Text allowFontScaling={false} style={styles.summaryLabel}>KONUM</Text>
                                    <Text allowFontScaling={false} style={styles.summaryValue} numberOfLines={1}>{lokasyon}</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <MaterialCommunityIcons name="chart-line" size={22} color="#FFD700" />
                                    <Text allowFontScaling={false} style={styles.summaryLabel}>BÜTÇE</Text>
                                    <Text allowFontScaling={false} style={styles.summaryValue}>{butce}</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={22} color="#FFD700" />
                                    <Text allowFontScaling={false} style={styles.summaryLabel}>DURUM</Text>
                                    <Text allowFontScaling={false} style={styles.summaryValue}>{request.status === 'pending' || request.status === 'OPEN' ? 'TEKLİF BEKLENİYOR' : 'İŞLEMDE'}</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* 2. TEKNİK BİLGİLER */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleWrap}>
                                <MaterialCommunityIcons name="hammer-wrench" size={20} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.sectionTitle}>TEKNİK DETAYLAR</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.infoRow}>
                                <Text allowFontScaling={false} style={styles.infoLabel}>Proje Tipi</Text>
                                <Text allowFontScaling={false} style={styles.infoValue}>{projeTipi}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text allowFontScaling={false} style={styles.infoLabel}>Mevcut Durum</Text>
                                <Text allowFontScaling={false} style={[styles.infoValue, { color: '#FFD700' }]}>{durum}</Text>
                            </View>
                            
                            <View style={styles.separator} />
                            
                            <Text allowFontScaling={false} style={styles.subHeader}>YENİLENECEK ALANLAR</Text>
                            {teknikItems.length > 0 ? teknikItems.map((item, idx) => (
                                <View key={idx} style={styles.techItem}>
                                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFD700" />
                                    <Text allowFontScaling={false} style={styles.techItemText}>{item}</Text>
                                </View>
                            )) : (
                                <Text allowFontScaling={false} style={{ color: '#666', fontStyle: 'italic' }}>Kapsam belirtilmedi</Text>
                            )}
                        </View>

                        {/* 3. TASARIM */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleWrap}>
                                <MaterialCommunityIcons name="palette-swatch" size={20} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.sectionTitle}>MİMARİ TARZ TERCİHİ</Text>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.styleBox}>
                                <MaterialCommunityIcons name="pillar" size={32} color="#FFD700" />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>{tarz}</Text>
                                    <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Tadilat sonrası hedeflenen görünüm.</Text>
                                </View>
                            </View>
                        </View>

                        {/* 4. MEDYA */}
                        {request.current_situation_urls?.length > 0 || request.inspiration_urls?.length > 0 ? (
                            <>
                                {request.current_situation_urls?.length > 0 && (
                                    <>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleWrap}>
                                                <MaterialCommunityIcons name="camera-outline" size={20} color="#FFD700" />
                                                <Text allowFontScaling={false} style={styles.sectionTitle}>MEVCUT DURUM FOTOĞRAFLARI</Text>
                                            </View>
                                        </View>
                                        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                                {request.current_situation_urls.map((url, idx) => (
                                                    <TouchableOpacity key={`current-${idx}`} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                        <Image source={{ uri: url }} style={styles.galleryImg} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </>
                                )}

                                {request.inspiration_urls?.length > 0 && (
                                    <>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleWrap}>
                                                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFD700" />
                                                <Text allowFontScaling={false} style={styles.sectionTitle}>İLHAM ALINAN FOTOĞRAFLAR</Text>
                                            </View>
                                        </View>
                                        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                                {request.inspiration_urls.map((url, idx) => (
                                                    <TouchableOpacity key={`inspiration-${idx}`} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                        <Image source={{ uri: url }} style={styles.galleryImg} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.sectionTitleWrap}>
                                        <MaterialCommunityIcons name="camera-burst" size={20} color="#FFD700" />
                                        <Text allowFontScaling={false} style={styles.sectionTitle}>YÜKLENEN MEDYALAR</Text>
                                    </View>
                                </View>
                                <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                                    {hasPhotos ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 10 }}>
                                            {request.document_urls.map((url, idx) => (
                                                <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)} activeOpacity={0.9}>
                                                    <Image source={{ uri: url }} style={styles.galleryImg} />
                                                    <View style={styles.imgLabel}>
                                                        <Text allowFontScaling={false} style={styles.imgLabelText}>Görsel {idx + 1}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <View style={styles.emptyPhotos}>
                                            <MaterialCommunityIcons name="image-off-outline" size={32} color="#333" />
                                            <Text allowFontScaling={false} style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Görsel yüklenmemiş</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* 5. NOTLAR */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleWrap}>
                                <MaterialCommunityIcons name="message-text-outline" size={20} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.sectionTitle}>ÖZEL NOTLARIM</Text>
                            </View>
                        </View>
                        <View style={[styles.card, { marginBottom: 20 }]}>
                            <Text allowFontScaling={false} style={styles.notesText}>
                                "{notes}"
                            </Text>
                        </View>

                        {/* 6. GELEN TEKLİFLER BÖLÜMÜ */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleWrap}>
                                <MaterialCommunityIcons name="email-multiple-outline" size={20} color="#FFD700" />
                                <Text allowFontScaling={false} style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                            </View>
                        </View>

                        {constructionOffers.length === 0 ? (
                            <View style={styles.emptyBidsBox}>
                                <MaterialCommunityIcons name="timer-sand" size={32} color="#666" />
                                <Text allowFontScaling={false} style={styles.emptyText}>Henüz teklif gelmedi. Müteahhitler incelemeye devam ediyor.</Text>
                            </View>
                        ) : (
                            <View style={styles.offersContainer}>
                                <LinearGradient colors={['#1A1A1A', '#0A0A0A']} style={styles.offersHighlight}>
                                    <Text allowFontScaling={false} style={styles.offersCountText}>
                                        <Text style={{ color: '#FFD700', fontSize: 24 }}>{constructionOffers.length}</Text> ADET TEKLİF ALINDI
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.viewOffersBtn}
                                        onPress={() => {
                                            const grouped = {};
                                            constructionOffers.forEach(o => {
                                                if (!grouped[o.contractor_id]) grouped[o.contractor_id] = [];
                                                grouped[o.contractor_id].push(o);
                                            });
                                            const contractorIds = Object.keys(grouped);
                                            if (contractorIds.length === 1) {
                                                navigation.navigate('OfferDetail', {
                                                    request: request,
                                                    offers: grouped[contractorIds[0]],
                                                    contractor_id: contractorIds[0],
                                                    request_id: request.id
                                                });
                                            } else {
                                                navigation.navigate('MainTabs', { screen: 'Inbox' });
                                            }
                                        }}
                                    >
                                        <LinearGradient colors={['#FFD700', '#D4AF37']} style={styles.viewOffersGradient}>
                                            <Text allowFontScaling={false} style={styles.viewOffersBtnText}>TEKLİFLERİ İNCELE</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#000" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        )}

                        {/* 7. İŞLEMLER */}
                        {isOwner && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRequest}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                <Text allowFontScaling={false} style={styles.deleteBtnText}>TALEBİ İPTAL ET / SİL</Text>
                            </TouchableOpacity>
                        )}

                    </ScrollView>

                    {/* Modal for images */}
                    <Modal visible={!!selectedImage} transparent={true} animationType="fade">
                        <View style={styles.modalBg}>
                            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
                                <Ionicons name="close-circle" size={42} color="white" />
                            </TouchableOpacity>
                            <Image source={{ uri: selectedImage }} style={styles.modalImg} resizeMode="contain" />
                        </View>
                    </Modal>

                </SafeAreaView>
            </View>
        );
    }

    // --- MARKET DETAIL VIEW ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text allowFontScaling={false} style={styles.headerTitle}>TALEP DETAYI</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="cube-outline" size={32} color="#D4AF37" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text allowFontScaling={false} style={styles.title}>{request?.title || 'Talep Başlığı'}</Text>
                                <Text allowFontScaling={false} style={styles.date}>{new Date(request?.created_at).toLocaleDateString('tr-TR')} • {request?.location || 'Konum Belirtilmedi'}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View>
                                <Text allowFontScaling={false} style={styles.label}>BAŞVURU NO</Text>
                                <Text allowFontScaling={false} style={styles.value}>#{request?.id?.slice(0, 8).toUpperCase()}</Text>
                            </View>
                            <StatusBadge status={request?.status} />
                        </View>
                        {request?.image_url && (
                            <View style={{ marginTop: 16 }}>
                                <Text allowFontScaling={false} style={styles.label}>EKLENEN FOTOĞRAF</Text>
                                <Image source={{ uri: request.image_url }} style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#333' }} resizeMode="cover" />
                            </View>
                        )}
                        {request?.notes && (
                            <View style={{ marginTop: 16 }}>
                                <Text allowFontScaling={false} style={styles.label}>ÖZEL NOTLAR</Text>
                                <Text allowFontScaling={false} style={styles.noteText}>{request.notes}</Text>
                            </View>
                        )}
                    </View>

                    <Text allowFontScaling={false} style={styles.sectionTitle}>MALZEME LİSTESİ</Text>
                    {loading ? (
                        <ActivityIndicator color="#D4AF37" style={{ marginTop: 20 }} />
                    ) : (
                        <View style={{ gap: 12, marginBottom: 24 }}>
                            {items.map((item, index) => {
                                let displayName = item.product_name || '';
                                let brand = null;
                                let spec = null;
                                
                                const brandMatch = displayName.match(/\[Marka:\s(.*?)\]/);
                                if (brandMatch) {
                                    brand = brandMatch[1];
                                    displayName = displayName.replace(brandMatch[0], '').trim();
                                }
                                
                                const specMatch = displayName.match(/\[Özellik:\s(.*?)\]/);
                                if (specMatch) {
                                    spec = specMatch[1];
                                    displayName = displayName.replace(specMatch[0], '').trim();
                                }

                                return (
                                    <View key={item.id} style={{
                                        backgroundColor: '#0c0c0c',
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(212, 175, 55, 0.25)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        padding: 16
                                    }}>
                                        {/* Neon Sol Çizgi Efekti */}
                                        <LinearGradient
                                            colors={['#D4AF37', '#E8890C', 'transparent']}
                                            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 }}
                                        />

                                        {/* Üst Kısım: Ürün Adı ve Miktarı */}
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: (brand || spec || item.details) ? 14 : 0 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, paddingRight: 10 }}>
                                                {/* İkon / Sıra No */}
                                                <View style={{
                                                    width: 38,
                                                    height: 38,
                                                    borderRadius: 12,
                                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                                    borderWidth: 1,
                                                    borderColor: 'rgba(212, 175, 55, 0.3)',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 12
                                                }}>
                                                    <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900' }}>{index + 1}</Text>
                                                </View>

                                                {/* İsim */}
                                                <View style={{ flex: 1, justifyContent: 'center', minHeight: 38 }}>
                                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 17, fontWeight: '800', lineHeight: 22 }}>
                                                        {displayName}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Miktar */}
                                            <View style={{ alignItems: 'flex-end', paddingTop: 2 }}>
                                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 }}>MİKTAR</Text>
                                                <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 18, fontWeight: '900' }}>
                                                    {item.quantity}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        {/* Alt Kısım: Detaylar (Marka, Özellik) */}
                                        {(brand || spec || item.details) && (
                                            <View style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: 12,
                                                padding: 14,
                                                marginLeft: 50,
                                                borderWidth: 1,
                                                borderColor: 'rgba(255, 255, 255, 0.05)',
                                                gap: 8
                                            }}>
                                                {brand && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37', marginRight: 8 }} />
                                                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, width: 65, fontWeight: '600' }}>Marka:</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 14, fontWeight: 'bold', flex: 1 }}>{brand}</Text>
                                                    </View>
                                                )}
                                                {spec && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8', marginRight: 8 }} />
                                                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, width: 65, fontWeight: '600' }}>Özellik:</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 14, fontWeight: 'bold', flex: 1 }}>{spec}</Text>
                                                    </View>
                                                )}
                                                {item.details && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#a855f7', marginRight: 8, marginTop: 6 }} />
                                                        <Text allowFontScaling={false} style={{ color: '#888', fontSize: 13, width: 65, fontWeight: '600', marginTop: 1 }}>Not:</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 18, flex: 1 }}>{item.details}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {request?.status === 'COMPLETED' ? (
                        <>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                            <View style={styles.emptyBids}>
                                <Text allowFontScaling={false} style={styles.emptyText}>Bu talep için alım tamamlanmış.</Text>
                            </View>
                        </>
                    ) : bids.length === 0 ? (
                        <>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                            <View style={styles.emptyBids}>
                                <MaterialCommunityIcons name="timer-sand" size={32} color="#666" />
                                <Text allowFontScaling={false} style={styles.emptyText}>Henüz teklif gelmedi.</Text>
                            </View>
                        </>
                    ) : (
                        <View style={{ marginBottom: 40, marginTop: 10 }}>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                            
                            <View style={{
                                borderRadius: 24,
                                borderWidth: 1,
                                borderColor: 'rgba(212, 175, 55, 0.25)',
                                overflow: 'hidden',
                                elevation: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.8,
                                shadowRadius: 10,
                                position: 'relative'
                            }}>
                                {/* Kart Zemin Gradienti (Bozulmayan yapı) */}
                                <LinearGradient
                                    colors={['#17130A', '#0D0C09', '#050505']}
                                    style={{ ...StyleSheet.absoluteFillObject }}
                                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                />

                                {/* Üst Neon Çizgi Parıltısı */}
                                <LinearGradient
                                    colors={['rgba(212, 175, 55, 0)', 'rgba(212, 175, 55, 0.6)', 'rgba(212, 175, 55, 0)']}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10 }}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                />

                                <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, zIndex: 5 }}>
                                    
                                    {/* Zarif Altın İkon */}
                                    <View style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(212, 175, 55, 0.3)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16
                                    }}>
                                        <MaterialCommunityIcons name="email-multiple-outline" size={38} color="#E8B923" />
                                    </View>

                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginBottom: 24, textAlign: 'center' }}>
                                        <Text style={{ color: '#FFD700', fontSize: 28 }}>{bids.length}</Text> ADET TEKLİFİNİZ VAR
                                    </Text>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ width: '100%', overflow: 'hidden', borderRadius: 16 }}
                                        onPress={() => navigation.navigate('MarketOffers', { request: { ...request, items }, bids })}
                                    >
                                        <LinearGradient
                                            colors={['#D4AF37', '#E8890C']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                paddingVertical: 18,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 12
                                            }}
                                        >
                                            <Text allowFontScaling={false} style={{ color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }}>
                                                TEKLİFLERİ GÖRÜNTÜLE
                                            </Text>
                                            <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#000" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* OWNER ACTIONS - DELETE (MARKET) */}
                    {isOwner && (
                        <View style={{ gap: 12, marginTop: 20, marginBottom: 40 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    borderWidth: 1,
                                    borderColor: '#EF4444',
                                    borderRadius: 12,
                                    paddingVertical: 16,
                                    alignItems: 'center',
                                }}
                                onPress={handleDeleteRequest}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                    <Text allowFontScaling={false} style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>TALEBİ SİL</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: 20, paddingBottom: 50 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, marginBottom: 10 },
    headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
    
    // Legacy/Market Card Styles
    card: { backgroundColor: '#111', marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222', marginBottom: 25 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    date: { color: '#888', fontSize: 12, marginTop: 4 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
    infoLabel: { color: '#888', fontSize: 13, fontWeight: '600', width: 130 },
    infoValue: { color: '#FFF', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
    label: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
    value: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    noteText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
    
    // Professional Summary Card
    mainSummaryCard: { margin: 20, borderRadius: 24, paddingVertical: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center', flex: 1, paddingHorizontal: 5 },
    summaryLabel: { color: '#888', fontSize: 9, fontWeight: '900', marginTop: 8, letterSpacing: 1 },
    summaryValue: { color: '#FFF', fontSize: 12, fontWeight: '800', marginTop: 4, textAlign: 'center' },
    summaryDivider: { width: 1, height: 40, backgroundColor: '#333' },

    // Sections
    sectionHeader: { paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
    sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
    separator: { height: 1, backgroundColor: '#222', marginVertical: 15 },
    subHeader: { color: '#666', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15 },
    
    // Items
    techItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    techItemText: { color: '#DDD', fontSize: 14, fontWeight: '600', flex: 1 },
    styleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333' },
    
    // Gallery
    galleryImg: { width: 140, height: 140, borderRadius: 18, borderWidth: 1, borderColor: '#222' },
    imgLabel: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    imgLabelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    emptyPhotos: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#222' },
    
    // Notes
    notesText: { color: '#CCC', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
    
    // Offers/Bids
    offersContainer: { paddingHorizontal: 20, marginBottom: 30 },
    offersHighlight: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center' },
    offersCountText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },
    viewOffersBtn: { width: '100%', height: 54, borderRadius: 16, overflow: 'hidden' },
    viewOffersGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    viewOffersBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    
    emptyBidsBox: { marginHorizontal: 20, padding: 30, backgroundColor: '#0A0A0A', borderRadius: 20, borderWidth: 1, borderColor: '#222', alignItems: 'center', borderStyle: 'dashed' },
    emptyText: { color: '#666', fontSize: 13, marginTop: 12, textAlign: 'center', lineHeight: 20 },

    // Actions
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: 20 },
    deleteBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

    // Modal
    modalBg: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    modalImg: { width: '100%', height: '80%' },

    // Market Legacy (kept for safety)
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    itemsContainer: { backgroundColor: '#1A1A1A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333', marginBottom: 24 },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16 }
});
