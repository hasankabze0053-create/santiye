import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ContractorRequestsScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('İhaleler'); // 'İhaleler' | 'Tekliflerim'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let data = [];

            if (activeTab === 'İhaleler') {
                // Fetch requests NOT YET BID ON
                data = await ConstructionService.getOpenRequestsForContractor();
            } else {
                // Fetch requests ALREADY BID ON
                data = await ConstructionService.getContractorBids();
            }

            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const renderItem = ({ item }) => (
        <GlassCard
            style={styles.card}
            onPress={() => navigation.navigate('ContractorRequestDetail', { request: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker-radius" size={18} color="#D4AF37" />
                    <Text style={styles.districtText}>{item.district}, {item.neighborhood}</Text>
                </View>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>TÜR</Text>
                    <Text style={styles.detailValue}>
                        {item.offer_type === 'anahtar_teslim' ? 'Anahtar Teslim' : 'Kat Karşılığı'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ADA / PARSEL</Text>
                    <Text style={styles.detailValue}>{item.ada} / {item.parsel}</Text>
                </View>
            </View>

            {item.is_campaign_active && (
                <View style={styles.campaignBadge}>
                    <MaterialCommunityIcons name="star-circle" size={16} color="#000" />
                    <Text style={styles.campaignText}>Yarısı Bizden Kampanyalı</Text>
                </View>
            )}

            {/* If My Bids tab, show my offer price if available */}
            {activeTab === 'Tekliflerim' && item.my_offer && (
                <View style={{ marginTop: 10, padding: 10, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: '#D4AF37' }}>
                    <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 12 }}>TEKLİFİNİZ</Text>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                        {item.my_offer.price_estimate ? item.my_offer.price_estimate.toLocaleString('tr-TR') + ' ₺' : 'Kat Karşılığı'}
                    </Text>
                    <Text style={{ color: '#BBB', fontSize: 10 }}>{item.my_offer.status === 'pending' ? 'Değerlendiriliyor' : (item.my_offer.status === 'approved' ? 'Onaylandı' : 'Reddedildi')}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.viewDetailsText}>{activeTab === 'İhaleler' ? 'DETAYLARI GÖR & TEKLİF VER' : 'TEKLİFİNİ İNCELE'}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#D4AF37" />
            </View>
        </GlassCard>
    );

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MÜTEAHHİT PANELİ</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* TABS */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'İhaleler' && styles.activeTabButton]}
                        onPress={() => setActiveTab('İhaleler')}
                    >
                        <Text style={[styles.tabText, activeTab === 'İhaleler' && styles.activeTabText]}>İHALELER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Tekliflerim' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Tekliflerim')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Tekliflerim' && styles.activeTabText]}>TEKLİFLERİM</Text>
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D4AF37" />
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name={activeTab === 'İhaleler' ? "clipboard-text-off-outline" : "file-document-edit-outline"} size={64} color="#666" />
                                <Text style={styles.emptyText}>
                                    {activeTab === 'İhaleler' ? 'Bekleyen açık ihale bulunmuyor.' : 'Henüz bir teklif vermediniz.'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
    },
    headerTitle: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    listContent: {
        padding: 16,
        paddingBottom: 40
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    districtText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    dateContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    dateText: {
        color: '#BBB',
        fontSize: 12
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        color: '#888',
        fontSize: 11,
        marginBottom: 4,
        fontWeight: '600'
    },
    detailValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500'
    },
    campaignBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D4AF37',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 12
    },
    campaignText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold'
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        marginTop: 4
    },
    viewDetailsText: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16
    },
    emptyText: {
        color: '#888',
        fontSize: 16
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTabButton: {
        borderBottomColor: '#D4AF37'
    },
    tabText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 14
    },
    activeTabText: {
        color: '#D4AF37'
    }
});
