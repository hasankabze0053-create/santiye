import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

// 1. Full Detailed Category Structure (Restored)
const RENTAL_CATEGORIES = [
    {
        id: '1', 
        title: 'KULE VE DİKEY KALDIRMA GRUBU',
        subtitle: 'Vinçler',
        icon: 'tower-beach', 
        items: [
            { name: 'Sabit Kule Vinç', type: 'Yüksek Katlı' },
            { name: 'Mobil Kule Vinç (Self-Erecting)', type: 'Kendi Kurulan' },
            { name: 'Gırgır Vinç', type: 'Çatı Tipi' },
            { name: 'Dış Cephe Asansörü (Alimak)', type: 'Personel/Yük' },
            { name: 'Yük Asansörü (İnşaat Vinci)', type: 'Sadece Malzeme' },
        ]
    },
    {
        id: '2',
        title: 'MOBİL KALDIRMA VE YÜKLEME',
        subtitle: 'Sahada Hareketli',
        icon: 'tow-truck',
        items: [
            { name: 'Mobil Vinç (Lastikli)', type: 'Şehir İçi' },
            { name: 'Arazi Tipi Mobil Vinç (All Terrain)', type: 'Zorlu Arazi' },
            { name: 'Hiyap Vinç (Kamyon Üstü)', type: 'Nakliye/Montaj' },
            { name: 'Paletli Vinç', type: 'Ağır Tonaj/Bataklık' },
            { name: 'Örümcek Vinç (Mini Vinç)', type: 'Dar Alan' },
            { name: 'Telehandler (Manitou)', type: 'Teleskopik Yükleyici' },
            { name: 'Roto Telehandler (Dönerli)', type: '360 Derece' },
        ]
    },
    {
        id: '3',
        title: 'HAFRİYAT VE KAZI GRUBU',
        subtitle: 'Ekskavatörler',
        icon: 'excavator',
        items: [
            { name: 'Paletli Ekskavatör (Mini 1-5 Ton)', type: 'Peyzaj' },
            { name: 'Paletli Ekskavatör (Midi 6-14 Ton)', type: 'Şehir İçi' },
            { name: 'Paletli Ekskavatör (Standart 20-30 Ton)', type: 'Hafriyat' },
            { name: 'Paletli Ekskavatör (Ağır 40+ Ton)', type: 'Taş Ocağı' },
            { name: 'Yıkım Ekskavatörü (High Reach)', type: 'Yüksek Yıkım' },
            { name: 'Lastikli Ekskavatör', type: 'Mobil Kazı' },
            { name: 'Beko Loder (JCB)', type: 'Kazıcı Yükleyici' },
        ]
    },
    {
        id: '4',
        title: 'YÜKLEME VE SERİ ÇALIŞMA',
        subtitle: 'Loderler',
        icon: 'bulldozer',
        items: [
            { name: 'Lastikli Loder', type: 'Yükleyici' },
            { name: 'Paletli Loder', type: 'Zorlu Zemin' },
            { name: 'Mini Yükleyici (Bobcat)', type: 'Skid Steer' },
            { name: 'Paletli Mini Yükleyici', type: 'Paletli Bobcat' },
        ]
    },
    {
        id: '5',
        title: 'PERSONEL YÜKSELTİCİ (MANLİFT)',
        subtitle: 'Platformlar',
        icon: 'ladder',
        items: [
            { name: 'Makaslı Platform (Akülü)', type: 'İç Mekan' },
            { name: 'Makaslı Platform (Dizel)', type: 'Dış Mekan' },
            { name: 'Eklemli Platform (Bomlu)', type: 'Engelli Erişim' },
            { name: 'Teleskopik Platform', type: 'Düz Bomlu' },
            { name: 'Örümcek Platform', type: 'Hassas Zemin' },
            { name: 'Dikey Direk Platform', type: 'Dar Alan' },
            { name: 'Araç Üstü Sepetli Platform', type: 'Kamyonet Arkası' },
        ]
    },
    {
        id: '6',
        title: 'YOL, ASFALT VE SIKIŞTIRMA',
        subtitle: 'Silindirler',
        icon: 'road-variant',
        items: [
            { name: 'Greyder', type: 'Yol Tesviye' },
            { name: 'Dozer', type: 'Zemin Sıyırma' },
            { name: 'Toprak Silindiri', type: 'Zemin Sıkıştırma' },
            { name: 'Yama Silindiri', type: 'Çift Tamburlu' },
            { name: 'Keçi Ayağı Silindir', type: 'Killi Zemin' },
            { name: 'Lastik Tekerlekli Silindir (Vabıl)', type: 'Asfalt Yüzey' },
            { name: 'Finişer', type: 'Asfalt Serici' },
            { name: 'Asfalt Kazıyıcı (Freze)', type: 'Asfalt Tıraşlama' },
        ]
    },
    {
        id: '7',
        title: 'BETON TEKNOLOJİLERİ',
        subtitle: 'Pompa & Mikser',
        icon: 'truck-mixer',
        items: [
            { name: 'Mobil Beton Pompası', type: 'Bomlu' },
            { name: 'Sabit (Yer) Pompası', type: 'Yüksek Basınç' },
            { name: 'Transmikser', type: 'Beton Kamyonu' },
            { name: 'Beton Perdah (Helikopter)', type: 'Yüzey İşleme' },
            { name: 'Vibrasyonlu Mastar', type: 'Düzeltme' },
        ]
    },
    {
        id: '8',
        title: 'ZEMİN GÜÇLENDİRME',
        subtitle: 'Delgi & Kazık',
        icon: 'screw-machine-flat-top',
        items: [
            { name: 'Fore Kazık Makinesi', type: 'Büyük Çaplı' },
            { name: 'Mini Kazık Makinesi', type: 'Güçlendirme' },
            { name: 'Ankraj Makinesi', type: 'Yatay Delgi' },
            { name: 'Jet Grout', type: 'Enjeksiyon' },
        ]
    },
    {
        id: '9',
        title: 'ENERJİ VE DESTEK',
        subtitle: 'Jeneratörler',
        icon: 'lightning-bolt',
        items: [
            { name: 'Mobil Jeneratör (Dizel)', type: 'Şantiye Elektriği' },
            { name: 'Portatif Jeneratör', type: 'El Aletleri' },
            { name: 'Mobil Kompresör', type: 'Hava Kaynağı' },
            { name: 'Işık Kulesi', type: 'Gece Çalışması' },
            { name: 'Dalgıç Pompa', type: 'Su Tahliye' },
            { name: 'Şantiye Konteyneri', type: 'Ofis/Yatakhane' },
        ]
    },
    {
        id: '10',
        title: 'NAKLİYE VE LOJİSTİK',
        subtitle: 'Tır & Kamyon',
        icon: 'truck',
        items: [
            { name: 'Damperli Kamyon', type: 'Hafriyat' },
            { name: 'Lowbed (Tır)', type: 'Makine Nakliyesi' },
            { name: 'Su Tankeri (Arazöz)', type: 'Su İkmali' },
        ]
    },
    {
        id: '11',
        title: 'MAKİNE ATAŞMANLARI',
        subtitle: 'Kırıcı & Kova',
        icon: 'tools',
        items: [
            { name: 'Hidrolik Kırıcı', type: 'Kırım Ucu' },
            { name: 'Kova (Bucket)', type: 'Kazı/Tesviye' },
            { name: 'Polip (Ahtapot)', type: 'Hurda/Taş' },
            { name: 'Burgu', type: 'Delgi Ucu' },
            { name: 'Ripper', type: 'Kedi Pençesi' },
            { name: 'Forklift Çatalı', type: 'Palet Taşıma' },
        ]
    },
];

