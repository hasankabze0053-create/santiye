import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

// 15 KATEGORİLİ DEV MARKET YAPISI
const MARKET_CATEGORIES = [
    {
        id: '1',
        title: 'KABA İNŞAAT VE YAPI ELEMANLARI',
        subtitle: 'Çimento, Demir, Tuğla',
        icon: 'wall',
        items: [
            { name: 'Gri Portland Çimento', spec: '50 Kg Torba', price: '₺180' },
            { name: 'Beyaz Çimento', spec: '25 Kg Torba', price: '₺220' },
            { name: 'Sönmüş Kireç', spec: 'Torba', price: '₺90' },
            { name: 'İnşaat Demiri Ø8', spec: 'Ton', price: '₺24.500' },
            { name: 'İnşaat Demiri Ø12-Ø32', spec: 'Ton', price: '₺24.000' },
            { name: 'Çelik Hasır', spec: 'Adet', price: '₺1.200' },
            { name: 'Kutu Profil', spec: '6m Boy', price: '₺850' },
            { name: 'Yığma Tuğla', spec: 'Adet', price: '₺8.50' },
            { name: 'Gazbeton (Ytong)', spec: 'Adet', price: '₺65' },
            { name: 'Sıva Kumu', spec: 'Ton', price: '₺450' },
            { name: 'Mıcır', spec: 'Ton', price: '₺400' },
        ]
    },
    {
        id: '2',
        title: 'YAPI KİMYASALLARI VE GÜÇLENDİRME',
        subtitle: 'Tamir, Ankraj, Zemin',
        icon: 'flask',
        items: [
            { name: 'Karbon Elyaf (FRP)', spec: 'm²', price: '€45' },
            { name: 'Epoksi Ankraj Kartuşu', spec: '345ml', price: '₺450' },
            { name: 'Grout Harcı', spec: '25 Kg', price: '₺320' },
            { name: 'Yapısal Tamir Harcı', spec: '25 Kg', price: '₺280' },
            { name: 'Seramik Yapıştırıcı (C2)', spec: '25 Kg', price: '₺180' },
            { name: 'Yüzey Sertleştirici', spec: '25 Kg', price: '₺150' },
            { name: 'Self-Leveling Şap', spec: '25 Kg', price: '₺600' },
        ]
    },
    {
        id: '3',
        title: 'İZOLASYON VE SU YALITIMI',
        subtitle: 'Mantolama, Membran',
        icon: 'shield-home',
        items: [
            { name: 'Bitüm Sürme Yalıtım', spec: 'Teneke (18kg)', price: '₺1.200' },
            { name: 'Arduvazlı Membran', spec: 'Top (10m²)', price: '₺850' },
            { name: 'XPS Köpük (Mavi)', spec: 'Paket', price: '₺1.100' },
            { name: 'Taşyünü Levha', spec: 'Paket', price: '₺950' },
            { name: 'Mantolama Paketi', spec: 'm²', price: '₺450' },
            { name: 'Su Tutucu Bant', spec: 'Metre', price: '₺120' },
        ]
    },
    {
        id: '4',
        title: 'KALIP, İSKELE VE ŞANTİYE',
        subtitle: 'Plywood, Güvenlik',
        icon: 'scaffold-tower', // Using custom icon name if available or generic
        items: [
            { name: 'Plywood (Huş)', spec: 'Plaka', price: '₺2.800' },
            { name: 'OSB-3 Levha', spec: 'Plaka', price: '₺450' },
            { name: 'Kalıp Yağı', spec: '30 Lt', price: '₺900' },
            { name: 'Tayrot Mili', spec: 'Adet', price: '₺150' },
            { name: 'H Tipi İskele', spec: 'm²', price: 'Teklif Al' },
            { name: 'İnşaat Bareti', spec: 'Adet', price: '₺85' },
            { name: 'Çelik Burunlu Ayakkabı', spec: 'Çift', price: '₺650' },
        ]
    },
    {
        id: '5',
        title: 'ÇATI VE DIŞ CEPHE',
        subtitle: 'Kiremit, Oluk, Siding',
        icon: 'home-roof',
        items: [
            { name: 'Kiremit (Marsilya)', spec: 'Adet', price: '₺22' },
            { name: 'Shingle', spec: 'Paket', price: '₺1.400' },
            { name: 'Sandviç Panel', spec: 'm²', price: '₺850' },
            { name: 'PVC Yağmur Oluğu', spec: '4m Boy', price: '₺180' },
            { name: 'Fibercement Levha', spec: 'Plaka', price: '₺750' },
        ]
    },
    {
        id: '6',
        title: 'TESİSAT VE MEKANİK',
        subtitle: 'Boru, Kombi, Vana',
        icon: 'pipe',
        items: [
            { name: 'PPRC Boru (20mm)', spec: '4m Boy', price: '₺65' },
            { name: 'Pimaş Boru (100mm)', spec: '3m Boy', price: '₺150' },
            { name: 'Yoğuşmalı Kombi', spec: 'Adet', price: '₺24.000' },
            { name: 'Panel Radyatör (600x1000)', spec: 'Adet', price: '₺2.200' },
            { name: 'Küresel Vana (1")', spec: 'Adet', price: '₺250' },
        ]
    },
    {
        id: '7',
        title: 'ELEKTRİK VE AYDINLATMA',
        subtitle: 'Kablo, Pano, LED',
        icon: 'lightning-bolt',
        items: [
            { name: 'Antigron Kablo 3x2.5', spec: '100m Top', price: '₺3.500' },
            { name: 'Otomatik Sigorta', spec: 'Adet', price: '₺120' },
            { name: 'Kaçak Akım Rölesi', spec: 'Adet', price: '₺850' },
            { name: 'Sıva Altı Priz', spec: 'Adet', price: '₺65' },
            { name: 'LED Ampul (10W)', spec: 'Adet', price: '₺45' },
            { name: 'Şerit LED', spec: '5m', price: '₺150' },
        ]
    },
    {
        id: '8',
        title: 'AKILLI EV VE TEKNOLOJİ',
        subtitle: 'Kamera, Alarm, Otomasyon',
        icon: 'home-automation', // or 'cctv'
        items: [
            { name: 'Akıllı Kapı Kilidi', spec: 'Adet', price: '₺4.500' },
            { name: 'IP Kamera Seti (4\'lü)', spec: 'Set', price: '₺8.500' },
            { name: 'Görüntülü Diyafon', spec: 'Adet', price: '₺3.200' },
            { name: 'Akıllı Termostat', spec: 'Adet', price: '₺2.800' },
        ]
    },
    {
        id: '9',
        title: 'KURU YAPI VE BOYA',
        subtitle: 'Alçıpan, Astar, Boya',
        icon: 'format-paint',
        items: [
            { name: 'Beyaz Alçıpan', spec: 'Plaka', price: '₺140' },
            { name: 'Yeşil Alçıpan (Suya D.)', spec: 'Plaka', price: '₺165' },
            { name: 'Tavan U Profili', spec: '3m', price: '₺45' },
            { name: 'İç Cephe Boyası', spec: '15 Lt', price: '₺1.800' },
            { name: 'Saten Alçı', spec: 'Torba', price: '₺140' },
        ]
    },
    {
        id: '10',
        title: 'ZEMİN VE DUVAR KAPLAMALARI',
        subtitle: 'Parke, Seramik, Mermer',
        icon: 'floor-plan',
        items: [
            { name: 'Laminat Parke 8mm', spec: 'm²', price: '₺320' },
            { name: 'Granit Seramik 60x120', spec: 'm²', price: '₺450' },
            { name: 'Duvar Seramiği', spec: 'm²', price: '₺280' },
            { name: 'Derz Dolgu', spec: '20 Kg', price: '₺220' },
        ]
    },
    {
        id: '11',
        title: 'HIRDAVAT VE EL ALETLERİ',
        subtitle: 'Matkap, Vida, Dübel',
        icon: 'hammer',
        items: [
            { name: 'Kırıcı-Delici Matkap', spec: 'Pro', price: '₺4.500' },
            { name: 'Avuç Taşlama', spec: '115mm', price: '₺2.200' },
            { name: 'Akülü Vidalama', spec: '18V', price: '₺3.800' },
            { name: 'Sunta Vidası Kutusu', spec: '1000 Adet', price: '₺350' },
            { name: 'Silikon Tabancası', spec: 'Adet', price: '₺85' },
        ]
    },
    {
        id: '12',
        title: 'KAPI, PENCERE VE DOĞRAMA',
        subtitle: 'Çelik Kapı, PVC',
        icon: 'door',
        items: [
            { name: 'Çelik Kapı (Lüks)', spec: 'Adet', price: '₺12.000' },
            { name: 'Amerikan Panel Kapı', spec: 'Adet', price: '₺2.400' },
            { name: 'PVC Pencere (120x120)', spec: 'Adet', price: '₺3.500' },
            { name: 'Kapı Kolu (Rozetli)', spec: 'Takım', price: '₺250' },
        ]
    },
    {
        id: '13',
        title: 'MUTFAK, BANYO VE VİTRİFİYE',
        subtitle: 'Klozet, Batarya, Dolap',
        icon: 'toilet',
        items: [
            { name: 'Asma Klozet Seti', spec: 'Tam Takım', price: '₺4.500' },
            { name: 'Banyo Dolabı (80cm)', spec: 'Alt+Üst', price: '₺3.800' },
            { name: 'Mutfak Bataryası', spec: 'Krom', price: '₺1.200' },
            { name: 'Duşakabin (90x90)', spec: 'Temperli', price: '₺3.200' },
        ]
    },
    {
        id: '14',
        title: 'PEYZAJ, HAVUZ VE ÇEVRE',
        subtitle: 'Kilit Taşı, Çit, Havuz',
        icon: 'flower',
        items: [
            { name: 'Kilit Parke Taşı', spec: 'm²', price: '₺180' },
            { name: 'Panel Çit', spec: 'm²', price: '₺320' },
            { name: 'Havuz Pompası', spec: '1.5 HP', price: '₺8.500' },
            { name: 'Klor (Tablet)', spec: '10 Kg', price: '₺1.400' },
        ]
    },
    {
        id: '15',
        title: 'ENERJİ SİSTEMLERİ',
        subtitle: 'Solar Panel, Jeneratör',
        icon: 'solar-power',
        items: [
            { name: 'Monokristal Solar Panel', spec: '450W', price: '$140' },
            { name: 'Solar İnverter', spec: '5KW', price: '₺22.000' },
            { name: 'Benzinli Jeneratör', spec: '3.5 kVA', price: '₺12.000' },
            { name: 'Kesintisiz Güç (UPS)', spec: '1 kVA', price: '₺3.500' },
        ]
    },
];

