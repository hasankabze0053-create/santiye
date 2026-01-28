import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Keyboard, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';

const { width } = Dimensions.get('window');

const PAYMENT_LABELS = {
    'cash': 'Nakit',
    'credit_card': 'K. Kartı',
    'check': 'Çek/Senet',
    'transfer': 'Havale'
};

const TERMS_OPTIONS = ['Peşin', 'Kredi Kartı', '30 Gün', '45 Gün', '60 Gün', '90 Gün'];

export default function MarketProviderScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'bids'

    // Data
    const [requests, setRequests] = useState([]);
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
    const [shippingType, setShippingType] = useState('buyer_pays'); // 'buyer_pays', 'included', 'extra'
    const [stockStatus, setStockStatus] = useState('immediate'); // 'immediate', '3_days'
    const [validity, setValidity] = useState(24); // hours
    const [deliveryDate, setDeliveryDate] = useState(''); // Text for now ("Salı uygun" etc.)
    const [vatIncluded, setVatIncluded] = useState(false); // false: +KDV, true: KDV Dahil

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

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setRefreshing(true);
        const data = await MarketService.getOpenRequests();
        setRequests(data);
        setRefreshing(false);
    };

    const openBidModal = (req) => {
        setSelectedRequest(req);
        setBidPrice('');
        setBidNotes('');
        setShippingIncluded(true);
        setBidPrice('');
        setBidNotes('');
        setShippingIncluded(false);
        setPaymentTerm('Peşin');
        // Reset new fields
        setPumpFee('');
        setShippingType('buyer_pays');
        setStockStatus('immediate');
        setValidity(24);
        setDeliveryDate('');
        setVatIncluded(false);

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
                shipping_included: shippingIncluded, // Deprecated but kept
                // New Fields
                pump_fee: parseFloat(pumpFee) || 0,
                shipping_type: shippingType,
                delivery_date: deliveryDate,
                stock_status: stockStatus,
                validity_duration: validity
            });

            if (result.success) {
                Alert.alert("Başarılı", "Teklifiniz iletildi.");
                setModalVisible(false);
            } else {
                Alert.alert("Hata", "Teklif gönderilemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Bir sorun oluştu.");
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
                {count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}
            </LinearGradient>
            <Text style={styles.controlLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const renderLeadsTab = () => {
        // Filter out archived requests for the main feed
        const activeRequests = requests.filter(req => !archivedRequests.includes(req.id));

        return (
            <View style={styles.tabContent}>
                <View style={styles.feedHeader}>
                    <Text style={styles.feedTitle}>FIRSAT HAVUZU ({activeRequests.length})</Text>
                    <TouchableOpacity onPress={loadRequests} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }}>
                        <Ionicons name="filter" size={16} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>Filtrele</Text>
                    </TouchableOpacity>
                </View>

                {activeRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-search-outline" size={56} color="#334155" />
                        <Text style={styles.emptyText}>Bölgenizde açık talep bulunmuyor.</Text>
                        <Text style={styles.emptySub}>Abonelik ayarlarınızı kontrol ediniz veya arşivi inceleyiniz.</Text>
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
                                        <Text style={styles.tagText}>YENİ TALEP</Text>
                                    </View>
                                )}
                                <View style={[styles.tagBadge, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                    <Ionicons name="location" size={10} color="#38bdf8" />
                                    <Text style={[styles.tagText, { color: '#38bdf8' }]}>YAKIN KONUM</Text>
                                </View>
                                <View style={[styles.timerTag, { marginLeft: 'auto' }]}>
                                    <Ionicons name="time" size={12} color="#F59E0B" />
                                    <Text style={styles.timerText}>2s Kaldı</Text>
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
                                        <Text style={styles.detailLabel}>MALZEME</Text>
                                        <Text style={styles.detailValue}>{req.items ? req.items[0]?.product_name : 'Belirtilmedi'}</Text>
                                    </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Quantity */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="weight" size={18} color="#94a3b8" />
                                    </View>
                                    <View>
                                        <Text style={styles.detailLabel}>MİKTAR</Text>
                                        <Text style={styles.detailValue}>{req.items ? req.items[0]?.quantity : '-'} {req.items ? req.items[0]?.unit : ''}</Text>
                                    </View>
                                </View>
                                <View style={styles.hDivider} />

                                {/* Location */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIcon}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={18} color="#EF4444" />
                                    </View>
                                    <View>
                                        <Text style={styles.detailLabel}>TESLİMAT YERİ</Text>
                                        <Text style={styles.detailValue}>{(req.location || 'Konum Bilgisi Yok').replace('(Varsayılan)', '').trim()} <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 'normal' }}>(12 km)</Text></Text>
                                    </View>
                                </View>
                            </View>

                            {/* 3. Actions */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.passBtn} onPress={() => handleArchive(req.id)}>
                                    <Text style={styles.passBtnText}>Pas Geç</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(req)}>
                                    <LinearGradient
                                        colors={['#F59E0B', '#ffdd00']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.gradientBtn}
                                    >
                                        <Text style={styles.bidButtonText}>TEKLİF VER</Text>
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
                    <Text style={styles.feedTitle}>ARŞİVLENEN TALEPLER ({archivedList.length})</Text>
                </View>

                {archivedList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Henüz arşivlenen talep yok.</Text>
                    </View>
                ) : (
                    archivedList.map(req => (
                        <View key={req.id} style={[styles.leadCard, { opacity: 0.6 }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{req.title}</Text>
                            <Text style={{ color: '#aaa', fontSize: 13 }}>{req.location}</Text>
                            <TouchableOpacity onPress={() => handleRestore(req.id)} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                                <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>Geri Al</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        );
    };

    const renderBidsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.funnelContainer}>
                <View style={[styles.funnelBox, { borderColor: 'rgba(251, 191, 36, 0.3)' }]}>
                    <Text style={[styles.funnelNum, { color: '#fbbf24' }]}>3</Text>
                    <Text style={styles.funnelTxt}>BEKLEYEN</Text>
                </View>
                <View style={[styles.funnelBox, { borderColor: 'rgba(74, 222, 128, 0.3)' }]}>
                    <Text style={[styles.funnelNum, { color: '#4ade80' }]}>1</Text>
                    <Text style={styles.funnelTxt}>KAZANILAN</Text>
                </View>
                <View style={[styles.funnelBox, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                    <Text style={[styles.funnelNum, { color: '#ef4444' }]}>5</Text>
                    <Text style={styles.funnelTxt}>KAYBEDİLEN</Text>
                </View>
            </View>

            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Henüz detaylı geçmiş verisi yok.</Text>
            </View>
        </View>
    );

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
                            <Text style={styles.modalTitle}>Hizmet Bölgesi Ayarları</Text>
                            <Text style={styles.modalSub}>Müşterilere görünürlüğünüzü yönetin.</Text>
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
                            <Text style={{ color: sellerType === 'CONCRETE' ? '#FFD700' : '#737373', fontWeight: 'bold' }}>Betoncu (Lokal)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSellerType('MATERIAL')}
                            style={{ flex: 1, padding: 10, borderRadius: 6, backgroundColor: sellerType === 'MATERIAL' ? '#333' : 'transparent', alignItems: 'center' }}
                        >
                            <Text style={{ color: sellerType === 'MATERIAL' ? '#FFD700' : '#737373', fontWeight: 'bold' }}>Malzemeci (Kargo)</Text>
                        </TouchableOpacity>
                    </View>

                    {sellerType === 'CONCRETE' ? (
                        <View>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color="#38bdf8" />
                                <Text style={styles.infoText}>Hazır betonun donma riski nedeniyle sadece tesisinize belirli mesafedeki işleri görüntüleyebilirsiniz.</Text>
                            </View>

                            <Text style={styles.label}>Hizmet Yarıçapı: <Text style={{ color: '#FFD700' }}>{serviceRadius} km</Text></Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => setServiceRadius(Math.max(5, serviceRadius - 5))} style={styles.iconBtnSmall}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
                                <View style={{ flex: 1, height: 4, backgroundColor: '#333', marginHorizontal: 12, borderRadius: 2 }}>
                                    <View style={{ width: `${(serviceRadius / 100) * 100}%`, height: '100%', backgroundColor: '#FFD700', borderRadius: 2 }} />
                                </View>
                                <TouchableOpacity onPress={() => setServiceRadius(Math.min(100, serviceRadius + 5))} style={styles.iconBtnSmall}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
                            </View>

                            <View style={{ height: 200, backgroundColor: '#111', borderRadius: 12, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' }}>
                                <MaterialCommunityIcons name="map-marker-radius" size={64} color="#333" />
                                <Text style={{ color: '#525252', marginTop: 8 }}>Harita Önizlemesi</Text>
                                <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' }} />
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.infoBox}>
                                <Ionicons name="cube" size={20} color="#4ADE80" />
                                <Text style={styles.infoText}>Ürünlerinizi kargo veya nakliye ile gönderebileceğiniz bölgeleri seçin.</Text>
                            </View>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'district' && styles.optionCardActive]} onPress={() => setShippingScope('district')}>
                                <View style={[styles.radio, shippingScope === 'district' && styles.radioActive]} />
                                <View>
                                    <Text style={styles.optionTitle}>Sadece İlçem</Text>
                                    <Text style={styles.optionSub}>Güngören ve çevresi</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'city' && styles.optionCardActive]} onPress={() => setShippingScope('city')}>
                                <View style={[styles.radio, shippingScope === 'city' && styles.radioActive]} />
                                <View>
                                    <Text style={styles.optionTitle}>Tüm İstanbul (Avrupa)</Text>
                                    <Text style={styles.optionSub}>Şehir içi nakliye imkanı</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.optionCard, shippingScope === 'country' && styles.optionCardActive]} onPress={() => setShippingScope('country')}>
                                <View style={[styles.radio, shippingScope === 'country' && styles.radioActive]} />
                                <View>
                                    <Text style={styles.optionTitle}>Tüm Türkiye</Text>
                                    <Text style={styles.optionSub}>Anlaşmalı kargo ile gönderim</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={[styles.modalBtn, { marginTop: 'auto' }]} onPress={() => setRegionModalVisible(false)}>
                        <Text style={styles.modalBtnText}>AYARLARI KAYDET</Text>
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
            // Remove non-numeric chars except dot/comma, replace comma with dot
            const cleaned = q.replace(/[^0-9.,]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }
        return 0;
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRequests} tintColor="#FFD700" />}
                >
                    {/* 1. HEADER */}
                    <View style={styles.header}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarTxt}>DD</Text>
                            </View>
                            <View>
                                <Text style={styles.welcome}>Hoşgeldin,</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={styles.companyName}>{sellerInfo.name}</Text>
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
                            <Text style={styles.statTxt}>{sellerInfo.rating} Puan</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Ionicons name="location" size={14} color="#94a3b8" />
                            <Text style={styles.statTxt}>{sellerInfo.location}</Text>
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
                            <Text style={[styles.msgTabTxt, activeTab === 'leads' && styles.msgTabTxtActive]}>FIRSATLAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('bids')} style={[styles.msgTab, activeTab === 'bids' && styles.msgTabActive]}>
                            <Text style={[styles.msgTabTxt, activeTab === 'bids' && styles.msgTabTxtActive]}>TEKLİFLERİM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('archived')} style={[styles.msgTab, activeTab === 'archived' && styles.msgTabActive]}>
                            <Text style={[styles.msgTabTxt, activeTab === 'archived' && styles.msgTabTxtActive]}>ARŞİV</Text>
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
                                <Text style={styles.modalTitle}>Hızlı Teklif Ver</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                    <Ionicons name="close" size={26} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View>

                                    {selectedRequest && (
                                        <View>
                                            <View style={styles.reqSummary}>
                                                <Text style={styles.summaryTitle} numberOfLines={2}>{selectedRequest.title}</Text>

                                                <View style={[styles.hDivider, { marginVertical: 10, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                                                <View style={{ flexDirection: 'row', gap: 20 }}>
                                                    <View>
                                                        <Text style={styles.detailLabel}>MİKTAR</Text>
                                                        <Text style={styles.detailValue}>{selectedRequest.items ? selectedRequest.items[0]?.quantity : '-'} {selectedRequest.items ? selectedRequest.items[0]?.unit : ''}</Text>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.detailLabel}>TESLİMAT YERİ</Text>
                                                        <Text style={styles.detailValue} numberOfLines={1}>{selectedRequest.location.replace('(Varsayılan)', '').trim()}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* DYNAMIC FORM LOGIC */}
                                            {/* Checking if Concrete or Material based on title/items */}
                                            {(selectedRequest.title.toLowerCase().includes('beton') || selectedRequest.items?.some(i => i.product_name.toLowerCase().includes('beton'))) ? (
                                                // --- CONCRETE SCENARIO ---
                                                <View style={styles.dynamicSection}>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.label}>Birim Fiyat ({selectedRequest.items ? selectedRequest.items[0]?.unit : 'm³'})</Text>
                                                            <View>
                                                                <TextInput style={styles.bigInput} placeholder="0.00" placeholderTextColor="#525252" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />

                                                                {/* Buttons Row: VAT (Left) - Price (Right) */}
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>

                                                                    {/* VAT Toggles */}
                                                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                                                        <TouchableOpacity onPress={() => setVatIncluded(false)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: !vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: !vatIncluded ? '#FFD700' : '#404040' }}>
                                                                            <Text style={{ color: !vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>+ KDV</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity onPress={() => setVatIncluded(true)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: vatIncluded ? '#FFD700' : '#404040' }}>
                                                                            <Text style={{ color: vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>KDV Dahil</Text>
                                                                        </TouchableOpacity>
                                                                    </View>

                                                                    {/* Total Price */}
                                                                    {bidPrice ? (
                                                                        <View style={{ alignItems: 'flex-end' }}>
                                                                            <Text style={{ color: '#F1F5F9', fontSize: 13, marginBottom: 4, fontWeight: '700' }}>TOPLAM TUTAR</Text>
                                                                            <Text style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900' }}>
                                                                                ≈ {((parseFloat(bidPrice) || 0) * getSafeQuantity()).toLocaleString('tr-TR')} TL
                                                                            </Text>
                                                                        </View>
                                                                    ) : <View />}
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.label}>Pompa (TL)</Text>
                                                            <TextInput style={styles.bigInput} placeholder="Ekstra" placeholderTextColor="#525252" keyboardType="numeric" value={pumpFee} onChangeText={setPumpFee} />
                                                        </View>
                                                    </View>

                                                    <Text style={styles.label}>Döküm Tarihi Uygunluğu</Text>
                                                    <TextInput
                                                        style={styles.inputBox}
                                                        placeholder="Örn: Salı sabah dökebiliriz"
                                                        placeholderTextColor="#525252"
                                                        value={deliveryDate}
                                                        onChangeText={setDeliveryDate}
                                                    />
                                                </View>
                                            ) : (
                                                // --- MATERIAL SCENARIO ---
                                                <View style={styles.dynamicSection}>
                                                    <Text style={styles.label}>Birim Fiyat (Adet/Kg)</Text>
                                                    <View>
                                                        <TextInput style={styles.bigInput} placeholder="0.00" placeholderTextColor="#525252" keyboardType="numeric" value={bidPrice} onChangeText={setBidPrice} />

                                                        {/* Buttons Row: VAT (Left) - Price (Right) */}
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>

                                                            {/* VAT Toggles */}
                                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                                <TouchableOpacity onPress={() => setVatIncluded(false)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: !vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: !vatIncluded ? '#FFD700' : '#404040' }}>
                                                                    <Text style={{ color: !vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>+ KDV</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => setVatIncluded(true)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: vatIncluded ? 'rgba(255, 215, 0, 0.15)' : '#1a1a1a', borderWidth: 1, borderColor: vatIncluded ? '#FFD700' : '#404040' }}>
                                                                    <Text style={{ color: vatIncluded ? '#FFD700' : '#737373', fontSize: 13, fontWeight: '700' }}>KDV Dahil</Text>
                                                                </TouchableOpacity>
                                                            </View>

                                                            {/* Total Price */}
                                                            {bidPrice ? (
                                                                <View style={{ alignItems: 'flex-end' }}>
                                                                    <Text style={{ color: '#F1F5F9', fontSize: 13, marginBottom: 4, fontWeight: '700' }}>TOPLAM TUTAR</Text>
                                                                    <Text style={{ color: '#4ADE80', fontSize: 24, fontWeight: '900' }}>
                                                                        ≈ {((parseFloat(bidPrice) || 0) * getSafeQuantity()).toLocaleString('tr-TR')} TL
                                                                    </Text>
                                                                </View>
                                                            ) : <View />}
                                                        </View>
                                                    </View>

                                                    <Text style={styles.label}>Stok Durumu</Text>
                                                    <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                                                        <TouchableOpacity onPress={() => setStockStatus('immediate')} style={[styles.chip, stockStatus === 'immediate' && styles.chipActive]}><Text style={[styles.chipText, stockStatus === 'immediate' && styles.chipTextActive]}>Hemen Teslim</Text></TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setStockStatus('wait')} style={[styles.chip, stockStatus === 'wait' && styles.chipActive]}><Text style={[styles.chipText, stockStatus === 'wait' && styles.chipTextActive]}>2-3 Gün</Text></TouchableOpacity>
                                                    </View>

                                                    <Text style={styles.label}>Teslimat / Kargo</Text>
                                                    <View style={styles.shippingOptions}>
                                                        <TouchableOpacity onPress={() => setShippingType('buyer_pays')} style={[styles.shipOpt, shippingType === 'buyer_pays' && styles.shipOptActive]}>
                                                            <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={shippingType === 'buyer_pays' ? '#000' : '#737373'} />
                                                            <Text style={[styles.shipText, shippingType === 'buyer_pays' && styles.shipTextActive]}>Alıcı Öder</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => setShippingType('included')} style={[styles.shipOpt, shippingType === 'included' && styles.shipOptActive]}>
                                                            <MaterialCommunityIcons name="check-circle-outline" size={20} color={shippingType === 'included' ? '#000' : '#737373'} />
                                                            <Text style={[styles.shipText, shippingType === 'included' && styles.shipTextActive]}>Dahil</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}

                                            {/* COMMON: VALIDITY */}
                                            <Text style={styles.label}>Teklif Geçerlilik Süresi</Text>
                                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                                {[24, 48, 168].map(h => (
                                                    <TouchableOpacity key={h} onPress={() => setValidity(h)} style={[styles.chip, validity === h && styles.chipActive]}>
                                                        <Text style={[styles.chipText, validity === h && styles.chipTextActive]}>{h === 168 ? '1 Hafta' : h + ' Saat'}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.label}>Ödeme Vadesi</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                                                {TERMS_OPTIONS.map(opt => (
                                                    <TouchableOpacity
                                                        key={opt}
                                                        style={[styles.chip, paymentTerm === opt && styles.chipActive]}
                                                        onPress={() => setPaymentTerm(opt)}
                                                    >
                                                        <Text style={[styles.chipText, paymentTerm === opt && styles.chipTextActive]}>{opt}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>

                                            <TouchableOpacity style={styles.modalBtn} onPress={submitBid}>
                                                <Text style={styles.modalBtnText}>TEKLİFİ GÖNDER</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
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

