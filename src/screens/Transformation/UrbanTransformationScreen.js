import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRANSFORMATION_STEPS = [
    {
        id: 1,
        title: 'RİSKLİ YAPI TESPİTİ',
        subtitle: 'Binanız Güvenli mi?',
        icon: 'home-alert',
        desc: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı lisanslı kuruluşlarca binanızın deprem risk raporunun hazırlanması.',
        image: 'https://images.unsplash.com/photo-1590674899505-1c5c417b1bda?q=80&w=400&auto=format&fit=crop',
        action: 'Tespiti Başlat'
    },
    {
        id: 2,
        title: 'YARISI BİZDEN',
        subtitle: 'Devlet Destek Kampanyası',
        icon: 'hand-heart', // customized icon
        desc: 'Hak sahiplerine 1.75 Milyon TL\'ye kadar destek! 875 Bin TL hibe, 875 Bin TL kredi ve 125 Bin TL tahliye desteği.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop',
        action: 'Başvuru Bilgisi'
    },
    {
        id: 3,
        title: 'UZLAŞMA & PROTOKOL',
        subtitle: '3/2 Çoğunluk Kararı',
        icon: 'file-sign',
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

// --- YARISI BİZDEN KAMPANYASI DATASI ---
const YARISI_BIZDEN_FAQ = [
    { q: '1-Kimler faydalanabilir?', a: 'İstanbul’un 39 ilçesinde riskli yapı sahiplerinin tümü kampanyadan faydalanabilir.' },
    { q: '2-Proje ön şartları nelerdir?', a: 'Yeni projedeki yapı (otopark ve sığınak hariç), eski yapının bir buçuk katı büyüklüğünü geçmemeli.' },
    { q: '3-“Ev/iş yerimin riskli olup olmadığını nasıl öğrenebilirim?”', a: 'Bakanlığa bağlı lisanslı kuruluşlara karot örneği baktırılarak risk durumu tespit edilir.' },
    { q: '4-Yarısı Bizden’e nasıl başvuru yapılır?', a: 'e-Devlet başvurusuna gerek duyulmaz. Kat irtifakı kurulduktan sonra hak sahibi tespiti yaptırmak üzere ilçe belediyesine başvurur. Bakanlıkça belirlenen randevu gününde hak sahibi ile hibe taahhütnamesi ve kredi sözleşmesi imzalanır.' },
    { q: '5-TOKİ ve Emlak Konut inşaat desteği veriyor mu?', a: 'Bina yerine alan/ada bazlı site benzeri büyük dönüşümlerde tam uzlaşma sağlanması halinde Kentsel Dönüşüm Başkanlığı, TOKİ ve Emlak Konut iş birliği ile destek sağlanır.' },
    { q: '6-Alan bazlı büyük dönüşümde hangi kolaylıklar sağlanır?', a: '875 bin TL’lik hibe, TOKİ ya da Emlak Konut ile de inşa desteği verilir.' },
    { q: '7-Alan bazlı dönüşümde geri ödeme nasıl yapılır?', a: 'Hibe tutarı bina maliyetinden düşürülür arta kalan borç ise uzun vadeli uygun ödeme koşullarıyla taksitlendirilir.' },
    { q: '8-Yüklenici firma ile dönüşümde her konut/iş yeri için ne kadar destek verilir?', a: 'Hak sahibinin bir konutu için 875 bin TL hibe ve 875 bin TL kredi, hak sahibinin bir dükkanı için 437 bin 500 TL hibe ve 437 bin 500 TL kredi.' },
    { q: '9-İlk konut/iş yeri için Yarısı Bizden desteği alan vatandaşlar diğer ev/ iş yerleri için de kampanyadan faydalanabilir mi?', a: 'Hak sahipleri bir konut için verilen 1 milyon 875 bin TL’lik desteğin ardından diğer her bir konutu için 1 milyon 750 bin TL kredi imkanından faydalanabilir. Bir iş yeri için 1 milyon TL dönüşüm desteğini alan hak sahibi diğer her bir dükkanı için ise 875 bin TL kredi desteğinden yararlanabilir.' },
    { q: '10-Ödeme hak sahibine mi yükleniciye mi yapılır?', a: 'Bina bazlı dönüşümde ödemeler hak sahipleri adına yükleniciye yapılır.' },
    { q: '11-Ödeme ne zaman ve nasıl yapılır?', a: 'İş başlayınca yüzde 30, taşıyıcı sistemin bitiminde yüzde 30, sıva aşamasında yüzde 30, yapı kullanım izin belgesi alındığında yüzde 10 oranında ödemeler yapılır.' },
    { q: '12-Tahliye/taşınma desteği ne kadar?', a: 'Tahliye desteği tek seferde 125 bin TL olarak ödenir.' },
    { q: '13-Tahliye desteğinden kiracılar da faydalanabilir mi?', a: 'Daire/iş yerinde oturan kiracıysa kiracıya, değilse ev sahibine ödenir.' },
    { q: '14-Otopark ve sığınak yapınca hak kaybı olur mu?', a: 'Otopark ve sığınak alanları inşaat alanı metrekaresinin dışında tutulur.' },
    { q: '15-Kredi geri ödemeleri ne zaman başlar?', a: 'Yapı ruhsatının alınmasından 2 yıl sonra başlar. 10 yıla kadar vade uygulanır. Ödemenin başladığı ilk yıl faiz uygulanmaz. Sonraki yıllar Tüketici Fiyat Endeksi (TÜFE) oranının yarısı kadar güncelleme yapılır.' },
    { q: '16-Kredi için gelir şartı aranır mı?', a: 'Hak sahiplerine kredi verilirken gelir ve kredi puanına bakılmaz.' }
];

// Expanded Faq Item Component
const FaqItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity style={styles.faqItem} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color="#FFD700" />
            </View>
            {expanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
        </TouchableOpacity>
    );
};

export default function UrbanTransformationScreen({ navigation }) {
    console.log("Urban Transformation Screen Loaded - Update Check");
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
    const [consultantQuery, setConsultantQuery] = useState('');

    const handleConsultantSubmit = () => {
        if (!consultantQuery.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen sorunuzu yazın.");
            return;
        }
        Alert.alert("İletildi", "Sorunuz uzmanlarımıza iletildi. En kısa sürede dönüş sağlanacaktır.");
        setConsultantQuery('');
    };

    const handleGetQuotes = () => {
        Alert.alert("Teklif Talebi", "Bölgenizdeki lisanslı müteahhit firmalara talebiniz iletiliyor.");
    };

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('ContractorProvider')}>
                            <MaterialCommunityIcons name="hard-hat" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>
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
                            <Text style={styles.statValue}>875.000₺</Text>
                            <Text style={styles.statLabel}>HİBE</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>875.000₺</Text>
                            <Text style={styles.statLabel}>KREDİ</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>18 Ay</Text>
                            <Text style={styles.statLabel}>Teslim Hedefi</Text>
                        </View>
                    </View>

                    {/* 1. SECTION: SMART CONSULTANT Q&A */}
                    <Text style={styles.sectionTitle}>KENTSEL DÖNÜŞÜM UZMANINA SOR</Text>
                    <View style={styles.consultantContainer}>
                        <TextInput
                            style={styles.consultantInput}
                            placeholder="Aklınıza takılan soruları buraya yazın..."
                            placeholderTextColor="#666"
                            multiline
                            value={consultantQuery}
                            onChangeText={setConsultantQuery}
                        />
                        <TouchableOpacity style={styles.consultantBtn} onPress={handleConsultantSubmit}>
                            <Text style={styles.consultantBtnText}>SOR</Text>
                            <Ionicons name="send" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. SECTION: CONSTRUCTION QUOTES */}
                    <TouchableOpacity style={styles.quoteCard} activeOpacity={0.9} onPress={handleGetQuotes}>
                        <LinearGradient
                            colors={['#FFD700', '#FF9100']}
                            style={styles.quoteGradient}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <View>
                                <Text style={styles.quoteTitle}>İNŞAAT FİRMALARINDAN TEKLİF AL</Text>
                                <Text style={styles.quoteSubtitle}>Lisanslı firmalardan en iyi teklifleri topla.</Text>
                            </View>
                            <MaterialCommunityIcons name="briefcase-search" size={32} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>

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

                    {/* 3. SECTION: YARISI BİZDEN CAMPAIGN DETAILS */}
                    <View style={styles.campaignSection}>
                        <View style={styles.campaignHeaderBox}>
                            <MaterialCommunityIcons name="handshake" size={28} color="#FFD700" />
                            <Text style={styles.campaignTitle}>İSTANBUL İÇİN YARISI BİZDEN KAMPANYASI</Text>
                        </View>
                        <Text style={styles.campaignSubtitle}>Sıkça Sorulan Sorular ve Detaylar</Text>

                        <View style={styles.faqContainer}>
                            {YARISI_BIZDEN_FAQ.map((item, index) => (
                                <FaqItem key={index} item={item} />
                            ))}
                        </View>
                    </View>
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

    applyBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    // Consultant Styles
    consultantContainer: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, padding: 5, marginBottom: 25, borderWidth: 1, borderColor: '#333' },
    consultantInput: { flex: 1, color: '#fff', padding: 15, fontSize: 14, minHeight: 50 },
    consultantBtn: { backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 6, margin: 5 },
    consultantBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

    // Quote Card Styles
    quoteCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 30, height: 90 },
    quoteGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    quoteTitle: { color: '#000', fontSize: 15, fontWeight: '900', marginBottom: 2 },
    quoteSubtitle: { color: '#222', fontSize: 12, fontWeight: '500' },

    // Campaign & FAQ Styles
    campaignSection: { marginTop: 10, paddingBottom: 20 },
    campaignHeaderBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
    campaignTitle: { color: '#FFD700', fontSize: 16, fontWeight: '900', flex: 1, lineHeight: 22 },
    campaignSubtitle: { color: '#666', fontSize: 12, marginBottom: 20, marginLeft: 38 },
    faqContainer: { gap: 10 },
    faqItem: { backgroundColor: '#161616', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    faqQuestion: { color: '#fff', fontSize: 13, fontWeight: 'bold', flex: 1, lineHeight: 20 },
    faqAnswer: { color: '#aaa', fontSize: 13, marginTop: 10, lineHeight: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
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
    }
});
