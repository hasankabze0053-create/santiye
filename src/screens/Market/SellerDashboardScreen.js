import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarketService } from '../../services/MarketService';

const PAYMENT_LABELS = {
    'cash': 'Nakit Ödeme',
    'credit_card': 'Kredi Kartı',
    'check': 'Çek / Senet',
    'transfer': 'Havale / EFT'
};

const TERMS_OPTIONS = ['EFT', '30 Gün Vade', '45 Gün Vade', '60 Gün Vade', '90 Gün Vade'];

export default function SellerDashboardScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'bids'

    // Data
    const [requests, setRequests] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [archivedRequests, setArchivedRequests] = useState([]); // Array of request IDs

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Bid Form Data
    const [bidPrice, setBidPrice] = useState('');
    const [bidNotes, setBidNotes] = useState('');
    const [shippingType, setShippingType] = useState('Dahil');
    const [shippingFee, setShippingFee] = useState('');
    const [paymentTerm, setPaymentTerm] = useState('Peşin');
    const [vatIncluded, setVatIncluded] = useState(false);
    const [offerBrand, setOfferBrand] = useState('');
    const [offerTechSpec, setOfferTechSpec] = useState('');

    // View Bid Modal State
    const [viewBidModalVisible, setViewBidModalVisible] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [openReqs, userBids] = await Promise.all([
            MarketService.getOpenRequests(),
            MarketService.getMyBids()
        ]);
        setRequests(openReqs);
        setMyBids(userBids);
    };

    const handleArchive = (reqId) => {
        setArchivedRequests(prev => [...prev, reqId]);
    };

    const handleRestore = (reqId) => {
        setArchivedRequests(prev => prev.filter(id => id !== reqId));
    };

    const getRequestedPaymentTerm = (req) => {
        if (!req) return null;
        if (req.payment_method === 'check' || req?.notes?.includes('İstenen Vade:')) {
            const match = req.notes?.match(/İstenen Vade:\s*(.*?)\]/);
            if (match) return match[1];
        }
        if (req.payment_method === 'credit_card') return 'Kredi Kartı';
        if (req.payment_method === 'cash_transfer') return 'EFT';
        return null;
    };

    const parseBidNotes = (notes) => {
        if (!notes) return {};
        const parsed = {};
        
        // Parse KDV
        if (notes.includes('KDV: Dahil')) parsed.vatIncluded = true;
        else if (notes.includes('KDV: Hariç')) parsed.vatIncluded = false;
        
        // Parse Shipping
        if (notes.includes('Nakliye Durumu: Alıcı Öder')) parsed.shippingType = 'Alıcı Öder';
        else if (notes.includes('Nakliye Durumu: Hariç')) parsed.shippingType = 'Hariç';
        else parsed.shippingType = 'Dahil';
        
        const shipCostMatch = notes.match(/\+ (\d+) TL Nakliye/);
        if (shipCostMatch) parsed.shippingFee = shipCostMatch[1];
        
        // Parse Stock (Wait doesn't apply to generic sellers historically, but logic handles it if present)
        if (notes.includes('Stok Durumu: Hemen Teslim')) parsed.stockStatus = 'immediate';
        else if (notes.includes('Stok Durumu: 2-3 Gün')) parsed.stockStatus = 'wait';
        
        // Parse Validity
        const validityMatch = notes.match(/Teklif Geçerlilik: (\d+) Saat/);
        if (validityMatch) parsed.validity = parseInt(validityMatch[1], 10);
        
        // Parse Brand & Tech Spec
        const brandMatch = notes.match(/\[Marka:\s*(.*?)\]/);
        if (brandMatch) parsed.offerBrand = brandMatch[1];
        
        const specMatch = notes.match(/\[Özellik:\s*(.*?)\]/);
        if (specMatch) parsed.offerTechSpec = specMatch[1];

        return parsed;
    };

    // Helper to render Name + Badges from product_name
    const renderProductWithBadges = (rawName, isTitle = false, hideCleanName = false, hideBadges = false) => {
        if (!rawName) return <Text allowFontScaling={false} style={isTitle ? styles.leadTitle : styles.detailText}>Belirtilmedi</Text>;

        let cleanName = rawName;
        let brand = null;
        let spec = null;

        const brandMatch = cleanName.match(/\[Marka:\s*(.*?)\]/);
        if (brandMatch) {
            brand = brandMatch[1];
            cleanName = cleanName.replace(brandMatch[0], '').trim();
        }

        const specMatch = cleanName.match(/\[Özellik:\s*(.*?)\]/);
        if (specMatch) {
            spec = specMatch[1];
            cleanName = cleanName.replace(specMatch[0], '').trim();
        }

        return (
            <View>
                {!hideCleanName && <Text allowFontScaling={false} style={isTitle ? styles.leadTitle : styles.detailText}>{cleanName}</Text>}
                {(!hideBadges && (brand || spec)) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: isTitle ? 8 : 4 }}>
                        {brand && (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                                <Ionicons name="pricetag" size={14} color="#38bdf8" style={{ marginTop: 2 }} />
                                <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 14, fontWeight: '700', flexShrink: 1 }}>İstenen Marka: {brand}</Text>
                            </View>
                        )}
                        {spec && (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(244, 114, 182, 0.1)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(244, 114, 182, 0.2)' }}>
                                <Ionicons name="options" size={14} color="#f472b6" style={{ marginTop: 2 }} />
                                <Text allowFontScaling={false} style={{ color: '#f472b6', fontSize: 14, fontWeight: '700', flexShrink: 1 }}>İstenen Özellik: {spec}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const openBidModal = (req) => {
        setSelectedRequest(req);
        setBidPrice('');
        setBidNotes('');
        setShippingType('Dahil');
        setShippingFee('');
        setVatIncluded(false);
        
        const reqVade = getRequestedPaymentTerm(req);
        setPaymentTerm(reqVade || 'EFT');
        setOfferBrand('');
        setOfferTechSpec('');
        
        setModalVisible(true);
    };

    const submitBid = async () => {
        if (!bidPrice) {
            Alert.alert("Eksik", "Lütfen birim fiyat giriniz.");
            return;
        }

        let enrichedNotes = `[KDV: ${vatIncluded ? 'Dahil' : 'Hariç'}] [Nakliye: ${shippingType}]`;
        if (shippingType === 'Alıcı Öder' && shippingFee) {
            enrichedNotes += ` [Nakliye Ücreti: ${shippingFee} TL]`;
        }
        if (offerBrand && offerBrand.trim()) enrichedNotes += ` [Marka: ${offerBrand.trim()}]`;
        if (offerTechSpec && offerTechSpec.trim()) enrichedNotes += ` [Özellik: ${offerTechSpec.trim()}]`;

        if (bidNotes) {
            enrichedNotes += ` | Notlar: ${bidNotes}`;
        }

        try {
            const result = await MarketService.submitBid({
                request_id: selectedRequest.id,
                price: parseFloat(bidPrice),
                notes: enrichedNotes,
                payment_terms: paymentTerm,
                shipping_type: shippingType,
                shipping_cost: shippingType === 'Alıcı Öder' ? shippingFee : null,
                vat_included: vatIncluded
            });

            if (result.success) {
                setSuccessModalVisible(true);
                setModalVisible(false);
                loadData(); // Re-fetch to populate myBids
            } else {
                Alert.alert("Hata", "Teklif gönderilemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Bir sorun oluştu.");
        }
    };

    // --- RENDERERS ---

    const renderLeadsTab = () => {
        // Filter out archived requests AND requests the user has already bid on for the main feed
        // Alternative bids are meant to be added from the "Tekliflerim" (My Bids) section.
        const activeRequests = requests.filter(req => !archivedRequests.includes(req.id));

        return (
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {activeRequests.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-text-search-outline" size={48} color="#334155" />
                    <Text allowFontScaling={false} style={styles.emptyText}>Şu an bölgenizde açık fırsat yok.</Text>
                </View>
            ) : (
                activeRequests.map((req) => (
                    <View key={req.id} style={styles.leadCard}>
                        {/* Header: Title & Time */}
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                                    <View style={{ flex: 1 }}>
                                        {renderProductWithBadges(req.title || "İsimsiz Talep", true)}
                                    </View>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                                        <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 10, fontWeight: 'bold' }}>#{req.id.substring(0,8).toUpperCase()}</Text>
                                    </View>
                                </View>
                                <Text allowFontScaling={false} style={styles.leadTime}>
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
                                <MaterialCommunityIcons name="dolly" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                                <View style={{ flex: 1 }}>
                                    {renderProductWithBadges(req.items ? req.items.map(i => `${i.quantity} ${i.product_name}`).join(', ') : 'Detay yok')}
                                </View>
                            </View>

                            {/* Location */}
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.detailText}>{req.location || 'Konum belirtilmedi'}</Text>
                            </View>

                            {/* Payment Preference */}
                            <View style={styles.detailItem}>
                                <Ionicons name="wallet-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.detailText}>{PAYMENT_LABELS[req.payment_method] || 'Fark etmez'}</Text>
                            </View>
                        </View>

                        {/* Action */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                            <TouchableOpacity style={[styles.bidButton, { backgroundColor: '#1e293b', flex: 1 }]} onPress={() => handleArchive(req.id)}>
                                <Text allowFontScaling={false} style={[styles.bidButtonText, { color: '#94a3b8' }]}>Arşivle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.bidButton, { flex: 2 }]} onPress={() => openBidModal(req)}>
                                <Text allowFontScaling={false} style={styles.bidButtonText}>TALEBİ İNCELE</Text>
                                <Ionicons name="arrow-forward" size={16} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
        );
    };

    const renderArchivedTab = () => {
        const archivedList = requests.filter(req => archivedRequests.includes(req.id));

        return (
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {archivedList.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="archive-outline" size={48} color="#334155" />
                    <Text allowFontScaling={false} style={styles.emptyText}>Henüz arşivlenen talep yok.</Text>
                </View>
            ) : (
                archivedList.map((req) => (
                    <View key={req.id} style={[styles.leadCard, { opacity: 0.6 }]}>
                        {/* Header: Title & Time */}
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                                    <View style={{ flex: 1 }}>
                                        {renderProductWithBadges(req.title || "İsimsiz Talep", true)}
                                    </View>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                                        <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 10, fontWeight: 'bold' }}>#{req.id.substring(0,8).toUpperCase()}</Text>
                                    </View>
                                </View>
                                <Text allowFontScaling={false} style={styles.leadTime}>
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
                                <MaterialCommunityIcons name="dolly" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                                <View style={{ flex: 1 }}>
                                    {renderProductWithBadges(req.items ? req.items.map(i => `${i.quantity} ${i.product_name}`).join(', ') : 'Detay yok')}
                                </View>
                            </View>

                            {/* Location */}
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.detailText}>{req.location || 'Konum belirtilmedi'}</Text>
                            </View>

                            {/* Payment Preference */}
                            <View style={styles.detailItem}>
                                <Ionicons name="wallet-outline" size={16} color="#94a3b8" />
                                <Text allowFontScaling={false} style={styles.detailText}>{PAYMENT_LABELS[req.payment_method] || 'Fark etmez'}</Text>
                            </View>
                        </View>

                        {/* Action - Archive View overrides to "Geri Al" and still has "TALEBİ İNCELE" */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                            <TouchableOpacity style={[styles.bidButton, { backgroundColor: '#1e293b', flex: 1 }]} onPress={() => handleRestore(req.id)}>
                                <Text allowFontScaling={false} style={[styles.bidButtonText, { color: '#F59E0B' }]}>Geri Al</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.bidButton, { flex: 2 }]} onPress={() => openBidModal(req)}>
                                <Text allowFontScaling={false} style={styles.bidButtonText}>TALEBİ İNCELE</Text>
                                <Ionicons name="arrow-forward" size={16} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
        );
    };

    const renderBidsTab = () => {
        return (
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {myBids.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color="#334155" />
                        <Text allowFontScaling={false} style={styles.emptyText}>Henüz verdiğiniz bir teklif bulunmuyor.</Text>
                    </View>
                ) : (
                    myBids.map(bid => {
                        const statusColor = bid.status === 'ACCEPTED' ? '#4ade80' : bid.status === 'REJECTED' ? '#ef4444' : '#f59e0b';
                        const statusBg = bid.status === 'ACCEPTED' ? 'rgba(74, 222, 128, 0.15)' : bid.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                        const statusText = bid.status === 'ACCEPTED' ? 'KABUL EDİLDİ' : bid.status === 'REJECTED' ? 'REDDEDİLDİ' : 'BEKLEMEDE';

                        return (
                            <View key={bid.id} style={[styles.leadCard, { borderColor: `rgba(${statusColor === '#4ade80' ? '74, 222, 128' : statusColor === '#ef4444' ? '239, 68, 68' : '245, 158, 11'}, 0.3)` }]}>
                                {/* Header: Title & Time */}
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                                            <View style={{ flex: 1 }}>
                                                {renderProductWithBadges(bid.request?.title || "İsimsiz Talep", true)}
                                            </View>
                                            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                                                <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 10, fontWeight: 'bold' }}>#{bid.request_id.substring(0,8).toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <Text allowFontScaling={false} style={styles.leadTime}>
                                            <Ionicons name="time-outline" size={12} color="#64748b" /> {new Date(bid.created_at).toLocaleDateString('tr-TR')} - {new Date(bid.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <View style={[styles.urgencyBadge, { backgroundColor: statusBg, width: 'auto', paddingHorizontal: 10, borderRadius: 8 }]}>
                                        <Text allowFontScaling={false} style={{ color: statusColor, fontSize: 11, fontWeight: 'bold' }}>{statusText}</Text>
                                    </View>
                                </View>

                                {/* Details Grid */}
                                <View style={[styles.cardDetails, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                    <View style={styles.detailItem}>
                                        <MaterialCommunityIcons name="dolly" size={16} color="#94a3b8" />
                                        <Text allowFontScaling={false} style={styles.detailText}>
                                            {bid.request?.items ? bid.request.items.map(i => `${i.quantity} ${i.product_name}`).join(', ') : 'Detay yok'}
                                        </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                        <Text allowFontScaling={false} style={styles.detailText}>{bid.request?.location || 'Konum belirtilmedi'}</Text>
                                    </View>
                                    <View style={[styles.detailItem, { marginTop: 8 }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <MaterialCommunityIcons name="currency-try" size={18} color="#4ADE80" />
                                        </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>TEKLİFİNİZ (BİRİM)</Text>
                                            <Text allowFontScaling={false} style={[styles.detailValue, { color: '#4ADE80', fontWeight: 'bold' }]}>{bid.price.toLocaleString('tr-TR')} ₺</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Alternate Option Badge Check */}
                                    {bid.notes && (bid.notes.includes('[Marka:') || bid.notes.includes('[Özellik:')) && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, alignSelf: 'flex-start' }}>
                                            <Ionicons name="pricetag" size={12} color="#A3A3A3" />
                                            <Text allowFontScaling={false} style={{ color: '#A3A3A3', fontSize: 11, fontWeight: '600' }}>Özel Seçenekli Teklif</Text>
                                        </View>
                                    )}
                                </View>
                                {/* Action */}
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155', gap: 10 }}>
                                    <TouchableOpacity 
                                        style={[styles.bidButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4ADE80', flex: 1 }]} 
                                        onPress={() => {
                                            setSelectedBid(bid);
                                            setViewBidModalVisible(true);
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%' }}>
                                            <Text allowFontScaling={false} style={[styles.bidButtonText, { color: '#4ADE80' }]}>TEKLİF DETAYI</Text>
                                            <Ionicons name="eye-outline" size={16} color="#4ADE80" />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.bidButton, { flex: 1 }]} onPress={() => openBidModal({ ...bid.request, id: bid.request_id })}>
                                        <LinearGradient
                                            colors={['#FFD700', '#FF9100']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={[styles.gradientBtn, { borderWidth: 0, gap: 8 }]}
                                        >
                                            <Text allowFontScaling={false} style={[styles.bidButtonText, { color: '#000' }]}>ALTERNATİF SUN</Text>
                                            <Ionicons name="add-circle-outline" size={16} color="#000" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                
                {/* HEADERS */}
                <View style={styles.header}>
                    <View>
                        <Text allowFontScaling={false} style={styles.headerTitle}>TEDARİKÇİ PANELİ</Text>
                        <Text allowFontScaling={false} style={styles.companyName}>Firma Adı</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text allowFontScaling={false} style={styles.ratingText}>4.8 / 5.0</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.activeRegionBadge}>
                            <Ionicons name="location" size={12} color="#94a3b8" />
                            <Text allowFontScaling={false} style={styles.regionText}>Ümraniye</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* TABS */}
                <View style={styles.tabBar}>
                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'leads' && styles.tabItemActive]}
                        onPress={() => setActiveTab('leads')}
                    >
                        <Text allowFontScaling={false} style={[styles.tabText, activeTab === 'leads' && styles.tabTextActive]}>FIRSATLAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'bids' && styles.tabItemActive]}
                        onPress={() => setActiveTab('bids')}
                    >
                        <Text allowFontScaling={false} style={[styles.tabText, activeTab === 'bids' && styles.tabTextActive]}>TEKLİFLERİM</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'archived' && styles.tabItemActive]}
                        onPress={() => setActiveTab('archived')}
                    >
                        <Text allowFontScaling={false} style={[styles.tabText, activeTab === 'archived' && styles.tabTextActive]}>ARŞİV</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'leads' ? renderLeadsTab() : activeTab === 'bids' ? renderBidsTab() : renderArchivedTab()}

                {/* --- QUICK BID MODAL --- */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text allowFontScaling={false} style={styles.modalTitle}>Hızlı Teklif Ver</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                    <Ionicons name="close" size={26} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexShrink: 1 }}>
                                    {selectedRequest && (
                                        <ScrollView 
                                            showsVerticalScrollIndicator={false} 
                                            keyboardShouldPersistTaps="handled" 
                                            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
                                            style={{ maxHeight: '100%' }}
                                        >
                                            <View style={[styles.summaryBox, { backgroundColor: '#1C1C1E', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#FFD700', padding: 18, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6, borderWidth: 0 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>{selectedRequest.title}</Text>
                                                </View>
                                                {selectedRequest.items && selectedRequest.items[0] && renderProductWithBadges(selectedRequest.items[0].product_name, false, true)}

                                                <View style={{ marginVertical: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 0 }} />

                                                <View style={{ flexDirection: 'row', gap: 24 }}>
                                                    <View>
                                                        <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>MİKTAR</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{selectedRequest.items ? selectedRequest.items[0]?.quantity : '-'} {selectedRequest.items ? selectedRequest.items[0]?.unit : ''}</Text>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>TESLİMAT YERİ</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: '800' }} selectable>{selectedRequest.location.replace('(Varsayılan)', '').trim()}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* SELLER PROPOSAL: BRAND & TECH SPEC */}
                                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                    <Text allowFontScaling={false} style={[styles.label, { marginBottom: 8 }]} numberOfLines={1}>Sizin Markanız (Ops.)</Text>
                                                    <TextInput allowFontScaling={false} style={[styles.input, { height: 48, backgroundColor: '#0A0A0A', padding: 10 }]} placeholder="Örn: Akçansa" placeholderTextColor="#525252" value={offerBrand} onChangeText={setOfferBrand} />
                                                </View>
                                                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                    <Text allowFontScaling={false} style={[styles.label, { marginBottom: 8 }]} numberOfLines={1}>Sizin Özelliğiniz (Ops.)</Text>
                                                    <TextInput allowFontScaling={false} style={[styles.input, { height: 48, backgroundColor: '#0A0A0A', padding: 10 }]} placeholder="Örn: 10mm Nervürlü" placeholderTextColor="#525252" value={offerTechSpec} onChangeText={setOfferTechSpec} />
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Birim Fiyat (Adet/Kg)</Text>
                                                <View>
                                                    <TextInput allowFontScaling={false} style={[styles.input, { fontSize: 24, fontWeight: 'bold', paddingVertical: 12 }]} placeholder="0.00" placeholderTextColor="#525252" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />

                                                    {/* Buttons Row: VAT (Left) - Price (Right) */}
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
                                                        {/* VAT Toggles */}
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <TouchableOpacity onPress={() => setVatIncluded(false)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: !vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: !vatIncluded ? '#FFD700' : '#404040' }}>
                                                                <Text allowFontScaling={false} style={{ color: !vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>KDV</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setVatIncluded(true)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: vatIncluded ? '#FFD700' : '#404040' }}>
                                                                <Text allowFontScaling={false} style={{ color: vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>KDV Dahil</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                        {/* Total Price */}
                                                        {bidPrice ? (
                                                            <View style={{ alignItems: 'flex-end', flex: 1, paddingLeft: 10 }}>
                                                                <Text allowFontScaling={false} style={{ color: '#F1F5F9', fontSize: 13, marginBottom: 4, fontWeight: '700' }}>TOPLAM TUTAR</Text>
                                                                {(() => {
                                                                    const q = selectedRequest.items?.[0]?.quantity;
                                                                    let parsedQ = 0;
                                                                    if (typeof q === 'number') parsedQ = q;
                                                                    else if (typeof q === 'string') {
                                                                        const numPart = q.trim().split(/\s+/)[0];
                                                                        parsedQ = parseFloat(numPart.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
                                                                    }
                                                                    
                                                                    return (
                                                                        <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900', textAlign: 'right' }} numberOfLines={1} adjustsFontSizeToFit>
                                                                            ≈ {((parseFloat(bidPrice) || 0) * parsedQ).toLocaleString('tr-TR')} TL{vatIncluded ? '' : <Text allowFontScaling={false} style={{ fontSize: 14, color: '#94a3b8' }}> KDV</Text>}
                                                                        </Text>
                                                                    );
                                                                })()}
                                                            </View>
                                                        ) : <View style={{ flex: 1 }} />}
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Teslimat / Nakliye Durumu</Text>
                                                <View style={styles.chipsContainer}>
                                                    <TouchableOpacity onPress={() => setShippingType('Dahil')} style={[styles.chip, shippingType === 'Dahil' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Dahil' && styles.chipTextActive]}>Dahil</Text></TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setShippingType('Hariç')} style={[styles.chip, shippingType === 'Hariç' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Hariç' && styles.chipTextActive]}>Hariç</Text></TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setShippingType('Alıcı Öder')} style={[styles.chip, shippingType === 'Alıcı Öder' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Alıcı Öder' && styles.chipTextActive]}>Alıcı Öder</Text></TouchableOpacity>
                                                </View>
                                                
                                                {shippingType === 'Alıcı Öder' && (
                                                    <View style={{ marginTop: 12 }}>
                                                        <Text allowFontScaling={false} style={styles.label}>Nakliye Ücreti (TL)</Text>
                                                        <TextInput allowFontScaling={false} style={styles.input} placeholder="Örn: 2500" placeholderTextColor="#525252" keyboardType="numeric" value={shippingFee} onChangeText={setShippingFee} />
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Ödeme Vadesi</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                    {(() => {
                                                        const reqVade = getRequestedPaymentTerm(selectedRequest);
                                                        const optionsToRender = [...TERMS_OPTIONS];
                                                        if (reqVade && !optionsToRender.includes(reqVade)) optionsToRender.splice(2, 0, reqVade);
                                                        return optionsToRender.map(opt => (
                                                            <TouchableOpacity
                                                                key={opt}
                                                                style={[
                                                                    styles.chip,
                                                                    { flexDirection: 'column', paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
                                                                    paymentTerm === opt && styles.chipActive,
                                                                    reqVade === opt && paymentTerm !== opt && { borderColor: '#4ADE80', borderWidth: 1, backgroundColor: 'rgba(74, 222, 128, 0.1)' }
                                                                ]}
                                                                onPress={() => {
                                                                    if (reqVade && opt !== reqVade && paymentTerm !== opt) {
                                                                        Alert.alert(
                                                                            "Vade Uyarısı",
                                                                            `Alıcı bu talep için "${reqVade}" vade istemiştir. Siz farklı bir teklif (${opt}) veriyorsunuz, devam etmek istiyor musunuz?`,
                                                                            [
                                                                                { text: "Vazgeç", style: 'cancel' },
                                                                                { text: `Evet, ${opt}`, onPress: () => setPaymentTerm(opt) }
                                                                            ]
                                                                        );
                                                                    } else {
                                                                        setPaymentTerm(opt);
                                                                    }
                                                                }}
                                                            >
                                                                <Text allowFontScaling={false} style={[ styles.chipText, paymentTerm === opt && styles.chipTextActive, reqVade === opt && paymentTerm !== opt && { color: '#4ADE80', fontWeight: 'bold' } ]}>{opt}</Text>
                                                                {opt !== 'EFT' && opt !== 'Kredi Kartı' && (
                                                                    <Text allowFontScaling={false} style={{ fontSize: 10, marginTop: 2, fontWeight: '600', color: paymentTerm === opt ? '#000' : (reqVade === opt && paymentTerm !== opt ? '#4ADE80' : '#737373') }}>Çek / Senet</Text>
                                                                )}
                                                            </TouchableOpacity>
                                                        ));
                                                    })()}
                                                </ScrollView>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Satıcı Notu (Opsiyonel)</Text>
                                                <TextInput allowFontScaling={false} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Müşteriye iletmek istediğiniz özel notlar..." placeholderTextColor="#525252" multiline={true} value={bidNotes} onChangeText={setBidNotes} />
                                            </View>

                                            <TouchableOpacity style={styles.submitBtn} onPress={submitBid}>
                                                <Text allowFontScaling={false} style={styles.submitBtnText}>TEKLİFİ GÖNDER</Text>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    )}
                                </View>
                        </View>
                    </View>
                </Modal>

                {/* --- READ-ONLY BID DETAILS MODAL --- */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={viewBidModalVisible}
                    onRequestClose={() => setViewBidModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text allowFontScaling={false} style={styles.modalTitle}>Teklif Detayları</Text>
                                <TouchableOpacity onPress={() => setViewBidModalVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedBid && selectedBid.request && (() => {
                                    const req = selectedBid.request;
                                    const parsedOptions = parseBidNotes(selectedBid.notes);
                                    
                                    // Parse total
                                    const q = req.items?.[0]?.quantity;
                                    let parsedQ = 0;
                                    if (typeof q === 'number') parsedQ = q;
                                    else if (typeof q === 'string') {
                                        parsedQ = parseFloat(q.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
                                    }
                                    const unitPrice = parseFloat(selectedBid.price) || 0;
                                    const totalAmnt = unitPrice * parsedQ;

                                    return (
                                        <View>
                                            <View style={styles.summaryBox}>
                                                <Text allowFontScaling={false} style={styles.summaryTitle} numberOfLines={2}>{req.title}</Text>
                                                <Text allowFontScaling={false} style={styles.summarySub}>{req.items?.[0]?.quantity} {req.items?.[0]?.unit} • {req.location.replace('(Varsayılan)', '').trim()}</Text>
                                            </View>

                                            {(parsedOptions.offerBrand || parsedOptions.offerTechSpec) && (
                                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                                    {parsedOptions.offerBrand && (
                                                        <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}>
                                                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>TEDARİKÇİ MARKASI</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{parsedOptions.offerBrand}</Text>
                                                        </View>
                                                    )}
                                                    {parsedOptions.offerTechSpec && (
                                                        <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}>
                                                            <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>TEDARİKÇİ ÖZELLİĞİ</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{parsedOptions.offerTechSpec}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Birim Fiyat (Adet/Kg)</Text>
                                                <View style={[styles.input, { justifyContent: 'center' }]}>
                                                    <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{selectedBid.price}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.rowGroup}>
                                                <View>
                                                    <Text allowFontScaling={false} style={styles.label}>KDV Durumu</Text>
                                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                                        <View style={[styles.chip, !parsedOptions.vatIncluded && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, !parsedOptions.vatIncluded && styles.chipTextActive]}>KDV</Text></View>
                                                        <View style={[styles.chip, parsedOptions.vatIncluded && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.vatIncluded && styles.chipTextActive]}>KDV Dahil</Text></View>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.totalBox}>
                                                <Text allowFontScaling={false} style={styles.totalLabel}>TOPLAM TUTAR</Text>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text allowFontScaling={false} style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>≈ {totalAmnt.toLocaleString('tr-TR')} TL</Text>
                                                    {!parsedOptions.vatIncluded && <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 13 }}>KDV</Text>}
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Stok Durumu</Text>
                                                <View style={styles.chipsContainer}>
                                                    <View style={[styles.chip, parsedOptions.stockStatus === 'immediate' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.stockStatus === 'immediate' && styles.chipTextActive]}>Hemen Teslim</Text></View>
                                                    <View style={[styles.chip, parsedOptions.stockStatus === 'wait' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.stockStatus === 'wait' && styles.chipTextActive]}>2-3 Gün</Text></View>
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text allowFontScaling={false} style={styles.label}>Teslimat / Nakliye Durumu</Text>
                                                <View style={styles.chipsContainer}>
                                                    <View style={[styles.chip, parsedOptions.shippingType === 'Dahil' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.shippingType === 'Dahil' && styles.chipTextActive]}>Dahil</Text></View>
                                                    <View style={[styles.chip, parsedOptions.shippingType === 'Hariç' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.shippingType === 'Hariç' && styles.chipTextActive]}>Hariç</Text></View>
                                                    <View style={[styles.chip, parsedOptions.shippingType === 'Alıcı Öder' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, parsedOptions.shippingType === 'Alıcı Öder' && styles.chipTextActive]}>Alıcı Öder</Text></View>
                                                </View>
                                                {parsedOptions.shippingType === 'Alıcı Öder' && (
                                                    <View style={{ marginTop: 12 }}>
                                                        <Text allowFontScaling={false} style={styles.label}>Tahmini Nakliye (TL)</Text>
                                                        <View style={[styles.input, { justifyContent: 'center' }]}>
                                                            <Text allowFontScaling={false} style={{ color: '#fff' }}>{parsedOptions.shippingFee || '-'}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            <View style={[styles.formGroup, { marginTop: 12 }]}>
                                                <Text allowFontScaling={false} style={styles.label}>Ödeme Vadesi</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                    {TERMS_OPTIONS.map(opt => {
                                                        const isSelected = selectedBid.notes && selectedBid.notes.includes(opt);
                                                        return (
                                                            <View key={opt} style={[styles.chip, isSelected && styles.chipActive]}>
                                                                <Text allowFontScaling={false} style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt}</Text>
                                                            </View>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>

                                            <View style={[styles.formGroup, { marginTop: 12 }]}>
                                                <Text allowFontScaling={false} style={styles.label}>Teklif Geçerlilik Süresi</Text>
                                                <View style={styles.chipsContainer}>
                                                    {[24, 48, 168].map(h => (
                                                        <View key={h} style={[styles.chip, parsedOptions.validity === h && styles.chipActive]}>
                                                            <Text allowFontScaling={false} style={[styles.chipText, parsedOptions.validity === h && styles.chipTextActive]}>{h === 168 ? '1 Hafta' : h + ' Saat'}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>

                                            <TouchableOpacity 
                                                style={{ 
                                                    marginTop: 24, 
                                                    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                                                    borderWidth: 1, 
                                                    borderColor: '#D4AF37', 
                                                    paddingVertical: 14, 
                                                    borderRadius: 12, 
                                                    alignItems: 'center',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    gap: 8
                                                }} 
                                                onPress={() => {
                                                    setViewBidModalVisible(false);
                                                    openBidModal(req);
                                                }}
                                            >
                                                <Ionicons name="add-circle-outline" size={20} color="#D4AF37" />
                                                <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 14 }}>YENİ ALTERNATİF TEKLİF SUN</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#334155', marginTop: 12 }]} onPress={() => setViewBidModalVisible(false)}>
                                                <Text allowFontScaling={false} style={[styles.submitBtnText, { color: '#f8fafc' }]}>KAPAT</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })()}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* --- PREMIUM SUCCESS MODAL --- */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisible}
                    onRequestClose={() => setSuccessModalVisible(false)}
                >
                    <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 24 }]}>
                        <View style={[styles.modalContent, { height: 'auto', padding: 32, alignItems: 'center', borderRadius: 24 }]}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(74, 222, 128, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                                <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
                            </View>
                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Başarılı</Text>
                            <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 32 }}>Teklifiniz başarıyla iletildi. Müşteri değerlendirmesi sonrası tarafınıza dönüş yapılacaktır.</Text>
                            <TouchableOpacity 
                                style={[styles.submitBtn, { width: '100%' }]}
                                onPress={() => setSuccessModalVisible(false)}
                            >
                                <Text allowFontScaling={false} style={styles.submitBtnText}>TAMAM</Text>
                            </TouchableOpacity>
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', paddingTop: 60 },
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
