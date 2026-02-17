import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    { id: 'turnkey', title: 'Anahtar Teslim\nTadilat', subtitle: 'Yıkım, proje ve uygulama.', icon: 'key', lib: 'Ionicons' },
    { id: 'restoration', title: 'Restorasyon', subtitle: 'Tarihi dokuya uygun güçlendirme.', icon: 'pillar', lib: 'MaterialCommunityIcons' },
    { id: 'paint', title: 'Boya & Dekorasyon', subtitle: 'Duvar kağıdı, boya ve alçıpan.', icon: 'format-paint', lib: 'MaterialCommunityIcons' },
    { id: 'kitchen', title: 'Mutfak & Banyo\nYenileme', subtitle: 'Modern ve fonksiyonel alanlar.', icon: 'water-pump', lib: 'MaterialCommunityIcons' },
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

import { supabase } from '../../lib/supabase';

export default function RenovationScreen({ navigation }) {
    const [requestInput, setRequestInput] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('Konfor');
    const scrollX = useRef(new Animated.Value(0)).current;

    const [isAdmin, setIsAdmin] = useState(false);
    const [isArchitect, setIsArchitect] = useState(false);
    const [isContractor, setIsContractor] = useState(false);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_admin, is_architect, is_contractor')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(data?.is_admin || false);
                setIsArchitect(data?.is_architect || false);
                setIsContractor(data?.is_contractor || false);
            }
        } catch (e) {
            console.warn('User status check failed', e);
        }
    };

    const handleServicePress = (service) => {
        if (service.id === 'turnkey') {
            navigation.navigate('RenovationProjectSelection');
            return;
        }
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

                {/* CUSTOM HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>MİMARLIK OFİSİ</Text>
                        <Text style={styles.headerSubtitle}>Yaşam Alanınızı Yeniden Keşfedin</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, !isArchitect && !isContractor && !isAdmin && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isAdmin || isArchitect || isContractor) {
                                    navigation.navigate('RenovationProvider');
                                } else {
                                    Alert.alert("Yetkisiz Erişim", "Bu panele sadece 'Mimar' veya 'Müteahhit' yetkisi olan hesaplar erişebilir.");
                                }
                            }}
                            activeOpacity={isAdmin || isArchitect || isContractor ? 0.7 : 1}
                        >
                            <MaterialCommunityIcons name="hammer-wrench" size={24} color={isAdmin || isArchitect || isContractor ? "#D4AF37" : "#666"} />
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>



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
                                    <Image source={slide.image} style={styles.slideImage} contentFit="cover" transition={500} />
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
                                        {item.lib === 'Ionicons' ? (
                                            <Ionicons name={item.icon} size={26} color={GOLD_MAIN} />
                                        ) : (
                                            <MaterialCommunityIcons name={item.icon} size={28} color={GOLD_MAIN} />
                                        )}
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.gridItemTitle}>{item.title}</Text>
                                        <Text style={styles.gridItemSubtitle}>{item.subtitle}</Text>
                                    </View>
                                </GoldCard>
                            ))}
                        </View>
                    </View>


                    {/* MIMARIM - SANAL TASARIM STÜDYOSU */}
                    <View style={styles.smartSection}>
                        <LinearGradient
                            colors={['rgba(255, 215, 0, 0.05)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.smartHeader}>
                            <MaterialCommunityIcons name="cube-scan" size={24} color={GOLD_MAIN} />
                            <Text style={styles.smartTitle}>Mimarım - Sanal Tasarım Stüdyosu</Text>
                        </View>

                        <Text style={styles.smartDesc}>
                            Mevcut alanın fotoğrafını yükleyin; seçtiğiniz kalite sınıfına uygun olarak <Text style={{ color: GOLD_MAIN }}>3D tasarımınızı ve maliyet teklifinizi</Text> hazırlansın.
                        </Text>

                        {/* Mood Tags (Radio Selection) */}
                        <View style={styles.moodTagsRow}>
                            {['Ekonomik', 'Konfor', 'Exclusive'].map((tag, index) => {
                                const isSelected = selectedQuality === tag;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.moodTag, isSelected ? styles.moodTagActive : {}]}
                                        onPress={() => setSelectedQuality(tag)}
                                    >
                                        <Text style={[styles.moodTagText, isSelected ? styles.moodTagTextActive : {}]}>{tag}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Dönüşümünüzdeki beklentilerinizi ve alanın fotoğrafını belirtin..."
                                placeholderTextColor="#666"
                                multiline
                                value={requestInput}
                                onChangeText={setRequestInput}
                            />
                        </View>

                        {/* Photo Upload Button (Large Card Style) */}
                        <TouchableOpacity style={styles.photoUploadCard} onPress={() => handleAction('Fotoğraf Yükle')}>
                            <View style={styles.photoIconCircle}>
                                <MaterialCommunityIcons name="camera-plus" size={24} color="#000" />
                                <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD_MAIN }} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.photoUploadTitle}>Mevcut Alanın Fotoğrafını Yükle</Text>
                                <Text style={styles.photoUploadSub}>Mimarlarımız dönüşümü başlatsın</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitBtn} onPress={() => handleAction('Analiz Başlat')}>
                            <LinearGradient
                                colors={[GOLD_MAIN, '#B8860B']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitText}>TASARIM VE TEKLİF İSTE</Text>
                                <MaterialCommunityIcons name="magic-staff" size={24} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Consultant CTA (Premium) */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => handleAction('Mimar Görüşmesi')}>
                            <LinearGradient
                                colors={['#1c1917', '#292524']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.consultantCard}
                            >
                                <View style={styles.consultantContent}>
                                    <View style={styles.consultantIconBox}>
                                        <MaterialCommunityIcons name="face-agent" size={24} color={GOLD_MAIN} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.consultantTitle}>Karar veremediniz mi?</Text>
                                        <Text style={styles.consultantSub}>Profesyonel destek için tıklayın.</Text>
                                    </View>
                                    <View style={styles.consultantBtn}>
                                        <Text style={styles.consultantBtnText}>Mimarınızla Görüş</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={16} color="#000" />
                                    </View>
                                </View>
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
    headerTitle: { color: GOLD_MAIN, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    headerSubtitle: { color: '#fff', fontSize: 16, fontWeight: '300', marginTop: 4 },
    headerBtn: { padding: 5 },

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
    sectionContainer: { paddingHorizontal: 20, marginBottom: 30 },

    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D4AF37',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 0, marginBottom: 15 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', height: 160, borderRadius: 20, marginBottom: 16 },

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
    gridItemTitle: { color: '#ddd', fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
    gridItemSubtitle: { color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4, paddingHorizontal: 4, lineHeight: 14 },


    // Smart Section
    smartSection: { marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    smartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    smartTitle: { color: GOLD_MAIN, fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    smartDesc: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 20 },

    // Mood Tags
    moodTagsRow: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
    moodTag: {
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    moodTagActive: {
        backgroundColor: GOLD_MAIN,
        borderColor: GOLD_MAIN
    },
    moodTagText: { color: '#888', fontSize: 11, fontWeight: '600' },
    moodTagTextActive: { color: '#000', fontWeight: '900' },

    inputContainer: { backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 15, height: 100 },
    textInput: { flex: 1, color: '#fff', padding: 15, textAlignVertical: 'top', fontSize: 13 },

    // Photo Upload Card
    photoUploadCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#333', borderStyle: 'dashed'
    },
    photoIconCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD_MAIN,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    photoUploadTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    photoUploadSub: { color: '#666', fontSize: 11 },

    submitBtn: { borderRadius: 16, overflow: 'hidden' },
    submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    submitText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

    // Consultant CTA (Premium Redesign)
    consultantCard: { marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: '#44403c', overflow: 'hidden' },
    consultantContent: { flexDirection: 'row', items: 'center', padding: 16, alignItems: 'center' },
    consultantIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    consultantTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    consultantSub: { color: '#a8a29e', fontSize: 11 },
    consultantBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: GOLD_MAIN, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 4 },
    consultantBtnText: { color: '#000', fontSize: 11, fontWeight: '900' }

});

