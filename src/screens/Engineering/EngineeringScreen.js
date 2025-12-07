import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ENGINEERS = [
    {
        id: '1',
        name: 'Koray Zengin',
        title: 'İnşaat Yüksek Mühendisi',
        badges: ['İSG UZMANI', 'ÖNERİLEN'],
        rating: 5.0,
        reviewCount: 128,
        specialty: 'Şantiye Yönetimi & İSG',
        about: '15+ yıl şantiye tecrübesi. A sınıfı İş Güvenliği Uzmanı. Büyük ölçekli konut ve AVM projelerinde proje müdürlüğü deneyimi.',
        isOnline: true,
        isBlocked: false,
        price: '₺2.500 / Saat',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' // Professional man
    },
    {
        id: '2',
        name: 'Yrd. Doç. Dr. Tevfik D. Müftüoğlu',
        title: 'Akademisyen & İnşaat Mühendisi',
        badges: ['AKADEMİSYEN', 'HİDROLİK UZMANI'],
        rating: 4.9,
        reviewCount: 84,
        specialty: 'Su Kaynakları & Hidrolik',
        about: 'Üniversite öğretim üyesi. "Akarsu Yataklarında Sediment Taşınımı" üzerine doktora tezi. Baraj ve HES projeleri danışmanı.',
        isOnline: false,
        isBlocked: false,
        price: '₺3.500 / Saat',
        image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop' // Senior academic look
    },
    {
        id: '3',
        name: 'Atahan Arıcı',
        title: 'İnşaat Mühendisi',
        badges: ['RİSKLİ PROFİL'],
        rating: 2.1,
        reviewCount: 14,
        specialty: 'Genel Yapı',
        about: 'Şantiye şefliği deneyimi var. (Kullanıcı Şikayeti: Randevulara sadık kalmadığı ve eksik bilgi verdiği raporlanmıştır.)',
        isOnline: false,
        isBlocked: true, // BLOCKED
        price: 'Hizmet Dışı',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop' // Another profile
    }
];

export default function EngineeringScreen() {

    const handleContact = (engineer) => {
        if (engineer.isBlocked) {
            Alert.alert("Hizmet Alınamaz", "Bu uzman hakkında yapılan şikayetler nedeniyle hizmet alımı geçici olarak durdurulmuştur.");
            return;
        }
        Alert.alert("Randevu Talebi", `${engineer.name} ile görüşme talebiniz iletildi. Asistanımız sizi arayacaktır.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>MÜHENDİSLİK & DANIŞMANLIK</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.subHeader}>Alanında uzman kadromuzdan online veya şantiyede danışmanlık alın.</Text>

                    {ENGINEERS.map((eng) => (
                        <View key={eng.id} style={[styles.card, eng.isBlocked && styles.cardBlocked]}>

                            {/* Header: Image & Badges */}
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: eng.image }} style={[styles.avatar, eng.isBlocked && styles.avatarBlocked]} />
                                <View style={styles.headerInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{eng.name}</Text>
                                        {eng.isOnline && <View style={styles.onlineBadge} />}
                                    </View>
                                    <Text style={styles.title}>{eng.title}</Text>

                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={styles.rating}>{eng.rating}</Text>
                                        <Text style={styles.review}>({eng.reviewCount} Değerlendirme)</Text>
                                    </View>

                                    <View style={styles.badgeRow}>
                                        {eng.badges.map((badge, idx) => (
                                            <View key={idx} style={[
                                                styles.badge,
                                                badge === 'RİSKLİ PROFİL' ? styles.badgeRisk :
                                                    badge === 'ÖNERİLEN' ? styles.badgeRec :
                                                        styles.badgeDefault
                                            ]}>
                                                <Text style={[
                                                    styles.badgeText,
                                                    badge === 'RİSKLİ PROFİL' ? styles.badgeTextRisk :
                                                        badge === 'ÖNERİLEN' ? styles.badgeTextRec :
                                                            styles.badgeTextDefault
                                                ]}>{badge}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Body: About */}
                            <View style={styles.cardBody}>
                                <Text style={styles.specialtyLabel}>UZMANLIK: <Text style={styles.specialtyValue}>{eng.specialty}</Text></Text>
                                <Text style={styles.about}>{eng.about}</Text>
                            </View>

                            {/* Footer: Action */}
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.priceLabel}>Danışmanlık Ücreti</Text>
                                    <Text style={[styles.priceValue, eng.isBlocked && styles.priceBlocked]}>{eng.price}</Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.actionButton, eng.isBlocked && styles.actionButtonBlocked]}
                                    onPress={() => handleContact(eng)}
                                    disabled={eng.isBlocked}
                                >
                                    <Text style={[styles.actionText, eng.isBlocked && styles.actionTextBlocked]}>
                                        {eng.isBlocked ? 'Erişim Kısıtlı' : 'Randevu Oluştur'}
                                    </Text>
                                    {!eng.isBlocked && <Ionicons name="calendar" size={16} color="#000" style={{ marginLeft: 5 }} />}
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#FFD700', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
    subHeader: { color: '#888', paddingHorizontal: 20, marginBottom: 20, marginTop: 5, fontSize: 13 },
    scrollContent: { paddingBottom: 40 },

    card: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardBlocked: {
        borderColor: '#4d1a1a',
        backgroundColor: '#1a0d0d', // Dark red tint
        opacity: 0.8
    },

    cardHeader: { flexDirection: 'row', marginBottom: 15 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#FFD700' },
    avatarBlocked: { borderColor: '#555', grayscale: 1 },
    headerInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },

    nameRow: { flexDirection: 'row', alignItems: 'center' },
    name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    onlineBadge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginLeft: 8, borderWidth: 1, borderColor: '#000' },

    title: { color: '#aaa', fontSize: 13, marginBottom: 4 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    rating: { color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginHorizontal: 4 },
    review: { color: '#666', fontSize: 12 },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeDefault: { backgroundColor: '#333' },
    badgeRec: { backgroundColor: '#FFD700' },
    badgeRisk: { backgroundColor: '#4a1111', borderWidth: 1, borderColor: '#ff4444' },

    badgeText: { fontSize: 10, fontWeight: 'bold' },
    badgeTextDefault: { color: '#ccc' },
    badgeTextRec: { color: '#000' },
    badgeTextRisk: { color: '#ff4444' },

    cardBody: { backgroundColor: '#111', padding: 12, borderRadius: 8, marginBottom: 15 },
    specialtyLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    specialtyValue: { color: '#ddd' },
    about: { color: '#999', fontSize: 13, lineHeight: 18 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },
    priceLabel: { color: '#666', fontSize: 11 },
    priceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    priceBlocked: { color: '#888', textDecorationLine: 'line-through' },

    actionButton: { flexDirection: 'row', backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    actionButtonBlocked: { backgroundColor: '#333' },
    actionText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
    actionTextBlocked: { color: '#666' }
});
