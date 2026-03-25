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
    if (type === 'construction') {
        const isFlatForLand =
            request?.offer_type === 'kat_karsiligi' ||
            request?.offer_type === 'Kat Karşılığı' ||
            request?.offer_model === 'kat_karsiligi' ||
            request?.offer_model === 'Kat Karşılığı';

        const offerLabel = request?.offer_type === 'anahtar_teslim_tadilat' ? 'Anahtar Teslim Tadilat' :
                           isFlatForLand ? 'Kat Karşılığı' : 'Komple Yapım (Anahtar Teslim)';

        let tadilatDetails = { propertyType: '-', areaSize: '-', style: '-' };
        if (request?.offer_type === 'anahtar_teslim_tadilat' && request?.description) {
            const lines = request.description.split('\n');
            const mekanLine = lines.find(l => l.startsWith('MEKAN:'));
            const tarzLine = lines.find(l => l.startsWith('TARZ:'));
            if (mekanLine) {
                 const mekanPart = mekanLine.replace('MEKAN:', '').trim();
                 const split = mekanPart.split('(');
                 tadilatDetails.propertyType = split[0].trim();
                 tadilatDetails.areaSize = split.length > 1 ? split[1].replace(')', '').trim() : '-';
            }
            if (tarzLine) {
                 tadilatDetails.style = tarzLine.replace('TARZ:', '').trim();
            }
        }

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.headerTitle}>PROJE DETAYI</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {request.offer_type === 'anahtar_teslim_tadilat' ? (
                            <View style={{ backgroundColor: '#161616', borderRadius: 16, padding: 20, gap: 20, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <MaterialCommunityIcons name="home-edit" size={28} color="#FFD700" />
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Anahtar Teslim Tadilat</Text>
                                    </View>
                                    <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold' }}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                                    </View>
                                </View>
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                                    <View style={{ flex: 1, minWidth: '30%', gap: 4 }}>
                                        <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>MEKAN</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{tadilatDetails.propertyType}</Text>
                                    </View>
                                    <View style={{ flex: 1, minWidth: '30%', gap: 4 }}>
                                        <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>ALAN</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{tadilatDetails.areaSize}</Text>
                                    </View>
                                    <View style={{ flex: 1, minWidth: '30%', gap: 4 }}>
                                        <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>TARZ</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>{tadilatDetails.style}</Text>
                                    </View>
                                </View>

                                {request.description && (
                                    <View style={{ gap: 8 }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' }}>Ek Notlar</Text>
                                        <Text allowFontScaling={false} style={{ color: '#DDD', fontSize: 14, lineHeight: 20 }}>
                                            {request.description.split('NOT:')[1]?.trim() || '-'}
                                        </Text>
                                    </View>
                                )}

                                <View style={{ gap: 12 }}>
                                    <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' }}>Mevcut Alan & İlham</Text>
                                    {request.document_urls && request.document_urls.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                            {request.document_urls.map((url, idx) => (
                                                <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)}>
                                                    <Image source={{ uri: url }} style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#2A2A2A' }} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <View style={{ height: 100, borderRadius: 12, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="image-off-outline" size={24} color="#555" />
                                            <Text allowFontScaling={false} style={{ color: '#A0A0A0', fontSize: 12, marginTop: 8 }}>Görsel yüklenmemiş</Text>
                                        </View>
                                    )}
                                </View>

                                {isOwner && (
                                    <TouchableOpacity 
                                        style={{ backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
                                        activeOpacity={0.8}
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
                                        <Text allowFontScaling={false} style={{ color: '#121212', fontSize: 15, fontWeight: 'bold' }}>
                                            {constructionOffers.length > 0 ? `${constructionOffers.length} Gelen Teklifi Gör` : 'Gelen Teklifleri Gör'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <>

                        {/* 1. PROJECT CARD */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons 
                                    name={request.offer_type === 'anahtar_teslim_tadilat' ? "home-edit" : "office-building-cog"} 
                                    size={32} color="#D4AF37" 
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text allowFontScaling={false} style={styles.title}>{request.offer_type === 'anahtar_teslim_tadilat' ? 'Mimari Dönüşüm Merkezi' : 'Kentsel Dönüşüm Projesi'}</Text>
                                    <Text allowFontScaling={false} style={styles.date}>{request.offer_type === 'anahtar_teslim_tadilat' ? 'Tadilat & Yenileme' : `${request.district}, ${request.neighborhood}`}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <View>
                                    <Text allowFontScaling={false} style={styles.label}>PROJE NO</Text>
                                    <Text allowFontScaling={false} style={styles.value}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                                </View>
                                <StatusBadge status={request.status || 'pending'} />
                            </View>

                            {/* Yarısı Bizden Status (Hide for Tadilat) */}
                            {request.offer_type !== 'anahtar_teslim_tadilat' && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                                    <MaterialCommunityIcons
                                        name={request.is_campaign_active ? "check-circle" : "close-circle"}
                                        size={20}
                                        color={request.is_campaign_active ? "#34C759" : "#EF4444"}
                                    />
                                    <Text allowFontScaling={false} style={{ color: '#DDD', marginLeft: 8, fontWeight: 'bold' }}>
                                        {request.is_campaign_active ? 'Yarısı Bizden Kampanyasından Faydalanılacağı Belirtildi' : 'Yarısı Bizden Kampanyası Yok'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* 2. SPECS & UNITS (Conditionally Rendered) */}
                        {request.is_campaign_active && (
                            <View style={{ marginBottom: 20 }}>
                                <Text allowFontScaling={false} style={styles.sectionTitle}>YARISI DEVLETTEN DESTEĞİNDEN FAYDALANILACAK KONUT / TİCARİ SAYISI</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                        <Text allowFontScaling={false} style={[styles.label, { fontSize: 14 }]}>KONUT</Text>
                                        <Text allowFontScaling={false} style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_unit_count || 0}</Text>
                                    </View>
                                    <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                        <Text allowFontScaling={false} style={[styles.label, { fontSize: 14 }]}>TİCARİ</Text>
                                        <Text allowFontScaling={false} style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_commercial_count || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 3. OFFER TYPE */}
                        <View style={styles.card}>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>TEKLİF MODELİ</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <MaterialCommunityIcons name="handshake" size={24} color="#D4AF37" />
                                <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>{offerLabel}</Text>
                            </View>
                            {request.offer_type === 'kat_karsiligi' && (
                                <Text allowFontScaling={false} style={{ color: '#888', fontSize: 12, marginTop: 4, marginLeft: 34 }}>
                                    Müteahhit firma arsa payı/daire karşılığında projeyi üstlenir.
                                </Text>
                            )}
                        </View>

                        {/* 4. DETAILS - DESCRIPTION */}
                        {request.description && (
                            <View style={styles.card}>
                                <Text allowFontScaling={false} style={styles.sectionTitle}>PROJE NOTLARI & DETAYLAR</Text>
                                <Text allowFontScaling={false} style={styles.noteText}>{request.description}</Text>
                            </View>
                        )}

                        {/* 5. LOCATION & LAND INFO */}
                        <View style={styles.card}>
                            <Text allowFontScaling={false} style={styles.sectionTitle}>TAPU VE KONUM BİLGİLERİ</Text>
                            <View style={{ marginTop: 10, gap: 12 }}>
                                <View style={styles.infoRow}>
                                    <Text allowFontScaling={false} style={{ color: '#888' }}>İl / İlçe:</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontWeight: 'bold' }}>{request.city} / {request.district}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text allowFontScaling={false} style={{ color: '#888' }}>Mahalle:</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontWeight: 'bold' }}>{request.neighborhood}</Text>
                                </View>
                                {request.offer_type !== 'anahtar_teslim_tadilat' && (
                                    <>
                                        <View style={[styles.divider, { marginVertical: 8, height: 1, backgroundColor: '#333' }]} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text allowFontScaling={false} style={styles.label}>ADA</Text>
                                                <Text allowFontScaling={false} style={styles.value}>{request.ada}</Text>
                                            </View>
                                            <View>
                                                <Text allowFontScaling={false} style={styles.label}>PARSEL</Text>
                                                <Text allowFontScaling={false} style={styles.value}>{request.parsel}</Text>
                                            </View>
                                            <View>
                                                <Text allowFontScaling={false} style={styles.label}>PAFTA</Text>
                                                <Text allowFontScaling={false} style={styles.value}>{request.pafta || '-'}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                                {request.full_address && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text allowFontScaling={false} style={styles.label}>AÇIK ADRES</Text>
                                        <Text allowFontScaling={false} style={{ color: '#CCC', fontSize: 13 }}>{request.full_address}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* 6. DOCUMENTS & IMAGES */}
                        <Text allowFontScaling={false} style={styles.sectionTitle}>BELGELER VE GÖRSELLER</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
                            {request.deed_image_url && (
                                <TouchableOpacity onPress={() => setSelectedImage(request.deed_image_url)} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri: request.deed_image_url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text allowFontScaling={false} style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Tapu Görseli</Text>
                                </TouchableOpacity>
                            )}

                            {request.document_urls && request.document_urls.length > 0 && request.document_urls.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri: url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text allowFontScaling={false} style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Belge #{idx + 1}</Text>
                                </TouchableOpacity>
                            ))}

                            {(!request.deed_image_url && (!request.document_urls || request.document_urls.length === 0)) && (
                                <View style={{ width: '100%', padding: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 12 }}>
                                    <MaterialCommunityIcons name="image-off-outline" size={32} color="#444" />
                                    <Text allowFontScaling={false} style={{ color: '#666', marginTop: 8 }}>Belge yüklenmemiş</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* 7. OFFERS SUMMARY */}
                        {isOwner && (
                            <View style={{ marginBottom: 30 }}>
                                <Text allowFontScaling={false} style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                                {constructionOffers.length === 0 ? (
                                    <View style={styles.emptyBids}>
                                        <MaterialCommunityIcons name="timer-sand" size={32} color="#666" />
                                        <Text allowFontScaling={false} style={styles.emptyText}>Henüz teklif gelmedi. Müteahhitler projenizi inceliyor.</Text>
                                    </View>
                                ) : (
                                    <View style={styles.card}>
                                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                                <MaterialCommunityIcons name="email-multiple-outline" size={30} color="#D4AF37" />
                                            </View>
                                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
                                                {constructionOffers.length} Adet Teklifiniz Var
                                            </Text>
                                            <Text allowFontScaling={false} style={{ color: '#888', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                                                Gelen tekliflerin detaylarını incelemek için Gelen Kutusu'na gidiniz.
                                            </Text>

                                            <TouchableOpacity
                                                style={{
                                                    marginTop: 20,
                                                    backgroundColor: '#D4AF37',
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 24,
                                                    borderRadius: 24,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}
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
                                                <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold' }}>TEKLİFLERİ İNCELE</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}


                            </>
                        )}
                        {/* OWNER ACTIONS - DELETE */}
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

                        {/* OFFER BUTTON */}
                        {(!isOwner || isAdmin) && (
                            <View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#D4AF37',
                                        borderRadius: 12,
                                        paddingVertical: 16,
                                        alignItems: 'center',
                                        marginTop: isOwner ? 0 : 20,
                                        marginBottom: 40,
                                    }}
                                    onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#000" />
                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>TEKLİF VER</Text>
                                    </View>
                                </TouchableOpacity>

                                {isOwner && isAdmin && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -20, marginBottom: 20, justifyContent: 'center', opacity: 0.7 }}>
                                        <MaterialCommunityIcons name="shield-account" size={14} color="#666" />
                                        <Text allowFontScaling={false} style={{ color: '#666', fontSize: 11 }}>Admin Test Modu Aktif</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Ionicons name="close-circle" size={40} color="white" />
                            </TouchableOpacity>
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={{ width: '100%', height: '80%', resizeMode: 'contain' }}
                                />
                            )}
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
    headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
    card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333', marginBottom: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    date: { color: '#888', fontSize: 12, marginTop: 4 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
    value: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'System' },
    noteText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    sectionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginLeft: 4, letterSpacing: 1, textTransform: 'uppercase' },
    itemsContainer: { backgroundColor: '#1A1A1A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333', marginBottom: 24 },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    itemBorder: { borderBottomWidth: 1, borderBottomColor: '#252525' },
    itemIndex: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#333' },
    indexText: { color: '#666', fontSize: 10, fontWeight: 'bold' },
    itemName: { color: '#FFF', fontSize: 15, fontWeight: '500' },
    itemDetail: { color: '#666', fontSize: 12, marginTop: 2 },
    itemQty: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold' },
    emptyBids: { alignItems: 'center', padding: 30, backgroundColor: '#111', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
    emptyText: { color: '#666', fontSize: 13, marginTop: 10, textAlign: 'center' },
    bidCard: { padding: 16, backgroundColor: '#1A1A1A', marginBottom: 10, borderRadius: 12 }
});
