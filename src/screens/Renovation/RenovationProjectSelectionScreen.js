import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- CONSTANTS & THEME ---
const THEME = {
    background: '#050505',
    cardBg: '#121212',
    titleColor: '#E5E5E5',
    goldPrimary: '#D4AF37',
    goldShadow: '#AA8230',
    goldHighlight: '#F7E5A8',
};

const BTN_GRADIENT = ['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30'];

// CAROUSEL GEOMETRY
const CARD_WIDTH = width * 0.70;
const CARD_HEIGHT = CARD_WIDTH * 1.5;
const SPACING = 12;
const ITEM_WIDTH = CARD_WIDTH + (SPACING * 2);
const INSET = (width - ITEM_WIDTH) / 2;

// ORIGINAL DATA - V21: Fixed Typo "VİLLA"
const ORIGINAL_DATA = [
    {
        id: 'daire',
        title: 'DAİRE',
        image: require('../../assets/renovation/daire_warm.png'),
        subtitle: 'MODERN ŞEHİR YAŞAMI'
    },
    {
        id: 'villa',
        title: 'VİLLA', // Fixed: VILLA -> VİLLA
        image: require('../../assets/renovation/villa_warm.png'),
        subtitle: 'MÜSTAKİL KONFOR'
    },
    {
        id: 'ofis',
        title: 'OFİS',
        image: require('../../assets/renovation/ofis_warm.png'),
        subtitle: 'PROFESYONEL ALANLAR'
    },
    {
        id: 'magaza',
        title: 'MAĞAZA',
        image: require('../../assets/renovation/magaza_warm.png'),
        subtitle: 'TİCARİ VİTRİN VE BUTİK'
    }
];

// INFINITE LOOP DATA
const LOOPS = 1000;
const DATA = Array.from({ length: LOOPS * ORIGINAL_DATA.length }).map((_, i) => ({
    ...ORIGINAL_DATA[i % ORIGINAL_DATA.length],
    uniqueKey: 'item-' + i,
    originalIndex: i
}));

const INITIAL_INDEX = Math.floor(DATA.length / 2);

