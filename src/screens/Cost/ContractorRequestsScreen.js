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
import { supabase } from '../../lib/supabase';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ContractorRequestsScreen() {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('construction_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
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
    }, []);

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

            <View style={styles.footer}>
                <Text style={styles.viewDetailsText}>DETAYLARI GÖR & TEKLİF VER</Text>
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
                    <Text style={styles.headerTitle}>GELEN TALEPLER</Text>
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
                                <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color="#666" />
                                <Text style={styles.emptyText}>Henüz bekleyen talep bulunmuyor.</Text>
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
    }
});
