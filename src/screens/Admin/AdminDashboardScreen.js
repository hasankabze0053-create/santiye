import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, Modal, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

    // Scalable Dashboard State (V2)
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'module_detail' | 'users'
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'offers'
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [offers, setOffers] = useState([]); // Store offers/bids

    // User Management State
    const [users, setUsers] = useState([]);
    const [userTypeFilter, setUserTypeFilter] = useState('corporate'); // 'individual' | 'corporate'

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
        if (viewMode === 'users') {
            fetchUsers();
        }
    }, [viewMode, userTypeFilter]); // Re-fetch when switching views or filters

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


    const fetchModuleData = async (tableName, loadMore = false) => {
        if (!tableName) return;

        // Reset if new search or module change
        if (!loadMore) {
            setLoading(true);
            setPage(0);
            setRequests([]);
            setHasMore(true);
        }

        try {
            // Build Query String safely
            let selectQuery = '*, profiles(full_name, email)';

            if (tableName === 'construction_requests') {
                selectQuery += ', bids:construction_offers(*)';
                // selectQuery += ', offers:construction_offers(*)'; // Removed duplicate
            } else if (tableName === 'market_requests') {
                selectQuery += ', bids:market_bids(*)';
                selectQuery += ', items:market_request_items(*)';
            } else if (tableName === 'transport_requests') {
                selectQuery += ', bids:transport_bids(*)';
            }

            let query = supabase
                .from(tableName)
                .select(selectQuery)
                .order('created_at', { ascending: false })
                .range(loadMore ? (page + 1) * 20 : 0, loadMore ? (page + 1) * 20 + 19 : 19);

            // Apply Search Filter
            if (searchQuery) {
                // ILIKE for title or ID (if strictly numeric)
                // Note: Joining profiles for name search is complex in one query, restricting to title/id/city for now
                // query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
                // Simple implementation: Filter by city or id
                // query = query.ilike('city', `%${searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error(`Error fetching ${tableName}:`, error);
                throw error;
            }

            if (data.length < 20) {
                setHasMore(false);
            }

            if (loadMore) {
                setRequests(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            } else {
                setRequests(data || []);
            }

            // Also fetch offers if we are in module detail view
            fetchOffers(tableName);

        } catch (error) {
            console.log(error); // Debugging
            Alert.alert('Hata', 'Veriler çekilemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchOffers = async (tableName) => {
        // Determine offer table based on request table
        let offerTable = '';
        let foreignKey = '';

        if (tableName === 'construction_requests') { offerTable = 'construction_offers'; foreignKey = 'request_id'; }
        else if (tableName === 'market_requests') { offerTable = 'market_bids'; foreignKey = 'request_id'; }
        else if (tableName === 'transport_requests') { offerTable = 'transport_bids'; foreignKey = 'request_id'; }

        if (!offerTable) return;

        try {
            const { data, error } = await supabase
                .from(offerTable)
                .select(`
                    *,
                    profiles:provider_id(full_name, email, phone),
                    request:${tableName}(*)
                `)
                .order('created_at', { ascending: false })
                .limit(50); // Initial limit

            if (!error) {
                setOffers(data);
            }
        } catch (err) {
            console.error("Error fetching offers:", err);
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

    // --- USER MANAGEMENT LOGIC ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

            if (userTypeFilter === 'individual') {
                query = query.eq('user_type', 'individual');
            } else {
                query = query.eq('user_type', 'corporate');
            }

            const { data: profiles, error } = await query;
            if (error) throw error;

            // Fetch Companies to map phones for corporate users
            const { data: companies } = await supabase.from('companies').select('owner_id, phone');

            // Map phones to profiles
            const paramsWithPhone = profiles.map(p => {
                const company = companies?.find(c => c.owner_id === p.id);
                return {
                    ...p,
                    phone: company ? company.phone : p.phone // Use company phone or profile phone
                };
            });

            setUsers(paramsWithPhone || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            Alert.alert('Hata', 'Kullanıcılar çekilemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    const handleMessage = (phone) => {
        if (!phone) return;
        Linking.openURL(`whatsapp://send?phone=${phone}`);
    };

    const handleToggleSuspend = async (user) => {
        const isSuspended = user.approval_status === 'suspended';
        const newStatus = isSuspended ? 'approved' : 'suspended';
        const actionText = isSuspended ? 'Erişimi Aç' : 'Hesabı Dondur';

        Alert.alert(
            `${actionText}?`,
            `Kullanıcının erişim durumu "${newStatus}" olarak güncellenecek.`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Onayla',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('profiles')
                                .update({ approval_status: newStatus })
                                .eq('id', user.id);

                            if (error) throw error;

                            // Optimistic Update
                            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, approval_status: newStatus } : u));
                            Alert.alert('Başarılı', `Kullanıcı durumu güncellendi.`);
                        } catch (err) {
                            Alert.alert('Hata', 'İşlem başarısız: ' + err.message);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteUser = (user) => {
        Alert.alert(
            'Kullanıcıyı Sil Yanıyor! ⚠️',
            'Bu işlem geri alınamaz. Kullanıcı veritabanından tamamen silinecek.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'SİL',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('profiles').delete().eq('id', user.id);
                            if (error) throw error;

                            setUsers(prev => prev.filter(u => u.id !== user.id));
                            Alert.alert('Silindi', 'Kullanıcı başarıyla silindi.');
                        } catch (err) {
                            Alert.alert('Hata', 'Silme başarısız: ' + err.message);
                        }
                    }
                }
            ]
        );
    };

    const handleApproveUser = async (user) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ approval_status: 'approved' })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Başarılı', `${user.full_name || user.email} onaylandı. ✅`);
            // Optimistic Update
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, approval_status: 'approved' } : u));
        } catch (err) {
            Alert.alert('Hata', 'Onaylama başarısız: ' + err.message);
        }
    };

    const renderOfferItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.offerCard}
            activeOpacity={0.8}
            onPress={() => {
                if (item.request) {
                    // Show request details and THIS offer in the list
                    // We attach the offer to the request so the modal list serves it
                    const requestWithOffer = { ...item.request, bids: [item] };
                    setSelectedRequest(requestWithOffer);
                } else {
                    Alert.alert('Hata', 'Talep detaylarına ulaşılamadı.');
                }
            }}
        >
            <View style={styles.offerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.offerIconBox}>
                        <MaterialCommunityIcons name="tag-text-outline" size={20} color="#34D399" />
                    </View>
                    <View>
                        <Text style={styles.offerProviderName}>{item.profiles?.full_name || 'Bilinmeyen Tedarikçi'}</Text>
                        <Text style={styles.offerDate}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'accepted' ? 'rgba(74, 222, 128, 0.1)' :
                        item.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                }]}>
                    <Text style={[styles.statusText, {
                        color: item.status === 'accepted' ? '#4ADE80' :
                            item.status === 'rejected' ? '#EF4444' : '#FBBF24'
                    }]}>
                        {item.status === 'accepted' ? 'KABUL EDİLDİ' :
                            item.status === 'rejected' ? 'REDDEDİLDİ' : 'BEKLİYOR'}
                    </Text>
                </View>
            </View>

            <View style={styles.offerBody}>
                <Text style={styles.offerLabel}>Teklif Tutarı:</Text>
                <Text style={styles.offerPrice}>{item.price ? `${item.price} ₺` : 'Fiyat Girilmedi'}</Text>
                {item.notes && (
                    <Text style={styles.offerNote} numberOfLines={2}>"{item.notes}"</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userIconBox}>
                <Ionicons
                    name={userTypeFilter === 'individual' ? "person" : "business"}
                    size={24}
                    color="#D4AF37"
                />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.userCardTitle}>{item.full_name || 'İsimsiz'}</Text>
                <Text style={styles.userCardSubtitle}>{item.email}</Text>
                {item.phone && (
                    <Text style={styles.userCardPhone}>📞 {item.phone}</Text>
                )}
                <Text style={styles.userCardDate}>Kayıt: {new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>

                {/* Status Badge */}
                <View style={[
                    styles.statusBadge,
                    {
                        backgroundColor: item.approval_status === 'approved' ? 'rgba(74, 222, 128, 0.1)' :
                            item.approval_status === 'suspended' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                    }
                ]}>
                    <Text style={[
                        styles.statusText,
                        {
                            color: item.approval_status === 'approved' ? '#4ADE80' :
                                item.approval_status === 'suspended' ? '#EF4444' : '#FBBF24'
                        }
                    ]}>
                        {item.approval_status === 'approved' ? 'ONAYLI' :
                            item.approval_status === 'suspended' ? 'ASKIDA' : 'ONAY BEKLİYOR'}
                    </Text>
                </View>
            </View>

            {/* Action Buttons Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                {/* 1. Approve Button (Only if Pending) */}
                {item.approval_status === 'pending' && item.user_type === 'corporate' && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleApproveUser(item)}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                    </TouchableOpacity>
                )}

                {/* 2. Communication Buttons (If Approved/Active) */}
                <TouchableOpacity onPress={() => handleCall(item.phone)} disabled={!item.phone}>
                    <Ionicons name="call" size={20} color={item.phone ? "#3B82F6" : "#444"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMessage(item.phone)} disabled={!item.phone}>
                    <MaterialCommunityIcons name="whatsapp" size={20} color={item.phone ? "#25D366" : "#444"} />
                </TouchableOpacity>

                {/* 3. Manage Buttons (Suspend/Delete) */}
                <TouchableOpacity onPress={() => handleToggleSuspend(item)}>
                    <MaterialCommunityIcons
                        name={item.approval_status === 'suspended' ? "lock-open" : "lock"}
                        size={20}
                        color={item.approval_status === 'suspended' ? "#FBBF24" : "#EF4444"}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(item)}>
                    <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                onPress={() => { setSelectedModule(item); setViewMode('module_detail'); }}
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
                        onPress={() => {
                            if (selectedModule) setSelectedModule(null);
                            else if (viewMode === 'users') setViewMode('dashboard');
                            else navigation.goBack();
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            onPress={() => { setViewMode('dashboard'); setIsEditMode(false); }}
                            style={{ opacity: viewMode === 'dashboard' ? 1 : 0.5 }}
                        >
                            <Text style={[styles.headerTitle, viewMode !== 'dashboard' && { color: '#666' }]}>VİTRİN</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#333' }}>|</Text>
                        <TouchableOpacity
                            onPress={() => { setViewMode('module_detail'); }}
                            disabled={!selectedModule} // Only active when a module is selected
                            style={{ opacity: viewMode === 'module_detail' ? 1 : (selectedModule ? 0.5 : 0.2) }}
                        >
                            <Text style={[styles.headerTitle, viewMode !== 'module_detail' && { color: '#666' }]}>DETAY</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#333' }}>|</Text>
                        <TouchableOpacity
                            onPress={() => { setViewMode('users'); setSelectedModule(null); }}
                            style={{ opacity: viewMode === 'users' ? 1 : 0.5 }}
                        >
                            <Text style={[styles.headerTitle, viewMode !== 'users' && { color: '#666' }]}>ÜYELER</Text>
                        </TouchableOpacity>
                    </View>

                    {/* EDIT BUTTON TOGGLE (Only in Dashboard Mode) */}
                    {!selectedModule && viewMode === 'dashboard' && (
                        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={styles.editBtn}>
                            <MaterialCommunityIcons name={isEditMode ? "check" : "view-dashboard-edit"} size={24} color={isEditMode ? "#4ADE80" : "#D4AF37"} />
                        </TouchableOpacity>
                    )}
                    {/* Placeholder for symmetry in Users mode */}
                    {(selectedModule || viewMode === 'users') && <View style={{ width: 40 }} />}
                </View>

                {/* MODE SWITCHING FOR ADMIN */}
                <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 10 }}>
                    <TouchableOpacity
                        style={[styles.modeBtn, { backgroundColor: '#34d399', flex: 1, justifyContent: 'center' }]}
                        onPress={() => navigation.navigate('MainTabs')}
                    >
                        <MaterialCommunityIcons name="account" size={20} color="#065f46" />
                        <Text style={[styles.modeBtnText, { color: '#065f46' }]}>Müşteri Modu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modeBtn, { backgroundColor: '#fbbf24', flex: 1, justifyContent: 'center' }]}
                        onPress={() => navigation.navigate('ProviderDashboard')}
                    >
                        <MaterialCommunityIcons name="briefcase" size={20} color="#78350f" />
                        <Text style={[styles.modeBtnText, { color: '#78350f' }]}>Tedarikçi Modu</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                    {viewMode === 'users' ? (
                        /* USER MANAGEMENT VIEW */
                        <View style={{ flex: 1 }}>
                            {/* Filter Tabs */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tabBtn, userTypeFilter === 'corporate' && styles.tabBtnActive]}
                                    onPress={() => setUserTypeFilter('corporate')}
                                >
                                    <Text style={[styles.tabText, userTypeFilter === 'corporate' && styles.tabTextActive]}>Kurumsal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, userTypeFilter === 'individual' && styles.tabBtnActive]}
                                    onPress={() => setUserTypeFilter('individual')}
                                >
                                    <Text style={[styles.tabText, userTypeFilter === 'individual' && styles.tabTextActive]}>Bireysel</Text>
                                </TouchableOpacity>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
                            ) : (
                                <FlatList
                                    data={users}
                                    renderItem={renderUserItem}
                                    keyExtractor={item => item.id}
                                    contentContainerStyle={{ padding: 20 }}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>Kullanıcı bulunamadı.</Text>
                                    }
                                />
                            )}
                        </View>
                    ) : viewMode === 'module_detail' && selectedModule ? (
                        /* MODULE DETAIL VIEW (Requests & Offers) */
                        <View style={{ flex: 1 }}>
                            {/* Search & Tabs */}
                            <View style={{ backgroundColor: '#1e293b', padding: 10 }}>
                                <TextInput
                                    style={styles.searchBar}
                                    placeholder="🔍 Talep Ara..."
                                    placeholderTextColor="#94a3b8"
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                    }}
                                    onSubmitEditing={() => fetchModuleData(selectedModule.table)}
                                />
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.subTab, activeTab === 'requests' && styles.subTabActive]}
                                        onPress={() => setActiveTab('requests')}
                                    >
                                        <Text style={[styles.subTabText, activeTab === 'requests' && styles.subTabTextActive]}>Talepler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.subTab, activeTab === 'offers' && styles.subTabActive]}
                                        onPress={() => setActiveTab('offers')}
                                    >
                                        <Text style={[styles.subTabText, activeTab === 'offers' && styles.subTabTextActive]}>Teklifler ({offers.length})</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {loading && !refreshing && page === 0 ? (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <ActivityIndicator size="large" color="#D4AF37" />
                                </View>
                            ) : activeTab === 'requests' ? (
                                <FlatList
                                    key="request-list"
                                    data={requests}
                                    renderItem={renderRequestItem}
                                    keyExtractor={item => item.id.toString()}
                                    contentContainerStyle={{ padding: 20 }}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchModuleData(selectedModule.table)} tintColor="#D4AF37" />}
                                    onEndReached={() => {
                                        if (hasMore && !loading) fetchModuleData(selectedModule.table, true);
                                    }}
                                    onEndReachedThreshold={0.5}
                                    ListFooterComponent={loading && page > 0 ? <ActivityIndicator color="#D4AF37" /> : null}
                                />
                            ) : (
                                <FlatList
                                    key="offer-list"
                                    data={offers}
                                    renderItem={renderOfferItem}
                                    keyExtractor={item => item.id.toString()}
                                    contentContainerStyle={{ padding: 20 }}
                                    ListEmptyComponent={<Text style={styles.noBidsText}>Henüz teklif yok.</Text>}
                                />
                            )}
                        </View>
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
        </View >
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

    modeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    modeBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
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
    noBidsText: { color: '#666', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },


    // Search & Tabs
    searchBar: {
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
        fontSize: 14,
    },
    subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    subTabActive: { borderBottomColor: '#D4AF37' },
    subTabText: { color: '#64748b', fontWeight: '600' },
    subTabTextActive: { color: '#D4AF37', fontWeight: 'bold' },

    // Offer Card Styles
    offerCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    offerIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(52, 211, 153, 0.1)', alignItems: 'center', justifyContent: 'center' },
    offerProviderName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    offerDate: { color: '#64748b', fontSize: 11 },
    offerBody: { backgroundColor: '#0f172a', padding: 10, borderRadius: 8 },
    offerLabel: { color: '#94a3b8', fontSize: 12 },
    offerPrice: { color: '#34D399', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
    offerNote: { color: '#cbd5e1', fontSize: 12, fontStyle: 'italic', marginTop: 5 },

    // User Management Styles
    tabContainer: { flexDirection: 'row', padding: 15, gap: 15 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#333' },
    tabBtnActive: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: '#D4AF37' },
    tabText: { color: '#888', fontWeight: '600' },
    tabTextActive: { color: '#D4AF37', fontWeight: 'bold' },

    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
    userIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center' },
    userCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    userCardSubtitle: { color: '#AAA', fontSize: 12 },
    userCardPhone: { color: '#DDD', fontSize: 12, marginTop: 2, fontWeight: '500' },
    userCardDate: { color: '#666', fontSize: 11, marginTop: 4 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 5 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    // Action Buttons
    actionBtn: { padding: 5 },
    approveBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
    approveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 }
});
