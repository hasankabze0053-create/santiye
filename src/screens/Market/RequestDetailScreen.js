import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
                    console.log('DEBUG: Current User ID:', user.id);
                    console.log('DEBUG: Request User ID:', request?.user_id);
                    console.log('DEBUG: Is Owner:', user.id === request?.user_id);
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
                .select('*, profiles:contractor_id(full_name, avatar_url)')
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

    const handleCompleteRequest = () => {
        Alert.alert(
            'Talebi Dondur',
            'Bu talebi dondurmak istediğinize emin misiniz? Talep pasife alınacak ve yeni tekliflere kapatılacaktır.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Evet, Dondur',
                    style: 'default',
                    onPress: async () => {
                        setLoading(true);
                        const { error } = await supabase
                            .from('construction_requests')
                            .update({ status: 'frozen' }) // Using 'frozen' or 'inactive' status
                            .eq('id', request.id);

                        setLoading(false);
                        if (!error) {
                            Alert.alert('Başarılı', 'Talep donduruldu.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } else {
                            Alert.alert('Hata', 'İşlem başarısız oldu: ' + error?.message);
                        }
                    }
                }
            ]
        );
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
        // Robust check for Flat for Land
        const isFlatForLand =
            request?.offer_type === 'kat_karsiligi' ||
            request?.offer_type === 'Kat Karşılığı' ||
            request?.offer_model === 'kat_karsiligi' ||
            request?.offer_model === 'Kat Karşılığı';

        const offerLabel = isFlatForLand ? 'Kat Karşılığı' : 'Komple Yapım (Anahtar Teslim)';
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
                                    {request.is_campaign_active ? 'Yarısı Bizden Kampanyasından Faydalanılacağı Belirtildi' : 'Yarısı Bizden Kampanyası Yok'}
                                </Text>
                            </View>
                        </View>

                        {/* 2. SPECS & UNITS (Conditionally Rendered) */}
                        {request.is_campaign_active && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.sectionTitle}>YARISI DEVLETTEN DESTEĞİNDEN FAYDALANILACAK KONUT / TİCARİ SAYISI</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                        <Text style={[styles.label, { fontSize: 14 }]}>KONUT</Text>
                                        <Text style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_unit_count || 0}</Text>
                                    </View>
                                    <View style={[styles.card, { flex: 1, marginBottom: 0, padding: 15 }]}>
                                        <Text style={[styles.label, { fontSize: 14 }]}>TİCARİ</Text>
                                        <Text style={[styles.value, { fontSize: 24, color: '#FDCB58' }]}>{request.campaign_commercial_count || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

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
                                <View style={[styles.divider, { marginVertical: 8, height: 1, backgroundColor: '#333' }]} />
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
                                <TouchableOpacity onPress={() => setSelectedImage(request.deed_image_url)} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri: request.deed_image_url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Tapu Görseli</Text>
                                </TouchableOpacity>
                            )}

                            {/* New Multiple Images */}
                            {request.document_urls && request.document_urls.length > 0 && request.document_urls.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setSelectedImage(url)} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri: url }}
                                        style={{ width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}
                                    />
                                    <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Belge #{idx + 1}</Text>
                                </TouchableOpacity>
                            ))}

                            {(!request.deed_image_url && (!request.document_urls || request.document_urls.length === 0)) && (
                                <View style={{ width: '100%', padding: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 12 }}>
                                    <MaterialCommunityIcons name="image-off-outline" size={32} color="#444" />
                                    <Text style={{ color: '#666', marginTop: 8 }}>Belge yüklenmemiş</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* 7. OFFERS SUMMARY (For Owner) - UPDATED AS PER REQUEST */}
                        {isOwner && (
                            <View style={{ marginBottom: 30 }}>
                                <Text style={styles.sectionTitle}>GELEN TEKLİFLER</Text>
                                {constructionOffers.length === 0 ? (
                                    <View style={styles.emptyBids}>
                                        <MaterialCommunityIcons name="timer-sand" size={32} color="#666" />
                                        <Text style={styles.emptyText}>Henüz teklif gelmedi. Müteahhitler projenizi inceliyor.</Text>
                                    </View>
                                ) : (
                                    <View style={styles.card}>
                                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                                <MaterialCommunityIcons name="email-multiple-outline" size={30} color="#D4AF37" />
                                            </View>
                                            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
                                                {constructionOffers.length} Adet Teklifiniz Var
                                            </Text>
                                            <Text style={{ color: '#888', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
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
                                                onPress={() => navigation.navigate('MainTabs', { screen: 'Operations', params: { screen: 'Inbox' } })}
                                            >
                                                <Text style={{ color: '#000', fontWeight: 'bold' }}>TEKLİFLERİ İNCELE</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* OWNER ACTIONS - DELETE/FREEZE */}
                        {isOwner && (
                            <View style={{ gap: 12, marginTop: 20, marginBottom: 40 }}>
                                {/* FREEZE REQUEST BUTTON */}
                                {request.status !== 'frozen' && request.status !== 'completed' && (
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: 'rgba(56, 189, 248, 0.1)', // Light Blue Tint
                                            borderWidth: 1,
                                            borderColor: '#38BDF8', // Light Blue
                                            borderRadius: 12,
                                            paddingVertical: 16,
                                            alignItems: 'center',
                                        }}
                                        onPress={handleCompleteRequest}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialCommunityIcons name="snowflake" size={20} color="#38BDF8" />
                                            <Text style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: 16 }}>TALEBİ DONDUR</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {/* DELETE BUTTON */}
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
                                        <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>TALEBİ SİL</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* OFFER BUTTON (For Non-Owners OR Admins testing their own requests) */}
                        {(!isOwner || isAdmin) && (
                            <View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#D4AF37', // Gold color
                                        borderRadius: 12,
                                        paddingVertical: 16,
                                        alignItems: 'center',
                                        marginTop: isOwner ? 0 : 20,
                                        marginBottom: 40,
                                        shadowColor: '#D4AF37',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}
                                    onPress={() => navigation.navigate('ConstructionOfferSubmit', { request })}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#000" />
                                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>TEKLİF VER</Text>
                                    </View>
                                </TouchableOpacity>

                                {isOwner && isAdmin && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -20, marginBottom: 20, justifyContent: 'center', opacity: 0.7 }}>
                                        <MaterialCommunityIcons name="shield-account" size={14} color="#666" />
                                        <Text style={{ color: '#666', fontSize: 11 }}>Admin Test Modu Aktif</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* FULL SCREEN IMAGE MODAL */}
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

    // Updated Styles
    label: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
    value: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'System' }, // Removed monospace, increased size and white color
    noteText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 }, // White and easier to read

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    // Updated Section Title (Gold)
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
