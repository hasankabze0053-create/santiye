import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// Reuse categories from HomeScreen logic but adapted
const ADMIN_MODULES = [
    {
        id: 'renovation',
        title: 'TADİLAT',
        subtitle: 'Boya & Tamirat',
        table: null, // Placeholder or separate table later
        icon: 'hammer-wrench',
        color: '#D4AF37',
        image: require('../../assets/categories/cat_renovation_v9.png'),
    },
    {
        id: 'market',
        title: 'MARKET',
        subtitle: 'Yapı Malzemesi',
        table: 'market_requests',
        icon: 'shopping',
        color: '#34C759', // Green
        image: require('../../assets/categories/cat_market_v4.png'),
    },
    {
        id: 'logistics',
        title: 'NAKLİYE',
        subtitle: 'Lojistik Çözüm',
        table: 'transport_requests',
        icon: 'truck-delivery',
        color: '#3B82F6', // Blue
        image: require('../../assets/categories/cat_logistics_v11.png'),
    },
    {
        id: 'urban_transformation',
        title: 'KENTSEL DÖNÜŞÜM',
        subtitle: 'Devlet Destekli',
        table: 'construction_requests', // Correct table
        icon: 'home-city',
        color: '#FFD700',
        image: require('../../assets/categories/cat_yerindedonusum_v3.png'),
    },
    {
        id: 'rental',
        title: 'KİRALAMA',
        subtitle: 'İş Makinesi',
        table: null, // Not implemented yet
        icon: 'excavator',
        color: '#F59E0B', // Orange
        image: require('../../assets/categories/cat_rental_v4.png'),
    },
    {
        id: 'engineering',
        title: 'TEKNİK OFİS',
        subtitle: 'Mühendis & Mimar',
        table: null,
        icon: 'compass-drafting',
        color: '#8B5CF6', // Purple
        image: require('../../assets/categories/cat_engineering_v10.png'),
    },
    {
        id: 'law',
        title: 'HUKUK',
        subtitle: 'Yasal Danışmanlık',
        table: null,
        icon: 'gavel',
        color: '#EF4444', // Red
        image: require('../../assets/categories/cat_law_v4.png'),
    },
    {
        id: 'urban_transformation',
        title: 'KENTSEL DÖNÜŞÜM',
        subtitle: 'Devlet Destekli',
        table: null,
        icon: 'city-variant-outline',
        color: '#2563EB', // Blue-ish
        image: require('../../assets/categories/cat_yerindedonusum_v3.png'),
    },
    {
        id: 'cost',
        title: 'MALİYET',
        subtitle: 'Proje Hesabı',
        table: null,
        icon: 'calculator-variant',
        color: '#10B981', // Emerald
        image: require('../../assets/categories/cat_cost_v5.png'),
    },
];

