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
        image: require('../../assets/categories/cat_renovation_v9.png'),
        route: 'Tadilat'
    },
    {
        id: 5,
        title: 'TEKNİK OFİS',
        subtitle: 'Mühendis & Mimar',
        image: require('../../assets/categories/cat_engineering_v10.png'),
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
                <Ionicons
                    name={item.trend === 'down' ? 'arrow-down' : item.trend === 'up' ? 'arrow-up' : 'remove'}
                    size={18}
                    color="#000"
                />
            </View>
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.tickerLabel}>{item.label} </Text>
                    <Ionicons name="chevron-down" size={8} color="#666" />
                </View>
                <Text style={[styles.tickerValue, { color: '#fff' }]}>
                    {item.value}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradient Removed to show Deep Black */}

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* HERO HEADER - REF_IMAGE_MATCH */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.subGreeting}>ŞANTİYE PRO v2.0</Text>
                            <Text style={styles.mainGreeting}>{greeting},</Text>
                            <Text style={styles.chiefName}>ŞEF <Text style={{ fontSize: 32 }}>👷🏼</Text></Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }}
                                style={styles.profileImg}
                            />
                            <View style={styles.onlineDot} />
                        </TouchableOpacity>
                    </View>

                    {/* METALLIC TICKER BAND */}
                    <View style={styles.tickerContainer}>
                        <LinearGradient
                            colors={['#2c3e50', '#000000', '#2c3e50']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }} // Horizontal gradient for brushed metal look
                            style={styles.tickerBand}
                        >
                            {/* Top/Bottom Gold Borders */}
                            <View style={styles.goldBorderTop} />

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tickerScroll}
                            >
                                {renderTickerItem(selectedValues.iron, 'iron')}
                                <View style={styles.tickerSeparator} />
                                {renderTickerItem(selectedValues.concrete, 'concrete')}
                                <View style={styles.tickerSeparator} />
                                {renderTickerItem(selectedValues.currency, 'currency')}
                                <View style={styles.tickerSeparator} />
                                {/* Static Weather Item */}
                                <View style={styles.tickerItem}>
                                    <View style={styles.tickerIconBox}>
                                        <Ionicons name="sunny" size={14} color="#000" />
                                    </View>
                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.tickerLabel}>İSTANBUL</Text>
                                            <Ionicons name="caret-up" size={10} color="#4ADE80" style={{ marginLeft: 4 }} />
                                        </View>
                                        <Text style={styles.tickerValue}>18°C</Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.goldBorderBottom} />
                            <View style={styles.goldBorderBottom} />
                        </LinearGradient>
                    </View>

                    {/* GRID CATEGORIES - SPLIT VIEW METALLIC */}
                    <View style={styles.gridContainer}>
                        {CATEGORIES.map((cat, index) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.cardWrapper}
                                onPress={() => {
                                    if (cat.title === 'KİRALAMA') {
                                        navigation.navigate('RentalStack');
                                    } else {
                                        navigation.navigate(cat.route);
                                    }
                                }}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardContainer}>
                                    {/* Full Height Image */}
                                    <View style={styles.cardImageContainer}>
                                        <Image source={cat.image} style={styles.cardImageFull} />
                                    </View>

                                    {/* Overlay Gradient Footer */}
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.95)']}
                                        style={styles.cardFooter}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                    >
                                        <View style={styles.cardTextContent}>
                                            <View style={styles.verticalGoldLine} />
                                            <View>
                                                <Text style={styles.cardTitle}>{cat.title}</Text>
                                                <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
                                    </LinearGradient>
                                </View>

                                {/* Glossy Border Overlay */}
                                <View style={styles.cardBorder} />
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
                                {activeCategory ? MARKET_OPTS[activeCategory].title : 'SEÃ‡Ä°M YAPIN'}
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
    container: { flex: 1, backgroundColor: '#000000' }, // Deep Black Background (Premium)
    scrollContent: { paddingBottom: 120 },

    // HEADER STYLES
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    subGreeting: { color: '#D4AF37', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, opacity: 0.8 },
    mainGreeting: { color: '#ffffff', fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
    chiefName: { color: '#ffffff', fontSize: 36, fontWeight: '900', lineHeight: 42 },
    profileBtn: {
        width: 50, height: 50, borderRadius: 16, // Squircle
        borderWidth: 1, borderColor: '#333',
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    profileImg: { width: '100%', height: '100%' },
    onlineDot: {
        position: 'absolute', top: 4, right: 4,
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80',
        borderWidth: 1, borderColor: '#000'
    },

    // METALLIC TICKER BAND
    tickerContainer: {
        marginHorizontal: 16,
        marginBottom: 24,
        height: 60, // Slightly more compact
        borderRadius: 30, // Pill/Lozenge shape (Height / 2)
        overflow: 'hidden',
        borderWidth: 1.5, // Distinct border
        borderColor: '#D4AF37', // Gold Border
        // Shadow
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, // Glow effect
        shadowRadius: 10,
        elevation: 8,
    },
    tickerBand: {
        height: '100%', // Fill container
        justifyContent: 'center',
        position: 'relative',
    },
    goldBorderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(212, 175, 55, 0.4)' },
    goldBorderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(212, 175, 55, 0.4)' },
    tickerScroll: { paddingHorizontal: 24, alignItems: 'center' },
    tickerSeparator: { width: 40 }, // Spacer
    tickerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 0 },
    tickerIconBox: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#D4AF37', // Gold Circle Background
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10,
    },
    tickerLabel: { color: '#bbb', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    tickerValue: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    // GRID CARDS
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
    cardWrapper: { width: (width - 48) / 2, marginBottom: 16, borderRadius: 16 }, // Gap handling
    cardContainer: {
        height: 180, // Taller structure
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111',
        // Ghost Border
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)', // Premium light border
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
    },
    cardImageContainer: {
        ...StyleSheet.absoluteFillObject, // Fill the entire card
        backgroundColor: '#000',
    },
    cardImageFull: { width: '100%', height: '100%', resizeMode: 'cover' },

    // Overlay Gradient Footer
    cardFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%', // Gradient covers bottom 45%
        flexDirection: 'row',
        alignItems: 'flex-end', // Align items to bottom
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 16, // Padding from bottom edge
    },
    cardTextContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    verticalGoldLine: { width: 3, height: 24, backgroundColor: '#D4AF37', marginRight: 10, borderRadius: 2 },
    cardTitle: { color: '#D4AF37', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
    cardSubtitle: { color: '#ffffff', fontSize: 10, fontWeight: '400', opacity: 0.9, marginTop: 2 },

    cardBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
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
});
