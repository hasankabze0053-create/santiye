import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

// Real Photography for Categories
const CATEGORIES = [
    {
        id: 1,
        title: 'KİRALA',
        image: require('../../../assets/manitou_v2.jpg'),
        route: 'Kiralama'
    },
    {
        id: 2,
        title: 'İNŞAAT MARKETİM',
        image: require('../../../assets/insaat_market.jpg'),
        route: 'Market'
    },
    {
        id: 3,
        title: 'TADİLAT TAMİRAT',
        image: require('../../../assets/tadilat_cover_v2.jpg'),
        route: 'Tadilat'
    },
    {
        id: 4,
        title: 'MÜHENDİSLİK MİMARLIK',
        image: require('../../../assets/muhendislik_cover_v2.jpg'),
        route: 'Mühendislik'
    },
    {
        id: 5,
        title: 'HUKUKİ DESTEK',
        image: require('../../../assets/hukuk_cover_v2.jpg'),
        route: 'Hukuk'
    },
    {
        id: 6,
        title: 'NAKLİYE LOJİSTİK',
        image: require('../../../assets/nakliye_cover.jpg'),
        route: 'Nakliye'
    },
    {
        id: 7,
        title: 'SİGORTA İŞLEMLERİ',
        image: { uri: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop' },
        route: 'Sigorta'
    },
    {
        id: 8,
        title: 'YAKLAŞIK MALİYET',
        image: { uri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop' },
        route: 'Maliyet'
    },
];

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Dark Background for App */}
            <LinearGradient
                colors={['#000000', '#111111', '#1a1a1a']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greetingText}>Merhaba, <Text style={{ color: COLORS.accent }}>Kral</Text></Text>
                            <View style={styles.locationContainer}>
                                <Ionicons name="location" size={12} color="#888" />
                                <Text style={styles.locationText}> Kadıköy, Şantiye Sahası</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.bellButton}>
                            <Ionicons name="notifications" size={20} color="#fff" />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Modules Grid */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.categoryCardWrapper}
                                    onPress={() => navigation.navigate(cat.route)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.categoryCard}>
                                        {/* Image Background */}
                                        <Image
                                            source={cat.image}
                                            style={styles.cardBgImage}
                                        />

                                        {/* Text Section - YELLOW Background */}
                                        <View style={styles.cardTextContainer}>
                                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 24, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greetingText: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    locationText: { color: '#888', fontSize: 13, fontWeight: '500' },
    bellButton: { backgroundColor: '#1F1F1F', padding: 12, borderRadius: 50, borderWidth: 1, borderColor: '#333' },
    notificationBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, borderWidth: 1, borderColor: '#1F1F1F' },

    // RESTORED GRID LAYOUT
    sectionContainer: { paddingHorizontal: 20, paddingTop: 20 },

    // Grid Layout (2 Columns)
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoryCardWrapper: { width: '48%', marginBottom: 20 },

    categoryCard: {
        height: 250,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFD700', // YELLOW BACKGROUND
        borderWidth: 0,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    cardBgImage: {
        width: '100%',
        height: '82%',
        resizeMode: 'cover',
        backgroundColor: '#FFD700',
    },
    cardTextContainer: {
        height: '18%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFD700', // YELLOW BACKGROUND
        paddingHorizontal: 5,
        paddingBottom: 5
    },

    categoryTitle: {
        fontWeight: '900',
        color: '#0047AB', // BLUE TEXT
        fontSize: 16,
        letterSpacing: 0,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
});