const AdminDashboardScreen = () => {
    const navigation = useNavigation();
    const [selectedModule, setSelectedModule] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Config Management State
    const [isEditMode, setIsEditMode] = useState(false);
    const [configModules, setConfigModules] = useState([]);

    // Reuse ASSET_MAP for admin display if needed, or just use icons
    // We will use the list from DB for the grid when in Edit Mode

    // Fetch requests when a module is selected
    useEffect(() => {
        if (selectedModule && selectedModule.table) {
            fetchModuleData(selectedModule.table);
        } else if (selectedModule) {
            // Module with no table
            setRequests([]);
        }
    }, [selectedModule]);

    // Fetch Config for Edit Mode or Grid
    useEffect(() => {
        fetchParameters();
    }, []);

    const fetchParameters = async () => {
        try {
            const { data, error } = await supabase
                .from('app_module_config')
                .select('*')
                .order('sort_order', { ascending: true });
            if (!error && data) {
                setConfigModules(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleModuleVisibility = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        // Optimistic Update
        setConfigModules(prev => prev.map(m => m.id === id ? { ...m, is_active: newStatus } : m));

        await supabase.from('app_module_config').update({ is_active: newStatus }).eq('id', id);
    };

    const moveModule = async (index, direction) => {
        const newModules = [...configModules];
        if (direction === 'up' && index > 0) {
            [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
        } else if (direction === 'down' && index < newModules.length - 1) {
            [newModules[index + 1], newModules[index]] = [newModules[index], newModules[index + 1]];
        } else {
            return;
        }

        // Reassign sort orders
        const updates = newModules.map((m, i) => ({
            id: m.id,
            sort_order: (i + 1) * 10
        }));

        setConfigModules(newModules); // Optimistic

        // Batch update ? For now loop (simple enough for 8 items)
        for (let u of updates) {
            await supabase.from('app_module_config').update({ sort_order: u.sort_order }).eq('id', u.id);
        }
    };

    const fetchModuleData = async (tableName) => {
        try {
            setLoading(true);

            // Build Query String safely
            let selectQuery = '*, profiles(full_name, email)';

            if (tableName === 'construction_requests') {
                selectQuery += ', bids:construction_offers(*)';
                selectQuery += ', offers:construction_offers(*)';
            } else if (tableName === 'market_requests') {
                selectQuery += ', bids:market_bids(*)';
                selectQuery += ', items:market_request_items(*)';
            } else if (tableName === 'transport_requests') {
                selectQuery += ', bids:transport_bids(*)';
            }

            let query = supabase
                .from(tableName)
                .select(selectQuery)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error(`Error fetching ${tableName}:`, error);
                throw error;
            }

            setRequests(data || []);
        } catch (error) {
            console.log(error); // Debugging
            Alert.alert('Hata', 'Veriler çekilemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Admin Silme İşlemi',
            'Bu talebi kalıcı olarak silmek istediğinize emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from(selectedModule.table).delete().eq('id', item.id);
                            if (error) throw error;

                            Alert.alert('Başarılı', 'Talep silindi.');
                            fetchModuleData(selectedModule.table); // Refresh
                        } catch (err) {
                            Alert.alert('Hata', 'Silme işlemi başarısız: ' + err.message);
                        }
                    }
                }
            ]
        );
    };

    // --- RENDER MODULE GRID ---
    const renderModuleItem = ({ item }) => {
        // Resolve Assets
        const imageSource = ASSET_MAP[item.image_asset_key] || item.image; // Fallback to item.image if still hardcoded

        // Define Icon (Fallback mapping if needed, or assume db has correct icon names)
        // Hardcoded modules in original file had specific icons. 
        // We might want to ensure 'hammer-wrench' etc are passed accurately or defaulted.
        const iconName = item.icon || 'circle-outline';
        const color = item.color || '#D4AF37';

        return (
            <TouchableOpacity
                style={styles.moduleCard}
                activeOpacity={0.8}
                onPress={() => setSelectedModule(item)}
            >
                <View style={styles.moduleImageContainer}>
                    <Image source={imageSource} style={styles.moduleBg} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                <View style={styles.moduleContent}>
                    <View style={[styles.iconBadge, { backgroundColor: color }]}>
                        <MaterialCommunityIcons name={iconName} size={20} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.moduleTitle}>{item.title}</Text>
                        <Text style={styles.moduleSubtitle}>{item.subtitle}</Text>
                    </View>
                </View>
                <View style={[styles.borderOverlay, { borderColor: color }]} />
            </TouchableOpacity>
        );
    };

    // --- RENDER REQUEST ITEM ---
    const renderRequestItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => setSelectedRequest(item)}
        >
            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: selectedModule.color + '20' }]}>
                    <MaterialCommunityIcons
                        name={selectedModule.icon}
                        size={24}
                        color={selectedModule.color}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.title}>{item.title || selectedModule.title + ' Talebi'}</Text>
                    <Text style={styles.subtitle}>
                        {item.city || 'Tüm Şehirler'} / {item.district || 'Tüm İlçeler'} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                    {item.profiles ? (
                        <Text style={styles.userText}>👤 {item.profiles.email} ({item.profiles.full_name})</Text>
                    ) : (
                        <Text style={styles.userText}>👤 Kullanıcı (Bilinmiyor)</Text>
                    )}
                </View>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
                    <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // --- MAIN RENDER ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#000000']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADERS */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => selectedModule ? setSelectedModule(null) : navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {selectedModule ? selectedModule.title : (isEditMode ? 'VİTRİN DÜZENLE' : 'ADMİN PANELİ')}
                    </Text>

                    {/* EDIT BUTTON TOGGLE */}
                    {!selectedModule && (
                        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={styles.editBtn}>
                            <MaterialCommunityIcons name={isEditMode ? "check" : "view-dashboard-edit"} size={24} color={isEditMode ? "#4ADE80" : "#D4AF37"} />
                        </TouchableOpacity>
                    )}
                    {selectedModule && <View style={{ width: 40 }} />}
                </View>

                <View style={{ flex: 1 }}>
                    {selectedModule ? (
                        /* MODULE DETAIL VIEW */
                        loading ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <ActivityIndicator size="large" color="#D4AF37" />
                            </View>
                        ) : (
                            <FlatList
                                key="request-list"
                                data={requests}
                                renderItem={renderRequestItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                                style={{ flex: 1 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => { setRefreshing(true); fetchModuleData(selectedModule.table); }}
                                        tintColor="#D4AF37"
                                    />
                                }
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#444" />
                                        <Text style={styles.emptyText}>Henüz talep bulunmuyor.</Text>
                                        {!selectedModule.table && (
                                            <Text style={styles.debugText}>(Özellik geliştirme aşamasında)</Text>
                                        )}
                                    </View>
                                }
                            />
                        )
                    ) : (
                        /* MODULE GRID VIEW OR EDIT LIST */
                        isEditMode ? (
                            <FlatList
                                data={configModules}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => (
                                    <View style={styles.editRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="drag-horizontal" size={24} color="#666" style={{ marginRight: 10 }} />
                                            <Text style={[styles.editTitle, !item.is_active && { color: '#555', textDecorationLine: 'line-through' }]}>
                                                {item.title}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <TouchableOpacity onPress={() => moveModule(index, 'up')} disabled={index === 0}>
                                                <Ionicons name="arrow-up-circle" size={28} color={index === 0 ? '#333' : '#3B82F6'} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => moveModule(index, 'down')} disabled={index === configModules.length - 1}>
                                                <Ionicons name="arrow-down-circle" size={28} color={index === configModules.length - 1 ? '#333' : '#3B82F6'} />
                                            </TouchableOpacity>
                                            <View style={{ width: 10 }} />
                                            <TouchableOpacity onPress={() => toggleModuleVisibility(item.id, item.is_active)}>
                                                <MaterialCommunityIcons
                                                    name={item.is_active ? "eye" : "eye-off"}
                                                    size={24}
                                                    color={item.is_active ? "#4ADE80" : "#EF4444"}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                contentContainerStyle={{ padding: 20 }}
                            />
                        ) : (
                            <FlatList
                                key="module-grid"
                                data={configModules.filter(m => m.is_active)}
                                renderItem={({ item }) => {
                                    // Merge with static definition to get Icon, Color, Table info
                                    const staticDef = ADMIN_MODULES.find(m => m.id === item.id) || {};
                                    const mergedItem = {
                                        ...staticDef,
                                        ...item,
                                        // DB image_asset_key is handled by renderModuleItem using ASSET_MAP
                                        // But we ensure 'image' fallback exists via staticDef
                                    };
                                    return renderModuleItem({ item: mergedItem });
                                }}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                                numColumns={1}
                                style={{ flex: 1 }}
                            />
                        )
                    )}
                </View>

                {/* DETAIL MODAL */}
                <Modal
                    visible={!!selectedRequest}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setSelectedRequest(null)}
                >
                    <View style={styles.modalContainer}>
                        <LinearGradient colors={['#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Talep Detayı</Text>
                            <TouchableOpacity onPress={() => setSelectedRequest(null)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {selectedRequest && (
                            <FlatList
                                data={selectedRequest.bids || selectedRequest.offers || []}
                                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                                ListHeaderComponent={() => (
                                    <View>
                                        {/* Request Info */}
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailLabel}>TALEP BİLGİLERİ</Text>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoKey}>Başlık:</Text>
                                                <Text style={styles.infoValue}>{selectedRequest.title || selectedModule?.title + ' Talebi'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoKey}>Kullanıcı:</Text>
                                                <Text style={styles.infoValue}>{selectedRequest.profiles?.email || 'Bilinmiyor'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoKey}>Konum:</Text>
                                                <Text style={styles.infoValue}>{selectedRequest.city || selectedRequest.location || '-'} / {selectedRequest.district || '-'}</Text>
                                            </View>
                                            {selectedRequest.notes && (
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoKey}>Notlar:</Text>
                                                    <Text style={styles.infoValue}>{selectedRequest.notes}</Text>
                                                </View>
                                            )}
                                            {/* Special Fields for Market */}
                                            {selectedRequest.items && selectedRequest.items.length > 0 && (
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={[styles.infoKey, { marginBottom: 5 }]}>Sipariş Listesi:</Text>
                                                    {selectedRequest.items.map((it, idx) => (
                                                        <Text key={idx} style={styles.bulletItem}>• {it.product_name} ({it.quantity})</Text>
                                                    ))}
                                                </View>
                                            )}
                                            {/* Special Fields for Transport */}
                                            {selectedModule?.id === 'transport' && (
                                                <>
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoKey}>Nereden:</Text>
                                                        <Text style={styles.infoValue}>{selectedRequest.from_location}</Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoKey}>Nereye:</Text>
                                                        <Text style={styles.infoValue}>{selectedRequest.to_location}</Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>

                                        <Text style={[styles.detailLabel, { marginTop: 20, marginLeft: 20 }]}>TEKLİFLER ({(selectedRequest.bids || selectedRequest.offers || []).length})</Text>
                                    </View>
                                )}
                                renderItem={({ item }) => (
                                    <View style={styles.bidCard}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.bidPrice}>{item.price || item.price_estimate} ₺</Text>
                                            <Text style={styles.bidStatus}>{item.status}</Text>
                                        </View>
                                        <Text style={styles.bidNotes}>{item.notes || item.offer_details || 'Açıklama yok'}</Text>
                                        <Text style={styles.bidProvider}>Tedarikçi ID: {item.provider_id || item.contractor_id}</Text>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.noBidsText}>Henüz teklif verilmemiş.</Text>
                                }
                                contentContainerStyle={{ paddingBottom: 50 }}
                            />
                        )}
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
};

