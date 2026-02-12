import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import PremiumBackground from '../../components/PremiumBackground';
import { supabase } from '../../lib/supabase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function UserRequestsScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedIds, setExpandedIds] = useState([]);
    const [offers, setOffers] = useState({}); // Map request_id -> offers[]

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('construction_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching user requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchOffers = async (requestId) => {
        if (offers[requestId]) return; // Already fetched

        try {
            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, profiles:contractor_id(full_name, avatar_url, company_name)') // Assuming relation
                .eq('request_id', requestId)
                .order('created_at', { ascending: false });

            if (error) {
                // If relation fails (profiles might not be linked in schema foreign key directly if implicit), try simple fetch
                const { data: simpleData, error: simpleError } = await supabase
                    .from('construction_offers')
                    .select('*')
                    .eq('request_id', requestId);

                if (simpleError) throw simpleError;
                // Manually fetch profiles if needed, for now just show basic info
                setOffers(prev => ({ ...prev, [requestId]: simpleData || [] }));
            } else {
                setOffers(prev => ({ ...prev, [requestId]: data || [] }));
            }

        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    const toggleExpand = async (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(prev => prev.filter(eid => eid !== id));
        } else {
            setExpandedIds(prev => [...prev, id]);
            await fetchOffers(id);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const renderItem = ({ item }) => {
        const isExpanded = expandedIds.includes(item.id);
        const requestOffers = offers[item.id] || [];

        return (
            <View style={styles.cardContainer}>
                <GlassCard
                    style={[styles.card, isExpanded && styles.cardExpanded]}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.districtText}>{item.district}, {item.neighborhood}</Text>
                            <Text style={styles.dateText}>Talep Tarihi: {formatDate(item.created_at)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#FFA500' : '#4CAF50' }]}>
                            <Text style={styles.statusText}>{item.status === 'pending' ? 'BEKLEMEDE' : 'AKTİF'}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={styles.detailsText}>
                            {item.offer_type === 'anahtar_teslim' ? 'Anahtar Teslim' : 'Kat Karşılığı'} • {item.ada}/{item.parsel}
                        </Text>
                        <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#D4AF37" />
                    </View>
                </GlassCard>

                {isExpanded && (
                    <View style={styles.offersContainer}>
                        <Text style={styles.offersTitle}>GELEN TEKLİFLER ({requestOffers.length})</Text>
                        {requestOffers.length === 0 ? (
                            <Text style={styles.noOffersText}>Henüz bu talebe bir teklif gelmedi.</Text>
                        ) : (
                            requestOffers.map((offer, index) => (
                                <View key={offer.id} style={styles.offerItem}>
                                    <View style={styles.offerHeader}>
                                        <Text style={styles.contractorName}>Müteahhit Firma</Text>
                                        {/* Since we might not have join setup perfectly, generic name */}
                                        <Text style={styles.offerPrice}>{offer.price_estimate ? `${offer.price_estimate.toLocaleString()} TL` : 'Fiyat Belirtilmemiş'}</Text>
                                    </View>
                                    <Text style={styles.offerDetails} numberOfLines={3}>{offer.offer_details}</Text>
                                    <TouchableOpacity style={styles.contactBtn}>
                                        <Text style={styles.contactBtnText}>İLETİŞİME GEÇ</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TALEPLERİM</Text>
                    <View style={{ width: 44 }} />
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
                                <MaterialCommunityIcons name="folder-outline" size={64} color="#666" />
                                <Text style={styles.emptyText}>Henüz bir talep oluşturmadınız.</Text>
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
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        padding: 16,
        zIndex: 1
    },
    cardExpanded: {
        borderColor: '#D4AF37',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    districtText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    dateText: {
        color: '#888',
        fontSize: 12,
        marginTop: 2
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    statusText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold'
    },
    detailsText: {
        color: '#BBB',
        fontSize: 13
    },
    offersContainer: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#333',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        padding: 16
    },
    offersTitle: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12
    },
    noOffersText: {
        color: '#666',
        fontSize: 13,
        fontStyle: 'italic'
    },
    offerItem: {
        backgroundColor: '#1A1A1A',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    offerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    contractorName: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    offerPrice: {
        color: '#D4AF37',
        fontWeight: 'bold'
    },
    offerDetails: {
        color: '#BBB',
        fontSize: 12,
        marginBottom: 8
    },
    contactBtn: {
        backgroundColor: '#D4AF37',
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 6
    },
    contactBtnText: {
        color: '#000',
        fontSize: 11,
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
    }
});
