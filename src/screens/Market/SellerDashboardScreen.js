import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';

const PAYMENT_LABELS = {
    'cash': 'Nakit Ödeme',
    'credit_card': 'Kredi Kartı',
    'check': 'Çek / Senet',
    'transfer': 'Havale / EFT'
};

const TERMS_OPTIONS = ['Peşin', '30 Gün Vade', '45 Gün Vade', '60 Gün Vade', '90 Gün Vade'];

export default function SellerDashboardScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'bids'

    // Data
    const [requests, setRequests] = useState([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Bid Form Data
    const [bidPrice, setBidPrice] = useState('');
    const [bidNotes, setBidNotes] = useState('');
    const [shippingIncluded, setShippingIncluded] = useState(false);
    const [paymentTerm, setPaymentTerm] = useState('Peşin');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        // In a real scenario, 'leads' would be filtered by seller's subscription
        // and 'bids' would be fetched from a 'market_bids' endpoint.
        const data = await MarketService.getOpenRequests();
        setRequests(data);
    };

    const openBidModal = (req) => {
        setSelectedRequest(req);
        setBidPrice('');
        setBidNotes('');
        setShippingIncluded(true); // Default to included
        setPaymentTerm('Peşin');
        setModalVisible(true);
    };

    const submitBid = async () => {
        if (!bidPrice) {
            Alert.alert("Eksik", "Lütfen birim fiyat giriniz.");
            return;
        }

        try {
            const result = await MarketService.submitBid({
                request_id: selectedRequest.id,
                price: parseFloat(bidPrice),
                notes: bidNotes,
                payment_terms: paymentTerm,
                shipping_included: shippingIncluded
            });

            if (result.success) {
                Alert.alert("Teklif İletildi", "Teklifiniz alıcıya başarıyla gönderildi.");
                setModalVisible(false);
                // Refresh list or move item to 'bids' tab locally
            } else {
                Alert.alert("Hata", "Teklif gönderilemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Bir sorun oluştu.");
        }
    };

    // --- RENDERERS ---

    const renderLeadsTab = () => (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {requests.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-text-search-outline" size={48} color="#334155" />
                    <Text style={styles.emptyText}>Şu an bölgenizde açık fırsat yok.</Text>
                </View>
            ) : (
                requests.map((req) => (
                    <View key={req.id} style={styles.leadCard}>
                        {/* Header: Title & Time */}
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.leadTitle}>{req.title || "İsimsiz Talep"}</Text>
                                <Text style={styles.leadTime}>
                                    <Ionicons name="time-outline" size={12} color="#64748b" /> {new Date(req.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • 2 Saat Kaldı
                                </Text>
                            </View>
                            <View style={styles.urgencyBadge}>
                                <Ionicons name="flame" size={14} color="#f59e0b" />
                            </View>
                        </View>

                        {/* Details Grid */}
                        <View style={styles.cardDetails}>
                            {/* Materials */}
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="dolly" size={16} color="#94a3b8" />
                                <Text style={styles.detailText}>
                                    {req.items ? req.items.map(i => `${i.quantity} ${i.product_name}`).join(', ') : 'Detay yok'}
                                </Text>
                            </View>

                            {/* Location */}
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                <Text style={styles.detailText}>{req.location || 'Konum belirtilmedi'}</Text>
                            </View>

                            {/* Payment Preference */}
                            <View style={styles.detailItem}>
                                <Ionicons name="wallet-outline" size={16} color="#94a3b8" />
                                <Text style={styles.detailText}>{PAYMENT_LABELS[req.payment_method] || 'Fark etmez'}</Text>
                            </View>
                        </View>

                        {/* Action */}
                        <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(req)}>
                            <Text style={styles.bidButtonText}>TEKLİF VER</Text>
                            <Ionicons name="arrow-forward" size={16} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </ScrollView>
    );

    const renderBidsTab = () => (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.funnelStats}>
                <View style={styles.funnelItem}>
                    <Text style={[styles.funnelCount, { color: '#fbbf24' }]}>3</Text>
                    <Text style={styles.funnelLabel}>Bekleyen</Text>
                </View>
                <View style={styles.funnelDivider} />
                <View style={styles.funnelItem}>
                    <Text style={[styles.funnelCount, { color: '#4ade80' }]}>1</Text>
                    <Text style={styles.funnelLabel}>Kazanılan</Text>
                </View>
                <View style={styles.funnelDivider} />
                <View style={styles.funnelItem}>
                    <Text style={[styles.funnelCount, { color: '#ef4444' }]}>5</Text>
                    <Text style={styles.funnelLabel}>Kaybedilen</Text>
                </View>
            </View>

            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Henüz aktif bir teklifiniz bulunmuyor.</Text>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Custom Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>HOŞGELDİNİZ</Text>
                        <Text style={styles.companyName}>Demir Dünyası A.Ş.</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>4.9 Mağaza Puanı</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.activeRegionBadge}>
                            <Ionicons name="map" size={12} color="#94a3b8" />
                            <Text style={styles.regionText}>Avrupa Yakası</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'leads' && styles.tabItemActive]}
                        onPress={() => setActiveTab('leads')}
                    >
                        <Text style={[styles.tabText, activeTab === 'leads' && styles.tabTextActive]}>FIRSATLAR (LEADS)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'bids' && styles.tabItemActive]}
                        onPress={() => setActiveTab('bids')}
                    >
                        <Text style={[styles.tabText, activeTab === 'bids' && styles.tabTextActive]}>TEKLİFLERİM</Text>
                        <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {activeTab === 'leads' ? renderLeadsTab() : renderBidsTab()}
                </View>

                {/* --- BID MODAL --- */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Hızlı Teklif Ver</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {selectedRequest && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Request Summary */}
                                    <View style={styles.summaryBox}>
                                        <Text style={styles.summaryTitle}>{selectedRequest.title}</Text>
                                        <Text style={styles.summarySub}>{selectedRequest.items ? selectedRequest.items[0]?.quantity : ''} • {selectedRequest.location}</Text>
                                    </View>

                                    {/* Form Fields */}
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Birim Fiyat (TL)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0.00"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
                                            value={bidPrice}
                                            onChangeText={setBidPrice}
                                        />
                                    </View>

                                    <View style={styles.rowGroup}>
                                        <Text style={styles.label}>Nakliye Dahil mi?</Text>
                                        <Switch
                                            value={shippingIncluded}
                                            onValueChange={setShippingIncluded}
                                            trackColor={{ false: "#334155", true: "#4ADE80" }}
                                            thumbColor="#fff"
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Ödeme Vadesi</Text>
                                        <View style={styles.chipsContainer}>
                                            {TERMS_OPTIONS.map(opt => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    style={[styles.chip, paymentTerm === opt && styles.chipActive]}
                                                    onPress={() => setPaymentTerm(opt)}
                                                >
                                                    <Text style={[styles.chipText, paymentTerm === opt && styles.chipTextActive]}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Satıcı Notu (Opsiyonel)</Text>
                                        <TextInput
                                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                            placeholder="Stok durumu, teslim süresi vb."
                                            placeholderTextColor="#475569"
                                            multiline
                                            value={bidNotes}
                                            onChangeText={setBidNotes}
                                        />
                                    </View>

                                    {/* Total Calculation Preview */}
                                    {bidPrice ? (
                                        <View style={styles.totalBox}>
                                            <Text style={styles.totalLabel}>Tahmini Toplam</Text>
                                            <Text style={styles.totalValue}>
                                                ₺{(parseFloat(bidPrice) * (parseFloat(selectedRequest.items[0]?.quantity?.split(' ')[0]) || 1)).toLocaleString('tr-TR')}
                                                <Text style={{ fontSize: 14, color: '#94a3b8' }}> + KDV</Text>
                                            </Text>
                                        </View>
                                    ) : null}

                                    <TouchableOpacity style={styles.submitBtn} onPress={submitBid}>
                                        <Text style={styles.submitBtnText}>TEKLİFİ GÖNDER</Text>
                                    </TouchableOpacity>
                                    <View style={{ height: 20 }} />
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    // Header
    header: { padding: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerTitle: { color: '#64748b', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
    companyName: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold' },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    ratingText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

    headerRight: { alignItems: 'flex-end', gap: 12 },
    activeRegionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
    regionText: { color: '#94a3b8', fontSize: 11 },
    closeBtn: { width: 36, height: 36, backgroundColor: '#334155', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

    // Tabs
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#334155' },
    tabItem: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    tabItemActive: { borderBottomColor: '#4ADE80' },
    tabText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
    tabTextActive: { color: '#4ADE80' },
    badge: { backgroundColor: '#ef4444', paddingHorizontal: 6, borderRadius: 10, minWidth: 20, alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

    // List & Cards
    listContainer: { padding: 20, paddingBottom: 100 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    emptyText: { color: '#475569', fontSize: 16 },

    leadCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    leadTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    leadTime: { color: '#94a3b8', fontSize: 12 },
    urgencyBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center' },

    cardDetails: { gap: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 16 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailText: { color: '#cbd5e1', fontSize: 14 },

    bidButton: { backgroundColor: '#4ADE80', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
    bidButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },

    // Funnel
    funnelStats: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
    funnelItem: { flex: 1, alignItems: 'center' },
    funnelCount: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
    funnelLabel: { color: '#64748b', fontSize: 12, textTransform: 'uppercase' },
    funnelDivider: { width: 1, backgroundColor: '#334155' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    summaryBox: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#4ADE80' },
    summaryTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 16 },
    summarySub: { color: '#94a3b8', marginTop: 4 },

    formGroup: { marginBottom: 20 },
    label: { color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 16 },

    rowGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },

    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
    chipActive: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
    chipText: { color: '#94a3b8', fontSize: 13 },
    chipTextActive: { color: '#0f172a', fontWeight: 'bold' },

    totalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 24, padding: 16, backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: 12 },
    totalLabel: { color: '#4ADE80', fontWeight: 'bold' },
    totalValue: { color: '#4ADE80', fontWeight: '900', fontSize: 18 },

    submitBtn: { backgroundColor: '#4ADE80', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#4ADE80', shadowOpacity: 0.3, shadowRadius: 10 },
    submitBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});
