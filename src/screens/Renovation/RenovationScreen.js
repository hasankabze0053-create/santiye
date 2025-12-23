import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const PLATINUM_DARK = '#2E2E2E'; // Dark Metallic
const PLATINUM_LIGHT = '#E5E4E2'; // Platinum Text
const GOLD_MAIN = '#FFD700';
const GOLD_ACCENT = '#D4AF37';

// Data
const HERO_SLIDES = [
    {
        id: 1,
        title: "Modern Salon\nYenileme",
        image: { uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop' },
        tag: "Minimalist"
    },
    {
        id: 2,
        title: "Lüks Mutfak\nTasarımı",
        image: { uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
        tag: "Avant-Garde"
    },
    {
        id: 3,
        title: "Tarihi Yalı\nRestorasyonu",
        image: { uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop' },
        tag: "Klasik"
    }
];

const SERVICES = [
    { id: 'turnkey', title: 'Anahtar Teslim\nTadilat', icon: 'home-key-outline', lib: 'MaterialCommunityIcons' },
    { id: 'restoration', title: 'Tarihi Eser &\nRestorasyon', icon: 'pillar', lib: 'MaterialCommunityIcons' },
    { id: 'kitchen', title: 'Mutfak & Banyo\nYenileme', icon: 'faucet', lib: 'MaterialCommunityIcons' },
    { id: 'commercial', title: 'Ticari Mekan\n& Ofis', icon: 'office-building', lib: 'MaterialCommunityIcons' },
    { id: 'exterior', title: 'Cephe &\nPeyzaj', icon: 'tree-outline', lib: 'MaterialCommunityIcons' },
    { id: 'smart', title: 'Akıllı Ev &\nTesisat', icon: 'lightning-bolt-outline', lib: 'MaterialCommunityIcons' },
];

// Standard Gold Card (Premium Button)
const GoldCard = ({ children, style, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.goldCardContainer, style]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
            colors={[GOLD_MAIN, 'rgba(197, 160, 89, 0.1)', GOLD_MAIN]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goldBorderGradient}
        />
        <View style={styles.cardContent}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function RenovationScreen({ navigation }) {
    const [requestInput, setRequestInput] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleServicePress = (service) => {
        Alert.alert(service.title, "Hizmet detayları yakında eklenecek.");
    };

    const handleAction = (action) => {
        Alert.alert(action, "Modül başlatılıyor...");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <LinearGradient
                colors={['#000000', '#121212', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>MİMARLIK OFİSİ</Text>
                            <Text style={styles.headerSubtitle}>Yaşam Alanınızı Yeniden Keşfedin</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <MaterialCommunityIcons name="account-circle-outline" size={30} color={GOLD_MAIN} />
                        </TouchableOpacity>
                    </View>

                    {/* HERO CAROUSEL */}
                    <View style={styles.carouselContainer}>
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                            scrollEventThrottle={16}
                        >
                            {HERO_SLIDES.map((slide) => (
                                <View key={slide.id} style={styles.slide}>
                                    <Image source={slide.image} style={styles.slideImage} />
                                    <View style={styles.slideOverlay}>
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                                            style={StyleSheet.absoluteFillObject}
                                        />
                                        <View style={styles.slideContent}>
                                            <View style={styles.tagContainer}>
                                                <Text style={styles.tagText}>{slide.tag}</Text>
                                            </View>
                                            <Text style={styles.slideTitle}>{slide.title}</Text>
                                            <TouchableOpacity style={styles.offerBtn} onPress={() => handleAction('Teklif Al')}>
                                                <Text style={styles.offerBtnText}>TEKLİF AL</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Animated.ScrollView>

                        {/* Pagination Dots */}
                        <View style={styles.pagination}>
                            {HERO_SLIDES.map((_, i) => {
                                const opacity = scrollX.interpolate({
                                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp'
                                });
                                return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                            })}
                        </View>
                    </View>

                    {/* SERVICE GRID */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>HİZMETLERİMİZ</Text>
                        <View style={styles.gridContainer}>
                            {SERVICES.map((item) => (
                                <GoldCard
                                    key={item.id}
                                    style={styles.gridItem}
                                    onPress={() => handleServicePress(item)}
                                >
                                    <View style={styles.iconCircle}>
                                        <MaterialCommunityIcons name={item.icon} size={28} color={GOLD_MAIN} />
                                    </View>
                                    <Text style={styles.gridItemTitle}>{item.title}</Text>
                                </GoldCard>
                            ))}
                        </View>
                    </View>

                    {/* SMART REQUEST SECTION */}
                    <View style={styles.smartSection}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.05)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.smartHeader}>
                            <MaterialCommunityIcons name="robot-outline" size={24} color={GOLD_MAIN} />
                            <Text style={styles.smartTitle}>AKILLI KEŞİF & MALİYET</Text>
                        </View>

                        <Text style={styles.smartDesc}>
                            Mevcut alanın fotoğrafını yükleyin veya yapmak istediklerinizi yazın, uzmanlarımız size yaklaşık maliyet sunsun.
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Duvarda çatlak var, mutfak dolapları değişecek..."
                                placeholderTextColor="#666"
                                multiline
                                value={requestInput}
                                onChangeText={setRequestInput}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Fotoğraf Yükle')}>
                                <MaterialCommunityIcons name="camera-plus-outline" size={20} color={PLATINUM_LIGHT} />
                                <Text style={styles.actionText}>Fotoğraf Ekle</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionBtn, { borderColor: GOLD_ACCENT }]} onPress={() => handleAction('Mimar Görüşmesi')}>
                                <MaterialCommunityIcons name="video-outline" size={20} color={GOLD_MAIN} />
                                <Text style={[styles.actionText, { color: GOLD_MAIN }]}>Mimar ile Görüş</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={() => handleAction('Analiz Başlat')}>
                            <LinearGradient
                                colors={[GOLD_MAIN, '#B8860B']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitText}>ANALİZİ BAŞLAT</Text>
                                <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    headerTitle: { color: GOLD_MAIN, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 20, fontWeight: '300', marginTop: 5 },
    profileBtn: { padding: 5 },

    // Carousel
    carouselContainer: { marginBottom: 30 },
    slide: { width: width - 40, height: 220, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
    slideImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    slideOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', padding: 20 },
    tagContainer: { backgroundColor: GOLD_MAIN, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    tagText: { color: '#000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    slideTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 15 },
    offerBtn: { backgroundColor: GOLD_MAIN, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5 },
    offerBtnText: { color: '#000', fontSize: 12, fontWeight: '900' },

    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN },

    // Grid
    sectionContainer: { px: 20, marginBottom: 30 },
    sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 20, marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between', gap: 10 },
    gridItem: { width: (width - 40) / 2 - 5, height: 130, borderRadius: 20 },

    // Premium Card Styles
    goldCardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#111',
        borderWidth: 1, borderColor: '#333'
    },
    goldBorderGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.8 },
    cardContent: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 15 },

    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
    gridItemTitle: { color: '#ddd', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 10 },

    // Smart Section
    smartSection: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    smartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    smartTitle: { color: GOLD_MAIN, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    smartDesc: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 20 },

    inputContainer: { backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 15, height: 80 },
    textInput: { flex: 1, color: '#fff', padding: 15, textAlignVertical: 'top' },

    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#444', backgroundColor: '#181818' },
    actionText: { color: PLATINUM_LIGHT, fontSize: 12, fontWeight: '600' },

    submitBtn: { borderRadius: 16, overflow: 'hidden' },
    submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    submitText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }

});
