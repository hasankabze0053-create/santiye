import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { ConstructionService } from '../../services/ConstructionService';

export default function RequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { request } = route.params || {};
    const type = route.params?.type || request?.type; // Support both ways

    const [items, setItems] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Get current user to check ownership
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id);
        });

        if (request?.id) {
            // Only fetch items if it's a MARKET request
            if (type !== 'construction') {
                fetchDetails();
            } else {
                setLoading(false); // No extra items to fetch for construction yet
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
                .select('*, provider:providers(company_name)')
                .eq('request_id', request.id);

            if (bidsError) console.log("Bids fetch note:", bidsError.message);
            setBids(bidsData || []);

        } catch (error) {
            console.error('Detail fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

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
                        const { success, error } = await ConstructionService.deleteRequest(request.id);
                        setLoading(false);
                        if (success) {
                            Alert.alert('Başarılı', 'Talep başarıyla silindi.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } else {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu: ' + error?.message);
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
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {status === 'OPEN' || status === 'pending' ? 'TEKLİF BEKLENİYOR' : status}
            </Text>
        </View>
    );

    // --- CONSTRUCTION DETAIL VIEW ---
    if (type === 'construction') {
        const offerLabel = request.offer_type === 'kat_karsiligi' ? 'Kat Karşılığı' : 'Komple Yapım (Anahtar Teslim)';
        const isOwner = currentUserId && request.user_id === currentUserId;

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
                        <Text style={styles.headerTitle}>PROJE DETAYI</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* 1. PROJECT CARD */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="office-building-cog" size={32} color="#D4AF37" />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.title}>Kentsel Dönüşüm Projesi</Text>
                                    <Text style={styles.date}>{request.district}, {request.neighborhood}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <View>
                                    <Text style={styles.label}>PROJE NO</Text>
                                    <Text style={styles.value}>#{request.id?.slice(0, 8).toUpperCase()}</Text>
                                </View>
                                <StatusBadge status={request.status || 'pending'} />
                            </View>

                            {/* Yarısı Bizden Status */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                                <MaterialCommunityIcons
                                    name={request.is_campaign_active ? "check-circle" : "close-circle"}
                                    size={20}
                                    color={request.is_campaign_active ? "#34C759" : "#EF4444"}
                                />
                                <Text style={{ color: '#DDD', marginLeft: 8, fontWeight: 'bold' }}>
                                    {request.is_campaign_active ? '"Yarısı Bizden" Kampanyasından Faydalanılıyor' : '"Yarısı Bizden" Kampanyası Yok'}
                                </Text>
                            </View>
                        </View>

                        {/* 2. SPECS & UNITS */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                <Text style={styles.label}>KONUT SAYISI</Text>
                                <Text style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_unit_count || 0}</Text>
                            </View>
                            <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                <Text style={styles.label}>TİCARİ SAYISI</Text>
                                <Text style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_commercial_count || 0}</Text>
                            </View>
                        </View>

                        {/* 3. OFFER TYPE */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>TEKLİF MODELİ</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <MaterialCommunityIcons name="handshake" size={24} color="#D4AF37" />
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>{offerLabel}</Text>
                            </View>
                            {request.offer_type === 'kat_karsiligi' && (
                                <Text style={{ color: '#888', fontSize: 12, marginTop: 4, marginLeft: 34 }}>
                                    Müteahhit firma arsa payı/daire karşılığında projeyi üstlenir.
                                </Text>
                            )}
                        </View>

                        {/* 4. DETAILS - DESCRIPTION */}
                        {request.description && (
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>PROJE NOTLARI & DETAYLAR</Text>
                                <Text style={styles.noteText}>{request.description}</Text>
                            </View>
                        )}

                        {/* 5. LOCATION & LAND INFO */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>TAPU VE KONUM BİLGİLERİ</Text>
                            <View style={{ marginTop: 10, gap: 12 }}>
                                <View style={styles.infoRow}>
                                    <Text style={{ color: '#888' }}>İl / İlçe:</Text>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{request.city} / {request.district}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={{ color: '#888' }}>Mahalle:</Text>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{request.neighborhood}</Text>
                                </View>
                                <View style={styles.divider} style={{ marginVertical: 8, height: 1, backgroundColor: '#333' }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={styles.label}>ADA</Text>
                                        <Text style={styles.value}>{request.ada}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.label}>PARSEL</Text>
                                        <Text style={styles.value}>{request.parsel}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.label}>PAFTA</Text>
                                        <Text style={styles.value}>{request.pafta || '-'}</Text>
                                    </View>
                                </View>
                                {request.full_address && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={styles.label}>AÇIK ADRES</Text>
                                        <Text style={{ color: '#CCC', fontSize: 13 }}>{request.full_address}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* 6. DOCUMENTS & IMAGES */}
                        <Text style={styles.sectionTitle}>BELGELER VE GÖRSELLER</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 30 }}>
                            {/* Legacy Single Image */}
                            {request.deed_image_url && (
                                <View>
                                    <Image
                                        source={{ uri: request.deed_image_url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Tapu Görseli</Text>
                                </View>
                            )}

                            {/* New Multiple Images */}
                            {request.document_urls && request.document_urls.length > 0 && request.document_urls.map((url, idx) => (
                                <View key={idx}>
                                    <Image
                                        source={{ uri: url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Belge #{idx + 1}</Text>
                                </View>
                            ))}

                            {(!request.deed_image_url && (!request.document_urls || request.document_urls.length === 0)) && (
                                <View style={{ width: '100%', padding: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 12 }}>
                                    <MaterialCommunityIcons name="image-off-outline" size={32} color="#444" />
                                    <Text style={{ color: '#666', marginTop: 8 }}>Belge yüklenmemiş</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* DELETE BUTTON (Only for Owner) */}
                        {isOwner && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    borderWidth: 1,
                                    borderColor: '#EF4444',
                                    borderRadius: 12,
                                    paddingVertical: 16,
                                    alignItems: 'center',
                                    marginTop: 20,
                                    marginBottom: 40
                                }}
                                onPress={handleDeleteRequest}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                    <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>BU TALEBİ SİL</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    // --- MARKET DETAIL VIEW (Legacy) ---
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
                    <Text style={styles.headerTitle}>TALEP DETAYI</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Main Info Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="cube-outline" size={32} color="#D4AF37" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.title}>{request?.title || 'Talep Başlığı'}</Text>
                                <Text style={styles.date}>{new Date(request?.created_at).toLocaleDateString('tr-TR')} • {request?.location || 'Konum Belirtilmedi'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View>
                                <Text style={styles.label}>BAŞVURU NO</Text>
                                <Text style={styles.value}>#{request?.id?.slice(0, 8).toUpperCase()}</Text>
                            </View>
                            <StatusBadge status={request?.status} />
                        </View>

                        {/* Request Image */}
                        {request?.image_url && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.label}>EKLENEN FOTOĞRAF</Text>
                                <Image
                                    source={{ uri: request.image_url }}
                                    style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#333' }}
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        {request?.notes && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.label}>ÖZEL NOTLAR</Text>
                                <Text style={styles.noteText}>{request.notes}</Text>
                            </View>
                        )}
                    </View>

                    {/* Items List */}
                    <Text style={styles.sectionTitle}>MALZEME LİSTESİ</Text>
                    {loading ? (
                        <ActivityIndicator color="#D4AF37" style={{ marginTop: 20 }} />
                    ) : (
                        <View style={styles.itemsContainer}>
                            {items.map((item, index) => (
                                <View key={item.id} style={[styles.itemRow, index !== items.length - 1 && styles.itemBorder]}>
                                    <View style={styles.itemIndex}>
                                        <Text style={styles.indexText}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.product_name}</Text>
                                        {item.details && <Text style={styles.itemDetail}>{item.details}</Text>}
                                    </View>
                                    <Text style={styles.itemQty}>{item.quantity}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Bids Section (Placeholder for now) */}
                    <Text style={styles.sectionTitle}>GELEN TEKLİFLER ({bids.length})</Text>
                    {bids.length === 0 ? (
                        <View style={styles.emptyBids}>
                            <MaterialCommunityIcons name="timer-sand" size={32} color="#666" />
                            <Text style={styles.emptyText}>Henüz teklif gelmedi. Tedarikçiler talebini inceliyor.</Text>
                        </View>
                    ) : (
                        bids.map(bid => (
                            <View key={bid.id} style={styles.bidCard}>
                                <Text style={{ color: '#fff' }}>Teklif: {bid.price} {bid.currency}</Text>
                            </View>
                        ))
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
    label: { color: '#666', fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
    value: { color: '#DDD', fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },
    noteText: { color: '#CCC', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    sectionTitle: { color: '#666', fontSize: 12, fontWeight: '900', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
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
