import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Text, AppState } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { MarketService } from '../../services/MarketService';
import { AppAssetService } from '../../services/AppAssetService';

// Premium Components
import HeaderComponent from '../../components/HeaderComponent';
import SearchCTA from '../../components/SearchCTA';
import HighlightCard from '../../components/HighlightCard';
import HighlightEditModal from '../../components/HighlightEditModal';
import ModuleEditModal from '../../components/ModuleEditModal';
import CategoryChipEditModal from '../../components/CategoryChipEditModal';
import CategoryChip from '../../components/CategoryChip';
import ServiceListItem from '../../components/ServiceListItem';
import { COLORS, FONTS } from '../../theme';

export default function HomeScreen({ navigation }) {
    const { isDarkMode } = useTheme();
    const { profile, isAdmin } = useAuth();
    
    console.log("DEBUG: Current User Profile:", profile);
    console.log("DEBUG: isAdmin flag:", isAdmin);

    const [categories, setCategories] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [marketCount, setMarketCount] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');

    // Highlight Card State
    const [configs, setConfigs] = useState([]);
    const scrollViewRef = useRef(null);
    const [editType, setEditType] = useState('urban');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Module Edit State (Vertical List)
    const [isModuleEditVisible, setIsModuleEditVisible] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

    // Category Chip Edit State (Horizontal Chips)
    const [categoryChips, setCategoryChips] = useState([]);
    const [isChipEditModalVisible, setIsChipEditModalVisible] = useState(false);
    const [chipEditType, setChipEditType] = useState('edit');
    const [editingChip, setEditingChip] = useState(null);

    useEffect(() => {
        const fetchConfig = async (isSilent = false) => {
            const CACHE_KEY = 'app_module_config_cache';
            try {
                if (!isSilent) {
                    const cached = await AsyncStorage.getItem(CACHE_KEY);
                    if (cached) {
                        setCategories(JSON.parse(cached));
                        setLoadingConfig(false);
                    }
                }

                const { data, error } = await supabase
                    .from('app_module_config')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (data) {
                    setCategories(data);
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
                }
            } catch (err) {
                console.warn('Config fetch error:', err);
            } finally {
                if (!isSilent) setLoadingConfig(false);
            }
        };

        const loadInternalData = async () => {
            const data = await MarketService.getUserRequests();
            if (data) setMarketCount(data.length);
        };

        const fetchAllHighlights = async () => {
            const allConfigs = await AppAssetService.getAllHighlightConfigs();
            setConfigs(allConfigs);
            return allConfigs;
        };

        const fetchAllChips = async () => {
            const chips = await AppAssetService.getAllCategoryChips();
            setCategoryChips(chips);
        };

        const silentSync = async () => {
            console.log('HomeScreen: Background silent sync triggered');
            await Promise.all([
                fetchConfig(true),
                fetchAllHighlights(),
                fetchAllChips()
            ]);
        };

        // Initial Load
        fetchConfig();
        loadInternalData();
        fetchAllHighlights();
        fetchAllChips();

        // 1. Navigation Focus Listener (SWR)
        const unsubscribeFocus = navigation.addListener('focus', async () => {
            const freshConfigs = await fetchAllHighlights();
            fetchConfig(true); // silent sync other data
            fetchAllChips(); // silent sync chips
            
            try {
                const lastVisited = await AsyncStorage.getItem('lastVisitedModule');
                if (lastVisited && freshConfigs && freshConfigs.length > 0) {
                    const index = freshConfigs.findIndex(c => c.metadata?.linkedModule === lastVisited);
                    if (index !== -1 && scrollViewRef.current) {
                        setTimeout(() => {
                            scrollViewRef.current.scrollTo({ x: index * width, animated: true });
                        }, 100);
                    }
                    await AsyncStorage.removeItem('lastVisitedModule'); // consume it
                }
            } catch(e) { console.warn(e); }
        });

        // 2. AppState Listener (Background to Foreground SWR)
        const appStateSubscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                silentSync();
            }
        });


        return () => {
            unsubscribeFocus();
            appStateSubscription.remove();
        };
    }, [navigation, isAdmin]);

    const handleCategoryPress = (cat) => {
        if (cat.title === 'KİRALAMA') navigation.navigate('RentalStack');
        else if (cat.title === 'TEKNİK OFİS') navigation.navigate('TeknikOfis');
        else if (cat.screen_route) navigation.navigate(cat.screen_route);
    };

    const handleEdit = (type) => {
        setEditType(type);
        setIsEditModalVisible(true);
    };

    const visibleCategories = categories.filter(c => isAdmin || c.is_active);

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.pageBackground : '#EDE5D5' }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header Section */}
                    <HeaderComponent navigation={navigation} />

                    {/* Search Section */}
                    <SearchCTA navigation={navigation} />

                    {/* Category Chips Section */}
                    <CategoryChip 
                        categories={categoryChips.filter(c => c.is_visible || isAdmin).map((c, index) => ({ ...c, key: `chip-${c.id}-${index}`, title: c.title }))}
                        activeCategory={activeCategory}
                        isAdmin={isAdmin}
                        isDarkMode={isDarkMode}
                        onSelect={(cat) => {
                            if (cat === 'all') {
                                setActiveCategory('all');
                            } else {
                                setActiveCategory(cat.key);
                                // Navigate using route from chip
                                if (cat.metadata?.route) {
                                    let routeName = cat.metadata.route;
                                    if (routeName === 'Market') routeName = 'MarketStack';
                                    if (routeName === 'Renovation') routeName = 'Tadilat';
                                    if (routeName === 'AsansorBakim') routeName = 'ElevatorWizard';
                                    navigation.navigate(routeName);
                                }
                            }
                        }}
                        onLongPress={(cat) => {
                            if (isAdmin && cat !== 'all') {
                                setEditingChip(cat);
                                setChipEditType('edit');
                                setIsChipEditModalVisible(true);
                            }
                        }}
                        onAddNew={() => {
                            setEditingChip(null);
                            setChipEditType('new');
                            setIsChipEditModalVisible(true);
                        }}
                    />


                    {/* Highlight Carousel Section */}
                    <View style={styles.carouselContainer}>
                        <ScrollView 
                            ref={scrollViewRef}
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width}
                            decelerationRate="fast"
                            contentContainerStyle={styles.carouselContent}
                        >
                            {configs.map((configItem, index) => (
                                <HighlightCard 
                                    key={`config-${configItem.id}-${index}`}
                                    config={configItem.metadata}
                                    type={configItem.metadata?.type || 'urban'}
                                    onPress={() => {
                                        if (configItem.metadata?.linkedModule) {
                                            let routeName = configItem.metadata.linkedModule;
                                            if (routeName === 'Market') routeName = 'MarketStack';
                                            if (routeName === 'Renovation') routeName = 'Tadilat';
                                            if (routeName === 'AsansorBakim') routeName = 'ElevatorWizard';
                                            if (routeName === 'GarajOtomasyon') routeName = 'GarageWizard';
                                            navigation.navigate(routeName);
                                        }
                                    }}
                                    isAdmin={isAdmin}
                                    isDarkMode={isDarkMode}
                                    onEdit={() => handleEdit(configItem.id)}
                                />
                            ))}

                            {isAdmin && (
                                <TouchableOpacity 
                                    style={[styles.addCardPlaceholder, { width: width - 40, height: 220 }]} 
                                    onPress={() => handleEdit('new_card')}
                                >
                                    <View style={styles.addCardIconWrapper}>
                                        <MaterialCommunityIcons name="plus" size={40} color="#B8820F" />
                                    </View>
                                    <Text style={styles.addCardText}>Yeni Kart Ekle</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    {/* Service List Section */}
                    <View style={styles.listSection}>
                        {loadingConfig ? (
                            <ActivityIndicator color={COLORS.gold} style={{ marginTop: 20 }} />
                        ) : (
                            visibleCategories.map((cat, index) => (
                                <ServiceListItem 
                                    key={`cat-${cat.id}-${index}`}
                                    title={cat.title}
                                    subtitle={cat.id === 'market' && marketCount > 0 ? `${marketCount} Aktif Talep` : cat.subtitle}
                                    icon={getIconForCategory(cat.title)}
                                    onPress={() => handleCategoryPress(cat)}
                                    isAdmin={isAdmin}
                                    isHidden={!cat.is_active}
                                    isDarkMode={isDarkMode}
                                    onEdit={() => {
                                        setEditingModule(cat);
                                        setIsModuleEditVisible(true);
                                    }}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Admin Edit Modal */}
            <HighlightEditModal 
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                type={editType}
                initialConfig={configs.find(c => c.id === editType)?.metadata || {}}
                onSaveSuccess={(newConfig) => {
                    if (editType === 'new_card') {
                        const dbId = newConfig.type.startsWith('highlight_card_') ? newConfig.type : `highlight_card_${newConfig.type}`;
                        setConfigs(prev => [...prev, { id: dbId, metadata: newConfig }]);
                    } else {
                        setConfigs(prev => prev.map(c => c.id === editType ? { ...c, metadata: newConfig } : c));
                    }
                }}
            />

            {/* Admin Module Edit Modal (Vertical List) */}
            <ModuleEditModal 
                visible={isModuleEditVisible}
                onClose={() => setIsModuleEditVisible(false)}
                initialConfig={editingModule}
                onSaveSuccess={(newConfig) => {
                    setCategories(prev => prev.map(c => c.id === newConfig.id ? newConfig : c));
                }}
            />

            {/* Admin Category Chip Edit Modal (Horizontal Chips) */}
            <CategoryChipEditModal 
                visible={isChipEditModalVisible}
                onClose={() => setIsChipEditModalVisible(false)}
                initialConfig={editingChip}
                type={chipEditType}
                onSaveSuccess={(newChip, isNew) => {
                    if (isNew) {
                        setCategoryChips(prev => [...prev, newChip].sort((a,b) => a.sort_order - b.sort_order));
                    } else {
                        setCategoryChips(prev => prev.map(c => c.id === newChip.id ? newChip : c));
                    }
                }}
                onDeleteSuccess={(deletedChipId) => {
                    setCategoryChips(prev => prev.filter(c => c.id !== deletedChipId));
                }}
            />
        </View>
    );
}


const getIconForCategory = (title) => {
    const normalized = title.toUpperCase();
    if (normalized.includes('KENTSEL DÖNÜŞÜM')) return 'home-city';
    if (normalized.includes('TADİLAT')) return 'hammer-wrench';
    if (normalized.includes('MARKET')) return 'cart-outline';
    if (normalized.includes('LOJİSTİK')) return 'truck-delivery-outline';
    if (normalized.includes('TEKNİK OFİS')) return 'office-building-cog';
    if (normalized.includes('İŞ MAKİNESİ')) return 'crane';
    if (normalized.includes('HUKUK')) return 'scale-balance';
    return 'dots-horizontal';
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120, paddingTop: 10 },
    carouselContainer: { 
        height: 220, 
        marginBottom: 20,
    },
    carouselContent: {
        alignItems: 'center',
    },
    listSection: { marginTop: 0, paddingBottom: 20 },
    addCardPlaceholder: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(184,130,15,0.3)',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(11,11,12,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(184,130,15,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    addCardText: {
        color: '#B8820F',
        fontFamily: FONTS.bold,
        fontSize: 16,
    }
});
