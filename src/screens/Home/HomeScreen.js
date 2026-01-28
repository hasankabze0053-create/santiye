import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketService } from '../../services/MarketService';

const { width, height } = Dimensions.get('window');

// Extended Market Data Options
const MARKET_OPTS = {
    iron: {
        title: 'DEMİR ÇEŞİTLERİ',
        icon: 'cube',
        items: [
            { label: 'DEMİR Ø8', value: '₺32.40', trend: 'up' },
            { label: 'DEMİR Ø10', value: '₺31.80', trend: 'neutral' },
            { label: 'DEMİR Ø12', value: '₺31.50', trend: 'down' },
            { label: 'DEMİR Ø14', value: '₺31.30', trend: 'down' },
            { label: 'DEMİR Ø16', value: '₺31.30', trend: 'down' },
        ]
    },
    concrete: {
        title: 'HAZIR BETON',
        icon: 'business',
        items: [
            { label: 'BETON C25', value: '₺3.200', trend: 'up' },
            { label: 'BETON C30', value: '₺3.450', trend: 'up' },
            { label: 'BETON C35', value: '₺3.700', trend: 'up' },
            { label: 'BETON C40', value: '₺3.950', trend: 'up' },
            { label: 'BETON C50', value: '₺4.400', trend: 'up' },
        ]
    },
    currency: {
        title: 'DÖVİZ & EMTİA',
        icon: 'cash',
        items: [
            { label: 'USD/TL', value: '43.03', trend: 'up' },
            { label: 'EUR/TL', value: '50.47', trend: 'up' },
            { label: 'ALTIN (Gr)', value: '₺5.975', trend: 'up' },
            { label: 'BRENT P.', value: '$72.00', trend: 'down' }, // Adjusted to ~$72 as per general trends if not exact
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
        image: require('../../assets/categories/cat_logistics_v11.png'),
        route: 'Nakliye'
    },
    {
        id: 8,
        title: 'KENTSEL DÖNÜŞÜM',
        subtitle: 'Devlet Destekli',
        image: require('../../assets/categories/cat_yerindedonusum_v3.png'),
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
    const [marketCount, setMarketCount] = useState(0);

    // Hanging Sign Animation
    const swingVal = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const swing = Animated.loop(
            Animated.sequence([
                Animated.timing(swingVal, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
                Animated.timing(swingVal, { toValue: -1, duration: 2500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
                Animated.timing(swingVal, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
            ])
        );
        swing.start();
        return () => swing.stop();
    }, []);

    useEffect(() => {
        const loadMarketCount = async () => {
            // Mock auth check or just safe call
            const data = await MarketService.getUserRequests();
            if (data) setMarketCount(data.length);
        };
        const unsubscribe = navigation.addListener('focus', loadMarketCount);
        return unsubscribe;
    }, [navigation]);

    const swingRotate = swingVal.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-5deg', '5deg'] // Gentle sway
    });

    // State for interactive ticker
    const [selectedValues, setSelectedValues] = useState({
        iron: MARKET_OPTS.iron.items[2], // Default: Ø12
        concrete: MARKET_OPTS.concrete.items[1], // Default: C30
        currency: MARKET_OPTS.currency.items[0], // Default: USD
    });

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null); // 'iron', 'concrete', 'currency'


    // Hybrid Auto-Scroll Logic
    // Native Animated Ticker Logic
    // Using Animated.Value with native driver for zero JS-thread impact
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const animationRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    const startAnimation = () => {
        // Only start if we have measured width
        if (contentWidth > 0) {
            // Calculate duration based on width for consistent speed
            // Speed factor: 50ms per pixel approx
            const duration = contentWidth * 20;

            // Create loop animation: 0 -> 1 (mapped to 0 -> -contentWidth)
            animationRef.current = Animated.loop(
                Animated.timing(scrollX, {
                    toValue: 1,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: true, // CRITICAL: Runs on UI thread
                })
            );
            animationRef.current.start();
        }
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            animationRef.current.stop();
        }
    };

    useEffect(() => {
        if (isAutoScrolling && contentWidth > 0) {
            startAnimation();
        } else {
            stopAnimation();
        }
        return () => stopAnimation();
    }, [isAutoScrolling, contentWidth]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('GÜNAYDIN');
        else if (hour < 18) setGreeting('TÜNAYDIN');
        else setGreeting('İYİ AKŞAMLAR');
    }, []);

    const openSelectionModal = (categoryKey) => {
        const baseKey = categoryKey.split('-')[0];
        setActiveCategory(baseKey);
        // setIsAutoScrolling(false); // REMOVED: Keep scrolling
        setModalVisible(true);
    };

    const handleSelectOption = (item) => {
        setSelectedValues(prev => ({ ...prev, [activeCategory]: item }));
        setModalVisible(false);
        // setIsAutoScrolling(true); // REMOVED
    };

    const closeModal = () => {
        setModalVisible(false);
        // setIsAutoScrolling(true); // REMOVED
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
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={styles.headerContainer}>
                        <View style={{ width: 10 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
                            <View style={{ alignItems: 'center', marginRight: 15, zIndex: 10 }}>
                                {/* Steel Cable - Fixed from top */}
                                <View style={{
                                    position: 'absolute',
                                    top: -1000, // Goes way up
                                    bottom: '95%', // Ends just above the hook
                                    width: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.3)', // Steel look
                                }} />

                                {/* Swinging Sign Container */}
                                <Animated.View style={{
                                    transform: [{ rotate: swingRotate }],
                                    alignItems: 'center'
                                }}>
                                    {/* Crane Hook Icon */}
                                    <View style={{ alignItems: 'center', marginBottom: -10, zIndex: 10 }}>
                                        <MaterialCommunityIcons name="hook" size={32} color="#F1C40F" />
                                    </View>

                                    {/* Text Logo with Emoji */}
                                    <Text style={{ fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 34 }}>
                                        <Text style={{ color: '#ffffff' }}>Cepte</Text>
                                        <Text style={{ color: '#D4AF37' }}>Şef</Text>
                                        <Text style={{ fontSize: 24 }}> 👷🏼</Text>
                                    </Text>

                                    {/* Bricks Construction */}
                                    <View style={{ flexDirection: 'row', marginTop: -2, marginLeft: 20 }}>
                                        {/* Top Row */}
                                        <View style={{ width: 12, height: 6, backgroundColor: '#D4AF37', marginRight: 2, marginBottom: 2 }} />
                                        <View style={{ width: 12, height: 6, backgroundColor: '#D4AF37', marginBottom: 2 }} />
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: -2, marginLeft: 14 }}>
                                        {/* Bottom Row */}
                                        <View style={{ width: 12, height: 6, backgroundColor: '#D4AF37', marginRight: 2 }} />
                                        <View style={{ width: 12, height: 6, backgroundColor: '#D4AF37', marginRight: 2 }} />
                                        <View style={{ width: 12, height: 6, backgroundColor: '#D4AF37' }} />
                                    </View>
                                </Animated.View>
                            </View>
                            <TouchableOpacity style={styles.profileBtn}>
                                <View style={styles.initialsContainer}>
                                    <Text style={styles.initialsText}>CŞ</Text>
                                </View>
                                <View style={styles.onlineDot} />
                            </TouchableOpacity>
                        </View>
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

                            {/* Native Animated Ticker (No Drag, High Performance) */}
                            <View style={{ overflow: 'hidden', width: '100%' }}>
                                <Animated.View
                                    style={{
                                        flexDirection: 'row',
                                        transform: [{
                                            translateX: scrollX.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -contentWidth]
                                            })
                                        }]
                                    }}
                                >
                                    {/* FIRST SET - We measure this one */}
                                    <View
                                        style={{ flexDirection: 'row' }}
                                        onLayout={(e) => {
                                            if (contentWidth === 0 && e.nativeEvent.layout.width > 0) {
                                                setContentWidth(e.nativeEvent.layout.width);
                                            }
                                        }}
                                    >
                                        {/* Ticker Items */}
                                        <View style={{ flexDirection: 'row' }}>
                                            {renderTickerItem(selectedValues.iron, `iron-1`)}
                                            <View style={styles.tickerSeparator} />
                                            {renderTickerItem(selectedValues.concrete, `concrete-1`)}
                                            <View style={styles.tickerSeparator} />
                                            {renderTickerItem(selectedValues.currency, `currency-1`)}
                                            <View style={styles.tickerSeparator} />
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
                                            <View style={styles.tickerSeparator} />
                                        </View>
                                    </View>

                                    {/* SECOND SET - Duplicate for Loop continuity */}
                                    <View style={{ flexDirection: 'row' }}>
                                        {renderTickerItem(selectedValues.iron, `iron-2`)}
                                        <View style={styles.tickerSeparator} />
                                        {renderTickerItem(selectedValues.concrete, `concrete-2`)}
                                        <View style={styles.tickerSeparator} />
                                        {renderTickerItem(selectedValues.currency, `currency-2`)}
                                        <View style={styles.tickerSeparator} />
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
                                        <View style={styles.tickerSeparator} />
                                    </View>
                                </Animated.View>
                            </View>

                            <View style={styles.goldBorderBottom} />
                            <View style={styles.goldBorderBottom} />
                        </LinearGradient>
                    </View>

                    {/* GRID CATEGORIES - SPLIT VIEW METALLIC */}
                    <View style={styles.gridContainer}>
                        {CATEGORIES.map((cat, index) => {
                            let subtitle = cat.subtitle;
                            if (cat.title === 'MARKET' && marketCount > 0) {
                                subtitle = `${marketCount} Aktif Talep`;
                            }

                            return (
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
                                            <Image source={cat.image} style={styles.cardImageFull} contentFit="cover" transition={300} />
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
                                                    <Text style={[styles.cardTitle, cat.id === 8 && { fontSize: 10 }]}>{cat.title}</Text>
                                                    <Text style={[styles.cardSubtitle, cat.title === 'MARKET' && marketCount > 0 && { color: '#D4AF37', fontWeight: 'bold' }]}>{subtitle}</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
                                        </LinearGradient>
                                    </View>

                                    {/* Glossy Border Overlay */}
                                    <View style={styles.cardBorder} />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* SELECTION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    {/* Glassy Gradient Background for Modal */}
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalContainer}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#000000']}
                            style={styles.modalContent}
                        >
                            {/* Drag Handle */}
                            <View style={styles.modalHandleContainer}>
                                <View style={styles.modalHandle} />
                            </View>

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {activeCategory ? MARKET_OPTS[activeCategory].title : 'SEÇİM YAPIN'}
                                </Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={activeCategory ? MARKET_OPTS[activeCategory].items : []}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{ paddingBottom: 40 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleSelectOption(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalItemLabel}>{item.label}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.modalItemValue}>{item.value}</Text>
                                            {item.trend === 'up' && <Ionicons name="caret-up" size={14} color="#4ADE80" style={{ marginLeft: 8 }} />}
                                            {item.trend === 'down' && <Ionicons name="caret-down" size={14} color="#EF4444" style={{ marginLeft: 8 }} />}
                                            {item.trend === 'neutral' && <Ionicons name="remove" size={14} color="#9CA3AF" style={{ marginLeft: 8 }} />}
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </TouchableOpacity>
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
        paddingTop: 40, // Increased to fix top alignment after removing text
        paddingBottom: 24,
    },
    hangingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#000', // Black Box
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D4AF37', // Gold Border
        // Shadow
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    signHook: {
        width: 14,
        height: 14,
        borderWidth: 2,
        borderColor: '#F1C40F', // Yellow Hook
        borderRadius: 7,
        marginBottom: -4, // Overlap slightly with badge
        zIndex: 1,
    },
    hookLoop: {
        position: 'absolute', top: -10, left: 5, width: 2, height: 12, backgroundColor: '#bdc3c7'
    },
    brandUnified: {
        color: '#D4AF37', // Gold
        fontSize: 16, // Large and confident
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    verifiedIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#D4AF37',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    mainGreeting: { color: '#ffffff', fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
    chiefName: { color: '#ffffff', fontSize: 36, fontWeight: '900', lineHeight: 42 },
    profileBtn: {
        width: 50, height: 50, borderRadius: 16, // Squircle
        borderWidth: 1, borderColor: '#333',
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    initialsContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a', // Slightly lighter than #111
    },
    initialsText: {
        color: '#D4AF37', // Gold
        fontSize: 20, // Nice and visible
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
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
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
        maxHeight: '50%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        // Glow effect
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalContent: {
        width: '100%', // Replaces flex: 1
        paddingHorizontal: 0,
    },
    modalHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: {
        color: '#D4AF37', // Gold Title
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#D4AF37', // Gold Button
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    modalItemLabel: {
        color: '#E5E5E5', // Almost white
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    modalItemValue: {
        color: '#D4AF37', // Gold Value
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 24,
    },
});
