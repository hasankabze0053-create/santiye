import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import WorkerCard from '../../components/WorkerCard';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Mock Data
const WORKERS = [
    {
        id: '1',
        name: 'Mehmet Yılmaz',
        role: 'Seramik & Fayans Ustası',
        rating: 4.9,
        image: { uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop' },
        isVerified: true,
        isOnline: true,
        tags: ['Seramik', 'Granit', 'Banyo'],
        location: 'Kadıköy',
        distance: '1.2 km'
    },
    {
        id: '2',
        name: 'Ali Vural',
        role: 'Elektrik Teknikeri',
        rating: 4.8,
        image: { uri: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop' },
        isVerified: true,
        isOnline: false,
        tags: ['Tesisat', 'Pano', 'Aydınlatma'],
        location: 'Üsküdar',
        distance: '3.5 km'
    },
    {
        id: '3',
        name: 'Mustafa Demir',
        role: 'Alçı & Boya Ustası',
        rating: 4.7,
        image: { uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
        isVerified: false,
        isOnline: true,
        tags: ['Alçıpan', 'Boya', 'Dekorasyon'],
        location: 'Ataşehir',
        distance: '5.0 km'
    },
    {
        id: '4',
        name: 'Hüseyin Kaya',
        role: 'Sıhhi Tesisatçı',
        rating: 5.0,
        image: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
        isVerified: true,
        isOnline: true,
        tags: ['Su', 'Doğalgaz', 'Kalorifer'],
        location: 'Maltepe',
        distance: '7.2 km'
    },
];

export default function WorkForceScreen() {
    const radarScale = useSharedValue(1);
    const radarOpacity = useSharedValue(0.5);

    useEffect(() => {
        radarScale.value = withRepeat(
            withSequence(withTiming(1.5, { duration: 1500 }), withTiming(1, { duration: 0 })),
            -1, false
        );
        radarOpacity.value = withRepeat(
            withSequence(withTiming(0, { duration: 1500 }), withTiming(0.5, { duration: 0 })),
            -1, false
        );
    }, []);

    const animatedRadarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: radarScale.value }],
        opacity: radarOpacity.value,
    }));

    const renderHeader = () => (
        <View style={styles.radarContainer}>
            <View style={styles.radarCircle}>
                <Animated.View style={[styles.radarPulse, animatedRadarStyle]} />
                <MaterialCommunityIcons name="radar" size={32} color={COLORS.accent} />
            </View>
            <View style={styles.radarTextContainer}>
                <Text style={styles.radarTitle}>ÇEVRE TARANIYOR...</Text>
                <Text style={styles.radarSubtitle}>Konumunuzdaki en yakın profesyoneller listeleniyor.</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Premium Concrete Gradient Background */}
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.headerSpacer} />
                <FlatList
                    data={WORKERS}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.delay(index * 200).springify()}>
                            <WorkerCard worker={item} onPress={() => { }} />
                        </Animated.View>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    headerSpacer: { height: 10 },
    listContent: { padding: 20, paddingBottom: 100 },

    // Radar UI
    radarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    radarCircle: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    radarPulse: { ...StyleSheet.absoluteFillObject, borderRadius: 30, backgroundColor: 'rgba(255, 215, 0, 0.3)', zIndex: -1 },
    radarTextContainer: { flex: 1 },
    radarTitle: { color: COLORS.accent, fontWeight: 'bold', fontSize: 12, letterSpacing: 1, marginBottom: 4 },
    radarSubtitle: { color: '#888', fontSize: 12 },
});
