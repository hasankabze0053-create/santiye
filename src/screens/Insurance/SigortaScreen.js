import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INSURANCE_DATA = [
    {
        title: '1. ARSA VE PROJE AŞAMASI',
        subtitle: 'Kazma Vurulmadan Önce',
        image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=400&auto=format&fit=crop', // Plan/Project
        items: [
            {
                title: 'Mesleki Sorumluluk Sigortası',
                desc: 'Mimar/Mühendis çizim ve hesap hatalarına karşı (Binanın yamuk olması, statik hata vb).',
            },
            {
                title: 'Arsa Sahibi Mali Mesuliyet',
                desc: 'Boş arsada olabilecek kazalar (Kuyuya düşme, istinat çökmesi vb) için arsa sahibini korur.',
            }
        ]
    },
    {
        title: '2. İNŞAAT VE YAPIM AŞAMASI',
        subtitle: 'Şantiye Dönemi (En Riskli)',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop', // Construction Site
        items: [
            {
                title: 'İnşaat All Risk (CAR)',
                desc: 'Şantiyenin Kaskosu. Deprem, sel, yangın, hırsızlık, sabotaj gibi her şeyi kapsar.',
            },
            {
                title: 'Montaj All Risk (EAR)',
                desc: 'Mekanik/Elektrik aksamların (asansör, tesisat) montaj hataları ve kazalarını kapsar.',
            },
            {
                title: 'İşveren Mali Mesuliyet',
                desc: 'İşçilerin başına gelebilecek kazalarda (ölüm, yaralanma) işverenin hukuki korumasıdır.',
            },
            {
                title: 'Şahıs Mali Mesuliyet',
                desc: 'İnşaatın çevreye (yandaki bina, geçen araç) verdiği zararları öder.',
            },
            {
                title: 'Makine Kırılması',
                desc: 'Pahalı iş makinelerinin (Vinç, kepçe) bozulma veya kırılmasını karşılar.',
            },
            {
                title: 'Emtia Nakliyat',
                desc: 'Malzemelerin (seramik, demir) yolda başına gelebilecek kaza hasarlarını öder.',
            }
        ]
    },
    {
        title: '3. BİTİM VE İSKAN SONRASI',
        subtitle: 'Kullanım Dönemi',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop', // Finished Building
        items: [
            {
                title: 'DASK (Zorunlu Deprem)',
                desc: 'Binanın kaba yapısı için devletin zorunlu tuttuğu sigorta.',
            },
            {
                title: 'Konut Paket Sigortası',
                desc: 'Evdeki eşya, elektronik, yangın ve su basmasını kapsar.',
            },
            {
                title: 'İşyeri Paket & Emtia',
                desc: 'Dükkan demirbaşı, mal stoku, kasa parası ve hırsızlığa karşı koruma.',
            },
            {
                title: 'İş Durması / Kar Kaybı',
                desc: 'Dükkanın kapalı kaldığı süredeki gelir kaybını ve maaşları öder.',
            },
            {
                title: 'Komşuluk Mali Mesuliyet',
                desc: 'Sizin evden komşuya sızan su vb. zararları karşılar.',
            },
            {
                title: 'Ortak Alan & Yönetici',
                desc: 'Site ortak alanları ve yöneticinin kararlarına karşı koruma.',
            }
        ]
    },
    {
        title: '4. ÖZEL DURUMLAR',
        subtitle: 'Ekstra Korumalar',
        image: 'https://images.unsplash.com/photo-1626265774643-f194303328ce?q=80&w=400&auto=format&fit=crop', // Security
        items: [
            {
                title: 'Terör & Kötü Niyet',
                desc: 'Grev, lokavt, terör olaylarında binayı korur.',
            },
            {
                title: 'Kira Kaybı',
                desc: 'Ev tadilattayken veya kiracı yokken oluşan kira gelir kaybını öder.',
            }
        ]
    }
];

export default function SigortaScreen({ navigation }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleGetQuote = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Dark Gradient Background */}
            <LinearGradient
                colors={['#000000', '#111111', '#1a1a1a']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SİGORTA İŞLEMLERİ</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.introText}>
                        Projenizin her aşamasında güvende olun. İhtiyacınız olan sigorta türünü seçin, anında teklif alın.
                    </Text>

                    {INSURANCE_DATA.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Image source={{ uri: section.image }} style={styles.sectionImage} />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.imageOverlay}
                                />
                                <View style={styles.sectionTitleContainer}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                                </View>
                            </View>

                            <View style={styles.itemsContainer}>
                                {section.items.map((item, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.card}
                                        onPress={() => handleGetQuote(item)}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={styles.iconContainer}>
                                                <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.cardTitle}>{item.title}</Text>
                                                <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="#666" />
                                        </View>
                                        <View style={styles.quoteButton}>
                                            <Text style={styles.quoteButtonText}>Fiyat Al</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Quote Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Teklif İste</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            {selectedItem && (
                                <View style={styles.modalBody}>
                                    <Text style={styles.modalSubtitle}>{selectedItem.title}</Text>
                                    <Text style={styles.modalDesc}>{selectedItem.desc}</Text>

                                    <View style={styles.divider} />

                                    <Text style={styles.modalInfo}>
                                        Müşteri temsilcimiz en kısa sürede sizi arayarak projenize özel fiyat teklifini sunacaktır.
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    Alert.alert("Başarılı", "Teklif talebiniz alındı! Uzmanlarımız sizi arayacak.");
                                }}
                            >
                                <Text style={styles.submitButtonText}>Talep Gönder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 40 },
    introText: { color: '#ccc', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },

    section: { marginBottom: 30 },
    sectionHeader: { height: 120, justifyContent: 'flex-end', marginBottom: 10 },
    sectionImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    imageOverlay: { ...StyleSheet.absoluteFillObject },
    sectionTitleContainer: { padding: 15 },
    sectionTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    sectionSubtitle: { color: '#fff', fontSize: 14, opacity: 0.9 },

    itemsContainer: { paddingHorizontal: 15 },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    iconContainer: { width: 40, alignItems: 'center' },
    textContainer: { flex: 1, paddingHorizontal: 10 },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { color: '#888', fontSize: 13 },

    quoteButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    quoteButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14
    },

    // Modal
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    modalBody: { marginBottom: 20 },
    modalSubtitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
    modalDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    modalInfo: { fontSize: 14, color: '#444', fontStyle: 'italic' },
    submitButton: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center' },
    submitButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