export default function RenovationProjectSelectionScreen({ navigation }) {
    const [area, setArea] = useState(150);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    // V18 FIX: Direct Math Offset - Most Reliable
    const handleCardPress = (index) => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
                offset: index * ITEM_WIDTH,
                animated: true
            });
        }
    };

    const renderItem = ({ item, index }) => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [30, 0, 30],
            extrapolate: 'clamp',
        });

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
        });

        // MAGIC GLOW OPACITY
        const activeOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        const overlayOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 0, 0.6],
            extrapolate: 'clamp',
        });

        // Border Opacity
        const borderOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleCardPress(index)}
                style={{ marginHorizontal: SPACING }}
            >
                <Animated.View
                    style={[
                        styles.cardWrapper,
                        {
                            transform: [{ translateY }, { scale }]
                        }
                    ]}
                >

                    {/* V21: MAGIC GLOW (Behind) - Enhanced */}
                    {/* Using negative margin/larger size to ensure glow spills out */}
                    <Animated.View style={[styles.glowContainer, { opacity: activeOpacity }]} />

                    {/* CONTAINER */}
                    <View style={styles.cardContainer}>

                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#333' }]} />

                        {/* IMAGE */}
                        <Image
                            source={item.image}
                            fadeDuration={0}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0, left: 0,
                            }}
                            resizeMode="cover"
                        />

                        {/* OVERLAY */}
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                StyleSheet.absoluteFillObject,
                                { backgroundColor: '#000', opacity: overlayOpacity, zIndex: 10 }
                            ]}
                        />

                        {/* V21: Active Thin Semi-Transparent Border */}
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.activeBorder,
                                { opacity: borderOpacity }
                            ]}
                        />

                        {/* GRADIENT */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
                            locations={[0, 0.6, 1]}
                            style={[styles.cardGradient, { height: '100%', justifyContent: 'flex-end', paddingBottom: 30 }]}
                            pointerEvents="none"
                        >
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </LinearGradient>

                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderRulerTicks = () => {
        const ticks = [];
        const count = 30;
        for (let i = 0; i <= count; i++) {
            const isLarge = i % 5 === 0;
            ticks.push(
                <View
                    key={i}
                    style={[
                        styles.tick,
                        {
                            height: isLarge ? 8 : 4,
                            backgroundColor: isLarge ? THEME.goldPrimary : '#666',
                            opacity: isLarge ? 0.9 : 0.4,
                            width: isLarge ? 2 : 1
                        }
                    ]}
                />
            );
        }
        return (
            <View style={styles.rulerContainer}>
                {ticks}
            </View>
        );
    };

    const getItemLayout = (_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={['#000000', '#121212', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Cepte</Text>
                        <Text style={[styles.logoText, { color: THEME.goldPrimary }]}>Şef</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Dönüşüm Nerede Başlayacak?</Text>
                </View>

                <View style={styles.carouselContainer}>
                    <Animated.FlatList
                        ref={flatListRef}
                        data={DATA}
                        keyExtractor={(item) => item.uniqueKey}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: INSET }}
                        renderItem={renderItem}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}

                        getItemLayout={getItemLayout}
                        initialScrollIndex={INITIAL_INDEX}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                    />
                </View>

                <View style={styles.sliderSection}>
                    <Text style={styles.sliderLabel}>MODERN DÖNÜŞÜM ALANI (m²)</Text>

                    <Text style={[styles.sliderValue, { color: THEME.goldHighlight }]}>{area} m²</Text>

                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Slider
                            style={{ width: '100%', height: 40, zIndex: 10 }}
                            minimumValue={0}
                            maximumValue={300}
                            step={10}
                            value={area}
                            onValueChange={setArea}
                            minimumTrackTintColor={THEME.goldPrimary}
                            maximumTrackTintColor="#333"
                            thumbTintColor={THEME.goldHighlight}
                        />
                        {renderRulerTicks()}
                        <View style={styles.sliderMarks}>
                            <Text style={styles.markText}>0</Text>
                            <Text style={[styles.markText, { color: THEME.goldShadow }]}>150</Text>
                            <Text style={styles.markText}>300</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => navigation.navigate('StyleSelection')}
                    >
                        <LinearGradient
                            colors={BTN_GRADIENT}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>DEVAM ET</Text>
                            <Ionicons name="arrow-forward" size={18} color="#1a1a1a" style={{ marginLeft: 6 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
    titleContainer: { marginTop: 20, alignItems: 'center', paddingHorizontal: 20 },
    mainTitle: { fontSize: 24, color: THEME.titleColor, textAlign: 'center', fontWeight: '300', letterSpacing: 0.5 },

    carouselContainer: { height: CARD_HEIGHT + 60, marginTop: 15, alignItems: 'center', justifyContent: 'center' },
    cardWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        // Ensure wrapper doesn't clip the glow
        overflow: 'visible'
    },

    // V22: SOFT GLOW
    glowContainer: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        borderRadius: 24,
        backgroundColor: '#000',
        // iOS
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
        // Android
        elevation: 10,
        zIndex: -1,
    },

    cardContainer: {
        width: '100%', height: '100%',
        borderRadius: 20, overflow: 'hidden',
        backgroundColor: '#000',
        elevation: 5,
    },

    // V22: Very Thin Active Border
    activeBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
        zIndex: 15
    },

    cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 },

    cardTitle: {
        color: THEME.goldPrimary,
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 5,
        letterSpacing: 4,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        textTransform: 'uppercase'
    },
    cardSubtitle: { color: '#CCC', fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 2, opacity: 0.9, marginBottom: 5 },

    sliderSection: { marginTop: 10, paddingHorizontal: 30, alignItems: 'center', width: '100%' },
    sliderLabel: { color: '#666', fontSize: 11, marginBottom: 5, letterSpacing: 1, fontWeight: '600' },
    sliderValue: { color: '#FFF', fontSize: 28, fontWeight: '300' },
    rulerContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: -9, paddingHorizontal: 12, zIndex: -1 },
    tick: { width: 1 },
    sliderMarks: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingHorizontal: 5 },
    markText: { color: '#555', fontSize: 10 },

    footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 40, paddingHorizontal: 30 },
    continueButton: { borderRadius: 30, overflow: 'hidden', shadowColor: THEME.goldPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    gradientButton: { height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
