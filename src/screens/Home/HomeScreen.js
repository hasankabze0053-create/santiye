import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Extended Market Data Options
const MARKET_OPTS = {
    iron: {
        title: 'DEMİR ÇEŞİTLERİ',
        icon: 'cube',
        items: [
            { label: 'DEMİR Ø8', value: '₺25.40', trend: 'up' },
            { label: 'DEMİR Ø10', value: '₺24.80', trend: 'neutral' },
            { label: 'DEMİR Ø12', value: '₺24.50', trend: 'down' },
            { label: 'DEMİR Ø14', value: '₺24.30', trend: 'down' },
            { label: 'DEMİR Ø16', value: '₺24.30', trend: 'down' },
        ]
    },
    concrete: {
        title: 'HAZIR BETON',
        icon: 'business',
        items: [
            { label: 'BETON C25', value: '₺2.000', trend: 'up' },
            { label: 'BETON C30', value: '₺2.100', trend: 'up' },
            { label: 'BETON C35', value: '₺2.250', trend: 'up' },
            { label: 'BETON C40', value: '₺2.400', trend: 'up' },
            { label: 'BETON C50', value: '₺2.650', trend: 'up' },
        ]
    },
    currency: {
        title: 'DÖVİZ & EMTİA',
        icon: 'cash',
        items: [
            { label: 'USD/TL', value: '32.45', trend: 'up' },
            { label: 'EUR/TL', value: '35.12', trend: 'up' },
            { label: 'ALTIN (Gr)', value: '₺2.450', trend: 'down' },
            { label: 'BRENT P.', value: '$82.40', trend: 'neutral' },
        ]
    }
};

// Real Photography for Categories
const CATEGORIES = [
    {
        id: 1,
        title: 'KİRALA',
        subtitle: 'Ağır İş Makineleri',
        image: require('../../assets/categories/cat_kiralama_v2.png'),
        route: 'Kiralama'
    },
    {
        id: 2,
        title: 'MARKET',
        subtitle: 'Toptan Malzeme',
        image: require('../../assets/categories/cat_market_v2.png'),
        route: 'Market'
    },
    {
        id: 3,
        title: 'TADİLAT',
        subtitle: 'Profesyonel Ekip',
        image: require('../../assets/categories/cat_tadilat_v2.png'),
        route: 'Tadilat'
    },
    {
        id: 4,
        title: 'PROJE',
        subtitle: 'Mimari Çizim',
        image: require('../../assets/categories/cat_proje_v2.png'),
        route: 'Mühendislik'
    },
    {
        id: 5,
        title: 'HUKUK',
        subtitle: 'Yasal Danışmanlık',
        image: require('../../assets/categories/cat_hukuk_v2.png'),
        route: 'Hukuk'
    },
    {
        id: 6,
        title: 'NAKLİYE',
        subtitle: 'Lojistik Çözüm',
        image: require('../../assets/categories/cat_nakliye_v2.png'),
        route: 'Nakliye'
    },
    {
        id: 7,
        title: 'SİGORTA',
        subtitle: 'Risk Güvencesi',
        image: require('../../assets/categories/cat_sigorta_v2.png'),
        route: 'Sigorta'
    },
    {
        id: 8,
        title: 'MALİYET',
        subtitle: 'Proje Hesabı',
        image: require('../../assets/categories/cat_maliyet_v2.png'),
        route: 'Maliyet'
    },
];

