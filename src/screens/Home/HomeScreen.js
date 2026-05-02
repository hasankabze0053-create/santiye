import React, { useEffect, useState } from 'react';
import { View, ScrollView, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { MarketService } from '../../services/MarketService';

// Premium Components
import HeaderComponent from '../../components/HeaderComponent';
import SearchCTA from '../../components/SearchCTA';
import HighlightCard from '../../components/HighlightCard';
import CategoryChip from '../../components/CategoryChip';
import InfoCard from '../../components/InfoCard';
import ServiceListItem from '../../components/ServiceListItem';
import { COLORS } from '../../theme';

export default function HomeScreen({ navigation }) {
    const { isDarkMode } = useTheme();
    const { profile } = useAuth();
    
    const [categories, setCategories] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [marketCount, setMarketCount] = useState(0);
    const [activeCategory, setActiveCategory] = useState('all');

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

        fetchConfig();
        loadInternalData();
    }, []);

    const handleCategoryPress = (cat) => {
        if (cat.title === 'KİRALAMA') navigation.navigate('RentalStack');
        else if (cat.title === 'TEKNİK OFİS') navigation.navigate('TeknikOfis');
        else if (cat.screen_route) navigation.navigate(cat.screen_route);
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

                    {/* Highlight Section */}
                    <HighlightCard 
                        title="KENTSEL DÖNÜŞÜM"
                        description="Arsa veya binanız için müteahhitlerden teklif toplayın."
                        onPress={() => navigation.navigate('KentselDonusum')}
                    />

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
        </View>
    );
}

const getIconForCategory = (title) => {
    const normalized = title.toUpperCase();
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
    listSection: { marginTop: 0, paddingBottom: 20 },
});
