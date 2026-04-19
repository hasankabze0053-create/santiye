import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import TurkeyLocationPicker from '../../components/TurkeyLocationPicker';

// Reuse categories from HomeScreen logic but adapted
const ADMIN_MODULES = [
    {
        id: 'renovation',
        title: 'TADİLAT',
        subtitle: 'Boya & Tamirat',
        table: 'renovation_group', // Virtual table to fetch both construction_requests and elevator_requests
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
        icon: 'compass',
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
    const [dashboardSubView, setDashboardSubView] = useState('menu'); // 'menu' | 'modules'
    const [offers, setOffers] = useState([]); // Store offers/bids

    // Location Filters
    const [filterCity, setFilterCity] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

    // User Management State
    const [users, setUsers] = useState([]);
    const [userTypeFilter, setUserTypeFilter] = useState('corporate');
    const [selectedUserDetail, setSelectedUserDetail] = useState(null); // Moved here // 'individual' | 'corporate'

    // Rejection / Info Request Modal State
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetUser, setTargetUser] = useState(null);
    const [actionType, setActionType] = useState(null); // 'reject' | 'incomplete'

    // Provider Assignment Modal State
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [assignTargetRequest, setAssignTargetRequest] = useState(null);
    const [assignableProviders, setAssignableProviders] = useState([]);
    const [selectedProviderIds, setSelectedProviderIds] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    // Reuse ASSET_MAP for admin display if needed, or just use icons
    // We will use the list from DB for the grid when in Edit Mode

    // Fetch requests when a module is selected OR search/filter changes
    useEffect(() => {
        if (selectedModule && selectedModule.table) {
            fetchModuleData(selectedModule.table);
        } else if (selectedModule) {
            // Module with no table
            setRequests([]);
        }
    }, [selectedModule, searchQuery, filterCity, filterDistrict]);

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

            if (tableName === 'renovation_group') {
                // Fetch from construction_requests where offer_type='anahtar_teslim_tadilat' AND elevator_requests
                let query1 = supabase.from('construction_requests').select(selectQuery + ', bids:construction_offers(*)').eq('offer_type', 'anahtar_teslim_tadilat').order('created_at', { ascending: false });
                let query2 = supabase.from('elevator_requests').select(selectQuery).order('created_at', { ascending: false });

                if (searchQuery) {
                    query1 = query1.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`);
                    query2 = query2.or(`city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`);
                }
                if (filterCity) {
                    query1 = query1.eq('city', filterCity);
                    query2 = query2.eq('city', filterCity);
                }
                if (filterDistrict) {
                    query1 = query1.eq('district', filterDistrict);
                    query2 = query2.eq('district', filterDistrict);
                }

                if (loadMore) {
                    query1 = query1.range((page + 1) * 20, (page + 1) * 20 + 19);
                    query2 = query2.range((page + 1) * 20, (page + 1) * 20 + 19);
                } else {
                    query1 = query1.range(0, 19);
                    query2 = query2.range(0, 19);
                }

                const [res1, res2] = await Promise.all([query1, query2]);
                if (res1.error) console.error('Tadilat fetch err', res1.error);
                if (res2.error) console.error('Elevator fetch err', res2.error);

                const data1 = (res1.data || []).map(d => ({ ...d, _tableName: 'construction_requests' }));
                const data2 = (res2.data || []).map(d => ({ ...d, _tableName: 'elevator_requests' }));
                
                const merged = [...data1, ...data2].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                if (merged.length < 20) setHasMore(false);

                if (loadMore) {
                    setRequests(prev => [...prev, ...merged]);
                    setPage(prev => prev + 1);
                } else {
                    setRequests(merged);
                }
                setLoading(false);
                setRefreshing(false);
                
                fetchOffers('construction_requests'); // Tadilat can have construction offers
                return;
            }

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
                .order('created_at', { ascending: false });

            // If we are in urban_transformation, exclude Tadilat requests because they are shown in Tadilat module
            if (tableName === 'construction_requests' && selectedModule.id === 'urban_transformation') {
                query = query.neq('offer_type', 'anahtar_teslim_tadilat');
            }

            if (loadMore) {
                query = query.range((page + 1) * 20, (page + 1) * 20 + 19);
            } else {
                query = query.range(0, 19);
            }

            // Apply Search Filter
            if (searchQuery) {
                // ILIKE for title or ID (if strictly numeric)
                // Note: Joining profiles for name search is complex in one query, restricting to title/id/city for now
                query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`);
            }

            // Apply Location Filters (Compatible with columns if they exist)
            if (filterCity) {
                // Some tables use 'city', some use 'location' (string match)
                if (tableName === 'market_requests' || tableName === 'transport_requests') {
                    query = query.ilike('location', `%${filterCity}%`);
                } else {
                    query = query.eq('city', filterCity);
                }
            }
            if (filterDistrict) {
                if (tableName === 'market_requests' || tableName === 'transport_requests') {
                    query = query.ilike('location', `%${filterDistrict}%`);
                } else {
                    query = query.eq('district', filterDistrict);
                }
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
                setRequests(prev => [...prev, ...data.map(d => ({...d, _tableName: tableName}))]);
                setPage(prev => prev + 1);
            } else {
                setRequests((data || []).map(d => ({...d, _tableName: tableName})));
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
        const targetTable = item._tableName || selectedModule.table;
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
                            const { error } = await supabase.from(targetTable).delete().eq('id', item.id);
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

            // Fetch Companies to map phones and get company_id
            const { data: companies } = await supabase.from('companies').select('id, owner_id, phone');

            // Fetch Company Services to map active roles
            const { data: services } = await supabase.from('company_services').select('*');

            // Map phones and services to profiles
            const usersWithServices = profiles.map(p => {
                const company = companies?.find(c => c.owner_id === p.id);
                const companyServices = services?.filter(s => s.company_id === company?.id && s.status === 'active') || [];
                
                return {
                    ...p,
                    company_id: company?.id,
                    phone: company ? company.phone : p.phone,
                    active_services: companyServices.map(s => s.service_type)
                };
            });

            setUsers(usersWithServices || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            Alert.alert('Hata', 'Kullanıcılar çekilemedi.');
        } finally {
            setLoading(false);
        }
    };

    // Yönlendirme yapılabilecek satıcıları (kurumsal hesapları) getir
    const fetchAssignableProviders = async () => {
        try {
            setAssignLoading(true);
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, user_type')
                .eq('user_type', 'corporate');
            
            if (error) throw error;
            setAssignableProviders(profiles || []);
        } catch (err) {
            console.error('Error fetching assignable providers:', err);
            Alert.alert("Hata", "Tedarikçiler yüklenemedi.");
        } finally {
            setAssignLoading(false);
        }
    };

    // Yönlendirme Modalını Aç
    useEffect(() => {
        if (assignModalVisible && assignableProviders.length === 0) {
            fetchAssignableProviders();
        }
    }, [assignModalVisible]);

    const handleAssignProviders = async () => {
        if (!assignTargetRequest) return;
        const targetTable = assignTargetRequest._tableName || selectedModule.table;
        try {
            const { error } = await supabase
                .from(targetTable)
                .update({ assigned_provider_ids: selectedProviderIds })
                .eq('id', assignTargetRequest.id);
            
            if (error) throw error;
            
            Alert.alert("Başarılı", "Talep seçili firmalara yönlendirildi. Artık o firmalar panellerinde bu talebi görebilecekler.");
            setAssignModalVisible(false);
            setAssignTargetRequest(null);
            setSelectedProviderIds([]);
            
            // Refresh requests
            fetchModuleData(selectedModule.table);
        } catch (err) {
            console.error(err);
            Alert.alert("Hata", "Yönlendirme işlemi başarısız oldu.");
        }
    };

    const toggleProviderSelection = (id) => {
        setSelectedProviderIds(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
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

    const handleOpenActionModal = (user, type) => {
        setTargetUser(user);
        setActionType(type);
        setRejectionReason('');
        setRejectModalVisible(true);
    };

    const handleSubmitAction = async () => {
        if (!targetUser) return;
        if (!rejectionReason.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen bir açıklama giriniz.');
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    approval_status: actionType === 'reject' ? 'rejected' : 'incomplete',
                    rejection_reason: rejectionReason.trim(),
                })
                .eq('id', targetUser.id);

            if (error) throw error;

            Alert.alert(
                'Başarılı', 
                actionType === 'reject' 
                    ? `${targetUser.full_name || targetUser.email} hesabı reddedildi. 🛑` 
                    : `${targetUser.full_name || targetUser.email} hesabından eksik bilgi/belge istendi. 📝`
            );

            // Optimistic Update
            setUsers(prev => prev.map(u => 
                u.id === targetUser.id 
                ? { ...u, approval_status: actionType === 'reject' ? 'rejected' : 'incomplete', rejection_reason: rejectionReason.trim() } 
                : u
            ));
            
            if (selectedUserDetail && selectedUserDetail.id === targetUser.id) {
                 setSelectedUserDetail({ ...selectedUserDetail, approval_status: actionType === 'reject' ? 'rejected' : 'incomplete', rejection_reason: rejectionReason.trim() });
            }

            setRejectModalVisible(false);
            setTargetUser(null);
            setRejectionReason('');
        } catch (err) {
            Alert.alert('Hata', 'İşlem başarısız: ' + err.message);
        }
    };


    const handleToggleCompanyService = async (user, serviceType, newValue) => {
        if (!user.company_id) {
            Alert.alert("Hata", "Bu kullanıcının bir firma kaydı bulunamadı.");
            return;
        }

        const status = newValue ? 'active' : 'inactive';

        try {
            // Update company_services table
            const { error: serviceError } = await supabase
                .from('company_services')
                .upsert({ 
                    company_id: user.company_id, 
                    service_type: serviceType, 
                    status: status 
                }, { onConflict: 'company_id, service_type' });

            if (serviceError) throw serviceError;

            // Also update the legacy profile flags to maintain compatibility if necessary
            // Mapping new service types to legacy profile columns if they exist
            let profileUpdate = {};
            if (serviceType === 'urban_transformation') profileUpdate.is_contractor = newValue; // Closest match
            if (serviceType === 'renovation_office') profileUpdate.is_architect = newValue; // Closest match
            if (serviceType === 'market_seller') profileUpdate.is_seller = newValue;
            if (serviceType === 'logistics_company') profileUpdate.is_transporter = newValue;
            if (serviceType === 'lawyer') profileUpdate.is_lawyer = newValue;
            if (serviceType === 'technical_office') profileUpdate.is_engineer = newValue;

            if (Object.keys(profileUpdate).length > 0) {
                await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
            }

            // Update UI State optimistically
            const updatedServices = newValue 
                ? [...(user.active_services || []), serviceType]
                : (user.active_services || []).filter(s => s !== serviceType);

            const updatedUser = { ...user, active_services: updatedServices, ...profileUpdate };
            setSelectedUserDetail(updatedUser);
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

        } catch (err) {
            console.error(err);
            Alert.alert("Hata", "Hizmet yetkisi güncellenemedi.");
        }
    };

    const handleConvertToIndividual = (user) => {
        Alert.alert(
            'Kurumsal Üyelikten Çıkar?',
            'Bu işlem kullanıcının tüm firma yetkilerini (Müteahhit, Satıcı vb.) iptal edecek ve hesabı "Bireysel"e çevirecektir.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Onayla ve Çevir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // 1. Update Profile (Legacy Flags)
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .update({
                                    user_type: 'individual',
                                    approval_status: 'approved', // Individuals default to approved
                                    is_contractor: false,
                                    is_seller: false,
                                    is_transporter: false,
                                    is_architect: false,
                                    is_engineer: false,
                                    is_real_estate_agent: false,
                                    rejection_reason: null
                                })
                                .eq('id', user.id);

                            if (profileError) throw profileError;

                            // 2. Clear Company Services (New System)
                            if (user.company_id) {
                                await supabase
                                    .from('company_services')
                                    .delete()
                                    .eq('company_id', user.company_id);
                            }

                            // Optimistic Update
                            const updatedUser = {
                                ...user,
                                user_type: 'individual',
                                approval_status: 'approved',
                                is_contractor: false,
                                is_seller: false,
                                is_transporter: false,
                                is_architect: false,
                                is_engineer: false,
                                is_real_estate_agent: false,
                                active_services: [],
                                rejection_reason: null
                            };

                            if (userTypeFilter === 'corporate') {
                                // Remove from list if viewing corporate only
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                                setSelectedUserDetail(null); // Close modal
                            } else {
                                // Just update details
                                setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                                setSelectedUserDetail(updatedUser);
                            }

                            Alert.alert('Başarılı', 'Kullanıcı bireysel hesaba geçirildi.');

                        } catch (err) {
                            Alert.alert('Hata', 'İşlem başarısız: ' + err.message);
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
                .update({
                    approval_status: 'approved',
                    rejection_reason: null // Clear reason on approval
                })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Başarılı', `${user.full_name || user.email} onaylandı. ✅`);
            // Optimistic Update
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, approval_status: 'approved', rejection_reason: null } : u));
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
                        <Text allowFontScaling={false} style={styles.offerProviderName}>{item.profiles?.full_name || 'Bilinmeyen Tedarikçi'}</Text>
                        <Text allowFontScaling={false} style={styles.offerDate}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'accepted' ? 'rgba(74, 222, 128, 0.1)' :
                        item.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                }]}>
                    <Text allowFontScaling={false} style={[styles.statusText, {
                        color: item.status === 'accepted' ? '#4ADE80' :
                            item.status === 'rejected' ? '#EF4444' : '#FBBF24'
                    }]}>
                        {item.status === 'accepted' ? 'KABUL EDİLDİ' :
                            item.status === 'rejected' ? 'REDDEDİLDİ' : 'BEKLİYOR'}
                    </Text>
                </View>
            </View>

            <View style={styles.offerBody}>
                <Text allowFontScaling={false} style={styles.offerLabel}>Teklif Tutarı:</Text>
                <Text allowFontScaling={false} style={styles.offerPrice}>{item.price ? `${item.price} ₺` : 'Fiyat Girilmedi'}</Text>
                {item.notes && (
                    <Text allowFontScaling={false} style={styles.offerNote} numberOfLines={2}>"{item.notes}"</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            activeOpacity={0.7}
            onPress={() => setSelectedUserDetail(item)}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.userIconBox}>
                    <Ionicons
                        name={userTypeFilter === 'individual' ? "person" : "business"}
                        size={24}
                        color="#D4AF37"
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text allowFontScaling={false} style={styles.userCardTitle}>{item.full_name || 'İsimsiz'}</Text>
                    <Text allowFontScaling={false} style={styles.userCardSubtitle}>{item.email}</Text>
                    {item.phone && (
                        <Text allowFontScaling={false} style={styles.userCardPhone}>📞 {item.phone}</Text>
                    )}
                    <Text allowFontScaling={false} style={styles.userCardDate}>Kayıt: {new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                </View>

                {/* Status Badge (Right Side) */}
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: item.approval_status === 'approved' ? 'rgba(74, 222, 128, 0.1)' :
                                item.approval_status === 'suspended' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                        }
                    ]}>
                        <Text allowFontScaling={false} style={[
                            styles.statusText,
                            {
                                color: item.approval_status === 'approved' ? '#4ADE80' :
                                    item.approval_status === 'suspended' ? '#EF4444' : '#FBBF24',
                                fontSize: 10
                            }
                        ]}>
                            {item.approval_status === 'approved' ? 'ONAYLI' :
                                item.approval_status === 'suspended' ? 'ASKIDA' : 'BEKLİYOR'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#555" style={{ marginTop: 8 }} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderUserDetailModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedUserDetail}
            onRequestClose={() => setSelectedUserDetail(null)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.modalContent}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Kullanıcı Detayı</Text>
                            <TouchableOpacity onPress={() => setSelectedUserDetail(null)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {selectedUserDetail && (
                            <ScrollView contentContainerStyle={{ padding: 20 }}>
                                {/* User Info */}
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{
                                        width: 80, height: 80, borderRadius: 40,
                                        backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginBottom: 12
                                    }}>
                                        <Ionicons name={selectedUserDetail.user_type === 'corporate' ? "business" : "person"} size={40} color="#D4AF37" />
                                    </View>
                                    <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{selectedUserDetail.full_name || 'İsimsiz'}</Text>
                                    <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 14 }}>{selectedUserDetail.email}</Text>
                                    <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{selectedUserDetail.phone || 'Telefon Yok'}</Text>

                                    <View style={{
                                        marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
                                        backgroundColor: selectedUserDetail.approval_status === 'approved' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                        borderWidth: 1, borderColor: selectedUserDetail.approval_status === 'approved' ? '#4ADE80' : '#FBBF24'
                                    }}>
                                        <Text allowFontScaling={false} style={{ color: selectedUserDetail.approval_status === 'approved' ? '#4ADE80' : '#FBBF24', fontWeight: 'bold', fontSize: 12 }}>
                                            {selectedUserDetail.approval_status === 'approved' ? 'ONAYLI HESAP' :
                                                selectedUserDetail.approval_status === 'rejected' ? 'REDDEDİLDİ' :
                                                    selectedUserDetail.approval_status === 'suspended' ? 'HESAP ASKIDA' : 'ONAY BEKLİYOR'}
                                        </Text>
                                    </View>

                                    {selectedUserDetail.rejection_reason && (
                                        <Text allowFontScaling={false} style={{ color: '#EF4444', marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
                                            "{selectedUserDetail.rejection_reason}"
                                        </Text>
                                    )}
                                </View>

                                {/* ROLE MANAGEMENT SECTION */}
                                {selectedUserDetail.user_type === 'corporate' && (
                                    <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>FİRMA YETKİLERİ / ROLLERİ</Text>

                                        {[
                                            { key: 'urban_transformation', label: 'Kentsel Dönüşüm' },
                                            { key: 'renovation_office', label: 'Tadilat Ofisi' },
                                            { key: 'market_seller', label: 'Hizmet & Satış (Market)' },
                                            { key: 'logistics_company', label: 'Lojistik / Nakliye' },
                                            { key: 'machine_renter', label: 'İş Makinesi Kiralama' },
                                            { key: 'lawyer', label: 'Avukatlık / Hukuk' },
                                            { key: 'technical_office', label: 'Teknik Ofis' },
                                        ].map((role) => {
                                            const isActive = selectedUserDetail.active_services?.includes(role.key);
                                            return (
                                                <View key={role.key} style={styles.roleRow}>
                                                    <Text allowFontScaling={false} style={{ color: '#ccc', flex: 1 }}>{role.label}</Text>
                                                    <Switch
                                                        value={isActive || false}
                                                        trackColor={{ false: '#333', true: '#4ADE80' }}
                                                        thumbColor={isActive ? '#fff' : '#f4f3f4'}
                                                        onValueChange={(newValue) => handleToggleCompanyService(selectedUserDetail, role.key, newValue)}
                                                    />
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* ACTION BUTTONS */}
                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>İŞLEMLER</Text>

                                <View style={{ gap: 10 }}>
                                    {/* Approval Actions */}
                                    {['pending', 'incomplete', 'rejected'].includes(selectedUserDetail.approval_status) && selectedUserDetail.user_type === 'corporate' && (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.actionRowBtn, { backgroundColor: '#065f46' }]}
                                                onPress={() => { handleApproveUser(selectedUserDetail); setSelectedUserDetail(null); }}
                                            >
                                                <Ionicons name="checkmark-circle" size={22} color="#4ADE80" />
                                                <Text allowFontScaling={false} style={{ color: '#ecfdf5', fontWeight: 'bold', marginLeft: 10 }}>Onayla ve Aktifleştir</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionRowBtn, { backgroundColor: '#422006' }]}
                                                onPress={() => { handleOpenActionModal(selectedUserDetail, 'incomplete'); }}
                                            >
                                                <MaterialCommunityIcons name="file-document-edit" size={22} color="#FBBF24" />
                                                <Text allowFontScaling={false} style={{ color: '#fef3c7', fontWeight: 'bold', marginLeft: 10 }}>Eksik Bilgi/Belge İste</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionRowBtn, { backgroundColor: '#450a0a' }]}
                                                onPress={() => { handleOpenActionModal(selectedUserDetail, 'reject'); }}
                                            >
                                                <Ionicons name="close-circle" size={22} color="#EF4444" />
                                                <Text allowFontScaling={false} style={{ color: '#fef2f2', fontWeight: 'bold', marginLeft: 10 }}>Reddet</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Communication */}
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                        <TouchableOpacity
                                            style={[styles.actionRowBtn, { flex: 1, justifyContent: 'center', backgroundColor: '#1e293b' }]}
                                            onPress={() => handleCall(selectedUserDetail.phone)}
                                            disabled={!selectedUserDetail.phone}
                                        >
                                            <Ionicons name="call" size={20} color={selectedUserDetail.phone ? "#3B82F6" : "#444"} />
                                            <Text allowFontScaling={false} style={{ color: '#cbd5e1', marginLeft: 8 }}>Ara</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionRowBtn, { flex: 1, justifyContent: 'center', backgroundColor: '#1e293b' }]}
                                            onPress={() => handleMessage(selectedUserDetail.phone)}
                                            disabled={!selectedUserDetail.phone}
                                        >
                                            <MaterialCommunityIcons name="whatsapp" size={20} color={selectedUserDetail.phone ? "#25D366" : "#444"} />
                                            <Text allowFontScaling={false} style={{ color: '#cbd5e1', marginLeft: 8 }}>WhatsApp</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Danger Zone */}
                                    <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }}>
                                        <Text allowFontScaling={false} style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>TEHLİKELİ BÖLGE</Text>

                                        {selectedUserDetail.user_type === 'corporate' && (
                                            <TouchableOpacity
                                                style={[styles.actionRowBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F59E0B', marginBottom: 10 }]}
                                                onPress={() => handleConvertToIndividual(selectedUserDetail)}
                                            >
                                                <MaterialCommunityIcons name="account-convert" size={20} color="#F59E0B" />
                                                <Text allowFontScaling={false} style={{ color: '#F59E0B', marginLeft: 10 }}>Kurumsal Üyelikten Çıkar (Bireysele Çevir)</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.actionRowBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FBBF24', marginBottom: 10 }]}
                                            onPress={() => { handleToggleSuspend(selectedUserDetail); }}
                                        >
                                            <MaterialCommunityIcons
                                                name={selectedUserDetail.approval_status === 'suspended' ? "lock-open" : "lock"}
                                                size={20}
                                                color="#FBBF24"
                                            />
                                            <Text allowFontScaling={false} style={{ color: '#FBBF24', marginLeft: 10 }}>
                                                {selectedUserDetail.approval_status === 'suspended' ? 'Hesabın Kilidini Aç' : 'Hesabı Askıya Al / Dondur'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionRowBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444' }]}
                                            onPress={() => { handleDeleteUser(selectedUserDetail); setSelectedUserDetail(null); }}
                                        >
                                            <Ionicons name="trash" size={20} color="#EF4444" />
                                            <Text allowFontScaling={false} style={{ color: '#EF4444', marginLeft: 10 }}>Kullanıcıyı Tamamen Sil</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );

    const renderDashboardMenu = () => (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text allowFontScaling={false} style={styles.adminSectionTitle}>YÖNETİM MERKEZİ</Text>
            
            <TouchableOpacity 
                style={styles.menuFeatureCard}
                onPress={() => setDashboardSubView('modules')}
            >
                <LinearGradient colors={['#D4AF37', '#8A6E2F']} style={styles.menuFeatureIconBox}>
                    <MaterialCommunityIcons name="view-grid-plus" size={32} color="#000" />
                </LinearGradient>
                <View style={styles.menuFeatureContent}>
                    <Text allowFontScaling={false} style={styles.menuFeatureTitle}>Modül Yönetimi</Text>
                    <Text allowFontScaling={false} style={styles.menuFeatureSubtitle}>
                        Hangi hizmetlerin aktif olacağını seçin, modül sıralarını ve içeriklerini düzenleyin.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4AF37" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.menuFeatureCard, { opacity: 0.5 }]}
                onPress={() => Alert.alert("Yakında", "İstatistik ve raporlama modülü geliştirme aşamasındadır.")}
            >
                <View style={[styles.menuFeatureIconBox, { backgroundColor: '#1e293b' }]}>
                    <MaterialCommunityIcons name="chart-box-outline" size={32} color="#94a3b8" />
                </View>
                <View style={styles.menuFeatureContent}>
                    <Text allowFontScaling={false} style={styles.menuFeatureTitle}>İstatistikler & Raporlar</Text>
                    <Text allowFontScaling={false} style={styles.menuFeatureSubtitle}>
                        Uygulama trafiği, teklif oranları ve finansal verileri gerçek zamanlı takip edin.
                    </Text>
                </View>
                <Ionicons name="lock-closed" size={20} color="#334155" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.menuFeatureCard, { opacity: 0.5 }]}
                onPress={() => Alert.alert("Yakında", "Sistem ayarları modülü geliştirme aşamasındadır.")}
            >
                <View style={[styles.menuFeatureIconBox, { backgroundColor: '#1e293b' }]}>
                    <MaterialCommunityIcons name="cog-outline" size={32} color="#94a3b8" />
                </View>
                <View style={styles.menuFeatureContent}>
                    <Text allowFontScaling={false} style={styles.menuFeatureTitle}>Genel Sistem Ayarları</Text>
                    <Text allowFontScaling={false} style={styles.menuFeatureSubtitle}>
                        Uygulama genelindeki metinler, limitler ve bildirim tercihlerini yönetin.
                    </Text>
                </View>
                <Ionicons name="lock-closed" size={20} color="#334155" />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
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
                    <Image source={imageSource} style={styles.moduleBg} contentFit="cover" />
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
                        <Text allowFontScaling={false} style={styles.moduleTitle}>{item.title}</Text>
                        <Text allowFontScaling={false} style={styles.moduleSubtitle}>{item.subtitle}</Text>
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
                    <Text allowFontScaling={false} style={styles.title}>{item.title || selectedModule.title + ' Talebi'}</Text>
                    <Text allowFontScaling={false} style={styles.subtitle}>
                        {item.city || 'Tüm Şehirler'} / {item.district || 'Tüm İlçeler'} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                    {item.profiles ? (
                        <Text allowFontScaling={false} style={styles.userText}>👤 {item.profiles.email} ({item.profiles.full_name})</Text>
                    ) : (
                        <Text allowFontScaling={false} style={styles.userText}>👤 Kullanıcı (Bilinmiyor)</Text>
                    )}
                </View>

                {selectedModule?.id !== 'market' && (
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
                        <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Yönlendirme & Silme Alanı */}
            {['market', 'renovation', 'urban_transformation'].includes(selectedModule?.id) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#334155' }}>
                    <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBBF24', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                        onPress={() => {
                            setAssignTargetRequest(item);
                            setSelectedProviderIds(item.assigned_provider_ids || []);
                            setAssignModalVisible(true);
                        }}
                    >
                        <MaterialCommunityIcons name="briefcase-check" size={18} color="#78350F" />
                        <Text allowFontScaling={false} style={{ color: '#78350F', fontWeight: 'bold', marginLeft: 8 }}>HİZMET VERENE YÖNLENDİR</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 8 }}>
                        <Ionicons name="trash" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    // --- MAIN RENDER ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#000000']} style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADERS */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedModule) setSelectedModule(null);
                            else if (viewMode === 'dashboard' && dashboardSubView === 'modules') setDashboardSubView('menu');
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
                            <Text allowFontScaling={false} style={[styles.headerTitle, viewMode !== 'dashboard' && { color: '#666' }]}>VİTRİN</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ color: '#333' }}>|</Text>
                        <TouchableOpacity
                            onPress={() => { setViewMode('module_detail'); }}
                            disabled={!selectedModule} // Only active when a module is selected
                            style={{ opacity: viewMode === 'module_detail' ? 1 : (selectedModule ? 0.5 : 0.2) }}
                        >
                            <Text allowFontScaling={false} style={[styles.headerTitle, viewMode !== 'module_detail' && { color: '#666' }]}>DETAY</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ color: '#333' }}>|</Text>
                        <TouchableOpacity
                            onPress={() => { setViewMode('users'); setSelectedModule(null); }}
                            style={{ opacity: viewMode === 'users' ? 1 : 0.5 }}
                        >
                            <Text allowFontScaling={false} style={[styles.headerTitle, viewMode !== 'users' && { color: '#666' }]}>ÜYELER</Text>
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
                        <Text allowFontScaling={false} style={[styles.modeBtnText, { color: '#065f46' }]}>Müşteri Modu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modeBtn, { backgroundColor: '#fbbf24', flex: 1, justifyContent: 'center' }]}
                        onPress={() => navigation.navigate('ProviderDashboard')}
                    >
                        <MaterialCommunityIcons name="briefcase" size={20} color="#78350f" />
                        <Text allowFontScaling={false} style={[styles.modeBtnText, { color: '#78350f' }]}>Tedarikçi Modu</Text>
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
                                    <Text allowFontScaling={false} style={[styles.tabText, userTypeFilter === 'corporate' && styles.tabTextActive]}>Kurumsal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabBtn, userTypeFilter === 'individual' && styles.tabBtnActive]}
                                    onPress={() => setUserTypeFilter('individual')}
                                >
                                    <Text allowFontScaling={false} style={[styles.tabText, userTypeFilter === 'individual' && styles.tabTextActive]}>Bireysel</Text>
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
                                        <Text allowFontScaling={false} style={styles.emptyText}>Kullanıcı bulunamadı.</Text>
                                    }
                                />
                            )}
                        </View>
                    ) : viewMode === 'module_detail' && selectedModule ? (
                        /* MODULE DETAIL VIEW (Requests & Offers) */
                        <View style={{ flex: 1 }}>
                            {/* Search & Tabs Header */}
                            <View style={{ backgroundColor: '#000', padding: 15, borderBottomWidth: 1, borderBottomColor: '#1A1A1E' }}>
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search" size={20} color="#D4AF37" style={{ marginRight: 10 }} />
                                    <TextInput allowFontScaling={false}
                                        style={styles.searchInput}
                                        placeholder="Taleplerde Ara..."
                                        placeholderTextColor="#666"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* Location Filter Row */}
                                <View style={styles.locationFilterRow}>
                                    <TouchableOpacity 
                                        onPress={() => setIsLocationPickerVisible(true)} 
                                        style={styles.locationFilterBtn}
                                        activeOpacity={0.7}
                                    >
                                        <LinearGradient colors={['#1C1C1E', '#111']} style={StyleSheet.absoluteFillObject} />
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                            <Ionicons name="location" size={16} color="#D4AF37" />
                                            <Text allowFontScaling={false} style={[styles.locationFilterText, filterCity && { color: '#FFF' }]}>
                                                {filterCity ? `${filterCity} / ${filterDistrict || 'Tümü'}` : '📍 Bölge Seçin'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={14} color="#555" />
                                    </TouchableOpacity>
                                    
                                    {filterCity ? (
                                        <TouchableOpacity 
                                            onPress={() => { setFilterCity(''); setFilterDistrict(''); }} 
                                            style={styles.clearFilterBtn}
                                        >
                                            <MaterialCommunityIcons name="filter-remove" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.subTab, activeTab === 'requests' && styles.subTabActive]}
                                        onPress={() => setActiveTab('requests')}
                                    >
                                        <Text allowFontScaling={false} style={[styles.subTabText, activeTab === 'requests' && styles.subTabTextActive]}>Talepler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.subTab, activeTab === 'offers' && styles.subTabActive]}
                                        onPress={() => setActiveTab('offers')}
                                    >
                                        <Text allowFontScaling={false} style={[styles.subTabText, activeTab === 'offers' && styles.subTabTextActive]}>Teklifler ({offers.length})</Text>
                                    </TouchableOpacity>
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
                                    ListEmptyComponent={<Text allowFontScaling={false} style={styles.noBidsText}>Henüz teklif yok.</Text>}
                                />
                            )}
                        </View>
                    ) : (
                        /* DASHBOARD VIEW: MENU OR MODULES */
                        dashboardSubView === 'menu' ? renderDashboardMenu() : (
                            isEditMode ? (
                                <FlatList
                                    data={configModules}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.editRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <MaterialCommunityIcons name="drag-horizontal" size={24} color="#666" style={{ marginRight: 10 }} />
                                                <Text allowFontScaling={false} style={[styles.editTitle, !item.is_active && { color: '#555', textDecorationLine: 'line-through' }]}>
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
                            <Text allowFontScaling={false} style={styles.modalTitle}>Talep Detayı</Text>
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
                                            <Text allowFontScaling={false} style={styles.detailLabel}>TALEP BİLGİLERİ</Text>
                                            <View style={styles.infoRow}>
                                                <Text allowFontScaling={false} style={styles.infoKey}>Başlık:</Text>
                                                <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.title || selectedModule?.title + ' Talebi'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text allowFontScaling={false} style={styles.infoKey}>Kullanıcı:</Text>
                                                <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.profiles?.email || 'Bilinmiyor'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text allowFontScaling={false} style={styles.infoKey}>Konum:</Text>
                                                <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.city || selectedRequest.location || '-'} / {selectedRequest.district || '-'}</Text>
                                            </View>
                                            {selectedRequest.notes && (
                                                <View style={styles.infoRow}>
                                                    <Text allowFontScaling={false} style={styles.infoKey}>Notlar:</Text>
                                                    <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.notes}</Text>
                                                </View>
                                            )}
                                            {/* Special Fields for Market */}
                                            {selectedRequest.items && selectedRequest.items.length > 0 && (
                                                <View style={{ marginTop: 10 }}>
                                                    <Text allowFontScaling={false} style={[styles.infoKey, { marginBottom: 5 }]}>Sipariş Listesi:</Text>
                                                    {selectedRequest.items.map((it, idx) => (
                                                        <Text allowFontScaling={false} key={idx} style={styles.bulletItem}>• {it.product_name} ({it.quantity})</Text>
                                                    ))}
                                                </View>
                                            )}
                                            {/* Special Fields for Transport */}
                                            {selectedModule?.id === 'transport' && (
                                                <>
                                                    <View style={styles.infoRow}>
                                                        <Text allowFontScaling={false} style={styles.infoKey}>Nereden:</Text>
                                                        <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.from_location}</Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Text allowFontScaling={false} style={styles.infoKey}>Nereye:</Text>
                                                        <Text allowFontScaling={false} style={styles.infoValue}>{selectedRequest.to_location}</Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>

                                        <Text allowFontScaling={false} style={[styles.detailLabel, { marginTop: 20, marginLeft: 20 }]}>TEKLİFLER ({(selectedRequest.bids || selectedRequest.offers || []).length})</Text>
                                    </View>
                                )}
                                renderItem={({ item }) => (
                                    <View style={styles.bidCard}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text allowFontScaling={false} style={styles.bidPrice}>{item.price || item.price_estimate} ₺</Text>
                                            <Text allowFontScaling={false} style={styles.bidStatus}>{item.status}</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={styles.bidNotes}>{item.notes || item.offer_details || 'Açıklama yok'}</Text>
                                        <Text allowFontScaling={false} style={styles.bidProvider}>Tedarikçi ID: {item.provider_id || item.contractor_id}</Text>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <Text allowFontScaling={false} style={styles.noBidsText}>Henüz teklif verilmemiş.</Text>
                                }
                            />
                        )}
                    </View>
                </Modal>
            </SafeAreaView>

            {/* REJECTION / INFO REQUEST MODAL */}
            <Modal
                visible={rejectModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: '#1e293b', maxHeight: 300 }]}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>
                                {actionType === 'reject' ? 'Red Nedeni' : 'Eksik Bilgi Talebi'}
                            </Text>
                            <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ padding: 20 }}>
                            <Text allowFontScaling={false} style={{ color: '#ccc', marginBottom: 10 }}>
                                {actionType === 'reject'
                                    ? 'Kullanıcıyı reddetme sebebinizi giriniz:'
                                    : 'Kullanıcıdan talep ettiğiniz eksik bilgileri yazınız:'}
                            </Text>

                            <TextInput allowFontScaling={false}
                                style={{
                                    backgroundColor: '#0f172a',
                                    color: '#FFF',
                                    padding: 10,
                                    borderRadius: 8,
                                    height: 100,
                                    textAlignVertical: 'top',
                                    borderWidth: 1,
                                    borderColor: '#334155'
                                }}
                                multiline
                                placeholder="Açıklama yazınız..."
                                placeholderTextColor="#64748b"
                                value={rejectionReason}
                                onChangeText={setRejectionReason}
                            />

                            <TouchableOpacity
                                style={{
                                    marginTop: 20,
                                    backgroundColor: actionType === 'reject' ? '#EF4444' : '#FBBF24',
                                    padding: 15,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                                onPress={handleSubmitAction}
                            >
                                <Text allowFontScaling={false} style={{ color: actionType === 'reject' ? '#FFF' : '#000', fontWeight: 'bold' }}>
                                    {actionType === 'reject' ? 'REDDET' : 'GÖNDER'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ASSIGNMENT MODAL (YÖNLENDİRME) */}
            <Modal
                visible={assignModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: '#0f172a', height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Tedarikçilere Yönlendir</Text>
                            <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: 12, margin: 15, borderRadius: 8, borderWidth: 1, borderColor: '#FBBF24' }}>
                            <Text allowFontScaling={false} style={{ color: '#FBBF24', fontSize: 13, textAlign: 'center' }}>
                                Seçtiğiniz firmalar dışında hiçbir firma bu talebi GÖREMEZ. İncelemesini istediğiniz firmaları belirleyin.
                            </Text>
                        </View>

                        {assignLoading ? (
                            <ActivityIndicator size="large" color="#FBBF24" style={{ marginTop: 50 }} />
                        ) : (
                            <FlatList
                                data={assignableProviders}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
                                renderItem={({ item }) => {
                                    const isSelected = selectedProviderIds.includes(item.id);
                                    return (
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', backgroundColor: isSelected ? 'rgba(74, 222, 128, 0.1)' : '#1e293b', 
                                                padding: 15, borderRadius: 12, marginBottom: 10,
                                                borderWidth: 1, borderColor: isSelected ? '#4ADE80' : '#334155'
                                            }}
                                            onPress={() => toggleProviderSelection(item.id)}
                                        >
                                            <MaterialCommunityIcons 
                                                name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                                                size={24} color={isSelected ? "#4ADE80" : "#64748b"} 
                                                style={{ marginRight: 15 }} 
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{item.full_name || 'İsimsiz Firma'}</Text>
                                                <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 13 }}>{item.email}</Text>
                                                {item.phone && <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 12 }}>📞 {item.phone}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <Text allowFontScaling={false} style={{ color: '#64748b', textAlign: 'center', marginTop: 30 }}>Kayıtlı uygun firma bulunamadı.</Text>
                                }
                            />
                        )}

                        <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#1e293b' }}>
                            <TouchableOpacity
                                style={{ backgroundColor: '#FBBF24', padding: 16, borderRadius: 12, alignItems: 'center' }}
                                onPress={handleAssignProviders}
                            >
                                <Text allowFontScaling={false} style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
                                    {selectedProviderIds.length} FİRMAYA YÖNLENDİR (KAYDET)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {renderUserDetailModal()}

            {/* LOCATION PICKER MODAL */}

            <TurkeyLocationPicker 
                visible={isLocationPickerVisible}
                onClose={() => setIsLocationPickerVisible(false)}
                onSelect={(c, d) => {
                    setFilterCity(c);
                    setFilterDistrict(d);
                }}
                currentCity={filterCity}
                currentDistrict={filterDistrict}
            />
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
    actionRowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginVertical: 4
    },
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
    adminSectionTitle: {
        color: '#D4AF37',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 4
    },
    menuFeatureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.1)'
    },
    menuFeatureIconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    menuFeatureContent: {
        flex: 1
    },
    menuFeatureTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    menuFeatureSubtitle: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 16
    },
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 16, overflow: 'hidden', maxHeight: '80%', width: '100%' },
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

    roleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333'
    },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 5 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    // Action Buttons
    actionBtn: { padding: 5 },
    approveBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
    approveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    // Detail Filters
    searchContainer: { backgroundColor: '#1A1A1C', borderRadius: 12, borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 12 },
    searchInput: { flex: 1, height: 48, color: '#FFF', fontSize: 14, fontWeight: '500' },
    locationFilterRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15, gap: 10 },
    locationFilterBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#222', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, overflow: 'hidden' },
    locationFilterText: { color: '#888', fontSize: 12, fontWeight: '600', flex: 1 },
    clearFilterBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)' },
});