export default function HomeScreen({ navigation }) {
    const [greeting, setGreeting] = useState('İYİ GÜNLER');

    // State for interactive ticker
    const [selectedValues, setSelectedValues] = useState({
        iron: MARKET_OPTS.iron.items[2], // Default: Ø12
        concrete: MARKET_OPTS.concrete.items[1], // Default: C30
        currency: MARKET_OPTS.currency.items[0], // Default: USD
    });

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null); // 'iron', 'concrete', 'currency'

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('GÜNAYDIN');
        else if (hour < 18) setGreeting('TÜNAYDIN');
        else setGreeting('İYİ AKŞAMLAR');
    }, []);

    const openSelectionModal = (categoryKey) => {
        setActiveCategory(categoryKey);
        setModalVisible(true);
    };

    const handleSelectOption = (item) => {
        setSelectedValues(prev => ({ ...prev, [activeCategory]: item }));
        setModalVisible(false);
    };

    const renderTickerItem = (item, categoryKey) => (
        <TouchableOpacity
            key={categoryKey}
            style={styles.tickerItem}
            activeOpacity={0.7}
            onPress={() => openSelectionModal(categoryKey)}
        >
            <View style={styles.tickerIconBox}>
                {item.trend === 'up' && <Ionicons name="caret-up" size={10} color={COLORS.primary} />}
                {item.trend === 'down' && <Ionicons name="caret-down" size={10} color={COLORS.primary} />}
                {item.trend === 'neutral' && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary }} />}
            </View>
            <View>
                <Text style={styles.tickerLabel}>{item.label}  <Ionicons name="chevron-down" size={8} color="#666" /></Text>
                <Text style={[styles.tickerValue, item.trend === 'up' ? { color: COLORS.success } : item.trend === 'down' ? { color: COLORS.danger } : { color: COLORS.text }]}>
                    {item.value}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background: Classic Platinum Grey Gradient */}
            <LinearGradient
                colors={['#4b5052', '#212121', '#0f0f0f']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* HERO HEADER */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.subGreeting}>ŞANTİYE PRO v2.0</Text>
                                <Text style={styles.mainGreeting}>{greeting},</Text>
                                <Text style={styles.chiefName}>ŞEF 👷🏼</Text>
                            </View>
                            <TouchableOpacity style={styles.profileBtn}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                                    style={styles.profileImg}
                                />
                                <View style={styles.onlineDot} />
                            </TouchableOpacity>
                        </View>

                        {/* INDUSTRIAL TICKER */}
                        <View style={styles.tickerWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                                {renderTickerItem(selectedValues.iron, 'iron')}
                                {renderTickerItem(selectedValues.concrete, 'concrete')}
                                {renderTickerItem(selectedValues.currency, 'currency')}
                                {/* Static Weather Item (Non-interactive for now) */}
                                <View style={styles.tickerItem}>
                                    <View style={styles.tickerIconBox}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary }} />
                                    </View>
                                    <View>
                                        <Text style={styles.tickerLabel}>İSTANBUL</Text>
                                        <Text style={[styles.tickerValue, { color: COLORS.text }]}>18°C ☀️</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {/* STANDARD GRID OF CARDS */}
                    <View style={styles.gridContainer}>
                        {CATEGORIES.map((cat, index) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.cardWrapper}
                                onPress={() => navigation.navigate(cat.route)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardContainer}>
                                    <View style={styles.imageContainer}>
                                        {/* UNIFYING BACKGROUND COLOR */}
                                        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#1a1a1a', zIndex: -1 }} />

                                        {/* IMAGE */}
                                        <Image source={cat.image} style={styles.cardImage} />

                                        {/* Gradient Overlay */}
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
                                            style={StyleSheet.absoluteFillObject}
                                        />
                                    </View>

                                    <View style={styles.cardContent}>
                                        <View style={styles.cardIndicator} />
                                        <View>
                                            <Text style={styles.cardTitle}>{cat.title}</Text>
                                            <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* SELECTION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {activeCategory ? MARKET_OPTS[activeCategory].title : 'SEÇİM YAPIN'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={activeCategory ? MARKET_OPTS[activeCategory].items : []}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleSelectOption(item)}
                                >
                                    <Text style={styles.modalItemLabel}>{item.label}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.modalItemValue}>{item.value}</Text>
                                        {item.trend === 'up' && <Ionicons name="caret-up" size={14} color={COLORS.success} style={{ marginLeft: 8 }} />}
                                        {item.trend === 'down' && <Ionicons name="caret-down" size={14} color={COLORS.danger} style={{ marginLeft: 8 }} />}
                                    </View>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },

    // Header Styles
    headerContainer: { padding: 24, paddingBottom: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    subGreeting: { color: COLORS.accent, fontSize: 10, letterSpacing: 2, fontWeight: '800', opacity: 0.8, marginBottom: 4 },
    mainGreeting: { color: '#ffffff', fontSize: 24, letterSpacing: 1, fontWeight: '300' },
    chiefName: { color: '#ffffff', fontSize: 36, letterSpacing: -1, fontWeight: '900', marginTop: -5 },
    profileBtn: {
        width: 56, height: 56, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)',
        padding: 4, backgroundColor: 'rgba(255,255,255,0.05)'
    },
    profileImg: { width: '100%', height: '100%', borderRadius: 12 },
    onlineDot: {
        position: 'absolute', top: -2, right: -2,
        width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success,
        borderWidth: 2, borderColor: '#0f0f0f'
    },

    // Ticker Styles
    tickerWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16, borderLeftWidth: 4, borderLeftColor: COLORS.accent,
        paddingVertical: 12, paddingHorizontal: 16
    },
    tickerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
    tickerIconBox: {
        width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent,
        alignItems: 'center', justifyContent: 'center', marginRight: 8
    },
    tickerLabel: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    tickerValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

    // Grid Styles
    scrollContent: { paddingBottom: 120 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },

    // Professional Card Styles
    cardWrapper: { width: '48%', marginBottom: 16 },
    cardContainer: {
        height: 180,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    imageContainer: { height: '100%', width: '100%' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 1.0 },
    cardContent: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardIndicator: {
        width: 3,
        height: 24,
        backgroundColor: COLORS.accent,
        marginRight: 8,
        borderRadius: 2
    },
    cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    cardSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500', marginTop: 2 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.accent,
        maxHeight: height * 0.5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    modalItemLabel: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: '500',
    },
    modalItemValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
});
