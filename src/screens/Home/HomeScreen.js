import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Text } from 'react-native';
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
import CategoryChip from '../../components/CategoryChip';
import InfoCard from '../../components/InfoCard';
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

    useEffect(() => {
        const fetchConfig = async () => {
            const CACHE_KEY = 'app_module_config_cache';
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    setCategories(JSON.parse(cached));
                    setLoadingConfig(false);
                }

                const { data, error } = await supabase
                    .from('app_module_config')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });

                if (data) {
                    setCategories(data);
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
                }
            } catch (err) {
                console.warn('Config fetch error:', err);
            } finally {
                setLoadingConfig(false);
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

        fetchConfig();
        loadInternalData();
        fetchAllHighlights();

        const unsubscribe = navigation.addListener('focus', async () => {
            const freshConfigs = await fetchAllHighlights();
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

        return unsubscribe;
    }, [navigation]);

    const handleCategoryPress = (cat) => {
        if (cat.title === 'KİRALAMA') navigation.navigate('RentalStack');
        else if (cat.title === 'TEKNİK OFİS') navigation.navigate('TeknikOfis');
        else if (cat.screen_route) navigation.navigate(cat.screen_route);
    };

    const handleEdit = (type) => {
        setEditType(type);
        setIsEditModalVisible(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.pageBackground }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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
                        categories={categories.map(c => ({ key: c.id, title: c.title }))}
                        activeCategory={activeCategory}
                        onSelect={(key) => setActiveCategory(key)}
                    />

                    {/* Ticker Section */}
                    <InfoCard 
                        weather={{ temp: 18, description: 'Beyaz' }}
                        ironPrice={{ value: '₺31.50', trend: 'down' }}
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
                            {configs.map((configItem) => (
                                <HighlightCard 
                                    key={configItem.id}
                                    config={configItem.metadata}
                                    onPress={() => {
                                        if (configItem.metadata?.linkedModule) {
                                            navigation.navigate(configItem.metadata.linkedModule);
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
                            categories.map((cat) => (
                                <ServiceListItem 
                                    key={cat.id}
                                    title={cat.title}
                                    subtitle={cat.id === 'market' && marketCount > 0 ? `${marketCount} Aktif Talep` : cat.subtitle}
                                    icon={getIconForCategory(cat.title)}
                                    onPress={() => handleCategoryPress(cat)}
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
                initialConfig={configs[editType]}
                onSaveSuccess={(newConfig) => setConfigs(prev => ({ ...prev, [editType]: newConfig }))}
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