export default AdminDashboardScreen;

// Asset Logic Map
const ASSET_MAP = {
    'cat_rental_v4': require('../../assets/categories/cat_rental_v4.png'),
    'cat_market_v4': require('../../assets/categories/cat_market_v4.png'),
    'cat_renovation_v9': require('../../assets/categories/cat_renovation_v9.png'),
    'cat_engineering_v10': require('../../assets/categories/cat_engineering_v10.png'),
    'cat_law_v4': require('../../assets/categories/cat_law_v4.png'),
    'cat_logistics_v11': require('../../assets/categories/cat_logistics_v11.png'),
    'cat_yerindedonusum_v3': require('../../assets/categories/cat_yerindedonusum_v3.png'),
    'cat_cost_v5': require('../../assets/categories/cat_cost_v5.png'),
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderRadius: 20 },
    editBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

    // Module Card Styles
    moduleCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        marginBottom: 16,
        height: 100,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center'
    },
    moduleImageContainer: { ...StyleSheet.absoluteFillObject },
    moduleBg: { width: '100%', height: '100%', opacity: 0.6 },
    moduleContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    iconBadge: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3
    },
    moduleTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    moduleSubtitle: { color: '#DDD', fontSize: 13, marginTop: 2, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    borderOverlay: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderRadius: 16, opacity: 0.3 },

    // Edit Row Styles
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    editTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    // Request Card Styles
    card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    title: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    subtitle: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    userText: { color: '#64748b', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
    delBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, marginLeft: 10 },

    // Empty State
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { color: '#888', marginTop: 10, fontSize: 16 },
    debugText: { color: '#555', marginTop: 5, fontSize: 12 },

    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
    modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    detailSection: { backgroundColor: '#1e293b', margin: 20, padding: 20, borderRadius: 12 },
    detailLabel: { color: '#64748b', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
    infoRow: { flexDirection: 'row', marginBottom: 8 },
    infoKey: { color: '#94a3b8', width: 100, fontWeight: '600' },
    infoValue: { color: '#FFF', flex: 1 },
    bulletItem: { color: '#DDD', marginLeft: 10, marginTop: 2 },

    bidCard: { backgroundColor: '#0f172a', marginHorizontal: 20, marginBottom: 10, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
    bidPrice: { color: '#34C759', fontSize: 18, fontWeight: 'bold' },
    bidStatus: { color: '#F59E0B', fontSize: 12, textTransform: 'uppercase' },
    bidNotes: { color: '#ccc', marginTop: 5 },
    bidProvider: { color: '#555', fontSize: 10, marginTop: 8 },
    noBidsText: { color: '#666', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
});
