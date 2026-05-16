import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import TurkeyLocationPicker from '../../components/TurkeyLocationPicker';
import SharedRequestDetail from '../../components/SharedRequestDetail';

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
    const [detailItems, setDetailItems] = useState([]);
    const [detailBids, setDetailBids] = useState([]);
    const [detailConstructionOffers, setDetailConstructionOffers] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

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

    // Offer Filter State
    const [offerFilterMode, setOfferFilterMode] = useState('request'); // 'request' | 'contractor'
    const [offerSearchQuery, setOfferSearchQuery] = useState('');
    const [selectedContractorForOffers, setSelectedContractorForOffers] = useState(null);

    // Location Filters
    const [filterCity, setFilterCity] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

    // User Management State
    const [users, setUsers] = useState([]);
    const [userTypeFilter, setUserTypeFilter] = useState('corporate');
    const [selectedUserDetail, setSelectedUserDetail] = useState(null); // Moved here // 'individual' | 'corporate'
    const [convertToIndivConfirm, setConvertToIndivConfirm] = useState(false);

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

    // --- MANUAL CORPORATE UPGRADE STATE ---
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [upgradeTargetUser, setUpgradeTargetUser] = useState(null);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [upgradeForm, setUpgradeForm] = useState({
        company_name: '',
        tax_number: '',
        tax_office: '',
        phone: '',
        address: '',
        service_types: [],
        subscription_months: 12 // Default 1 year
    });

    const [editingSubscription, setEditingSubscription] = useState(false);
    const [expiryInput, setExpiryInput] = useState({ day: '', month: '', year: '' });

    const SERVICE_TYPES = [
        { id: 'urban_transformation', label: 'Kentsel Dönüşüm / Müteahhit' },
        { id: 'renovation_office', label: 'Tadilat Ofisi / Mimar' },
        { id: 'market_seller', label: 'Malzeme Satıcısı / Market' },
        { id: 'logistics_company', label: 'Nakliye / Lojistik' },
        { id: 'machine_renter', label: 'İş Makinesi Kiralama' },
        { id: 'lawyer', label: 'Avukat / Hukuk' },
        { id: 'technical_office', label: 'Teknik Ofis / Mühendis' },
    ];

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
            console.error('fetchParameters error:', err);
        }
    };

    // Detay verilerini çek (Modal için)
    useEffect(() => {
        if (selectedRequest) {
            fetchRequestDetails();
        } else {
            setDetailItems([]);
            setDetailBids([]);
            setDetailConstructionOffers([]);
        }
    }, [selectedRequest]);

    const fetchRequestDetails = async () => {
        try {
            setDetailLoading(true);
            const reqId = selectedRequest.id;
            
            // 1. Get Items (Market)
            const { data: items } = await supabase
                .from('market_request_items')
                .select('*')
                .eq('request_id', reqId);
            setDetailItems(items || []);

            // 2. Get Bids (Market)
            const { data: bids } = await supabase
                .from('market_bids')
                .select('*, provider:profiles!provider_id(full_name)')
                .eq('request_id', reqId);
            setDetailBids(bids || []);

            // 3. Get Construction Offers
            const { data: cOffers } = await supabase
                .from('construction_offers')
                .select('*, profiles:profiles!contractor_id(id, full_name, company_name, avatar_url)')
                .eq('request_id', reqId)
                .neq('status', 'draft')
                .order('created_at', { ascending: false });
            setDetailConstructionOffers(cOffers || []);

        } catch (err) {
            console.error('fetchRequestDetails error:', err);
        } finally {
            setDetailLoading(false);
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
            let profileHint = 'profiles';
            if (tableName === 'construction_requests' || tableName === 'renovation_group') profileHint = 'profiles!fk_construction_profiles';
            else if (tableName === 'market_requests') profileHint = 'profiles!fk_market_profiles';
            else if (tableName === 'transport_requests') profileHint = 'profiles!fk_transport_profiles';
            else if (tableName === 'elevator_requests') profileHint = 'profiles!elevator_requests_user_id_fkey';

            let selectQuery = `*, ${profileHint}(full_name, email)`;

            if (tableName === 'renovation_group') {
                // Fetch from construction_requests where offer_type='anahtar_teslim_tadilat' AND elevator_requests
                const constructionSelect = '*, profiles!fk_construction_profiles(full_name, email), bids:construction_offers(*)';
                const elevatorSelect = '*, profiles!elevator_requests_user_id_fkey(full_name, email)';

                let query1 = supabase.from('construction_requests').select(constructionSelect).eq('offer_type', 'anahtar_teslim_tadilat').order('created_at', { ascending: false });
                let query2 = supabase.from('elevator_requests').select(elevatorSelect).order('created_at', { ascending: false });

                if (searchQuery) {
                    let or1 = `title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`;
                    let or2 = `city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`;
                    
                    if (!isNaN(searchQuery) && searchQuery.trim().length > 0) {
                        or1 += `,ad_no.eq.${searchQuery}`;
                        or2 += `,ad_no.eq.${searchQuery}`;
                    }
                    
                    query1 = query1.or(or1);
                    query2 = query2.or(or2);
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
                let orQuery = "";
                
                if (tableName === 'transport_requests') {
                    orQuery = `load_type.ilike.%${searchQuery}%,from_location.ilike.%${searchQuery}%,to_location.ilike.%${searchQuery}%`;
                } else if (tableName === 'market_requests') {
                    orQuery = `title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`;
                } else {
                    orQuery = `title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`;
                }

                // If numeric, also search in ad_no
                if (!isNaN(searchQuery) && searchQuery.trim().length > 0) {
                    orQuery += `,ad_no.eq.${searchQuery}`;
                }
                query = query.or(orQuery);
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
        let selectQuery = '';

        if (tableName === 'construction_requests') {
            offerTable = 'construction_offers';
            // construction_offers uses contractor_id (not provider_id)
            selectQuery = `*, contractor:profiles!contractor_id(full_name, email), request:construction_requests!request_id(ad_no, city, district, offer_type, description, campaign_unit_count, campaign_commercial_count)`;
        } else if (tableName === 'market_requests') {
            offerTable = 'market_bids';
            selectQuery = `*, profiles:profiles!provider_id(full_name, email), request:market_requests!request_id(ad_no, location, title, items:market_request_items(*))`;
        } else if (tableName === 'transport_requests') {
            offerTable = 'transport_bids';
            selectQuery = `*, profiles:profiles!provider_id(full_name, email), request:transport_requests!request_id(ad_no, city, district)`;
        }

        if (!offerTable) return;

        try {
            let query = supabase
                .from(offerTable)
                .select(selectQuery);

            // Filter by module to avoid mixing urban transformation and renovation offers
            if (selectedModule?.id === 'urban_transformation') {
                query = query.not('request.offer_type', 'eq', 'anahtar_teslim_tadilat');
            } else if (selectedModule?.id === 'renovation') {
                query = query.eq('request.offer_type', 'anahtar_teslim_tadilat');
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(100);

            if (!error) {
                const dataWithTable = (data || []).map(d => ({ ...d, _tableName: offerTable }));
                setOffers(dataWithTable);
                // Reset drill-down if mode changes or data refreshes
                setSelectedContractorForOffers(null);
            } else {
                console.error('fetchOffers error:', error);
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

                            Alert.alert('Başarılı', 'İşlem tamamlandı.');
                            fetchModuleData(selectedModule.table); // Refresh requests
                            fetchOffers(selectedModule.table); // Refresh offers
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

            // Fetch Companies with ALL details
            const { data: companies } = await supabase.from('companies').select('*');

            // Fetch Company Services to map active roles
            const { data: services } = await supabase.from('company_services').select('*');

            // Map phones and services to profiles
            const usersWithServices = profiles.map(p => {
                const company = companies?.find(c => c.owner_id === p.id);
                const companyServices = services?.filter(s => s.company_id === company?.id && s.status === 'active') || [];
                
                return {
                    ...p,
                    company_id: company?.id,
                    company_name: company?.company_name,
                    tax_number: company?.tax_number,
                    tax_office: company?.tax_office,
                    address: company?.address,
                    phone: company?.phone || p.phone,
                    subscription_start_date: company?.subscription_start_date,
                    subscription_expires_at: company?.subscription_expires_at,
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
        try {
            // Mevcut listeden seçilenler çıkarılıp, yeni eklenen ID'ler merge ediliyor (üzerine YAZILMIYOR)
            let currentAssigned = assignTargetRequest.assigned_provider_ids || [];
            if (typeof currentAssigned === 'string') {
                try { currentAssigned = JSON.parse(currentAssigned); } catch(e) { currentAssigned = []; }
            }
            if (!Array.isArray(currentAssigned)) currentAssigned = [];

            const merged = [...new Set([...currentAssigned, ...selectedProviderIds])];
            const newlyAdded = selectedProviderIds.filter(id => !currentAssigned.includes(id));

            const targetTable = assignTargetRequest._tableName || selectedModule?.table || 'construction_requests';

            const { data, error } = await supabase
                .from(targetTable)
                .update({ assigned_provider_ids: merged })
                .eq('id', assignTargetRequest.id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Kayıt güncellenemedi. RLS (Güvenlik) engeli olabilir veya talep bulunamadı.");

            Alert.alert(
                "Yönlendirme Başarılı ✅",
                `${newlyAdded.length} yeni firmaya yönlendirildi. Toplam ${merged.length} firmaya iletilmiş durumda.`
            );
            setAssignModalVisible(false);
            setAssignTargetRequest(null);
            setSelectedProviderIds([]);

            // Refresh requests to update stats
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
        try {
            // 1. Update company_services table
            if (newValue) {
                // ADD SERVICE
                const { error: insertError } = await supabase
                    .from('company_services')
                    .upsert({
                        company_id: user.company_id,
                        service_type: serviceType,
                        status: 'active'
                    }, { onConflict: ['company_id', 'service_type'] });
                
                if (insertError) throw insertError;
            } else {
                // REMOVE SERVICE
                const { error: deleteError } = await supabase
                    .from('company_services')
                    .delete()
                    .match({ company_id: user.company_id, service_type: serviceType });
                
                if (deleteError) throw deleteError;
            }

            // 2. Sync Legacy Flags in Profiles for immediate UI/Access control across the app
            const profileUpdate = {};
            if (serviceType === 'urban_transformation') profileUpdate.is_contractor = newValue;
            if (serviceType === 'renovation_office') profileUpdate.is_architect = newValue;
            if (serviceType === 'market_seller') profileUpdate.is_seller = newValue;
            if (serviceType === 'logistics_company') profileUpdate.is_transporter = newValue;
            if (serviceType === 'lawyer') profileUpdate.is_lawyer = newValue;
            if (serviceType === 'technical_office') profileUpdate.is_engineer = newValue;

            if (Object.keys(profileUpdate).length > 0) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update(profileUpdate)
                    .eq('id', user.id);
                
                if (profileError) throw profileError;
            }

            // 3. Update UI State optimistically
            const currentServices = user.active_services || [];
            const updatedServices = newValue 
                ? [...currentServices, serviceType]
                : currentServices.filter(s => s !== serviceType);

            const updatedUser = { 
                ...user, 
                active_services: updatedServices,
                ...profileUpdate 
            };

            // Update both the list and the open modal detail
            setSelectedUserDetail(updatedUser);
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

            // Success feedback
            // console.log(`Service ${serviceType} set to ${newValue} for user ${user.id}`);

        } catch (err) {
            console.error("Toggle Service Error:", err);
            Alert.alert("Hata", "Yetki güncellenirken bir sorun oluştu: " + err.message);
        }
    };

    const handleConvertToIndividual = (user) => {
        setConvertToIndivConfirm(true);
    };

    const executeConvertToIndividual = async () => {
        const user = selectedUserDetail;
        if (!user) return;
        
        try {
            // 1. Update Profile (Legacy Flags)
            const { data: profileData, error: profileError } = await supabase
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
                .eq('id', user.id)
                .select();

            if (profileError) throw profileError;
            if (!profileData || profileData.length === 0) {
                throw new Error("Profil güncellenemedi. Güvenlik yetkisi (RLS) kısıtlaması olabilir.");
            }

            // 2. Clear Company Services (New System)
            if (user.company_id) {
                const { error: deleteError } = await supabase
                    .from('company_services')
                    .delete()
                    .eq('company_id', user.company_id);
                if (deleteError) console.error("Company Services Silme Hatası:", deleteError);
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
                setUsers(prev => prev.filter(u => u.id !== user.id));
                setConvertToIndivConfirm(false);
                setSelectedUserDetail(null);
            } else {
                setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                setSelectedUserDetail(updatedUser);
                setConvertToIndivConfirm(false);
            }

            setTimeout(() => {
                Alert.alert('Başarılı', 'Kullanıcı bireysel hesaba geçirildi.');
            }, 500);

        } catch (err) {
            console.error("executeConvertToIndividual Hatası:", err);
            setConvertToIndivConfirm(false);
            setTimeout(() => {
                Alert.alert('Hata', 'İşlem başarısız: ' + err.message);
            }, 500);
        }
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

    // --- MANUAL CORPORATE UPGRADE LOGIC ---
    const handleManualUpgrade = async () => {
        const { company_name, tax_number, tax_office, phone, address, service_types, subscription_months } = upgradeForm;

        if (!company_name || !phone || service_types.length === 0) {
            Alert.alert("Eksik Bilgi", "Firma adı, telefon ve en az bir hizmet alanı zorunludur.");
            return;
        }

        try {
            setUpgradeLoading(true);

            // Calculate Expiry Date
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + parseInt(subscription_months));

            // 1. Create/Update Company
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .upsert({
                    owner_id: upgradeTargetUser.id,
                    company_name,
                    tax_number,
                    tax_office,
                    phone,
                    address,
                    subscription_start_date: new Date().toISOString(),
                    subscription_expires_at: expiryDate.toISOString()
                }, { onConflict: 'owner_id' })
                .select()
                .single();

            if (companyError) throw companyError;

            // 2. Set Services
            const servicesToInsert = service_types.map(type => ({
                company_id: company.id,
                service_type: type,
                status: 'active'
            }));

            // Delete old services first to ensure clean state
            await supabase.from('company_services').delete().eq('company_id', company.id);
            
            const { error: servicesError } = await supabase
                .from('company_services')
                .insert(servicesToInsert);

            if (servicesError) throw servicesError;

            // 3. Update Profile & Legacy Flags
            const profileUpdate = {
                user_type: 'corporate',
                approval_status: 'approved',
                rejection_reason: null,
                // Legacy Flags for backward compatibility
                is_contractor: service_types.includes('urban_transformation'),
                is_architect: service_types.includes('renovation_office'),
                is_seller: service_types.includes('market_seller'),
                is_transporter: service_types.includes('logistics_company'),
                is_lawyer: service_types.includes('lawyer'),
                is_engineer: service_types.includes('technical_office'),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdate)
                .eq('id', upgradeTargetUser.id);

            if (profileError) throw profileError;

            Alert.alert("Başarılı ✅", `${upgradeTargetUser.full_name || upgradeTargetUser.email} kurumsal hesaba yükseltildi ve tüm yetkileri tanımlandı.`);
            
            setUpgradeModalVisible(false);
            setUpgradeTargetUser(null);
            setUpgradeForm({ company_name: '', tax_number: '', tax_office: '', phone: '', address: '', service_types: [] });
            
            // Refresh User List
            fetchUsers();

        } catch (err) {
            console.error(err);
            Alert.alert("Hata", "Yükseltme işlemi başarısız oldu: " + err.message);
        } finally {
            setUpgradeLoading(false);
        }
    };

    const groupOffersByContractor = (offersList) => {
        const groups = {};
        offersList.forEach(offer => {
            const profile = offer.contractor || offer.profiles;
            const id = profile?.id || 'unknown';
            if (!groups[id]) {
                groups[id] = {
                    id,
                    profile,
                    offers: []
                };
            }
            groups[id].offers.push(offer);
        });
        return Object.values(groups).sort((a, b) => 
            (a.profile?.company_name || a.profile?.full_name || '').localeCompare(b.profile?.company_name || b.profile?.full_name || '')
        );
    };

    const renderContractorItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.card, { padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#D4AF37' }]}
            activeOpacity={0.7}
            onPress={() => setSelectedContractorForOffers(item)}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)', width: 44, height: 44, borderRadius: 12 }]}>
                    <MaterialCommunityIcons name="domain" size={24} color="#D4AF37" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                        {item.profile?.company_name || item.profile?.full_name || 'İsimsiz Firma'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12 }}>
                            📞 {item.profile?.phone || 'Telefon yok'}
                        </Text>
                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12 }}>
                            📍 {item.profile?.city || '-'}{item.profile?.district ? ` / ${item.profile.district}` : ''}
                        </Text>
                    </View>
                </View>
                <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 14, fontWeight: 'bold' }}>{item.offers.length}</Text>
                    <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 9, fontWeight: 'bold' }}>TEKLİF</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderOfferItem = ({ item }) => {
        if (selectedModule?.id === 'market') {
            const providerProfile = item.contractor || item.profiles;
            const statusColor = item.status === 'ACCEPTED' ? '#4ade80' : item.status === 'REJECTED' ? '#ef4444' : '#f59e0b';
            const statusBg = item.status === 'ACCEPTED' ? 'rgba(74, 222, 128, 0.15)' : item.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
            const statusText = item.status === 'ACCEPTED' ? 'ONAYLI TEKLİF' : item.status === 'REJECTED' ? 'REDDEDİLDİ' : 'BEKLEYEN TEKLİF';

            // IF FILTERED BY REQUEST: Use the "Opportunity Card" style (Image 2)
            if (offerFilterMode === 'request') {
                return (
                    <View style={[styles.card, { padding: 0, overflow: 'hidden', backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.05)', marginBottom: 15 }]}>
                        <View style={{ padding: 16 }}>
                            {/* Header: Provider & Status */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <MaterialCommunityIcons name="office-building" size={12} color="#34D399" />
                                            <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 10, fontWeight: '900' }}>{providerProfile?.company_name || providerProfile?.full_name || 'İSİMSİZ FİRMA'}</Text>
                                        </View>
                                        <View style={{ backgroundColor: statusBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                            <Text allowFontScaling={false} style={{ color: statusColor, fontSize: 10, fontWeight: '900' }}>{statusText}</Text>
                                        </View>
                                    </View>
                                    <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                                        {new Date(item.created_at).toLocaleDateString('tr-TR')} • {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}>
                                    <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold' }}>#{item.id.substring(0,8).toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* Details Box */}
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name="cube-outline" size={20} color="#94a3b8" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>MALZEME</Text>
                                        {renderProductWithBadges(item.request?.items?.[0]?.product_name || item.request?.title || "İsimsiz Talep", false)}
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name="cash" size={20} color="#4ade80" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>TEKLİF TUTARI</Text>
                                        <Text allowFontScaling={false} style={{ color: '#4ade80', fontSize: 15, fontWeight: 'bold' }}>{item.price?.toLocaleString('tr-TR')} ₺</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="location-outline" size={20} color="#EF4444" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>TESLİMAT YERİ</Text>
                                        <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{item.request?.location || 'Konum belirtilmedi'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                                <TouchableOpacity style={{ flex: 1, backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold' }}>Arşivle</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={{ flex: 2, backgroundColor: '#fbbf24', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                                    onPress={() => {
                                        // Navigate to MarketOffers to see the EXACT view the customer sees
                                        navigation.navigate('MarketOffers', {
                                            request: { ...item.request, items: item.request?.items || [] }, 
                                            bids: [item], // Pass the single bid as an array
                                            isAdminView: true
                                        });
                                    }}
                                >
                                    <Text allowFontScaling={false} style={{ color: '#000', fontSize: 14, fontWeight: '900' }}>TEKLİFİ İNCELE</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            }

            // DEFAULT / BY CONTRACTOR: Use the standard offer-focused design
            return (
                <TouchableOpacity
                    style={[styles.card, { padding: 16, backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.05)', marginBottom: 15 }]}
                    onPress={() => {
                        // Navigate to MarketOffers to see the EXACT view the customer sees
                        navigation.navigate('MarketOffers', {
                            request: { ...item.request, items: item.request?.items || [] }, 
                            bids: [item], // Pass the single bid as an array
                            isAdminView: true
                        });
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(52, 211, 153, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                            <MaterialCommunityIcons name="office-building" size={20} color="#34D399" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>{providerProfile?.company_name || providerProfile?.full_name || 'İsimsiz Firma'}</Text>
                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11 }}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                        </View>
                        <View style={{ backgroundColor: statusBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text allowFontScaling={false} style={{ color: statusColor, fontSize: 10, fontWeight: '900' }}>{statusText}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                         <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="cart" size={12} color="#34D399" />
                            <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 10, fontWeight: 'bold' }}>MARKET / MALZEME</Text>
                         </View>
                    </View>

                    <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Teklif Özeti:</Text>
                        <Text allowFontScaling={false} style={{ color: '#4ADE80', fontSize: 15, fontWeight: 'bold' }}>
                            {item.request?.location || 'Konum belirtilmedi'} - {item.price?.toLocaleString('tr-TR')} ₺
                        </Text>
                        {item.notes && (
                            <Text allowFontScaling={false} numberOfLines={2} style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                                "{item.notes}"
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            );
        }

        // construction_offers uses contractor field (not profiles), others use profiles
        const providerProfile = item.contractor || item.profiles;
        const providerName = providerProfile?.company_name || providerProfile?.full_name || 'Bilinmeyen Firma';
        const requestCity = item.request?.city || item.request?.location || '-';
        const requestDistrict = item.request?.district || '';
        const locationText = `${requestCity}${requestDistrict ? ' / ' + requestDistrict : ''}`;
        const offerTypeLabel = item.request?.offer_type === 'anahtar_teslim_tadilat' ? 'Anahtar Teslim' : 'Kat Karşılığı';

        const priceDisplay = item.price_estimate > 0
            ? `${locationText} - ${item.price_estimate.toLocaleString('tr-TR')} ₺`
            : item.price > 0
                ? `${locationText} - ${item.price.toLocaleString('tr-TR')} ₺`
                : `${locationText} - ${offerTypeLabel}`;

        return (
            <TouchableOpacity
                style={styles.offerCard}
                activeOpacity={0.8}
                onPress={() => {
                    if (['urban_transformation', 'renovation'].includes(selectedModule?.id)) {
                        navigation.navigate('OfferDetail', {
                            request: item.request,
                            request_id: item.request_id,
                            contractor_id: item.contractor_id,
                            initialOfferIndex: 0,
                            isAdminView: true
                        });
                    } else if (item.request) {
                        navigation.navigate('OfferDetail', {
                            request: item.request, 
                            request_id: item.request_id, 
                            contractor_id: item.provider_id, 
                            offers: [item], 
                            isAdminView: true,
                            isMarket: selectedModule?.id === 'market'
                        });
                    } else {
                        Alert.alert('Hata', 'Talep detaylarına ulaşılamadı.');
                    }
                }}
            >
                {/* Header: Provider Info + Status */}
                <View style={styles.offerHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <View style={styles.offerIconBox}>
                            <MaterialCommunityIcons name="domain" size={20} color="#34D399" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text allowFontScaling={false} style={styles.offerProviderName}>{providerName}</Text>
                                {item.request?.ad_no && (
                                    <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 9, fontWeight: 'bold' }}>#{item.request.ad_no.toString().padStart(7, '0')}</Text>
                                    </View>
                                )}
                            </View>
                            <Text allowFontScaling={false} style={styles.offerDate}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.statusBadge, {
                            backgroundColor: item.status === 'accepted' ? 'rgba(74, 222, 128, 0.1)' :
                                item.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'
                        }]}>
                            <Text allowFontScaling={false} style={[styles.statusText, {
                                color: item.status === 'accepted' ? '#4ADE80' :
                                    item.status === 'rejected' ? '#EF4444' : '#FBBF24'
                            }]}>
                                {item.status === 'accepted' ? 'KABUL' :
                                    item.status === 'rejected' ? 'REDDEDİLDİ' : 'BEKLİYOR'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => handleDelete(item)}
                            style={{ padding: 5 }}
                        >
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Request Type Badge */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: 
                            item.request?.offer_type === 'anahtar_teslim_tadilat' ? 'rgba(212, 175, 55, 0.1)' :
                            selectedModule?.id === 'market' ? 'rgba(52, 211, 153, 0.1)' :
                            selectedModule?.id === 'logistics' ? 'rgba(56, 189, 248, 0.1)' :
                            'rgba(59, 130, 246, 0.1)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 
                            item.request?.offer_type === 'anahtar_teslim_tadilat' ? 'rgba(212, 175, 55, 0.3)' :
                            selectedModule?.id === 'market' ? 'rgba(52, 211, 153, 0.3)' :
                            selectedModule?.id === 'logistics' ? 'rgba(56, 189, 248, 0.3)' :
                            'rgba(59, 130, 246, 0.3)',
                    }}>
                        <MaterialCommunityIcons 
                            name={
                                item.request?.offer_type === 'anahtar_teslim_tadilat' ? "hammer-wrench" :
                                selectedModule?.id === 'market' ? "cart" :
                                selectedModule?.id === 'logistics' ? "truck-fast" :
                                "home-city"
                            } 
                            size={14} 
                            color={
                                item.request?.offer_type === 'anahtar_teslim_tadilat' ? "#D4AF37" :
                                selectedModule?.id === 'market' ? "#34D399" :
                                selectedModule?.id === 'logistics' ? "#38BDF8" :
                                "#60A5FA"
                            } 
                        />
                        <Text allowFontScaling={false} style={{ 
                            color: 
                                item.request?.offer_type === 'anahtar_teslim_tadilat' ? "#D4AF37" :
                                selectedModule?.id === 'market' ? "#34D399" :
                                selectedModule?.id === 'logistics' ? "#38BDF8" :
                                "#60A5FA", 
                            fontSize: 11, 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            {
                                item.request?.offer_type === 'anahtar_teslim_tadilat' ? 'Tadilat Talebi' :
                                selectedModule?.id === 'market' ? 'Market / Malzeme' :
                                selectedModule?.id === 'logistics' ? 'Lojistik / Nakliye' :
                                'Kentsel Dönüşüm'
                            }
                        </Text>
                    </View>
                </View>

                {/* Offer Body */}
                <View style={styles.offerBody}>
                    <Text allowFontScaling={false} style={styles.offerLabel}>Teklif Özeti:</Text>
                    <Text allowFontScaling={false} style={styles.offerPrice}>{priceDisplay}</Text>
                    {(item.notes || item.offer_details) && (
                        <Text allowFontScaling={false} style={styles.offerNote} numberOfLines={2}>"{item.notes || item.offer_details}"</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };



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
                    {item.user_type === 'corporate' && item.subscription_expires_at && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="calendar-outline" size={12} color={new Date(item.subscription_expires_at) < new Date() ? '#EF4444' : '#4ADE80'} />
                            <Text allowFontScaling={false} style={[styles.userCardDate, { color: new Date(item.subscription_expires_at) < new Date() ? '#EF4444' : '#4ADE80', marginLeft: 4 }]}>
                                Abonelik Bitiş: {new Date(item.subscription_expires_at).toLocaleDateString('tr-TR')} 
                                ({Math.ceil((new Date(item.subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24))} gün)
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action / Status Area */}
                <View style={{ alignItems: 'flex-end' }}>
                    {userTypeFilter === 'individual' ? (
                        <TouchableOpacity
                            style={{ backgroundColor: '#D4AF37', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            onPress={() => {
                                setUpgradeTargetUser(item);
                                setUpgradeForm(prev => ({ ...prev, phone: item.phone || '' }));
                                setUpgradeModalVisible(true);
                            }}
                        >
                            <MaterialCommunityIcons name="shield-star" size={14} color="#000" />
                            <Text allowFontScaling={false} style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>KURUMSAL YAP</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#EF4444' }}
                                onPress={() => handleConvertToIndividual(item)}
                            >
                                <Text allowFontScaling={false} style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>BİREYSELE DÜŞÜR</Text>
                            </TouchableOpacity>

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
                        </View>
                    )}
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
                        <>
                            {/* Header */}
                            <View style={styles.modalHeader}>
                                <Text allowFontScaling={false} style={styles.modalTitle}>Kullanıcı Detayı</Text>
                                <TouchableOpacity onPress={() => setSelectedUserDetail(null)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            {selectedUserDetail && (
                                <>
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
                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>📅 Sisteme Kayıt: {new Date(selectedUserDetail.created_at).toLocaleDateString('tr-TR')}</Text>

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

                                        {/* COMPANY DETAILS SECTION */}
                                        {selectedUserDetail.user_type === 'corporate' && (
                                            <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
                                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>FİRMA RESMİ BİLGİLERİ</Text>
                                                
                                                <View style={{ gap: 12 }}>
                                                    <View>
                                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Firma Ünvanı</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 }}>{selectedUserDetail.company_name || 'Belirtilmemiş'}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row' }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Vergi Numarası</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 }}>{selectedUserDetail.tax_number || 'Belirtilmemiş'}</Text>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Vergi Dairesi</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 }}>{selectedUserDetail.tax_office || 'Belirtilmemiş'}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row' }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Firma Telefonu</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 }}>{selectedUserDetail.phone || 'Belirtilmemiş'}</Text>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Hesap Tipi</Text>
                                                            <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>KURUMSAL</Text>
                                                        </View>
                                                    </View>

                                                    <View>
                                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Firma Adresi</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 13, marginTop: 2 }}>{selectedUserDetail.address || 'Adres bilgisi girilmemiş.'}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* SUBSCRIPTION TRACKING SECTION */}
                                        {selectedUserDetail.user_type === 'corporate' && (
                                            <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                    <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold' }}>ÜYELİK VE ABONELİK</Text>
                                                    <TouchableOpacity 
                                                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                                                        onPress={() => {
                                                            const current = selectedUserDetail.subscription_expires_at ? new Date(selectedUserDetail.subscription_expires_at) : new Date();
                                                            setExpiryInput({
                                                                day: String(current.getDate()),
                                                                month: String(current.getMonth() + 1),
                                                                year: String(current.getFullYear())
                                                            });
                                                            setEditingSubscription(true);
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#3B82F6', fontSize: 11, fontWeight: 'bold' }}>DÜZENLE</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                                    <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 10, borderRadius: 8 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold' }}>BAŞLANGIÇ</Text>
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 13, marginTop: 2 }}>
                                                            {selectedUserDetail.subscription_start_date ? new Date(selectedUserDetail.subscription_start_date).toLocaleDateString('tr-TR') : '-'}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 10, borderRadius: 8 }}>
                                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold' }}>BİTİŞ TARİHİ</Text>
                                                        <Text allowFontScaling={false} style={{ color: selectedUserDetail.subscription_expires_at && new Date(selectedUserDetail.subscription_expires_at) < new Date() ? '#EF4444' : '#4ADE80', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                                                            {selectedUserDetail.subscription_expires_at ? new Date(selectedUserDetail.subscription_expires_at).toLocaleDateString('tr-TR') : 'Sınırsız'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {selectedUserDetail.subscription_expires_at && (
                                                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                        <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 11 }}>
                                                            Kalan Süre: {Math.ceil((new Date(selectedUserDetail.subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24))} gün
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* ROLE MANAGEMENT SECTION */}
                                        {selectedUserDetail.user_type === 'corporate' && (
                                            <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
                                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>FİRMA YETKİLERİ / ROLLERİ</Text>

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
                                                        <View key={role.key} style={[styles.roleRow, { borderBottomWidth: 0.5, borderBottomColor: '#222' }]}>
                                                            <Text allowFontScaling={false} style={{ color: isActive ? '#fff' : '#888', flex: 1, fontSize: 14 }}>{role.label}</Text>
                                                            <Switch
                                                                value={isActive || false}
                                                                trackColor={{ false: '#333', true: 'rgba(74, 222, 128, 0.4)' }}
                                                                thumbColor={isActive ? '#4ADE80' : '#f4f3f4'}
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

                                    {/* INTERNAL SUBSCRIPTION EDIT PANEL (FIXED) */}
                                    {editingSubscription && (
                                        <View style={{ 
                                            position: 'absolute', 
                                            top: 0, left: 0, right: 0, bottom: 0, 
                                            backgroundColor: 'rgba(0,0,0,0.92)', 
                                            zIndex: 999, 
                                            justifyContent: 'center', 
                                            padding: 20
                                        }}>
                                            <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}>
                                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Abonelik Tarihini Güncelle</Text>
                                                
                                                <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>Hızlı İşlemler:</Text>
                                                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, minWidth: '45%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: '#4ADE80', alignItems: 'center' }}
                                                        onPress={async () => {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('companies')
                                                                    .update({ subscription_expires_at: null })
                                                                    .eq('owner_id', selectedUserDetail.id);
                                                                
                                                                if (error) throw error;
                                                                
                                                                const updatedUser = { ...selectedUserDetail, subscription_expires_at: null };
                                                                setSelectedUserDetail(updatedUser);
                                                                setUsers(prev => prev.map(u => u.id === selectedUserDetail.id ? updatedUser : u));
                                                                setEditingSubscription(false);
                                                                Alert.alert("Başarılı", "Üyelik SINIRSIZ olarak güncellendi. ♾️");
                                                            } catch (err) {
                                                                Alert.alert("Hata", err.message);
                                                            }
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#4ADE80', fontWeight: 'bold' }}>♾️ SINIRSIZ YAP</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity 
                                                        style={{ flex: 1, minWidth: '45%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' }}
                                                        onPress={async () => {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('companies')
                                                                    .update({ subscription_expires_at: new Date().toISOString() })
                                                                    .eq('owner_id', selectedUserDetail.id);
                                                                
                                                                if (error) throw error;
                                                                
                                                                const updatedUser = { ...selectedUserDetail, subscription_expires_at: new Date().toISOString() };
                                                                setSelectedUserDetail(updatedUser);
                                                                setUsers(prev => prev.map(u => u.id === selectedUserDetail.id ? updatedUser : u));
                                                                setEditingSubscription(false);
                                                                Alert.alert("Başarılı", "Üyelik süresi bugün dolacak şekilde güncellendi. ⏳");
                                                            } catch (err) {
                                                                Alert.alert("Hata", err.message);
                                                            }
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#EF4444', fontWeight: 'bold' }}>⌛ SÜREYİ BİTİR</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>Manuel Tarih Girişi (GG / AA / YYYY):</Text>
                                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25 }}>
                                                    <TextInput 
                                                        style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', textAlign: 'center' }}
                                                        placeholder="GG"
                                                        placeholderTextColor="#444"
                                                        keyboardType="numeric"
                                                        value={expiryInput.day}
                                                        onChangeText={(t) => setExpiryInput(prev => ({ ...prev, day: t }))}
                                                        maxLength={2}
                                                    />
                                                    <TextInput 
                                                        style={{ flex: 1, backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', textAlign: 'center' }}
                                                        placeholder="AA"
                                                        placeholderTextColor="#444"
                                                        keyboardType="numeric"
                                                        value={expiryInput.month}
                                                        onChangeText={(t) => setExpiryInput(prev => ({ ...prev, month: t }))}
                                                        maxLength={2}
                                                    />
                                                    <TextInput 
                                                        style={{ flex: 2, backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', textAlign: 'center' }}
                                                        placeholder="YYYY"
                                                        placeholderTextColor="#444"
                                                        keyboardType="numeric"
                                                        value={expiryInput.year}
                                                        onChangeText={(t) => setExpiryInput(prev => ({ ...prev, year: t }))}
                                                        maxLength={4}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 12, alignItems: 'center' }}
                                                        onPress={() => setEditingSubscription(false)}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontWeight: 'bold' }}>İPTAL</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={{ flex: 2, backgroundColor: '#D4AF37', padding: 15, borderRadius: 12, alignItems: 'center' }}
                                                        onPress={async () => {
                                                            const { day, month, year } = expiryInput;
                                                            if (!day || !month || !year) {
                                                                Alert.alert("Hata", "Lütfen tüm tarih alanlarını doldurun.");
                                                                return;
                                                            }
                                                            
                                                            const newDate = new Date(year, month - 1, day, 23, 59, 59);
                                                            if (isNaN(newDate.getTime())) {
                                                                Alert.alert("Hata", "Geçersiz tarih formatı.");
                                                                return;
                                                            }

                                                            try {
                                                                const { error } = await supabase
                                                                    .from('companies')
                                                                    .update({ subscription_expires_at: newDate.toISOString() })
                                                                    .eq('owner_id', selectedUserDetail.id);
                                                                
                                                                if (error) throw error;
                                                                
                                                                const updatedUser = { ...selectedUserDetail, subscription_expires_at: newDate.toISOString() };
                                                                setSelectedUserDetail(updatedUser);
                                                                setUsers(prev => prev.map(u => u.id === selectedUserDetail.id ? updatedUser : u));
                                                                setEditingSubscription(false);
                                                                Alert.alert("Başarılı", `Bitiş tarihi ${day}.${month}.${year} olarak güncellendi. ✅`);
                                                            } catch (err) {
                                                                Alert.alert("Hata", err.message);
                                                            }
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold' }}>TARİHİ KAYDET</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                    {/* CONVERT TO INDIVIDUAL CONFIRMATION PANEL */}
                                    {convertToIndivConfirm && (
                                        <View style={{ 
                                            position: 'absolute', 
                                            top: 0, left: 0, right: 0, bottom: 0, 
                                            backgroundColor: 'rgba(0,0,0,0.92)', 
                                            zIndex: 9999, 
                                            justifyContent: 'center', 
                                            padding: 20
                                        }}>
                                            <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 25, borderWidth: 1, borderColor: '#F59E0B', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, alignItems: 'center' }}>
                                                <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#F59E0B" style={{ marginBottom: 15 }} />
                                                <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Kurumsal Üyelikten Çıkar?</Text>
                                                
                                                <Text allowFontScaling={false} style={{ color: '#cbd5e1', fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
                                                    Bu işlem kullanıcının tüm firma yetkilerini (Müteahhit, Satıcı vb.) iptal edecek ve hesabı <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>"Bireysel"</Text>e çevirecektir. Onaylıyor musunuz?
                                                </Text>
                                                
                                                <View style={{ flexDirection: 'row', gap: 15 }}>
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 12, alignItems: 'center' }}
                                                        onPress={() => setConvertToIndivConfirm(false)}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Vazgeç</Text>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, backgroundColor: '#F59E0B', padding: 15, borderRadius: 12, alignItems: 'center' }}
                                                        onPress={executeConvertToIndividual}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Onayla ve Çevir</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
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

    // Helper to render Name + Badges from product_name (Parity with Market)
    const renderProductWithBadges = (rawName, isTitle = false, hideCleanName = false, hideBadges = false) => {
        if (!rawName) return <Text allowFontScaling={false} style={{ color: '#888', fontSize: isTitle ? 16 : 14 }}>Belirtilmedi</Text>;

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
                {!hideCleanName && (
                    <Text allowFontScaling={false} style={{ 
                        color: '#FFF', 
                        fontSize: isTitle ? 18 : 14, 
                        fontWeight: isTitle ? '900' : 'bold' 
                    }}>
                        {cleanName}
                    </Text>
                )}
                {(!hideBadges && (brand || spec)) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: isTitle ? 8 : 4 }}>
                        {brand && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                                <Ionicons name="pricetag" size={10} color="#38bdf8" />
                                <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 11, fontWeight: 'bold' }}>Marka: {brand}</Text>
                            </View>
                        )}
                        {spec && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(168, 85, 247, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                                <Ionicons name="settings" size={10} color="#a855f7" />
                                <Text allowFontScaling={false} style={{ color: '#a855f7', fontSize: 11, fontWeight: 'bold' }}>Özellik: {spec}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // --- RENDER REQUEST ITEM ---
    const renderRequestItem = ({ item }) => {
        if (selectedModule?.id === 'market') {
            return (
                <View style={[styles.card, { padding: 0, overflow: 'hidden', backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.05)', marginBottom: 15 }]}>
                    <View style={{ padding: 16 }}>
                        {/* Header: Title & Time */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                    <View style={{ backgroundColor: '#fbbf24', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="flash" size={12} color="#000" />
                                        <Text allowFontScaling={false} style={{ color: '#000', fontSize: 10, fontWeight: '900' }}>YENİ TALEP</Text>
                                    </View>
                                    <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="location" size={12} color="#38bdf8" />
                                        <Text allowFontScaling={false} style={{ color: '#38bdf8', fontSize: 10, fontWeight: '900' }}>YAKIN KONUM</Text>
                                    </View>
                                </View>
                                <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                                    {new Date(item.created_at).toLocaleDateString('tr-TR')} • {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold' }}>
                                        {item.ad_no ? `#${item.ad_no.toString().padStart(7, '0')}` : `#${item.id.substring(0,8).toUpperCase()}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Details Box */}
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommunityIcons name="cube-outline" size={20} color="#94a3b8" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>MALZEME</Text>
                                    {renderProductWithBadges(item.items?.[0]?.product_name || item.title || "İsimsiz Talep", false)}
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommunityIcons name="bag-personal-outline" size={20} color="#94a3b8" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>MİKTAR</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>{item.items?.[0]?.quantity || item.quantity || '-'}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="location-outline" size={20} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>TESLİMAT YERİ</Text>
                                    <Text allowFontScaling={false} style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{item.location || 'Konum belirtilmedi'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                                <Text allowFontScaling={false} style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold' }}>Arşivle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ flex: 2, backgroundColor: '#fbbf24', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                                onPress={() => setSelectedRequest(item)}
                            >
                                <Text allowFontScaling={false} style={{ color: '#000', fontSize: 14, fontWeight: '900' }}>TALEBİ İNCELE</Text>
                                <Ionicons name="arrow-forward" size={18} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => setSelectedRequest(item)}
            >
            {/* Module Context Badge */}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 
                        selectedModule?.id === 'renovation' ? 'rgba(212, 175, 55, 0.1)' :
                        selectedModule?.id === 'market' ? 'rgba(52, 211, 153, 0.1)' :
                        selectedModule?.id === 'logistics' ? 'rgba(56, 189, 248, 0.1)' :
                        'rgba(59, 130, 246, 0.1)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: 
                        selectedModule?.id === 'renovation' ? 'rgba(212, 175, 55, 0.3)' :
                        selectedModule?.id === 'market' ? 'rgba(52, 211, 153, 0.3)' :
                        selectedModule?.id === 'logistics' ? 'rgba(56, 189, 248, 0.3)' :
                        'rgba(59, 130, 246, 0.3)',
                }}>
                    <MaterialCommunityIcons 
                        name={
                            selectedModule?.id === 'renovation' ? "hammer-wrench" :
                            selectedModule?.id === 'market' ? "cart" :
                            selectedModule?.id === 'logistics' ? "truck-fast" :
                            "home-city"
                        } 
                        size={12} 
                        color={
                            selectedModule?.id === 'renovation' ? "#D4AF37" :
                            selectedModule?.id === 'market' ? "#34D399" :
                            selectedModule?.id === 'logistics' ? "#38BDF8" :
                            "#60A5FA"
                        } 
                    />
                    <Text allowFontScaling={false} style={{ 
                        color: 
                            selectedModule?.id === 'renovation' ? "#D4AF37" :
                            selectedModule?.id === 'market' ? "#34D399" :
                            selectedModule?.id === 'logistics' ? "#38BDF8" :
                            "#60A5FA", 
                        fontSize: 9, 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}>
                        {
                            selectedModule?.id === 'renovation' ? 'Tadilat' :
                            selectedModule?.id === 'market' ? 'Market' :
                            selectedModule?.id === 'logistics' ? 'Lojistik' :
                            'Kentsel Dönüşüm'
                        }
                    </Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: selectedModule.color + '20' }]}>
                    <MaterialCommunityIcons
                        name={selectedModule.icon}
                        size={24}
                        color={selectedModule.color}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text allowFontScaling={false} style={[styles.title, { flex: 1 }]}>{item.title || selectedModule.title + ' Talebi'}</Text>
                        {item.ad_no && (
                            <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                                <Text allowFontScaling={false} style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold' }}>#{item.ad_no.toString().padStart(7, '0')}</Text>
                            </View>
                        )}
                    </View>
                    <Text allowFontScaling={false} style={styles.subtitle}>
                        {item.city || 'Tüm Şehirler'} / {item.district || 'Tüm İlçeler'} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                    {item.profiles ? (
                        <Text allowFontScaling={false} style={styles.userText}>
                            👤 {item.profiles.company_name || item.profiles.full_name} 
                            <Text style={{ fontSize: 10, color: '#64748b' }}> ({item.profiles.email})</Text>
                        </Text>
                    ) : (
                        <Text allowFontScaling={false} style={styles.userText}>👤 Kullanıcı (Bilinmiyor)</Text>
                    )}
                    
                    {/* STATS: Routing & Offers */}
                    {['urban_transformation', 'renovation', 'market'].includes(selectedModule?.id) && (
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                <MaterialCommunityIcons name="briefcase-account" size={12} color="#D4AF37" />
                                <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                                    {Array.isArray(item.assigned_provider_ids) ? item.assigned_provider_ids.length : (typeof item.assigned_provider_ids === 'string' ? (item.assigned_provider_ids === '[]' ? 0 : item.assigned_provider_ids.split(',').length) : 0)} Firmaya İletildi
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                <MaterialCommunityIcons name="file-document-outline" size={12} color="#34D399" />
                                <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                                    {item.bids?.length || 0} Teklif Alındı
                                </Text>
                            </View>
                        </View>
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
    };

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
                                        style={[styles.subTab, activeTab === 'forwarded' && styles.subTabActive]}
                                        onPress={() => setActiveTab('forwarded')}
                                    >
                                        <Text allowFontScaling={false} style={[styles.subTabText, activeTab === 'forwarded' && styles.subTabTextActive]}>Yönlendirilenler</Text>
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
                            ) : (activeTab === 'requests' || activeTab === 'forwarded') ? (
                                <FlatList
                                    key={`request-list-${activeTab}`}
                                    data={requests.filter(req => {
                                        let ids = req.assigned_provider_ids || [];
                                        if (typeof ids === 'string') {
                                            try { ids = JSON.parse(ids); } catch(e) { ids = []; }
                                        }
                                        const isForwarded = Array.isArray(ids) && ids.length > 0;
                                        return activeTab === 'requests' ? !isForwarded : isForwarded;
                                    })}
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
                            ) : (() => {
                                // Compute filtered offers
                                const filteredOffers = offers.filter(item => {
                                    if (!offerSearchQuery.trim()) return true;
                                    const q = offerSearchQuery.toLowerCase();
                                    if (offerFilterMode === 'contractor') {
                                        const providerProfile = item.contractor || item.profiles;
                                        const name = (providerProfile?.company_name || providerProfile?.full_name || '').toLowerCase();
                                        return name.includes(q);
                                    } else { // request
                                        const city = (item.request?.city || item.request?.location || '').toLowerCase();
                                        const district = (item.request?.district || '').toLowerCase();
                                        return city.includes(q) || district.includes(q);
                                    }
                                });

                                // Contractor Drill-Down Logic
                                if (offerFilterMode === 'contractor' && selectedContractorForOffers) {
                                    return (
                                        <FlatList
                                            key="contractor-offer-list"
                                            data={selectedContractorForOffers.offers}
                                            renderItem={renderOfferItem}
                                            keyExtractor={item => item.id.toString()}
                                            contentContainerStyle={{ padding: 20 }}
                                            ListHeaderComponent={(
                                                <View style={{ marginBottom: 16 }}>
                                                    <TouchableOpacity 
                                                        onPress={() => setSelectedContractorForOffers(null)}
                                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                                                    >
                                                        <Ionicons name="arrow-back" size={20} color="#D4AF37" />
                                                        <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold', marginLeft: 8 }}>Müteahhit Listesine Dön</Text>
                                                    </TouchableOpacity>
                                                    <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                                        <Text allowFontScaling={false} style={{ color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }}>
                                                            {selectedContractorForOffers.profile?.company_name || selectedContractorForOffers.profile?.full_name}
                                                        </Text>
                                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                                                            Toplam {selectedContractorForOffers.offers.length} teklif listeleniyor
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        />
                                    );
                                }

                                const groupedData = offerFilterMode === 'contractor' ? groupOffersByContractor(filteredOffers) : filteredOffers;

                                return (
                                    <FlatList
                                        key={offerFilterMode === 'contractor' ? "contractor-list" : "offer-list"}
                                        data={groupedData}
                                        renderItem={offerFilterMode === 'contractor' ? renderContractorItem : renderOfferItem}
                                        keyExtractor={item => item.id.toString()}
                                        contentContainerStyle={{ padding: 20 }}
                                        ListHeaderComponent={(
                                            <View style={{ marginBottom: 16 }}>
                                                {/* Filter Mode Chips */}
                                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                                                    <TouchableOpacity
                                                        onPress={() => { setOfferFilterMode('request'); setSelectedContractorForOffers(null); }}
                                                        style={{
                                                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                                                            backgroundColor: offerFilterMode === 'request' ? '#D4AF37' : '#1e293b',
                                                            borderWidth: 1, borderColor: '#D4AF37'
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: offerFilterMode === 'request' ? '#000' : '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>
                                                            📋 Talebe Göre
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => { setOfferFilterMode('contractor'); setSelectedContractorForOffers(null); }}
                                                        style={{
                                                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                                                            backgroundColor: offerFilterMode === 'contractor' ? '#D4AF37' : '#1e293b',
                                                            borderWidth: 1, borderColor: '#D4AF37'
                                                        }}
                                                    >
                                                        <Text allowFontScaling={false} style={{ color: offerFilterMode === 'contractor' ? '#000' : '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>
                                                            🏢 Müteahhite Göre
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Search */}
                                                <View style={[styles.searchContainer, { marginTop: 0 }]}>
                                                    <Ionicons name="search" size={18} color="#D4AF37" style={{ marginRight: 8 }} />
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={[styles.searchInput, { flex: 1 }]}
                                                        placeholder={offerFilterMode === 'contractor' ? 'Firma adı ara...' : 'Şehir / İlçe ara...'}
                                                        placeholderTextColor="#555"
                                                        value={offerSearchQuery}
                                                        onChangeText={setOfferSearchQuery}
                                                    />
                                                    {offerSearchQuery ? (
                                                        <TouchableOpacity onPress={() => setOfferSearchQuery('')}>
                                                            <Ionicons name="close-circle" size={18} color="#555" />
                                                        </TouchableOpacity>
                                                    ) : null}
                                                </View>

                                                <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                                                    {offerFilterMode === 'contractor' ? `${groupedData.length} firma listeleniyor` : `${filteredOffers.length} teklif listeleniyor`}
                                                </Text>
                                            </View>
                                        )}
                                        ListEmptyComponent={<Text allowFontScaling={false} style={styles.noBidsText}>Teklif bulunamadı.</Text>}
                                    />
                                );
                            })()}
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

                {/* DETAIL MODAL (Unified with SharedRequestDetail) */}
                <Modal
                    visible={!!selectedRequest}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setSelectedRequest(null)}
                >
                    <View style={{ flex: 1, backgroundColor: '#000' }}>
                        {selectedRequest && (
                            <SharedRequestDetail
                                request={selectedRequest}
                                type={
                                    selectedModule?.id === 'urban_transformation' ? 'construction' :
                                    selectedModule?.id === 'market' ? 'market' :
                                    selectedModule?.id === 'logistics' ? 'logistics' :
                                    selectedRequest.type || (selectedRequest.offer_type ? 'construction' : 'elevator') 
                                }
                                items={detailItems}
                                bids={detailBids}
                                constructionOffers={detailConstructionOffers}
                                loading={detailLoading}
                                isAdmin={true}
                                isOwner={false}
                                navigation={{ ...navigation, goBack: () => setSelectedRequest(null) }}
                                showActions={false}
                                additionalFooter={
                                    <View style={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}>
                                        <TouchableOpacity 
                                            style={{ 
                                                backgroundColor: '#FBBF24', 
                                                paddingVertical: 18, 
                                                borderRadius: 16, 
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                gap: 10
                                            }}
                                            onPress={() => {
                                                setAssignTargetRequest(selectedRequest);
                                                setSelectedProviderIds(selectedRequest.assigned_provider_ids || []);
                                                setAssignModalVisible(true);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="briefcase-check" size={24} color="#78350F" />
                                            <Text allowFontScaling={false} style={{ color: '#78350F', fontWeight: '900', fontSize: 16 }}>HİZMET VERENE YÖNLENDİR</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={{ 
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                                borderWidth: 1, 
                                                borderColor: '#EF4444', 
                                                paddingVertical: 16, 
                                                borderRadius: 16, 
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                gap: 8
                                            }}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Talebi Sil',
                                                    'Bu talebi yönetici yetkisiyle silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
                                                    [
                                                        { text: 'Vazgeç', style: 'cancel' },
                                                        { text: 'Sil', style: 'destructive', onPress: () => { handleDelete(selectedRequest); setSelectedRequest(null); } }
                                                    ]
                                                );
                                            }}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                            <Text allowFontScaling={false} style={{ color: '#EF4444', fontWeight: 'bold' }}>TALEBİ KALICI OLARAK SİL</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={{ paddingVertical: 10, alignItems: 'center' }}
                                            onPress={() => setSelectedRequest(null)}
                                        >
                                            <Text allowFontScaling={false} style={{ color: '#666', fontWeight: 'bold' }}>KAPAT</Text>
                                        </TouchableOpacity>
                                    </View>
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
                                ListHeaderComponent={(
                                    <View style={{ marginBottom: 10 }}>
                                        <Text allowFontScaling={false} style={{ color: '#64748b', fontSize: 12 }}>
                                            ✅ Yeşil = Zaten iletilmiş • Seçili = Bu seferki yönlendirmeye dahil
                                        </Text>
                                    </View>
                                )}
                                renderItem={({ item }) => {
                                    const alreadyAssigned = (assignTargetRequest?.assigned_provider_ids || []).includes(item.id);
                                    const isSelected = selectedProviderIds.includes(item.id);
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center',
                                                backgroundColor: alreadyAssigned ? 'rgba(52, 211, 153, 0.08)' : (isSelected ? 'rgba(74, 222, 128, 0.1)' : '#1e293b'),
                                                padding: 15, borderRadius: 12, marginBottom: 10,
                                                borderWidth: 1, borderColor: alreadyAssigned ? '#34D399' : (isSelected ? '#4ADE80' : '#334155')
                                            }}
                                            onPress={() => toggleProviderSelection(item.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name={isSelected || alreadyAssigned ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                                size={24} color={isSelected ? "#4ADE80" : (alreadyAssigned ? '#34D399' : '#64748b')}
                                                style={{ marginRight: 15 }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', flex: 1 }}>{item.full_name || 'İsimsiz Firma'}</Text>
                                                    {alreadyAssigned && (
                                                        <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                            <Text allowFontScaling={false} style={{ color: '#34D399', fontSize: 10, fontWeight: 'bold' }}>Zaten İletildi</Text>
                                                        </View>
                                                    )}
                                                </View>
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

            {/* MANUAL CORPORATE UPGRADE MODAL */}
            <Modal
                visible={upgradeModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setUpgradeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: '#0f172a', height: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text allowFontScaling={false} style={styles.modalTitle}>Kurumsal Hesaba Geçir</Text>
                            <TouchableOpacity onPress={() => setUpgradeModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            <View style={{ marginBottom: 20, padding: 15, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 14 }}>Kullanıcı:</Text>
                                <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>{upgradeTargetUser?.full_name || upgradeTargetUser?.email}</Text>
                            </View>

                            <Text allowFontScaling={false} style={styles.detailLabel}>FİRMA BİLGİLERİ</Text>
                            
                            <Text allowFontScaling={false} style={styles.inputLabel}>Firma Adı *</Text>
                            <TextInput allowFontScaling={false}
                                style={styles.modalInput}
                                placeholder="Örn: Özkan İnşaat Ltd. Şti."
                                placeholderTextColor="#444"
                                value={upgradeForm.company_name}
                                onChangeText={(t) => setUpgradeForm(prev => ({ ...prev, company_name: t }))}
                            />

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.inputLabel}>Vergi No</Text>
                                    <TextInput allowFontScaling={false}
                                        style={styles.modalInput}
                                        placeholder="1234567890"
                                        placeholderTextColor="#444"
                                        keyboardType="numeric"
                                        value={upgradeForm.tax_number}
                                        onChangeText={(t) => setUpgradeForm(prev => ({ ...prev, tax_number: t }))}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.inputLabel}>Vergi Dairesi</Text>
                                    <TextInput allowFontScaling={false}
                                        style={styles.modalInput}
                                        placeholder="Zincirlikuyu"
                                        placeholderTextColor="#444"
                                        value={upgradeForm.tax_office}
                                        onChangeText={(t) => setUpgradeForm(prev => ({ ...prev, tax_office: t }))}
                                    />
                                </View>
                            </View>

                            <Text allowFontScaling={false} style={styles.inputLabel}>İletişim Telefonu *</Text>
                            <TextInput allowFontScaling={false}
                                style={styles.modalInput}
                                placeholder="05xx xxx xx xx"
                                placeholderTextColor="#444"
                                keyboardType="phone-pad"
                                value={upgradeForm.phone}
                                onChangeText={(t) => setUpgradeForm(prev => ({ ...prev, phone: t }))}
                            />

                            <Text allowFontScaling={false} style={styles.inputLabel}>Firma Adresi</Text>
                            <TextInput allowFontScaling={false}
                                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Mahalle, Sokak, No..."
                                placeholderTextColor="#444"
                                multiline
                                value={upgradeForm.address}
                                onChangeText={(t) => setUpgradeForm(prev => ({ ...prev, address: t }))}
                            />

                            <Text allowFontScaling={false} style={[styles.detailLabel, { marginTop: 10 }]}>HİZMET ALANLARI / YETKİLER *</Text>
                            <View style={{ gap: 8 }}>
                                {SERVICE_TYPES.map((service) => {
                                    const isSelected = upgradeForm.service_types.includes(service.id);
                                    return (
                                        <TouchableOpacity
                                            key={service.id}
                                            style={[
                                                styles.serviceChoiceBtn,
                                                isSelected && styles.serviceChoiceBtnActive
                                            ]}
                                            onPress={() => {
                                                setUpgradeForm(prev => ({
                                                    ...prev,
                                                    service_types: isSelected 
                                                        ? prev.service_types.filter(id => id !== service.id)
                                                        : [...prev.service_types, service.id]
                                                }));
                                            }}
                                        >
                                            <MaterialCommunityIcons 
                                                name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                                                size={20} 
                                                color={isSelected ? "#000" : "#64748b"} 
                                            />
                                            <Text allowFontScaling={false} style={[styles.serviceChoiceText, isSelected && styles.serviceChoiceTextActive]}>
                                                {service.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text allowFontScaling={false} style={[styles.detailLabel, { marginTop: 20 }]}>ABONELİK SÜRESİ</Text>
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                                {[
                                    { label: '3 Ay', val: 3 },
                                    { label: '6 Ay', val: 6 },
                                    { label: '1 Yıl', val: 12 },
                                    { label: '2 Yıl', val: 24 }
                                ].map((opt) => (
                                    <TouchableOpacity 
                                        key={opt.val}
                                        style={[
                                            { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#333' },
                                            upgradeForm.subscription_months === opt.val && { backgroundColor: '#D4AF37', borderColor: '#D4AF37' }
                                        ]}
                                        onPress={() => setUpgradeForm(prev => ({ ...prev, subscription_months: opt.val }))}
                                    >
                                        <Text allowFontScaling={false} style={{ color: upgradeForm.subscription_months === opt.val ? '#000' : '#888', fontWeight: 'bold' }}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ height: 30 }} />
                        </ScrollView>

                        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#1e293b' }}>
                            <TouchableOpacity
                                style={[styles.upgradeSubmitBtn, upgradeLoading && { opacity: 0.7 }]}
                                onPress={handleManualUpgrade}
                                disabled={upgradeLoading}
                            >
                                {upgradeLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text allowFontScaling={false} style={styles.upgradeSubmitText}>KURUMSAL ÜYELİĞİ BAŞLAT ✅</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
const PAYMENT_LABELS = {
    'cash': 'Nakit Ödeme',
    'credit_card': 'Kredi Kartı',
    'check': 'Çek / Senet',
    'transfer': 'Havale / EFT'
};

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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', height: '92%', width: '100%' },
    modalContainer: { flex: 1 },
    modalHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 35, 
        paddingBottom: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#333' 
    },
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

    // Manual Upgrade Modal Styles
    inputLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 5, marginLeft: 2, marginTop: 10 },
    modalInput: {
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
        fontSize: 14,
    },
    serviceChoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        gap: 10
    },
    serviceChoiceBtnActive: {
        backgroundColor: '#D4AF37',
        borderColor: '#D4AF37',
    },
    serviceChoiceText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    serviceChoiceTextActive: { color: '#000', fontWeight: 'bold' },
    upgradeSubmitBtn: {
        backgroundColor: '#D4AF37',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    },
    upgradeSubmitText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});