export default function RentalScreen() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const handleRentRequest = (item) => {
        Alert.alert("Talep Alındı", `${item.name} için kiralama ekibimiz sizi arayacak.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={styles.header}>
                    {viewMode === 'detail' ? (
                        <TouchableOpacity onPress={() => setViewMode('list')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}
                    
                    <Text style={styles.headerTitle}>
                        {viewMode === 'list' ? 'MAKİNE PARKI (KİRALAMA)' : selectedCategory?.title}
                    </Text>
                    
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {viewMode === 'list' && (
                        <View style={styles.listContainer}>
                            {RENTAL_CATEGORIES.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={styles.listItem}
                                    onPress={() => handleCategorySelect(cat)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name={cat.icon} size={30} color="#000" />
                                    </View>
                                    
                                    <View style={styles.textContainer}>
                                        <Text style={styles.listTitle}>{cat.title}</Text>
                                        <Text style={styles.listSubtitle}>
                                            {cat.subtitle} • {cat.items.length} Model
                                        </Text>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            {selectedCategory.items.map((item, idx) => (
                                <View key={idx} style={styles.itemCard}>
                                    <View style={styles.itemInfo}>
                                        <View style={styles.itemIconBox}>
                                            <MaterialCommunityIcons name={selectedCategory.icon} size={24} color="#FFD700" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemType}>{item.type}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.rentButton}
                                        onPress={() => handleRentRequest(item)}
                                    >
                                        <Text style={styles.rentText}>FİYAT AL</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                </ScrollView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 15, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    scrollContent: { paddingBottom: 40 },

    // List View (New Design)
    listContainer: { paddingHorizontal: 20 },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFD700', // Yellow
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    textContainer: { flex: 1 },
    listTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    listSubtitle: { color: '#888', fontSize: 11, marginTop: 3 },

    // Detail View
    detailContainer: { padding: 20 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    itemIconBox: { 
        width: 36, 
        height: 36, 
        backgroundColor: '#222', 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: 12
    },
    itemName: { color: '#fff', fontSize: 13, fontWeight: 'bold', flexWrap: 'wrap' },
    itemType: { color: '#666', fontSize: 11, marginTop: 2 },
    rentButton: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6
    },
    rentText: { color: '#000', fontWeight: 'bold', fontSize: 11 },
});
