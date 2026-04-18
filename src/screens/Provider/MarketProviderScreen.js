import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';

const { width } = Dimensions.get('window');

const PAYMENT_LABELS = {
    'cash': 'Nakit',
    'credit_card': 'K. Kartı',
    'check': 'Çek/Senet',
    'transfer': 'Havale'
};

const TERMS_OPTIONS = ['EFT', 'Kredi Kartı'];

export default function MarketProviderScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'bids'

    // Data
    const [requests, setRequests] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [archivedRequests, setArchivedRequests] = useState([]); // Store IDs of archived requests
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [bidNotes, setBidNotes] = useState('');
    const [shippingIncluded, setShippingIncluded] = useState(false);
    const [paymentTerm, setPaymentTerm] = useState('Peşin');
    // New Bid Fields
    const [pumpFee, setPumpFee] = useState('');
    const [shippingType, setShippingType] = useState('Dahil'); // 'Dahil', 'Hariç', 'Alıcı Öder'
    const [shippingFee, setShippingFee] = useState('');
    const [stockStatus, setStockStatus] = useState('immediate'); // 'immediate', 'wait', 'custom'
    const [stockCustom, setStockCustom] = useState(''); // free-text for custom stock status
    const [validity, setValidity] = useState('24'); // '24', '48', '168', 'custom'
    const [validityCustom, setValidityCustom] = useState(''); // free-text for custom validity
    const [pendingOffers, setPendingOffers] = useState([]); // locally saved alternatives, not yet sent
    const [vatIncluded, setVatIncluded] = useState(false);
    const [offerBrand, setOfferBrand] = useState('');
    const [offerTechSpec, setOfferTechSpec] = useState(''); // false: +KDV, true: KDV Dahil

    // View Bid Modal State
    const [viewBidModalVisible, setViewBidModalVisible] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [offerActionSheet, setOfferActionSheet] = useState(null); // { index, offer } or null

    // Per-group active bid index: { [requestId]: number }
    const [bidIndexMap, setBidIndexMap] = useState({});

    // --- REGION SETTINGS LOGIC ---
    const [regionModalVisible, setRegionModalVisible] = useState(false);
    const [sellerType, setSellerType] = useState('CONCRETE'); // 'CONCRETE' or 'MATERIAL'
    const [serviceRadius, setServiceRadius] = useState(30); // km for concrete
    const [shippingScope, setShippingScope] = useState('city'); // 'district', 'city', 'country'

    const sellerInfo = {
        name: 'Demir Dünyası A.Ş.',
        rating: 4.9,
        location: 'Avrupa Yakası',
        isVerified: true
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setRefreshing(true);
            const [openReqs, userBids] = await Promise.all([
                MarketService.getOpenRequests(),
                MarketService.getMyBids()
            ]);
            setRequests(openReqs || []);
            setMyBids(userBids || []);
        } catch (error) {
            console.warn('MarketProviderScreen loadData error:', error);
        } finally {
            setRefreshing(false);
        }
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
        
        // Parse Pump
        const pumpMatch = notes.match(/Pompa Ücreti: (\d+)/);
        if (pumpMatch) parsed.pumpFee = pumpMatch[1];
        
        // Parse Shipping
        if (notes.includes('Nakliye Durumu: Alıcı Öder')) parsed.shippingType = 'Alıcı Öder';
        else if (notes.includes('Nakliye Durumu: Hariç')) parsed.shippingType = 'Hariç';
        else parsed.shippingType = 'Dahil';
        
        const shipCostMatch = notes.match(/\+ (\d+) TL Nakliye/);
        if (shipCostMatch) parsed.shippingFee = shipCostMatch[1];
        
        // Parse Stock
        if (notes.includes('Stok Durumu: Hemen Teslim')) parsed.stockStatus = 'immediate';
        else if (notes.includes('Stok Durumu: 2-3 Gün')) parsed.stockStatus = 'wait';
        else {
            const customStockMatch = notes.match(/Stok Durumu: (.+?)\|/);
            if (customStockMatch) { parsed.stockStatus = 'custom'; parsed.stockCustom = customStockMatch[1]; }
        }
        
        // Parse Validity
        const validityMatch = notes.match(/Teklif Geçerlilik: (.+?)\|/);
        if (validityMatch) parsed.validity = validityMatch[1];
        
        // Parse Brand & Tech Spec
        const brandMatch = notes.match(/\[Marka:\s*(.*?)\]/);
        if (brandMatch) parsed.offerBrand = brandMatch[1];
        
        const specMatch = notes.match(/\[Özellik:\s*(.*?)\]/);
        if (specMatch) parsed.offerTechSpec = specMatch[1];

        return parsed;
    };

    // Helper to render Name + Badges from product_name
    const renderProductWithBadges = (rawName, hideCleanName = false, hideBadges = false) => {
        if (!rawName) return <Text allowFontScaling={false} style={styles.detailValue}>Belirtilmedi</Text>;

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
                {!hideCleanName && <Text allowFontScaling={false} style={styles.detailValue}>{cleanName}</Text>}
                {(!hideBadges && (brand || spec)) ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
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
                ) : null}
            </View>
        );
    };

    const openBidModal = (req) => {
        setSelectedRequest(req);
        setBidPrice('');
        setBidNotes('');
        setShippingIncluded(false);
        
        const reqVade = getRequestedPaymentTerm(req);
        setPaymentTerm(reqVade || 'EFT');

        // Reset new fields
        setPumpFee('');
        setShippingType('Dahil');
        setShippingFee('');
        setStockCustom('');
        setValidityCustom('');
        setPendingOffers([]);
        setModalVisible(true);
    };

    // --- OFFER HELPERS (Alternative Offer Flow) ---

    // Snapshot current form into a plain object
    const captureCurrentOffer = () => ({
        bidPrice, vatIncluded, shippingType, shippingFee,
        stockStatus, stockCustom, validity, validityCustom,
        paymentTerm, offerBrand, offerTechSpec, pumpFee, bidNotes,
    });

    // Build the notes string from a snapshot (matches parseBidNotes format)
    const buildNotesFromOffer = (offer) => {
        let notes = `[KDV: ${offer.vatIncluded ? 'Dahil' : 'Hariç'}] [Nakliye: ${offer.shippingType}]`;
        if (offer.shippingType === 'Alıcı Öder' && offer.shippingFee) {
            notes += ` [Nakliye Ücreti: ${offer.shippingFee} TL]`;
        }
        const stockLabel = offer.stockStatus === 'immediate' ? 'Hemen Teslim' : offer.stockStatus === 'wait' ? '2-3 Gün' : (offer.stockCustom?.trim() || 'Diğer');
        if (offer.stockStatus) notes += ` | Stok Durumu: ${stockLabel}|`;
        const validityLabel = offer.validity === '24' ? '24 Saat' : offer.validity === '48' ? '48 Saat' : offer.validity === '168' ? '1 Hafta' : (offer.validityCustom?.trim() || 'Belirtilmedi');
        if (offer.validity) notes += ` | Teklif Geçerlilik: ${validityLabel}|`;
        if (offer.offerBrand?.trim()) notes += ` [Marka: ${offer.offerBrand.trim()}]`;
        if (offer.offerTechSpec?.trim()) notes += ` [Özellik: ${offer.offerTechSpec.trim()}]`;
        if (offer.bidNotes) notes += ` | Notlar: ${offer.bidNotes}`;
        return notes;
    };

    // Reset form fields for a fresh entry
    const resetOfferForm = () => {
        setBidPrice('');
        setVatIncluded(false);
        setShippingType('Dahil');
        setShippingFee('');
        setStockStatus('immediate');
        setStockCustom('');
        setValidity('24');
        setValidityCustom('');
        setPaymentTerm('EFT');
        setOfferBrand('');
        setOfferTechSpec('');
        setPumpFee('');
        setBidNotes('');
    };

    // Build MarketService-compatible payload from a snapshot
    const buildBidPayload = (offer, requestId) => ({
        request_id: requestId,
        price: parseFloat(offer.bidPrice),
        notes: buildNotesFromOffer(offer),
        payment_terms: offer.paymentTerm,
        pump_fee: parseFloat(offer.pumpFee) || 0,
        shipping_type: offer.shippingType,
        shipping_cost: offer.shippingType === 'Alıcı Öder' ? offer.shippingFee : null,
        stock_status: offer.stockStatus,
        validity_duration: offer.validity,
        vat_included: offer.vatIncluded,
    });

    // Save current offer locally as an alternative (NO server call)
    const handleAddAlternative = () => {
        if (!bidPrice) {
            Alert.alert('Eksik', 'Lütfen birim fiyat giriniz.');
            return;
        }
        setPendingOffers(prev => [...prev, captureCurrentOffer()]);
        resetOfferForm();
    };

    // Submit all saved alternatives + current form offer to server
    const sendAllOffers = async () => {
        if (!bidPrice && pendingOffers.length === 0) {
            Alert.alert('Eksik', 'Lütfen birim fiyat giriniz.');
            return;
        }
        const allOffers = [...pendingOffers];
        if (bidPrice) allOffers.push(captureCurrentOffer());

        try {
            for (const offer of allOffers) {
                const result = await MarketService.submitBid(buildBidPayload(offer, selectedRequest.id));
                if (!result.success) throw new Error('Teklif gönderilemedi.');
            }
            setPendingOffers([]);
            resetOfferForm();
            loadData();
            setSuccessModalVisible(true);
            setModalVisible(false);
        } catch (e) {
            Alert.alert('Hata', 'Bir sorun oluştu: ' + (e.message || ''));
        }
    };

    const handleArchive = (reqId) => {
        Alert.alert("Emin misiniz?", "Bu talebi pas geçmek istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Pas Geç",
                style: "destructive",
                onPress: () => {
                    setArchivedRequests(prev => [...prev, reqId]);
                    // Here you would optimally duplicate this logic in backend or async storage
                }
            }
        ]);
    };

    const handleRestore = (reqId) => {
        setArchivedRequests(prev => prev.filter(id => id !== reqId));
    };

    // --- COMPONENTS ---

    const ControlButton = ({ icon, label, count, color, onPress }) => (
        <TouchableOpacity style={styles.controlBtn} onPress={onPress}>
            <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.controlIconBox}
            >
                <MaterialCommunityIcons name={icon} size={28} color={color} />
                {count > 0 && <View style={styles.badge}><Text allowFontScaling={false} style={styles.badgeText}>{count}</Text></View>}
            </LinearGradient>
            <Text allowFontScaling={false} style={styles.controlLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const renderLeadsTab = () => {
        // Filter out archived requests AND requests the user has already bid on for the main feed
        // We only show requests where there are NO bids from this user to keep Fırsatlar clean.
        // Alternative bids are made from the Tekliflerim (Bids) tab.
        const activeRequests = requests.filter(req => !archivedRequests.includes(req.id) && !myBids.some(b => b.request_id === req.id));

        return (
            <View style={styles.tabContent}>
                <View style={styles.feedHeader}>
                    <Text allowFontScaling={false} style={styles.feedTitle}>FIRSAT HAVUZU ({activeRequests.length})</Text>
                    <TouchableOpacity onPress={loadData} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }}>
                        <Ionicons name="filter" size={16} color="#94a3b8" />
                        <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>Filtrele</Text>
                    </TouchableOpacity>
                </View>

                {activeRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-search-outline" size={56} color="#334155" />
                        <Text allowFontScaling={false} style={styles.emptyText}>Bölgenizde açık talep bulunmuyor.</Text>
                        <Text allowFontScaling={false} style={styles.emptySub}>Abonelik ayarlarınızı kontrol ediniz veya arşivi inceleyiniz.</Text>
                    </View>
                ) : (
                    activeRequests.map((req, index) => (
                        <LinearGradient
                            key={req.id}
                            colors={['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']}
                            style={styles.leadCard}
                        >
                            {/* 1. Header Labels */}
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {index === 0 && ( // Demo logic for "New"
                                    <View style={styles.tagBadge}>
                                        <Ionicons name="flash" size={10} color="#000" />
                                        <Text allowFontScaling={false} style={styles.tagText}>YENİ TALEP</Text>
                                    </View>
                                )}
                                <View style={[styles.tagBadge, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                    <Ionicons name="location" size={10} color="#38bdf8" />
                                    <Text allowFontScaling={false} style={[styles.tagText, { color: '#38bdf8' }]}>YAKIN KONUM</Text>
                                </View>
                                <View style={[styles.timerTag, { marginLeft: 'auto' }]}>
                                    <Ionicons name="time" size={12} color="#F59E0B" />
                                    <Text allowFontScaling={false} style={styles.timerText}>2s Kaldı</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                                <Text allowFontScaling={false} style={[styles.leadTitle, { fontSize: 13, color: '#a3a3a3' }]}>{new Date(req.created_at).toLocaleDateString('tr-TR')} • {new Date(req.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 10, fontWeight: 'bold' }}>#{req.id.substring(0,8).toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* 2. Detailed Rows */}
                            <View style={styles.detailBox}>
                                {/* Material */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="cube-outline" size={18} color="#94a3b8" />
                                    </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>MALZEME</Text>
                                            {renderProductWithBadges(req.items ? req.items[0]?.product_name : 'Belirtilmedi', false, true)}
                                        </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Quantity */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="weight" size={18} color="#94a3b8" />
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={styles.detailLabel}>MİKTAR</Text>
                                        <Text allowFontScaling={false} style={styles.detailValue}>{req.items ? req.items[0]?.quantity : '-'} {req.items ? req.items[0]?.unit : ''}</Text>
                                    </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Location */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={18} color="#EF4444" />
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={styles.detailLabel}>TESLİMAT YERİ</Text>
                                        <Text allowFontScaling={false} style={styles.detailValue}>{(req.location || 'Konum Bilgisi Yok').replace('(Varsayılan)', '').trim()} <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, fontWeight: 'normal' }}>(12 km)</Text></Text>
                                    </View>
                                </View>
                            </View>

                            {/* 3. Actions */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.passBtn} onPress={() => handleArchive(req.id)}>
                                    <Text allowFontScaling={false} style={styles.passBtnText}>Arşivle</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(req)}>
                                    <LinearGradient
                                        colors={['#F59E0B', '#ffdd00']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.gradientBtn}
                                    >
                                        <Text allowFontScaling={false} style={styles.bidButtonText}>TALEBİ İNCELE</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#000" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    ))
                )}
            </View>
        );
    };

    const renderArchivedTab = () => {
        const archivedList = requests.filter(req => archivedRequests.includes(req.id));

        return (
            <View style={styles.tabContent}>
                <View style={styles.feedHeader}>
                    <Text allowFontScaling={false} style={styles.feedTitle}>ARŞİVLENEN TALEPLER ({archivedList.length})</Text>
                </View>

                {archivedList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text allowFontScaling={false} style={styles.emptyText}>Henüz arşivlenen talep yok.</Text>
                    </View>
                ) : (
                    archivedList.map((req, index) => (
                        <LinearGradient
                            key={req.id}
                            colors={['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']}
                            style={styles.leadCard}
                        >
                            {/* 1. Header Labels */}
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                {index === 0 && ( // Demo logic for "New"
                                    <View style={styles.tagBadge}>
                                        <Ionicons name="flash" size={10} color="#000" />
                                        <Text allowFontScaling={false} style={styles.tagText}>YENİ TALEP</Text>
                                    </View>
                                )}
                                <View style={[styles.tagBadge, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                    <Ionicons name="location" size={10} color="#38bdf8" />
                                    <Text allowFontScaling={false} style={[styles.tagText, { color: '#38bdf8' }]}>YAKIN KONUM</Text>
                                </View>
                                <View style={[styles.timerTag, { marginLeft: 'auto' }]}>
                                    <Ionicons name="time" size={12} color="#F59E0B" />
                                    <Text allowFontScaling={false} style={styles.timerText}>2s Kaldı</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                                <Text allowFontScaling={false} style={[styles.leadTitle, { fontSize: 13, color: '#a3a3a3' }]}>{new Date(req.created_at).toLocaleDateString('tr-TR')} • {new Date(req.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text allowFontScaling={false} style={{ color: '#a3a3a3', fontSize: 10, fontWeight: 'bold' }}>#{req.id.substring(0,8).toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* 2. Detailed Rows */}
                            <View style={styles.detailBox}>
                                {/* Material */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="cube-outline" size={18} color="#94a3b8" />
                                    </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>MALZEME</Text>
                                            {renderProductWithBadges(req.items ? req.items[0]?.product_name : 'Belirtilmedi', false, true)}
                                        </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Quantity */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="weight" size={18} color="#94a3b8" />
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={styles.detailLabel}>MİKTAR</Text>
                                        <Text allowFontScaling={false} style={styles.detailValue}>{req.items ? req.items[0]?.quantity : '-'} {req.items ? req.items[0]?.unit : ''}</Text>
                                    </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Location */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={18} color="#EF4444" />
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={styles.detailLabel}>TESLİMAT YERİ</Text>
                                        <Text allowFontScaling={false} style={styles.detailValue}>{(req.location || 'Konum Bilgisi Yok').replace('(Varsayılan)', '').trim()} <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, fontWeight: 'normal' }}>(12 km)</Text></Text>
                                    </View>
                                </View>
                            </View>

                            {/* 3. Actions - Archive View overrides to "Geri Al" and still has "TALEBİ İNCELE" */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.passBtn} onPress={() => handleRestore(req.id)}>
                                    <Text allowFontScaling={false} style={styles.passBtnText}>Geri Al</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(req)}>
                                    <LinearGradient
                                        colors={['#F59E0B', '#ffdd00']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.gradientBtn}
                                    >
                                        <Text allowFontScaling={false} style={styles.bidButtonText}>TALEBİ İNCELE</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#000" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    ))
                )}
            </View>
        );
    };

    const renderBidsTab = () => {
        const pendingBids = myBids.filter(b => b.status === 'PENDING').length;
        const wonBids = myBids.filter(b => b.status === 'ACCEPTED').length;
        const lostBids = myBids.filter(b => b.status === 'REJECTED').length;

        // ── Group bids by request_id ──
        const groupsMap = {};
        myBids.forEach(bid => {
            const key = bid.request_id;
            if (!groupsMap[key]) groupsMap[key] = [];
            groupsMap[key].push(bid);
        });
        // Sort each group oldest→newest so index 0 = first bid
        const groups = Object.values(groupsMap).map(g =>
            [...g].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        );
        // Sort groups by most recent bid
        groups.sort((a, b) => new Date(b[b.length-1].created_at) - new Date(a[a.length-1].created_at));

        const goTo = (requestId, idx) => setBidIndexMap(prev => ({ ...prev, [requestId]: idx }));

        return (
            <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.funnelContainer, { marginBottom: 16 }]}>
                    <View style={[styles.funnelBox, { borderColor: 'rgba(251, 191, 36, 0.3)' }]}>
                        <Text allowFontScaling={false} style={[styles.funnelNum, { color: '#fbbf24' }]}>{pendingBids}</Text>
                        <Text allowFontScaling={false} style={styles.funnelTxt}>BEKLEYEN</Text>
                    </View>
                    <View style={[styles.funnelBox, { borderColor: 'rgba(74, 222, 128, 0.3)' }]}>
                        <Text allowFontScaling={false} style={[styles.funnelNum, { color: '#4ade80' }]}>{wonBids}</Text>
                        <Text allowFontScaling={false} style={styles.funnelTxt}>KAZANILAN</Text>
                    </View>
                    <View style={[styles.funnelBox, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                        <Text allowFontScaling={false} style={[styles.funnelNum, { color: '#ef4444' }]}>{lostBids}</Text>
                        <Text allowFontScaling={false} style={styles.funnelTxt}>KAYBEDILEN</Text>
                    </View>
                </View>

                {groups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text allowFontScaling={false} style={styles.emptyText}>Henüz verdiğiniz bir teklif bulunmuyor.</Text>
                    </View>
                ) : (
                    groups.map(group => {
                        const reqId = group[0].request_id;
                        const total = group.length;
                        const idx = bidIndexMap[reqId] ?? 0;
                        const bid = group[idx];

                        const statusColor = bid.status === 'ACCEPTED' ? '#4ade80' : bid.status === 'REJECTED' ? '#ef4444' : '#fbbf24';
                        const statusBg    = bid.status === 'ACCEPTED' ? 'rgba(74,222,128,0.15)' : bid.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)';
                        const statusText  = bid.status === 'ACCEPTED' ? 'KABUL EDİLDİ' : bid.status === 'REJECTED' ? 'REDDEDİLDİ' : 'BEKLEMEDE';

                        return (
                            <LinearGradient
                                key={reqId}
                                colors={['rgba(30,41,59,0.6)', 'rgba(15,23,42,0.8)']}
                                style={[styles.leadCard, { borderColor: `rgba(${statusColor === '#4ade80' ? '74,222,128' : statusColor === '#ef4444' ? '239,68,68' : '251,191,36'},0.3)` }]}
                            >
                                {/* ── Header: Status + ID + Date ── */}
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                                    <View style={[styles.tagBadge, { backgroundColor: statusBg }]}>
                                        <Ionicons name={bid.status === 'ACCEPTED' ? 'checkmark-circle' : bid.status === 'REJECTED' ? 'close-circle' : 'time'} size={10} color={statusColor} />
                                        <Text allowFontScaling={false} style={[styles.tagText, { color: statusColor }]}>{statusText}</Text>
                                    </View>
                                    <View style={[styles.tagBadge, { backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 'auto' }]}>
                                        <Text allowFontScaling={false} style={[styles.tagText, { color: '#a3a3a3' }]}>#{reqId.substring(0,8).toUpperCase()}</Text>
                                    </View>
                                    <View style={[styles.tagBadge, { backgroundColor: 'rgba(148,163,184,0.2)' }]}>
                                        <Text allowFontScaling={false} style={[styles.tagText, { color: '#94a3b8' }]}>{new Date(bid.created_at).toLocaleDateString('tr-TR')}</Text>
                                    </View>
                                </View>

                                {/* ── Bid Navigator (only shown if >1 bid) ── */}
                                {total > 1 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                                        {/* Prev */}
                                        <TouchableOpacity
                                            onPress={() => goTo(reqId, idx - 1)}
                                            disabled={idx === 0}
                                            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: idx === 0 ? 'transparent' : 'rgba(255,215,0,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: idx === 0 ? '#1e293b' : 'rgba(255,215,0,0.3)' }}
                                        >
                                            <Ionicons name="chevron-back" size={16} color={idx === 0 ? '#334155' : '#FFD700'} />
                                        </TouchableOpacity>

                                        {/* Dots + label */}
                                        <View style={{ alignItems: 'center', gap: 6 }}>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>TEKLİF {idx + 1} / {total}</Text>
                                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                                {group.map((_, i) => (
                                                    <TouchableOpacity key={i} onPress={() => goTo(reqId, i)}>
                                                        <View style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#FFD700' : '#334155' }} />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Next */}
                                        <TouchableOpacity
                                            onPress={() => goTo(reqId, idx + 1)}
                                            disabled={idx === total - 1}
                                            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: idx === total-1 ? 'transparent' : 'rgba(255,215,0,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: idx === total-1 ? '#1e293b' : 'rgba(255,215,0,0.3)' }}
                                        >
                                            <Ionicons name="chevron-forward" size={16} color={idx === total-1 ? '#334155' : '#FFD700'} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* ── Detail Rows ── */}
                                <View style={styles.detailBox}>
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIcon}>
                                            <MaterialCommunityIcons name="cube-outline" size={18} color="#94a3b8" />
                                        </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>MALZEME</Text>
                                            {renderProductWithBadges(bid.request?.items ? bid.request.items[0]?.product_name : 'Belirtilmedi')}
                                        </View>
                                    </View>
                                    <View style={styles.hDivider} />

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailIcon}>
                                            <MaterialCommunityIcons name="weight" size={18} color="#94a3b8" />
                                        </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>MİKTAR</Text>
                                            <Text allowFontScaling={false} style={styles.detailValue}>{bid.request?.items ? bid.request.items[0]?.quantity : '-'} {bid.request?.items ? bid.request.items[0]?.unit : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.hDivider} />

                                    <View style={styles.detailRow}>
                                        <View style={[styles.detailIcon, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
                                            <MaterialCommunityIcons name="currency-try" size={18} color="#4ADE80" />
                                        </View>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.detailLabel}>TEKLİFİNİZ (BİRİM)</Text>
                                            <Text allowFontScaling={false} style={[styles.detailValue, { color: '#4ADE80', fontWeight: 'bold' }]}>{bid.price.toLocaleString('tr-TR')} ₺</Text>
                                        </View>
                                    </View>

                                    {bid.notes && (bid.notes.includes('[Marka:') || bid.notes.includes('[Özellik:')) && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, alignSelf: 'flex-start' }}>
                                            <Ionicons name="pricetag" size={12} color="#A3A3A3" />
                                            <Text allowFontScaling={false} style={{ color: '#A3A3A3', fontSize: 11, fontWeight: '600' }}>Özel Seçenekli Teklif</Text>
                                        </View>
                                    )}
                                </View>

                                {/* ── Actions ── */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => openViewBidModal(bid)}
                                        style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Ionicons name="eye-outline" size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }} onPress={() => openBidModal({ ...bid.request, id: bid.request_id })}>
                                        <LinearGradient
                                            colors={['#FFD700', '#FF9100']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            <Text allowFontScaling={false} style={{ color: '#000', fontWeight: '900', fontSize: 13 }}>ALTERNATİF SUN</Text>
                                            <Ionicons name="add-circle-outline" size={16} color="#000" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        );
                    })
                )}
            </ScrollView>
        );
    };


    const renderRegionSettings = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={regionModalVisible}
            onRequestClose={() => setRegionModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { minHeight: 400 }]}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Hizmet Bölgesi Ayarları</Text>
                            <Text allowFontScaling={false} style={styles.modalSub}>Müşterilere görünürlüğünüzü yönetin.</Text>
                        </View>
                        <TouchableOpacity onPress={() => setRegionModalVisible(false)} style={{ padding: 4 }}>
                            <Ionicons name="close" size={26} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* DEMO TOGGLE (Development Only) */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#0A0A0A', padding: 4, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: '#333' }}>
                        <TouchableOpacity
                            onPress={() => setSellerType('CONCRETE')}
                            style={{ flex: 1, padding: 10, borderRadius: 6, backgroundColor: sellerType === 'CONCRETE' ? '#333' : 'transparent', alignItems: 'center' }}
                        >
                            <Text allowFontScaling={false} style={{ color: sellerType === 'CONCRETE' ? '#FFD700' : '#737373', fontWeight: 'bold' }}>Betoncu (Lokal)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSellerType('MATERIAL')}
                            style={{ flex: 1, padding: 10, borderRadius: 6, backgroundColor: sellerType === 'MATERIAL' ? '#333' : 'transparent', alignItems: 'center' }}
                        >
                            <Text allowFontScaling={false} style={{ color: sellerType === 'MATERIAL' ? '#FFD700' : '#737373', fontWeight: 'bold' }}>Malzemeci (Kargo)</Text>
                        </TouchableOpacity>
                    </View>

                    {sellerType === 'CONCRETE' ? (
                        <View>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color="#38bdf8" />
                                <Text allowFontScaling={false} style={styles.infoText}>Hazır betonun donma riski nedeniyle sadece tesisinize belirli mesafedeki işleri görüntüleyebilirsiniz.</Text>
                            </View>

                            <Text allowFontScaling={false} style={styles.label}>Hizmet Yarıçapı: <Text allowFontScaling={false} style={{ color: '#FFD700' }}>{serviceRadius} km</Text></Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => setServiceRadius(Math.max(5, serviceRadius - 5))} style={styles.iconBtnSmall}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
                                <View style={{ flex: 1, height: 4, backgroundColor: '#333', marginHorizontal: 12, borderRadius: 2 }}>
                                    <View style={{ width: `${(serviceRadius / 100) * 100}%`, height: '100%', backgroundColor: '#FFD700', borderRadius: 2 }} />
                                </View>
                                <TouchableOpacity onPress={() => setServiceRadius(Math.min(100, serviceRadius + 5))} style={styles.iconBtnSmall}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
                            </View>

                            <View style={{ height: 200, backgroundColor: '#111', borderRadius: 12, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}>
                                <MaterialCommunityIcons name="map-marker-radius" size={64} color="#333" />
                                <Text allowFontScaling={false} style={{ color: '#525252', marginTop: 8 }}>Harita Önizlemesi</Text>
                                <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' }} />
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.infoBox}>
                                <Ionicons name="cube" size={20} color="#4ADE80" />
                                <Text allowFontScaling={false} style={styles.infoText}>Ürünlerinizi kargo veya nakliye ile gönderebileceğiniz bölgeleri seçin.</Text>
                            </View>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'district' && styles.optionCardActive]} onPress={() => setShippingScope('district')}>
                                <View style={[styles.radio, shippingScope === 'district' && styles.radioActive]} />
                                <View>
                                    <Text allowFontScaling={false} style={styles.optionTitle}>Sadece İlçem</Text>
                                    <Text allowFontScaling={false} style={styles.optionSub}>Güngören ve çevresi</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'city' && styles.optionCardActive]} onPress={() => setShippingScope('city')}>
                                <View style={[styles.radio, shippingScope === 'city' && styles.radioActive]} />
                                <View>
                                    <Text allowFontScaling={false} style={styles.optionTitle}>Tüm İstanbul (Avrupa)</Text>
                                    <Text allowFontScaling={false} style={styles.optionSub}>Şehir içi nakliye imkanı</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'country' && styles.optionCardActive]} onPress={() => setShippingScope('country')}>
                                <View style={[styles.radio, shippingScope === 'country' && styles.radioActive]} />
                                <View>
                                    <Text allowFontScaling={false} style={styles.optionTitle}>Tüm Türkiye</Text>
                                    <Text allowFontScaling={false} style={styles.optionSub}>Anlaşmalı kargo ile gönderim</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={[styles.modalBtn, { marginTop: 'auto' }]} onPress={() => setRegionModalVisible(false)}>
                        <Text allowFontScaling={false} style={styles.modalBtnText}>AYARLARI KAYDET</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Helper to safely parse quantity
    const getSafeQuantity = () => {
        if (!selectedRequest?.items || !selectedRequest.items[0]) return 0;
        const q = selectedRequest.items[0].quantity;
        if (typeof q === 'number') return q;
        if (typeof q === 'string') {
            const numPart = q.trim().split(/\s+/)[0];
            const cleaned = numPart.replace(/[^0-9.,]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    };

    const openViewBidModal = (bid) => {
        setSelectedBid(bid);
        setViewBidModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Deep Dark Background */}
            <View style={{ position: 'absolute', width, height: '100%', backgroundColor: '#000000' }} />
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#FFD700" />}
                >
                    {/* 1. HEADER */}
                    <View style={styles.header}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text allowFontScaling={false} style={styles.avatarTxt}>DD</Text>
                            </View>
                            <View>
                                <Text allowFontScaling={false} style={styles.welcome}>Hoşgeldin,</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text allowFontScaling={false} style={styles.companyName}>{sellerInfo.name}</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#38bdf8" />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Ionicons name="settings-sharp" size={24} color="#e2e8f0" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. STATS OVERVIEW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statPill}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text allowFontScaling={false} style={styles.statTxt}>{sellerInfo.rating} Puan</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Ionicons name="location" size={14} color="#94a3b8" />
                            <Text allowFontScaling={false} style={styles.statTxt}>{sellerInfo.location}</Text>
                        </View>
                    </View>

                    {/* 3. CONTROL CENTER */}
                    <View style={styles.controlsGrid}>
                        <ControlButton icon="plus" label="Ürün Ekle" color="#4ADE80" onPress={() => { }} />
                        <ControlButton icon="file-document-outline" label="Geçmiş" color="#f472b6" onPress={() => { }} />
                        <ControlButton icon="clock-outline" label="Bekleyen" count={3} color="#fbbf24" onPress={() => setActiveTab('bids')} />
                        <ControlButton icon="store-marker-outline" label="Bölge" color="#94a3b8" onPress={() => setRegionModalVisible(true)} />
                    </View>

                    {/* 4. TABS */}
                    <View style={styles.msgTabs}>
                        <TouchableOpacity onPress={() => setActiveTab('leads')} style={[styles.msgTab, activeTab === 'leads' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'leads' && styles.msgTabTxtActive]}>FIRSATLAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('bids')} style={[styles.msgTab, activeTab === 'bids' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'bids' && styles.msgTabTxtActive]}>TEKLİFLERİM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('archived')} style={[styles.msgTab, activeTab === 'archived' && styles.msgTabActive]}>
                            <Text allowFontScaling={false} style={[styles.msgTabTxt, activeTab === 'archived' && styles.msgTabTxtActive]}>ARŞİV</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 5. CONTENT */}
                    {activeTab === 'leads' ? renderLeadsTab() :
                        activeTab === 'bids' ? renderBidsTab() :
                            renderArchivedTab()}

                </ScrollView>

                {/* --- REGION SETTINGS MODAL --- */}
                {renderRegionSettings()}

                {/* --- MODAL --- */}
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
                                <TouchableOpacity onPress={() => { setModalVisible(false); setPendingOffers([]); resetOfferForm(); }} style={{ padding: 4 }}>
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
                                            <View style={[styles.reqSummary, { backgroundColor: '#1C1C1E', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#FFD700', padding: 18, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6, borderWidth: 0 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>
                                                        {(() => {
                                                            const raw = selectedRequest.items?.[0]?.product_name || selectedRequest.title;
                                                            return raw.replace(/\[Marka:.*?\]/g, '').replace(/\[Özellik:.*?\]/g, '').trim();
                                                        })()}
                                                    </Text>
                                                </View>
                                                {selectedRequest.items && selectedRequest.items[0] && renderProductWithBadges(selectedRequest.items[0].product_name, true)}
                                                
                                                <View style={[styles.hDivider, { marginVertical: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 0 }]} />

                                                <View style={{ flexDirection: 'row', gap: 24 }}>
                                                    <View>
                                                        <Text allowFontScaling={false} style={[styles.detailLabel, { fontSize: 11 }]}>MİKTAR</Text>
                                                        <Text allowFontScaling={false} style={[styles.detailValue, { fontSize: 16, fontWeight: '800' }]}>{selectedRequest.items ? selectedRequest.items[0]?.quantity : '-'} {selectedRequest.items ? selectedRequest.items[0]?.unit : ''}</Text>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text allowFontScaling={false} style={[styles.detailLabel, { fontSize: 11 }]}>TESLİMAT YERİ</Text>
                                                        <Text allowFontScaling={false} style={[styles.detailValue, { fontSize: 16, fontWeight: '800' }]} selectable>{selectedRequest.location.replace('(Varsayılan)', '').trim()}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* SELLER PROPOSAL: BRAND & TECH SPEC */}
                                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                    <Text allowFontScaling={false} style={[styles.label, { marginBottom: 8 }]} numberOfLines={1}>Sizin Markanız (Ops.)</Text>
                                                    <TextInput allowFontScaling={false} style={[styles.inputBox, { height: 48, backgroundColor: '#0A0A0A' }]} placeholder="Örn: Akçansa" placeholderTextColor="#525252" value={offerBrand} onChangeText={setOfferBrand} />
                                                </View>
                                                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                    <Text allowFontScaling={false} style={[styles.label, { marginBottom: 8 }]} numberOfLines={1}>Sizin Özelliğiniz (Ops.)</Text>
                                                    <TextInput allowFontScaling={false} style={[styles.inputBox, { height: 48, backgroundColor: '#0A0A0A' }]} placeholder="Örn: 10mm Nervürlü" placeholderTextColor="#525252" value={offerTechSpec} onChangeText={setOfferTechSpec} />
                                                </View>
                                            </View>

                                            {/* DYNAMIC FORM LOGIC */}
                                            {/* Checking if Concrete or Material based on title/items */}
                                            {(selectedRequest.title.toLowerCase().includes('beton') || selectedRequest.items?.some(i => i.product_name.toLowerCase().includes('beton'))) ? (
                                                // --- CONCRETE SCENARIO ---
                                                <View style={styles.dynamicSection}>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={styles.label}>Birim Fiyat ({selectedRequest.items ? selectedRequest.items[0]?.unit : 'm³'})</Text>
                                                            <TextInput allowFontScaling={false} style={styles.bigInput} placeholder="0.00" placeholderTextColor="#525252" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={styles.label}>Pompa (TL)</Text>
                                                            <TextInput allowFontScaling={false} style={styles.bigInput} placeholder="Ekstra" placeholderTextColor="#525252" keyboardType="numeric" value={pumpFee} onChangeText={setPumpFee} />
                                                        </View>
                                                    </View>

                                                    {/* Buttons Row: VAT (Left) - Price (Right) */}
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
                                                        {/* VAT Toggles */}
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <TouchableOpacity onPress={() => setVatIncluded(false)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: !vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: !vatIncluded ? '#FFD700' : '#404040' }}>
                                                                <Text allowFontScaling={false} style={{ color: !vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>+ KDV</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setVatIncluded(true)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: vatIncluded ? '#FFD700' : '#404040' }}>
                                                                <Text allowFontScaling={false} style={{ color: vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>KDV Dahil</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                        {/* Total Price */}
                                                        {bidPrice ? (
                                                            <View style={{ alignItems: 'flex-end', flex: 1, paddingLeft: 10 }}>
                                                                <Text allowFontScaling={false} style={{ color: '#F1F5F9', fontSize: 13, marginBottom: 4, fontWeight: '700' }}>TOPLAM TUTAR</Text>
                                                                <Text allowFontScaling={false} 
                                                                    style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900', textAlign: 'right' }}
                                                                    numberOfLines={1} 
                                                                    adjustsFontSizeToFit>
                                                                    ≈ {((parseFloat(bidPrice) || 0) * getSafeQuantity()).toLocaleString('tr-TR')} TL{vatIncluded ? '' : <Text allowFontScaling={false} style={{ fontSize: 14, color: '#94a3b8' }}> KDV</Text>}
                                                                </Text>
                                                            </View>
                                                        ) : <View style={{ flex: 1 }} />}
                                                    </View>
                                                </View>
                                            ) : (
                                                // --- MATERIAL SCENARIO ---
                                                <View style={styles.dynamicSection}>
                                                    <Text allowFontScaling={false} style={styles.label}>Birim Fiyat (Adet/Kg)</Text>
                                                    <View>
                                                        <TextInput allowFontScaling={false} style={styles.bigInput} placeholder="0.00" placeholderTextColor="#525252" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />

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
                                                                    <Text allowFontScaling={false} 
                                                                        style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900', textAlign: 'right' }}
                                                                        numberOfLines={1} 
                                                                        adjustsFontSizeToFit>
                                                                        ≈ {((parseFloat(bidPrice) || 0) * getSafeQuantity()).toLocaleString('tr-TR')} TL{vatIncluded ? '' : <Text allowFontScaling={false} style={{ fontSize: 14, color: '#94a3b8' }}> KDV</Text>}
                                                                    </Text>
                                                                </View>
                                                            ) : <View style={{ flex: 1 }} />}
                                                        </View>
                                                    </View>

                                                    <Text allowFontScaling={false} style={styles.label}>Stok Durumu</Text>
                                                    <View style={{ flexDirection: 'row', marginBottom: stockStatus === 'custom' ? 8 : 12, gap: 8 }}>
                                                        <TouchableOpacity onPress={() => setStockStatus('immediate')} style={[styles.chip, stockStatus === 'immediate' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, stockStatus === 'immediate' && styles.chipTextActive]}>Hemen Teslim</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setStockStatus('wait')} style={[styles.chip, stockStatus === 'wait' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, stockStatus === 'wait' && styles.chipTextActive]}>2-3 Gün</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setStockStatus('custom')} style={[styles.chip, stockStatus === 'custom' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, stockStatus === 'custom' && styles.chipTextActive]}>Diğer</Text></TouchableOpacity>
                                                    </View>
                                                    {stockStatus === 'custom' && (
                                                        <TextInput allowFontScaling={false} style={[styles.inputBox, { height: 44, backgroundColor: '#0A0A0A', marginBottom: 12 }]} placeholder="Stok durumunu yazın" placeholderTextColor="#525252" value={stockCustom} onChangeText={setStockCustom} />
                                                    )}

                                                    <Text allowFontScaling={false} style={styles.label}>Teslimat / Nakliye Durumu</Text>
                                                    <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                                                        <TouchableOpacity onPress={() => setShippingType('Dahil')} style={[styles.chip, shippingType === 'Dahil' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Dahil' && styles.chipTextActive]}>Dahil</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setShippingType('Hariç')} style={[styles.chip, shippingType === 'Hariç' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Hariç' && styles.chipTextActive]}>Hariç</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setShippingType('Alıcı Öder')} style={[styles.chip, shippingType === 'Alıcı Öder' && styles.chipActive]}><Text allowFontScaling={false} style={[styles.chipText, shippingType === 'Alıcı Öder' && styles.chipTextActive]}>Alıcı Öder</Text></TouchableOpacity>
                                                    </View>
                                                    
                                                    {shippingType === 'Alıcı Öder' && (
                                                        <View style={{ marginBottom: 16 }}>
                                                            <Text allowFontScaling={false} style={styles.label}>Nakliye Ücreti (TL)</Text>
                                                            <TextInput allowFontScaling={false}
                                                                style={styles.inputBox}
                                                                placeholder="Örn: 2500"
                                                                placeholderTextColor="#525252"
                                                                keyboardType="numeric"
                                                                value={shippingFee}
                                                                onChangeText={setShippingFee}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {/* COMMON: VALIDITY */}
                                            <Text allowFontScaling={false} style={styles.label}>Teklif Geçerlilik Süresi</Text>
                                            <View style={{ flexDirection: 'row', marginBottom: validity === 'custom' ? 8 : 16, gap: 8 }}>
                                                {[{ val: '24', label: '24 Saat' }, { val: '48', label: '48 Saat' }, { val: '168', label: '1 Hafta' }, { val: 'custom', label: 'Diğer' }].map(opt => (
                                                    <TouchableOpacity key={opt.val} onPress={() => setValidity(opt.val)} style={[styles.chip, validity === opt.val && styles.chipActive]}>
                                                        <Text allowFontScaling={false} style={[styles.chipText, validity === opt.val && styles.chipTextActive]}>{opt.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            {validity === 'custom' && (
                                                <TextInput allowFontScaling={false} style={[styles.inputBox, { height: 44, backgroundColor: '#0A0A0A', marginBottom: 16 }]} placeholder="ör: 1 hafta" placeholderTextColor="#525252" value={validityCustom} onChangeText={setValidityCustom} />
                                            )}

                                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                                {TERMS_OPTIONS.map(opt => (
                                                    <TouchableOpacity
                                                        key={opt}
                                                        style={[styles.chip, paymentTerm === opt && styles.chipActive]}
                                                        onPress={() => setPaymentTerm(opt)}
                                                    >
                                                        <Text allowFontScaling={false} style={[styles.chipText, paymentTerm === opt && styles.chipTextActive]}>{opt}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            {/* PENDING OFFERS PREVIEW */}
                                            {(pendingOffers.length > 0 || (bidPrice && String(bidPrice).trim() !== '')) && (
                                                <View style={{ backgroundColor: '#0A0A0A', borderRadius: 12, padding: 12, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: '#D4AF3730' }}>
                                                    <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 10 }}>HAZIRLANAN TEKLİFLER</Text>
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            {pendingOffers.map((offer, i) => (
                                                                <TouchableOpacity
                                                                    key={i}
                                                                    activeOpacity={0.75}
                                                                    onPress={() => setOfferActionSheet({ index: i, offer })}
                                                                    style={{ backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#D4AF3760', minWidth: 80, alignItems: 'center' }}
                                                                >
                                                                    <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }}>TEKLİF {i + 1}</Text>
                                                                    <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>{parseFloat(offer.bidPrice).toLocaleString('tr-TR')} ₺</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                            {/* Current form indicator */}
                                                            <TouchableOpacity 
                                                                activeOpacity={0.7}
                                                                onPress={() => {
                                                                    Alert.alert(
                                                                        `TEKLİF ${pendingOffers.length + 1}`,
                                                                        bidPrice ? "Girdiğiniz verileri silmek (temizlemek) istiyor musunuz?" : "Bu alternatif teklifi iptal etmek istiyor musunuz?",
                                                                        [
                                                                            { text: 'Vazgeç', style: 'cancel' },
                                                                            { 
                                                                                text: bidPrice ? 'Temizle' : 'İptal Et', 
                                                                                style: 'destructive', 
                                                                                onPress: () => {
                                                                                    if (bidPrice) {
                                                                                        resetOfferForm();
                                                                                    } else {
                                                                                        if (pendingOffers.length > 0) {
                                                                                            const lastOffer = pendingOffers[pendingOffers.length - 1];
                                                                                            setPendingOffers(prev => prev.slice(0, -1));
                                                                                            setBidPrice(lastOffer.bidPrice);
                                                                                            setVatIncluded(lastOffer.vatIncluded);
                                                                                            setShippingType(lastOffer.shippingType);
                                                                                            setShippingFee(lastOffer.shippingFee || '');
                                                                                            setStockStatus(lastOffer.stockStatus);
                                                                                            setStockCustom(lastOffer.stockCustom || '');
                                                                                            setValidity(lastOffer.validity);
                                                                                            setValidityCustom(lastOffer.validityCustom || '');
                                                                                            setPaymentTerm(lastOffer.paymentTerm);
                                                                                            setOfferBrand(lastOffer.offerBrand || '');
                                                                                            setOfferTechSpec(lastOffer.offerTechSpec || '');
                                                                                            setPumpFee(lastOffer.pumpFee || '');
                                                                                            setBidNotes(lastOffer.bidNotes || '');
                                                                                        } else {
                                                                                            resetOfferForm(); // Fallback
                                                                                        }
                                                                                    }
                                                                                } 
                                                                            }
                                                                        ]
                                                                    );
                                                                }}
                                                                style={{ backgroundColor: '#0f2a1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#4ADE8040', minWidth: 80, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}
                                                            >
                                                                <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }}>TEKLİF {pendingOffers.length + 1}</Text>
                                                                <Text allowFontScaling={false} style={{ color: '#4ADE8080', fontSize: 9 }}>{bidPrice ? 'Düzenleniyor..' : 'Hazırlanıyor...'}</Text>
                                                                <Text allowFontScaling={false} style={{ color: '#4ADE8050', fontSize: 8, marginTop: 4 }}>{bidPrice ? '🗑 temizle' : '❌ iptal et'}</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </ScrollView>
                                                </View>
                                            )}

                                            {/* ACTION BUTTONS */}
                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                                <TouchableOpacity style={[styles.modalBtn, { flex: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' }]} onPress={handleAddAlternative}>
                                                    <Text allowFontScaling={false} style={[styles.modalBtnText, { color: '#fff' }]}>+ ALTERNATİF EKLE</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={sendAllOffers}>
                                                    <Text allowFontScaling={false} style={styles.modalBtnText}>
                                                        {pendingOffers.length > 0
                                                            ? `${pendingOffers.length + (bidPrice ? 1 : 0)} TEKLİF GÖNDER`
                                                            : 'TEKLİFİ GÖNDER'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>
                        </View>

                        {/* PREMIUM OFFER ACTION SHEET */}
                        {offerActionSheet && (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => setOfferActionSheet(null)}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}
                            >
                                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                                    <View style={{ backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: 36, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#D4AF3730' }}>
                                        {/* Handle */}
                                        <View style={{ width: 40, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

                                        {/* Badge */}
                                        <View style={{ alignSelf: 'center', backgroundColor: '#D4AF3715', borderRadius: 24, paddingHorizontal: 22, paddingVertical: 10, borderWidth: 1.5, borderColor: '#D4AF3750', marginBottom: 30 }}>
                                            <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 14, fontWeight: '900', letterSpacing: 2 }}>TEKLİF {offerActionSheet.index + 1}</Text>
                                        </View>

                                        {/* Düzenle */}
                                        <TouchableOpacity
                                            style={{ backgroundColor: '#1a1a1a', borderRadius: 16, paddingVertical: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D4AF3740', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
                                            onPress={() => {
                                                const offer = offerActionSheet.offer;
                                                const idx = offerActionSheet.index;

                                                const currentPriceStr = String(bidPrice || '').trim();
                                                if (currentPriceStr && parseFloat(currentPriceStr) > 0) {
                                                    const currentOfferData = captureCurrentOffer();
                                                    setPendingOffers(prev => {
                                                        const newList = [...prev];
                                                        newList.splice(idx, 1);
                                                        newList.push(currentOfferData);
                                                        return newList;
                                                    });
                                                } else {
                                                    setPendingOffers(prev => prev.filter((_, i) => i !== idx));
                                                }

                                                setBidPrice(offer.bidPrice);
                                                setVatIncluded(offer.vatIncluded);
                                                setShippingType(offer.shippingType);
                                                setShippingFee(offer.shippingFee || '');
                                                setStockStatus(offer.stockStatus);
                                                setStockCustom(offer.stockCustom || '');
                                                setValidity(offer.validity);
                                                setValidityCustom(offer.validityCustom || '');
                                                setPaymentTerm(offer.paymentTerm);
                                                setOfferBrand(offer.offerBrand || '');
                                                setOfferTechSpec(offer.offerTechSpec || '');
                                                setPumpFee(offer.pumpFee || '');
                                                setBidNotes(offer.bidNotes || '');
                                                setOfferActionSheet(null);
                                            }}
                                        >
                                            <Ionicons name="create-outline" size={20} color="#D4AF37" />
                                            <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 15, fontWeight: '700' }}>Düzenle</Text>
                                        </TouchableOpacity>

                                        {/* Kaldır */}
                                        <TouchableOpacity
                                            style={{ backgroundColor: '#1a0505', borderRadius: 16, paddingVertical: 16, marginBottom: 10, borderWidth: 1, borderColor: '#EF444430', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
                                            onPress={() => {
                                                setPendingOffers(prev => prev.filter((_, i) => i !== offerActionSheet.index));
                                                setOfferActionSheet(null);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            <Text allowFontScaling={false} style={{ color: '#EF4444', fontSize: 15, fontWeight: '700' }}>Kaldır</Text>
                                        </TouchableOpacity>

                                        {/* İptal */}
                                        <TouchableOpacity
                                            onPress={() => setOfferActionSheet(null)}
                                            style={{ paddingVertical: 14, alignItems: 'center' }}
                                        >
                                            <Text allowFontScaling={false} style={{ color: '#555', fontSize: 14 }}>İptal</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    </View>
                </Modal>

                {/* --- READ-ONLY BID DETAILS MODAL --- */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={viewBidModalVisible}
                    onRequestClose={() => setViewBidModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={() => setViewBidModalVisible(false)} />
                        <View style={{ backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: '#1e293b', padding: 20, paddingBottom: 36 }}>
                        {/* Handle */}
                        <View style={{ width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

                        {selectedBid && (() => {
                            const req = selectedBid.request;
                            const p = parseBidNotes(selectedBid.notes);
                            const statusColor = selectedBid.status === 'ACCEPTED' ? '#4ade80' : selectedBid.status === 'REJECTED' ? '#ef4444' : '#fbbf24';
                            const statusText = selectedBid.status === 'ACCEPTED' ? '✓ Kabul edildi' : selectedBid.status === 'REJECTED' ? '✕ Reddedildi' : '⏳ Beklemede';
                            const q = req?.items?.[0]?.quantity || req?.quantity || 1;
                            let parsedQ = 1;
                            if (typeof q === 'number') {
                                parsedQ = q;
                            } else if (typeof q === 'string') {
                                let numStr = q.trim().split(/\s+/)[0];
                                if (numStr.includes('.') && numStr.split('.')[1]?.length === 3) {
                                    numStr = numStr.replace(/\./g, '');
                                }
                                numStr = numStr.replace(/[^0-9.,]/g, '').replace(',', '.');
                                parsedQ = parseFloat(numStr) || 1;
                            }
                            const totalAmnt = (parseFloat(selectedBid.price) || 0) * parsedQ;

                            return (
                                <View>
                                    {/* Title row */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Verilen Teklif</Text>
                                            <Text allowFontScaling={false} style={{ color: statusColor, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{statusText}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setViewBidModalVisible(false)} style={{ padding: 6 }}>
                                            <Ionicons name="close" size={22} color="#475569" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Price + Total on same row */}
                                    <View style={{ backgroundColor: '#0a1628', borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#FFD700', borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)' }}>
                                        <View>
                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>BİRİM FİYAT</Text>
                                            <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 26, fontWeight: '900', marginTop: 2 }}>{parseFloat(selectedBid.price).toLocaleString('tr-TR')} ₺</Text>
                                            <Text allowFontScaling={false} style={{ color: p.vatIncluded ? '#FFD700' : '#64748b', fontSize: 11, marginTop: 4 }}>{p.vatIncluded ? 'KDV Dahil' : 'KDV Hariç'}</Text>
                                        </View>
                                        {totalAmnt > 0 && (
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>TOPLAM</Text>
                                                <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 22, fontWeight: '900', marginTop: 2 }}>≈ {totalAmnt.toLocaleString('tr-TR')} ₺</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* 2-col info grid */}
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                        <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                                            <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>STOK</Text>
                                            <Text allowFontScaling={false} style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{p.stockStatus === 'immediate' ? 'Hemen Teslim' : '2-3 Gün'}</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                                            <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>NAKLİYE</Text>
                                            <Text allowFontScaling={false} style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{p.shippingType || 'Dahil'}{p.shippingFee ? ` · ${p.shippingFee}₺` : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                                        <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                                            <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>VADE</Text>
                                            <Text allowFontScaling={false} style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{TERMS_OPTIONS.find(o => selectedBid.notes?.includes(o)) || 'EFT'}</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
                                            <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>GEÇERLİLİK</Text>
                                            <Text allowFontScaling={false} style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{p.validity === 168 ? '1 Hafta' : p.validity ? `${p.validity} Saat` : '24 Saat'}</Text>
                                        </View>
                                    </View>

                                    {/* Marka/Özellik if present */}
                                    {(p.offerBrand || p.offerTechSpec) && (
                                        <View style={{ backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 14 }}>
                                            <Text allowFontScaling={false} style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>MARKA / ÖZELLİK</Text>
                                            <Text allowFontScaling={false} style={{ color: '#f472b6', fontSize: 14, fontWeight: '700' }}>{[p.offerBrand, p.offerTechSpec].filter(Boolean).join(' · ')}</Text>
                                        </View>
                                    )}

                                    {/* Date + close */}
                                    <Text allowFontScaling={false} style={{ color: '#334155', fontSize: 11, textAlign: 'center', marginBottom: 2 }}>
                                        {new Date(selectedBid.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })}
                                    </Text>
                                </View>
                            );
                        })()}
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
                                style={[styles.modalBtn, { width: '100%', padding: 18 }]}
                                onPress={() => setSuccessModalVisible(false)}
                            >
                                <Text allowFontScaling={false} style={styles.modalBtnText}>TAMAM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 16 },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
    avatarTxt: { color: '#FFD700', fontSize: 16, fontWeight: '800' },
    welcome: { color: '#a3a3a3', fontSize: 13 },
    companyName: { color: '#fff', fontSize: 17, fontWeight: '700' },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#262626' },
    statTxt: { color: '#e5e5e5', fontSize: 13, fontWeight: '500' },

    // Controls
    controlsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
    controlBtn: { alignItems: 'center', gap: 8, width: (width - 60) / 4 },
    controlIconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717', borderWidth: 1, borderColor: '#333' },
    controlLabel: { color: '#a3a3a3', fontSize: 12, fontWeight: '600' },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // Tabs
    msgTabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#262626' },
    msgTab: { paddingBottom: 12, marginRight: 24, paddingHorizontal: 4 },
    msgTabActive: { borderBottomWidth: 2, borderBottomColor: '#FFD700' },
    msgTabTxt: { color: '#737373', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
    msgTabTxtActive: { color: '#FFD700' },

    // Feed
    tabContent: { paddingHorizontal: 20 },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    feedTitle: { color: '#e5e5e5', fontSize: 14, fontWeight: '700', letterSpacing: 1 },

    // Card
    leadCard: { padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    productIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    leadTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
    leadSub: { color: '#a3a3a3', fontSize: 13, lineHeight: 18 },
    timerTag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    timerText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },

    dataRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 10, marginBottom: 16 },
    dataItem: { flex: 1, alignItems: 'center' },
    dataLabel: { color: '#525252', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
    dataValue: { color: '#e5e5e5', fontSize: 13, fontWeight: '500' },
    vDivider: { width: 1, height: '80%', backgroundColor: '#404040', alignSelf: 'center' },

    bidButton: { borderRadius: 12, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    bidButtonText: { color: '#000', fontSize: 14, fontWeight: '800' },

    // Funnel
    funnelContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    funnelBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    funnelNum: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    funnelTxt: { color: '#737373', fontSize: 10, fontWeight: '700' },

    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.6 },
    emptyText: { color: '#d4d4d4', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    emptySub: { color: '#737373', fontSize: 13 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20, paddingTop: 60, paddingBottom: 40 },
    modalContent: { backgroundColor: '#171717', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    modalSub: { color: '#737373', fontSize: 13, marginTop: 4 },

    reqSummary: { backgroundColor: '#262626', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
    summaryTitle: { color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: 0.5 },
    summarySub: { color: '#a3a3a3', fontSize: 13, marginTop: 4 },

    label: { color: '#d4d4d4', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
    labelSimple: { color: '#d4d4d4', fontSize: 14 },
    bigInput: { backgroundColor: '#0A0A0A', fontSize: 24, color: '#FFD700', padding: 16, borderRadius: 12, fontWeight: 'bold', borderWidth: 1, borderColor: '#333', textAlign: 'center', marginBottom: 16 },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#262626', padding: 12, borderRadius: 10, marginBottom: 16 },

    chipsScroll: { gap: 8, paddingBottom: 24 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040' },
    chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
    chipText: { color: '#a3a3a3', fontSize: 13, fontWeight: '500' },
    chipTextActive: { color: '#000', fontWeight: '700' },

    modalBtn: { backgroundColor: '#4ADE80', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    modalBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },

    // Region Settings Specific
    infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
    infoText: { color: '#38bdf8', fontSize: 13, flex: 1, lineHeight: 18 },
    iconBtnSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },

    optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#262626', marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    optionCardActive: { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#525252' },
    radioActive: { borderColor: '#FFD700', backgroundColor: '#FFD700' },
    optionTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
    optionSub: { color: '#737373', fontSize: 12, marginTop: 2 },

    // New Card Styles
    tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    tagText: { color: '#000', fontSize: 10, fontWeight: '800' },

    detailBox: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 16, marginBottom: 20, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    detailIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    detailLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
    detailValue: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
    hDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 50 },

    // Dynamic Form Styles
    dynamicSection: { marginBottom: 12 },
    inputBox: { backgroundColor: '#262626', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#404040', marginBottom: 16 },
    shippingOptions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    shipOpt: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 8, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040' },
    shipOptActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
    shipText: { color: '#a3a3a3', fontWeight: '600', fontSize: 13 },
    shipTextActive: { color: '#000' },

    actionRow: { flexDirection: 'row', gap: 12 },
    passBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#404040', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)' },
    passBtnText: { color: '#a3a3a3', fontWeight: '700', fontSize: 14 },
    bidButton: { flex: 2, borderRadius: 12, overflow: 'hidden' },
});

