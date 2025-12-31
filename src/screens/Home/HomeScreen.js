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
// Real Photography for Categories
const CATEGORIES = [
    {
        id: 2,
        title: 'KİRALAMA',
        subtitle: 'İş Makinesi',
        image: require('../../assets/categories/cat_rental_v4.png'),
        route: 'RentalStack'
    },
    {
        id: 3,
        title: 'MARKET',
        subtitle: 'Yapı Malzemesi',
        image: require('../../assets/categories/cat_market_v4.png'),
        route: 'MarketStack'
    },
    {
        id: 4,
        title: 'TADİLAT',
        subtitle: 'Boya & Tamirat',
        image: require('../../assets/categories/cat_renovation_v4.png'),
        route: 'Tadilat'
    },
    {
        id: 5,
        title: 'MÜHENDİSLİK',
        subtitle: 'Proje & Danışman',
        image: require('../../assets/categories/cat_engineering_v4.png'),
        route: 'Mühendislik'
    },
    {
        id: 6,
        title: 'HUKUK',
        subtitle: 'Yasal Danışmanlık',
        image: require('../../assets/categories/cat_law_v4.png'),
        route: 'Hukuk'
    },
    {
        id: 7,
        title: 'NAKLİYE',
        subtitle: 'Lojistik Çözüm',
        image: require('../../assets/categories/cat_logistics_v5.png'),
        route: 'Nakliye'
    },
    {
        id: 8,
        title: 'YERİNDE DÖNÜŞÜM',
        subtitle: 'Devlet Destekli',
        image: require('../../assets/categories/cat_transformation_v4.png'),
        route: 'KentselDonusum'
    },
    {
        id: 9,
        title: 'MALİYET',
        subtitle: 'Proje Hesabı',
        image: require('../../assets/categories/cat_cost_v5.png'),
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
                {item.trend === 'up' && <Ionicons name="caret-up" size={10} color="#4ADE80" />}
                {item.trend === 'down' && <Ionicons name="caret-down" size={10} color="#F87171" />}
                {item.trend === 'neutral' && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37' }} />}
            </View>
            <View>
                <Text style={styles.tickerLabel}>{item.label}  <Ionicons name="chevron-down" size={8} color="#D4AF37" /></Text>
                <Text style={[styles.tickerValue, item.trend === 'up' ? { color: '#4ADE80' } : item.trend === 'down' ? { color: '#F87171' } : { color: '#fff' }]}>
                    {item.value}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background: Gunmetal / Dark Silver Theme */}
            <LinearGradient
                colors={['#666666', '#222222']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* HERO HEADER - LUXURY COCKPIT STYLE */}
                    <View style={styles.headerContainer}>
                        {/* Dashboard Card Container */}
                        <LinearGradient
                            colors={['rgba(30,30,30,0.95)', 'rgba(10,10,10,0.95)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dashboardCard}
                        >
                            {/* Top Section: Greeting & Profile */}
                            <View style={styles.dashboardTop}>
                                <View>
                                    <Text style={styles.subGreeting}>ŞANTİYE PRO v2.0</Text>
                                    <Text style={styles.mainGreeting}>{greeting},</Text>
                                    <Text style={styles.chiefName}>ŞEF <Text style={{ fontSize: 24 }}>👷🏼</Text></Text>
                                </View>
                                <TouchableOpacity style={styles.profileBtn}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                                        style={styles.profileImg}
                                    />
                                    <View style={styles.onlineDot} />
                                </TouchableOpacity>
                            </View>

                            {/* Divider with Gold Accent */}
                            <View style={styles.dashboardDivider} />

                            {/* Bottom Section: Integrated Ticker */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tickerScroll}
                            >
                                {renderTickerItem(selectedValues.iron, 'iron')}
                                <View style={styles.tickerSeparator} />
                                {renderTickerItem(selectedValues.concrete, 'concrete')}
                                <View style={styles.tickerSeparator} />
                                {/* Static Weather Item */}
                                <View style={styles.tickerItem}>
                                    <View style={[styles.tickerIconBox, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                        <Ionicons name="sunny" size={14} color="#D4AF37" />
                                    </View>
                                    <View>
                                        <Text style={[styles.tickerLabel, { color: '#888' }]}>İSTANBUL</Text>
                                        <Text style={[styles.tickerValue, { color: '#fff' }]}>18°C</Text>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Glossy Overlay for Premium Feel */}
                            <LinearGradient
                                colors={['rgba(255,255,255,0.03)', 'transparent']}
                                style={StyleSheet.absoluteFillObject}
                                pointerEvents="none"
                            />
                        </LinearGradient>
                    </View>

                    {/* IMMERSIVE SHOWROOM GRID (Full Image + Gradient Overlay) */}
                    <View style={styles.gridContainer}>
                        {CATEGORIES.map((cat, index) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.cardWrapper}
                                onPress={() => {
                                    if (cat.title === 'KİRALA') {
                                        navigation.navigate('Kiralama');
                                    } else {
                                        navigation.navigate(cat.route);
                                    }
                                }}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardContainer}>
                                    {/* Full Height Image */}
                                    <Image source={cat.image} style={styles.cardImageFull} />

                                    {/* Cinematic Gradient Overlay */}
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
                                        locations={[0, 0.4, 1]}
                                        style={styles.cardOverlay}
                                    >
                                        <View style={styles.footerContent}>
                                            <View style={styles.titleRow}>
                                                <View style={styles.indicator} />
                                                <Text style={styles.cardTitle}>{cat.title}</Text>
                                            </View>
                                            <Text style={styles.cardSubtitle}>{cat.subtitle.toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.actionBtn}>
                                            <Ionicons name="arrow-forward" size={16} color="#000" />
                                        </View>
                                    </LinearGradient>

                                    {/* Premium Border Touch */}
                                    <View style={styles.cardBorder} />
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
    container: { flex: 1, backgroundColor: '#0f0f0f' }, // Dark Antracite Background

    // Header Styles
    headerContainer: { padding: 20, paddingBottom: 10 },
    dashboardCard: {
        borderRadius: 24,
        padding: 2, // Inner border space via gradient if needed, or just padding
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    dashboardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 15,
    },
    subGreeting: { color: '#D4AF37', fontSize: 11, letterSpacing: 3, fontWeight: '800', opacity: 0.9, marginBottom: 4 },
    mainGreeting: { color: '#e0e0e0', fontSize: 16, letterSpacing: 1, fontWeight: '400' },
    chiefName: { color: '#ffffff', fontSize: 32, letterSpacing: -0.5, fontWeight: '900', marginTop: 2 },

    profileBtn: {
        width: 54, height: 54, borderRadius: 27,
        borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)',
        padding: 2,
    },
    profileImg: { width: '100%', height: '100%', borderRadius: 25 },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success,
        borderWidth: 2, borderColor: '#1a1a1a'
    },

    dashboardDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 20,
    },

    // Integrated Ticker Styles
    tickerScroll: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
    },
    tickerSeparator: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    tickerItem: { flexDirection: 'row', alignItems: 'center' },
    tickerIconBox: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center', marginRight: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    tickerLabel: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    tickerValue: { color: '#fff', fontSize: 13, fontWeight: '800' },

    // Grid Styles

    // Grid Styles
    scrollContent: { paddingBottom: 120 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15 },

    // Card Styles (Immersive Showroom)
    cardWrapper: { width: '48%', marginBottom: 16 },
    cardContainer: {
        height: 220, // Taller for cinematic feel
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 12,
    },
    cardImageFull: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '50%', // Fade covers bottom half
        justifyContent: 'flex-end',
        padding: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    cardBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        zIndex: 10
    },

    // Content inside Overlay
    footerContent: { flex: 1, marginRight: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    indicator: {
        width: 2, height: 12, backgroundColor: '#D4AF37', marginRight: 8
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3
    },
    cardSubtitle: {
        color: '#D4AF37', // Gold subtitle for contrast
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1, // Cinematic tracking
        marginLeft: 10
    },
    actionBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#D4AF37', // Gold Button
        alignItems: 'center', justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#333',
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
    },

    // FULL SCREEN MODAL STYLES
    fsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    fsBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    fsTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    fsContainer: { flex: 1, padding: 20, justifyContent: 'center', gap: 20 },

    fsCardContainer: { height: 180, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 20 },
    fsCardGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 24, gap: 15 },
    fsGlowBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderRadius: 24, opacity: 0.5 },

    fsIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D4AF37' },

    fsCardContent: { flex: 1 },
    fsCardTitle: { color: '#D4AF37', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
    fsCardSub: { color: '#ccc', fontSize: 13, lineHeight: 18, fontWeight: '500' },

    fsArrowBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center' },
});