export default function MarketScreen() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setViewMode('detail');
    };

    const handleAddToCart = (item) => {
        Alert.alert("Sepete Eklendi", `${item.name} (${item.spec}) sepete eklendi.`);
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
                    ) : <View style={{ width: 40 }} />} // Spacer

                    <Text style={styles.headerTitle}>
                        {viewMode === 'list' ? 'İNŞAAT MARKET' : selectedCategory?.title.split(' ')[0] + '...'}
                    </Text>

                    <TouchableOpacity style={styles.cartButton}>
                        <Ionicons name="cart" size={24} color="#FFD700" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {viewMode === 'list' && (
                        <View style={styles.listContainer}>
                            {MARKET_CATEGORIES.map((cat) => (
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
                                            {cat.subtitle} • {cat.items.length} Ürün
                                        </Text>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {viewMode === 'detail' && selectedCategory && (
                        <View style={styles.detailContainer}>
                            <Text style={styles.categoryHeader}>{selectedCategory.title}</Text>
                            {selectedCategory.items.map((item, idx) => (
                                <View key={idx} style={styles.itemCard}>
                                    <View style={styles.itemInfo}>
                                        <View style={styles.itemIconBox}>
                                            <MaterialCommunityIcons name="tag" size={20} color="#FFD700" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemSpec}>{item.spec}</Text>
                                        </View>
                                        <Text style={styles.itemPrice}>{item.price}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.addBtn}
                                        onPress={() => handleAddToCart(item)}
                                    >
                                        <Text style={styles.addText}>SEPETE EKLE</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    backButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    cartButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    badge: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4 },
    scrollContent: { paddingBottom: 40 },

    // List View
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
    categoryHeader: { color: '#ccc', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
    itemCard: {
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    itemInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    itemIconBox: {
        width: 32,
        height: 32,
        backgroundColor: '#222',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    itemName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    itemSpec: { color: '#666', fontSize: 12, marginTop: 2 },
    itemPrice: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },

    addBtn: {
        backgroundColor: '#333',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },
    addText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
});
