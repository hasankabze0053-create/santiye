import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConstructionService } from '../../services/ConstructionService';

const { width } = Dimensions.get('window');

export default function ContractorProviderScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('tenders'); // 'tenders' | 'bids' | 'won'

    // Static Provider Info (Mock for UI)
    const providerInfo = {
        name: 'Müteahhit Yapı A.Ş.',
        rating: 4.8,
        location: 'İstanbul, TR',
        isVerified: true
    };

    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const loadRequests = async () => {
        setRefreshing(true);
        let data = [];
        if (activeTab === 'tenders') {
            data = await ConstructionService.getOpenRequestsForContractor();
        } else if (activeTab === 'bids') {
            data = await ConstructionService.getContractorBids();
        } else {
            // won - future implementation
            data = [];
        }
        setRequests(data || []);
        setRefreshing(false);
    };

    useEffect(() => {
        loadRequests();
    }, [activeTab]);

    const renderTendersTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>
                    {activeTab === 'tenders' ? `YERİNDE DÖNÜŞÜM İHALELERİ (${requests.length})` : `VERİLEN TEKLİFLER (${requests.length})`}
                </Text>
                <TouchableOpacity onPress={loadRequests} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 }}>
                    <Ionicons name="filter" size={16} color="#94a3b8" />
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>Filtrele</Text>
                </TouchableOpacity>
            </View>

            {requests.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name={activeTab === 'tenders' ? "home-city-outline" : "file-document-edit-outline"} size={56} color="#334155" />
                    <Text style={styles.emptyText}>
                        {activeTab === 'tenders' ? 'Aktif kentsel dönüşüm ihalesi bulunmuyor.' : 'Henüz bir teklif vermediniz.'}
                    </Text>
                    {activeTab === 'tenders' && <Text style={styles.emptySub}>Yeni projeler eklendiğinde burada görünecek.</Text>}
                </View>
            ) : (
                requests.map((item, index) => (
                    <LinearGradient
                        key={`${item.id}-${index}`}
                        colors={['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']}
                        style={styles.leadCard}
                    >
                        {/* 1. STATUS TAGS */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            <View style={[styles.tagBadge, activeTab === 'bids' && { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                                <View style={[styles.statusDot, activeTab === 'bids' && { backgroundColor: '#D4AF37' }]} />
                                <Text style={[styles.tagText, activeTab === 'bids' && { color: '#D4AF37' }]}>
                                    {activeTab === 'bids'
                                        ? (item.my_offers && item.my_offers.length > 0
                                            ? (item.my_offers[0].status === 'approved' ? 'ONAYLANDI' : (item.my_offers[0].status === 'rejected' ? 'REDDEDİLDİ' : 'DEĞERLENDİRİLİYOR'))
                                            : 'DURUM BELİRSİZ')
                                        : 'TEKLİF BEKLİYOR'}
                                </Text>
                            </View>
                            <View style={[styles.timerTag, { marginLeft: 'auto' }]}>
                                <Ionicons name="calendar" size={12} color="#94a3b8" />
                                <Text style={styles.timerText}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                            </View>
                        </View>

                        {/* 2. PROJECT INFO */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.leadTitle}>Kentsel Dönüşüm Talebi</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <Ionicons name="location-sharp" size={14} color="#94a3b8" />
                                <Text style={styles.leadSub}>{item.city} / {item.district}</Text>
                            </View>
                        </View>

                        {/* 3. DETAILS ROW (Premium Chips) */}
                        <View style={styles.detailBox}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name="home-group" size={18} color="#D4AF37" />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>MODEL</Text>
                                    <Text style={styles.detailValue}>
                                        {(item.offer_type === 'kat_karsiligi' || item.offer_type === 'Kat Karşılığı' || item.offer_model === 'kat_karsiligi')
                                            ? 'Kat Karşılığı'
                                            : 'Anahtar Teslim'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.hDivider} />

                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <MaterialCommunityIcons name="file-document-outline" size={18} color="#D4AF37" />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>{activeTab === 'bids' ? 'SON TEKLİFİNİZ' : 'DURUM'}</Text>
                                    <Text style={styles.detailValue}>
                                        {activeTab === 'bids'
                                            ? (item.my_offers && item.my_offers.length > 0
                                                ? (item.my_offers[0].price_estimate ? item.my_offers[0].price_estimate.toLocaleString('tr-TR') + ' ₺' : 'Kat Karşılığı')
                                                : 'Belirtilmedi')
                                            : 'Aktif'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* 4. ACTIONS */}
                        <TouchableOpacity
                            style={styles.bidButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate(activeTab === 'bids' ? 'OfferDetail' : 'RequestDetail', {
                                request: item,
                                request_id: item.id,
                                contractor_id: item.my_offers?.[0]?.contractor_id,
                                type: 'construction',
                                ...(activeTab === 'bids' ? { offers: item.my_offers, readOnly: true } : {}) // Pass ALL offers for this request
                            })}
                        >
                            <LinearGradient
                                colors={['#D4AF37', '#FDCB58']} // Gold Gradient
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.bidButtonText}>{activeTab === 'bids' ? 'TEKLİFİ İNCELE' : 'DETAY EKRANINA GİT'}</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                    </LinearGradient>
                ))
            )}
        </View>
    );

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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRequests} tintColor="#D4AF37" />}
                >
                    {/* 1. HEADER */}
                    <View style={styles.header}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarTxt}>MY</Text>
                            </View>
                            <View>
                                <Text style={styles.welcome}>Hoşgeldin,</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={styles.companyName}>{providerInfo.name}</Text>
                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#D4AF37" />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="notifications-outline" size={24} color="#e2e8f0" />
                            <View style={styles.badgeDot} />
                        </TouchableOpacity>
                    </View>

                    {/* 2. STATS OVERVIEW */}
                    <View style={styles.statsRow}>
                        <View style={styles.statPill}>
                            <Ionicons name="star" size={14} color="#D4AF37" />
                            <Text style={styles.statTxt}>{providerInfo.rating} Puan</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Ionicons name="location" size={14} color="#94a3b8" />
                            <Text style={styles.statTxt}>{providerInfo.location}</Text>
                        </View>
                    </View>

                    {/* 3. TABS */}
                    <View style={styles.msgTabs}>
                        <TouchableOpacity onPress={() => setActiveTab('tenders')} style={[styles.msgTab, activeTab === 'tenders' && styles.msgTabActive]}>
                            <Text style={[styles.msgTabTxt, activeTab === 'tenders' && styles.msgTabTxtActive]}>İHALELER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('bids')} style={[styles.msgTab, activeTab === 'bids' && styles.msgTabActive]}>
                            <Text style={[styles.msgTabTxt, activeTab === 'bids' && styles.msgTabTxtActive]}>TEKLİFLERİM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('won')} style={[styles.msgTab, activeTab === 'won' && styles.msgTabActive]}>
                            <Text style={[styles.msgTabTxt, activeTab === 'won' && styles.msgTabTxtActive]}>KAZANILAN</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 4. CONTENT */}
                    {(activeTab === 'tenders' || activeTab === 'bids') ? renderTendersTab() : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="lock-outline" size={48} color="#334155" />
                            <Text style={styles.emptyText}>Bu özellik yakında aktif olacak.</Text>
                        </View>
                    )}

                </ScrollView>
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
    avatarTxt: { color: '#D4AF37', fontSize: 16, fontWeight: '800' },
    welcome: { color: '#a3a3a3', fontSize: 13 },
    companyName: { color: '#fff', fontSize: 17, fontWeight: '700' },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#333' },
    badgeDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#000' },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
    statTxt: { color: '#e5e5e5', fontSize: 13, fontWeight: '500' },

    // Tabs
    msgTabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#262626' },
    msgTab: { paddingBottom: 12, marginRight: 24, paddingHorizontal: 4 },
    msgTabActive: { borderBottomWidth: 2, borderBottomColor: '#D4AF37' },
    msgTabTxt: { color: '#737373', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
    msgTabTxtActive: { color: '#D4AF37' },

    // Feed
    tabContent: { paddingHorizontal: 20 },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    feedTitle: { color: '#e5e5e5', fontSize: 14, fontWeight: '700', letterSpacing: 1 },

    // Card
    leadCard: { padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },

    // Status Tag
    tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37' },
    tagText: { color: '#D4AF37', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

    timerTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timerText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },

    leadTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
    leadSub: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },

    // Details Box
    detailBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    detailRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 10 },
    detailLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
    detailValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '700' },
    hDivider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10 },

    // Button
    bidButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    gradientBtn: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    bidButtonText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.7, minHeight: 300 },
    emptyText: { color: '#d4d4d4', fontSize: 16, fontWeight: '600', marginBottom: 6, marginTop: 16 },
    emptySub: { color: '#737373', fontSize: 13, textAlign: 'center' },
});
