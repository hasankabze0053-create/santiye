import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRANSFORMATION_STEPS = [
    {
        id: 1,
        title: 'RİSKLİ YAPI TESPİTİ',
        subtitle: 'Binanız Güvenli mi?',
        icon: 'building-alert',
        desc: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı lisanslı kuruluşlarca binanızın deprem risk raporunun hazırlanması.',
        image: 'https://images.unsplash.com/photo-1590674899505-1c5c417b1bda?q=80&w=400&auto=format&fit=crop',
        action: 'Tespiti Başlat'
    },
    {
        id: 2,
        title: 'YARISI BİZDEN',
        subtitle: 'Devlet Destek Kampanyası',
        icon: 'hand-holding-heart', // customized icon
        desc: 'Hak sahiplerine 1.5 Milyon TL\'ye kadar destek! 700 Bin TL hibe, 700 Bin TL uygun kredi ve 100 Bin TL tahliye desteği.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop',
        action: 'Başvuru Bilgisi'
    },
    {
        id: 3,
        title: 'UZLAŞMA & PROTOKOL',
        subtitle: '3/2 Çoğunluk Kararı',
        icon: 'file-signature',
        desc: 'Kat malikleri ile müteahhit arasında SPK lisanslı değerleme raporlarına dayalı adil paylaşım ve sözleşme süreci.',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop',
        action: 'Uzman Ata'
    },
    {
        id: 4,
        title: 'YIKIM VE YAPIM',
        subtitle: 'Yeni Yaşam Alanınız',
        icon: 'crane',
        desc: 'Ruhsat alımı, güvenli yıkım ve projenin start alması. Kira yardımlarının başlaması.',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
        action: 'Müteahhit Bul'
    }
];

export default function UrbanTransformationScreen({ navigation }) {
    const [selectedStep, setSelectedStep] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleAction = (step) => {
        setSelectedItem(step);
        setModalVisible(true);
    };

    const handleApplication = () => {
        setModalVisible(false);
        Alert.alert("Talep Alındı", "Kentsel dönüşüm uzmanımız 24 saat içinde sizinle iletişime geçerek süreci başlatacaktır.");
    };

    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>YERİNDE DÖNÜŞÜM</Text>
                        <Text style={styles.headerSubtitle}>GÜVENLİ GELECEK</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Hero Section */}
                    <View style={styles.heroCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop' }}
                            style={styles.heroImage}
                        />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFillObject} />
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>DEVLET GÜVENCESİYLE</Text>
                            <Text style={styles.heroDesc}>Evinizi yerinde, güvenle ve devlet desteğiyle yenileyin.</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>1.5M₺</Text>
                            <Text style={styles.statLabel}>Toplam Destek</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>%0.79</Text>
                            <Text style={styles.statLabel}>Kredi Oranı</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>18 Ay</Text>
                            <Text style={styles.statLabel}>Teslim Hedefi</Text>
                        </View>
                    </View>

                    {/* Steps List */}
                    <Text style={styles.sectionTitle}>DÖNÜŞÜM SÜRECİ ADIMLARI</Text>

                    {TRANSFORMATION_STEPS.map((step, index) => (
                        <TouchableOpacity
                            key={step.id}
                            style={styles.stepCard}
                            activeOpacity={0.9}
                            onPress={() => handleAction(step)}
                        >
                            <View style={styles.stepHeader}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name={step.icon} size={24} color="#FFD700" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                                </View>
                                <View style={styles.stepNumberBox}>
                                    <Text style={styles.stepNumber}>{step.id}</Text>
                                </View>
                            </View>

                            <Text style={styles.stepDesc}>{step.desc}</Text>

                            <View style={styles.stepFooter}>
                                <Text style={styles.actionText}>{step.action}</Text>
                                <Ionicons name="arrow-forward-circle" size={24} color="#FFD700" />
                            </View>
                        </TouchableOpacity>
                    ))}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Image source={{ uri: selectedItem?.image }} style={styles.modalImage} />
                            <Text style={styles.modalDescText}>{selectedItem?.desc}</Text>

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={24} color="#FFD700" />
                                <Text style={styles.infoText}>
                                    Bu aşamada uzman ekiplerimiz, mevzuata uygun şekilde tüm resmi süreçleri sizin adınıza yönetmektedir.
                                </Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.applyBtn} onPress={handleApplication}>
                            <Text style={styles.applyBtnText}>BAŞVURU OLUŞTUR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    backBtn: { padding: 8, backgroundColor: '#222', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: '900', textAlign: 'center' },
    headerSubtitle: { color: '#666', fontSize: 10, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },

    scrollContent: { padding: 20 },

    heroCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    heroImage: { width: '100%', height: '100%' },
    heroTextContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 5 },
    heroDesc: { color: '#ccc', fontSize: 14 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#222' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#666', fontSize: 11, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#333' },

    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15, letterSpacing: 0.5 },

    stepCard: { backgroundColor: '#161616', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
    stepTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    stepSubtitle: { color: '#888', fontSize: 12 },
    stepNumberBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    stepNumber: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    stepDesc: { color: '#aaa', fontSize: 13, lineHeight: 18, marginBottom: 15 },
    stepFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 },
    actionText: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginRight: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    modalImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },
    modalDescText: { color: '#ccc', fontSize: 15, lineHeight: 22, marginBottom: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: 15, borderRadius: 12, alignItems: 'center', gap: 12, marginBottom: 20 },
    infoText: { color: '#FFD700', flex: 1, fontSize: 13 },
    applyBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center' },
    applyBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});
