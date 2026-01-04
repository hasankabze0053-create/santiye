import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS & THEME ---
const THEME = {
    background: '#050505',
    cardBg: '#121212',
    goldPrimary: '#D4AF37',
    goldShadow: '#AA8230',
    goldHighlight: '#F7E5A8',
};

const BTN_GRADIENT = ['#8C6A30', '#D4AF37', '#F7E5A8', '#D4AF37', '#8C6A30'];

// GRID GEOMETRY
const SPACING = 15;
const COLUMNS = 2;
// (Screen Width - (Side Padding * 2) - Spacing between columns) / 2
const ITEM_WIDTH = (width - (20 * 2) - SPACING) / COLUMNS;
// Portrait 3:4 Aspect Ratio
const ITEM_HEIGHT = ITEM_WIDTH * (4 / 3);

// DUMMY DATA with Pexels Placeholders matching the descriptions
const STYLES = [
    {
        id: 'modern',
        title: 'MODERN & MİNİMALİST',
        image: require('../../../assets/renovation/style_modern.png')
    },
    {
        id: 'classic',
        title: 'KLASİK & AVANGART',
        image: require('../../../assets/renovation/style_classic.png')
    },
    {
        id: 'loft',
        title: 'ENDÜSTRİYEL (LOFT)',
        image: require('../../../assets/renovation/style_loft.png')
    },
    {
        id: 'scandinavian',
        title: 'İSKANDİNAV',
        image: require('../../../assets/renovation/style_scandinavian.png')
    },
    {
        id: 'boho',
        title: 'BOHEM',
        image: require('../../../assets/renovation/style_boho.png')
    },
    {
        id: 'other',
        title: 'DİĞER / ÖZEL',
        image: require('../../../assets/renovation/style_other.png')
    }
];

export default function StyleSelectionScreen({ navigation }) {
    const [selectedId, setSelectedId] = useState(null);

    const handleSelect = (id) => {
        setSelectedId(id);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradient */}
            <LinearGradient colors={['#000000', '#121212', '#000000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Tarzını</Text>
                        <Text style={[styles.logoText, { color: THEME.goldPrimary }]}>Seç</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Hayalindeki Atmosfer Hangisi?</Text>
                    <Text style={styles.subtitle}>Sana en uygun tasarım dilini belirleyelim.</Text>
                </View>

                {/* GRID CONTENT */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.gridContainer}>
                        {STYLES.map((item) => {
                            const isSelected = selectedId === item.id;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.9}
                                    onPress={() => handleSelect(item.id)}
                                    style={styles.cardTouchWrapper}
                                >
                                    <View style={[
                                        styles.cardContainer,
                                        // Selected Border Logic
                                        isSelected && styles.selectedCardBorder
                                    ]}>

                                        {/* Image */}
                                        <Image
                                            source={item.image}
                                            style={[styles.cardImage, { width: '100%', height: '100%' }]}
                                            resizeMode="cover"
                                            fadeDuration={0}
                                        />

                                        {/* Overlay Gradient for Text Readability */}
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                                            locations={[0, 0.6, 1]}
                                            style={styles.cardGradient}
                                        >
                                            <Text style={[
                                                styles.cardTitle,
                                                isSelected && { color: THEME.goldHighlight }
                                            ]}>
                                                {item.title}
                                            </Text>
                                        </LinearGradient>

                                        {/* GOLDEN GLOW (When Selected) */}
                                        {isSelected && (
                                            <View style={styles.glowContainer} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* SPACER for Floating Button */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* FOOTER BUTTON (Floating) */}
                <View style={styles.footerContainer}>
                    {/* Gradient Fade at bottom of scroll content */}
                    <LinearGradient
                        colors={['transparent', '#000']}
                        style={styles.bottomFade}
                        pointerEvents="none"
                    />

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            { opacity: selectedId ? 1 : 0.5 } // Dim if not selected
                        ]}
                        disabled={!selectedId}
                        onPress={() => navigation.navigate('CustomRequest')}
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

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10, marginBottom: 10
    },
    backButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20
    },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },

    titleContainer: { paddingHorizontal: 20, marginBottom: 20 },
    mainTitle: {
        fontSize: 22, color: THEME.goldHighlight, fontWeight: '600',
        letterSpacing: 0.5, marginBottom: 5
    },
    subtitle: { fontSize: 13, color: '#888', fontWeight: '400' },

    scrollContent: { paddingHorizontal: 20 },
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between'
    },

    cardTouchWrapper: {
        width: ITEM_WIDTH,
        marginBottom: SPACING,
        // To ensure glow doesn't get clipped if it extends out, 
        // but margins usually handle spacing. 
        // We'll put glow inside the absolute container for simplicity.
    },

    cardContainer: {
        width: '100%',
        height: ITEM_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#222',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#333', // Default dark border
    },

    selectedCardBorder: {
        borderColor: 'rgba(255, 215, 0, 0.8)', // Gold border when selected
    },

    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.goldPrimary,
        // Glow Effect
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
        backgroundColor: 'transparent',
        zIndex: 2, // On top of content or just below border logic? 
        // Actually shadows on Views inside overflow:hidden parents are tricky in RN.
        // Better to put glow OUTSIDE if we want spill-over, but user asked for "Golden Glow selection".
        // Let's stick to a strong border and internal glow overlay or similar.
        // Re-reading: "Golden Glow effect on selection."
        // Let's try to simulate internal highlight or just rely on the border + shadow if checking on iOS.
    },

    cardImage: {
        width: '100%', height: '100%',
        position: 'absolute', top: 0, left: 0
    },

    cardGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '50%',
        justifyContent: 'flex-end',
        padding: 12,
        zIndex: 5
    },

    cardTitle: {
        color: '#EEE',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    footerContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 30, paddingBottom: 40,
        alignItems: 'center'
    },
    bottomFade: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    },
    continueButton: {
        width: '100%', borderRadius: 30, overflow: 'hidden',
        shadowColor: THEME.goldPrimary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
    },
    gradientButton: {
        height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    buttonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
