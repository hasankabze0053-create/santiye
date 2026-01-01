import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellerStoreScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { sellerName, rating, location, isRental } = route.params || { sellerName: 'Mağaza', rating: '4.8', location: 'İstanbul', isRental: false };

    // Mock Rental Machines
    const rentalMachines = [
        { id: '1', name: 'Mobil Vinç 30 Ton (Liebherr)', price: '6.500 ₺ / Gün', unit: 'Saatlik: 850 ₺', image: 'https://images.unsplash.com/photo-1579623862660-3162b7571343?q=80&w=400' },
        { id: '2', name: 'Makaslı Platform (Genie)', price: '2.500 ₺ / Gün', unit: 'Saatlik: 400 ₺', image: 'https://images.unsplash.com/photo-1519003300449-424ad9e12435?q=80&w=400' },
        { id: '3', name: 'JCB Beko Loder 3CX', price: '4.500 ₺ / Gün', unit: 'Saatlik: 600 ₺', image: 'https://images.unsplash.com/photo-1550953930-a9cb579aa32a?q=80&w=400' },
    ];

    // Mock Products for this Seller
    const marketProducts = [
        { id: '1', name: 'Nervürlü İnşaat Demiri Ø12', price: '₺24.500', unit: 'Ton', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400' },
        { id: '2', name: 'Çelik Hasır Q188', price: '₺1.450', unit: 'Adet', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400' },
        { id: '3', name: 'İnşaat Çivisi (5kg)', price: '₺120', unit: 'Kutu', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400' },
        { id: '4', name: 'Bağlama Teli', price: '₺850', unit: 'Rulo', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=400' },
    ];

    const [products, setProducts] = useState(isRental ? rentalMachines : marketProducts);

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{item.price}</Text>
                </View>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productUnit}>{isRental ? item.unit : item.unit + ' Fiyatı'}</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>{isRental ? 'KİRALA' : 'SEPETE EKLE'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <LinearGradient colors={['#000', '#111']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Store Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isRental ? 'FİRMA PROFİLİ' : 'MAĞAZA PROFİLİ'}</Text>
                    <TouchableOpacity style={styles.moreBtn}>
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Seller Profile Banner */}
                <View style={styles.profileBanner}>
                    <LinearGradient colors={['#1A1A1A', '#000']} style={StyleSheet.absoluteFillObject} />
                    <View style={styles.profileContent}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{sellerName.substring(0, 1)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.sellerName}>{sellerName}</Text>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="#4ADE80" />
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Ionicons name="star" size={12} color="#D4AF37" />
                                    <Text style={styles.statText}>{rating}</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.stat}>
                                    <Ionicons name="location-outline" size={12} color="#888" />
                                    <Text style={styles.statText}>{location || 'Türkiye, İst'}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.followBtn}>
                            <Text style={styles.followBtnText}>Takip Et</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product List */}
                <View style={styles.productListContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{isRental ? 'Kiralık Makine Parkı' : 'Tüm Ürünler'}</Text>
                        <Text style={styles.productCount}>{products.length} Ürün</Text>
                    </View>

                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { padding: 8 },
    headerTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    moreBtn: { padding: 8 },

    profileBanner: { margin: 20, padding: 20, borderRadius: 16, backgroundColor: '#111', borderWidth: 1, borderColor: '#333' },
    profileContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#D4AF37' },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: '#D4AF37' },
    sellerName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { color: '#ccc', fontSize: 12 },
    statDivider: { width: 1, height: 12, backgroundColor: '#444' },
    followBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#D4AF37', borderRadius: 20 },
    followBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    productListContainer: { flex: 1, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37' },
    productCount: { color: '#666', fontSize: 12 },

    productCard: { width: '48%', backgroundColor: '#1A1A1A', borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    imageContainer: { height: 120, backgroundColor: '#222', position: 'relative' },
    productImage: { width: '100%', height: '100%', opacity: 0.8 }, // Reduced opacity as requested in market, but maybe keep some visuals here? User wanted text based list IN MARKET. Here is STORE. Let's keep images for store appeal or follow text trend? User said "firmanın sayfası gibi olsun". A store usually has images. I'll keep images but make them neat.
    priceTag: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    priceText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 12 },
    productInfo: { padding: 12 },
    productName: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 4, height: 36 },
    productUnit: { color: '#888', fontSize: 11, marginBottom: 8 },
    addButton: { backgroundColor: '#333', paddingVertical: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
    addButtonText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});
