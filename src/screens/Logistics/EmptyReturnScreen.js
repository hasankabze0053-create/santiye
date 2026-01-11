import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Data for Opportunities
const OPPORTUNITIES = [
    {
        id: '1',
        from: 'İstanbul',
        fromDistrict: 'Avrupa Y.',
        to: 'Ankara',
        toDistrict: 'Merkez',
        date: 'Yarın 09:00\'da Hareket',
        vehicleType: 'TIR (Tenteli)',
        capacity: '15 Ton Boş',
        image: require('../../assets/logistics/opt_truck.png'),
        driverRating: 4.9,
        oldPrice: '12.000 ₺',
        price: '6.500 ₺',
        isHot: true,
        isCorporate: true,
        urgencyColor: '#FF4444' // Red for urgency
    },
    {
        id: '2',
        from: 'İzmir',
        fromDistrict: 'Liman',
        to: 'Bursa',
        toDistrict: 'Organize San.',
        date: 'Bugün 17:00\'de Hareket',
        vehicleType: 'Kamyon',
        capacity: 'Tam Boş',
        image: require('../../assets/logistics/opt_tow.png'),
        driverRating: 4.8,
        oldPrice: '8.500 ₺',
        price: '4.200 ₺',
        isHot: true,
        isCorporate: false,
        urgencyColor: '#FF8800' // Orange
    },
    {
        id: '3',
        from: 'Antalya',
        fromDistrict: 'Merkez',
        to: 'Konya',
        toDistrict: 'Sanayi',
        date: '15 Ocak - Esnek',
        vehicleType: 'Panelvan',
        capacity: 'Parsiyel',
        image: require('../../assets/logistics/opt_van.png'),
        driverRating: 5.0,
        oldPrice: '4.000 ₺',
        price: '1.800 ₺',
        isHot: false,
        isHot: false,
        isCorporate: true,
        corporateType: 'Kurumsal',
        urgencyColor: '#D4AF37' // Gold/Normal
    },
    {
        id: '4',
        from: 'Kocaeli',
        fromDistrict: 'Gebze',
        to: 'İstanbul',
        toDistrict: 'Anadolu Y.',
        date: 'Her Gün',
        vehicleType: 'Kamyonet',
        capacity: 'Parça Eşya',
        image: require('../../assets/logistics/opt_moving.png'),
        driverRating: 4.7,
        oldPrice: '1.500 ₺',
        price: '750 ₺',
        isHot: false,
        isCorporate: false,
        urgencyColor: '#D4AF37'
    },
    {
        id: 'alert', // Special type for Lead Gen
        type: 'alert'
    }
];

export default function EmptyReturnScreen({ navigation }) {
    const [fromCity, setFromCity] = useState('Türkiye - Tümü');
    const [toCity, setToCity] = useState('Türkiye - Tümü');

    const renderItem = ({ item }) => {
        // Calculate discount for glow effect logic if needed (mock logic here based on item prop or manual check)
        // For existing mock data, let's assume items with > 40% discount get a special flag or we calculate it.
        // Simple logic: If oldPrice/Price diff is high. parsed:
        const oldP = parseInt(item.oldPrice?.replace(/\./g, '').replace(' ₺', '') || '0');
        const newP = parseInt(item.price?.replace(/\./g, '').replace(' ₺', '') || '0');
        const discountRate = oldP > 0 ? (oldP - newP) / oldP : 0;
        const shouldGlow = discountRate > 0.40;

        if (item.type === 'alert') {
            return (
                <View style={styles.alertCard}>
                    <LinearGradient
                        colors={['#1A1A1A', '#000']}
                        style={styles.alertGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.alertIconBox}>
                            <MaterialCommunityIcons name="bell-ring" size={28} color="#D4AF37" />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>Aradığını Bulamadın mı?</Text>
                            <Text style={styles.alertText}>İstediğin rotada boş araç çıkınca sana haber verelim.</Text>
                        </View>
                        <TouchableOpacity style={styles.alarmBtn}>
                            <Text style={styles.alarmBtnText}>ALARM KUR</Text>
                            <MaterialCommunityIcons name="bell-plus" size={16} color="#000" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            );
        }

        return (
            <TouchableOpacity style={styles.listCard} activeOpacity={0.9}>
                <LinearGradient
                    colors={['#1e1e1e', '#121212']}
                    style={styles.cardGradient}
                >
                    {/* Left: Image & Capacity */}
                    <View style={styles.leftSection}>
                        <Image source={item.image} style={styles.vehicleImage} contentFit="cover" />
                        {item.isCorporate && (
                            <View style={styles.corpBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={12} color="#fff" />
                            </View>
                        )}
                    </View>

                    {/* Center: Route & Info */}
                    <View style={styles.centerSection}>
                        <View style={styles.routeRow}>
                            <Text style={styles.cityText}>{item.from}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={12} color="#888" style={{ marginLeft: 2 }} />
                            <MaterialCommunityIcons name="arrow-right-thick" size={16} color="#FFD700" style={{ marginHorizontal: 8 }} />
                            <Text style={styles.cityText}>{item.to}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={12} color="#888" style={{ marginLeft: 2 }} />
                        </View>
                        <Text style={styles.districtText}>{item.fromDistrict} {'>'} {item.toDistrict}</Text>

                        <View style={styles.timeRow}>
                            {item.isHot && <MaterialCommunityIcons name="fire" size={14} color={item.urgencyColor} style={{ marginRight: 4 }} />}
                            <Text style={[styles.dateText, { color: item.urgencyColor }]}>{item.date}</Text>
                        </View>
                    </View>

                    {/* Right: Price & Button */}
                    <View style={styles.rightSection}>
                        <View style={shouldGlow ? styles.glowingPriceContainer : null}>
                            <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                            <Text style={styles.newPrice}>{item.price}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionBtn, shouldGlow && styles.glowingActionBtn]}
                            onPress={() => navigation.navigate('EmptyReturnDetail', { item })}
                        >
                            <Text style={styles.actionBtnText}>FIRSATI GÖR</Text>
                            <MaterialCommunityIcons name="chevron-right" size={12} color="#000" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity >
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000', '#121212']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header Back Button */}
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>BOŞ DÖNÜŞ FIRSATLARI</Text>
                    <View style={{ width: 40 }} />
                </View>


                {/* Sticky Smart Filter */}
                <View style={styles.filterContainer}>
                    <View style={[styles.blurContainer, { backgroundColor: 'rgba(30,30,30,0.95)' }]}>
                        <View style={styles.filterRow}>
                            <TouchableOpacity style={styles.inputGroup}>
                                <Text style={styles.label}>Çıkış</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.inputValue} numberOfLines={1}>{fromCity}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={14} color="#D4AF37" style={{ marginLeft: 4 }} />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.arrowContainer}>
                                <MaterialCommunityIcons name="arrow-right-thick" size={24} color="#FFD700" />
                            </View>

                            <TouchableOpacity style={styles.inputGroup}>
                                <Text style={styles.label}>Varış</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.inputValue} numberOfLines={1}>{toCity}</Text>
                                    <MaterialCommunityIcons name="chevron-down" size={14} color="#D4AF37" style={{ marginLeft: 4 }} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateRow}>
                            <MaterialCommunityIcons name="calendar-clock" size={14} color="#888" />
                            <Text style={styles.dateLabel}>Tarih:</Text>
                            <Text style={styles.dateValue}>Bugün / Yarın</Text>
                        </View>
                    </View>
                </View>

                {/* Content List */}
                <FlatList
                    data={OPPORTUNITIES}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
    backBtn: { padding: 8 },
    screenTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '700', letterSpacing: 1 },

    // Sticky Filter
    filterContainer: { paddingHorizontal: 16, marginBottom: 16, zIndex: 10 },
    blurContainer: { borderRadius: 16, overflow: 'hidden', padding: 12, backgroundColor: '#2C2C2E', borderWidth: 1, borderColor: '#3A3A3C' },
    filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    inputGroup: { flex: 1 },
    label: { color: '#666', fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
    inputValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
    arrowContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
    dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    dateLabel: { color: '#666', fontSize: 11, marginLeft: 4, marginRight: 4 },
    dateValue: { color: '#D4AF37', fontSize: 11, fontWeight: '500' },

    // List Content
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },

    // Card Styles
    listCard: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', height: 100 },
    cardGradient: { flex: 1, flexDirection: 'row', padding: 8, alignItems: 'center' },

    // Left Section
    leftSection: { width: 84, height: 84, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
    vehicleImage: { width: '100%', height: '100%' },
    capacityBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#D4AF37', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
    capacityText: { fontSize: 8, fontWeight: 'bold', color: '#000', marginLeft: 2 },
    corpBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#2196F3', borderRadius: 10, padding: 2 },

    // Center Section
    centerSection: { flex: 1, justifyContent: 'center', paddingVertical: 4 },
    routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    cityText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    districtText: { color: '#BBB', fontSize: 11, marginBottom: 8 },
    timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dateText: { fontSize: 11, fontWeight: '600' },
    driverRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { color: '#FFD700', fontSize: 11, fontWeight: 'bold', marginLeft: 2 },
    driverLabel: { color: '#666', fontSize: 10, marginLeft: 4 },

    // Right Section
    rightSection: { alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', paddingVertical: 4 },
    oldPrice: { color: '#666', fontSize: 11, textDecorationLine: 'line-through' },
    newPrice: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
    glowingPriceContainer: {
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
    glowingActionBtn: {
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 5,
    },
    actionBtnText: { color: '#000', fontSize: 10, fontWeight: '700', marginRight: 2 },

    // Alert Card
    alertCard: { marginTop: 8, marginBottom: 24, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', borderStyle: 'dashed' },
    alertGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    alertIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    alertContent: { flex: 1 },
    alertTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
    alertText: { color: '#BBB', fontSize: 11, lineHeight: 16 },
    alarmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginLeft: 8 },
    alarmBtnText: { color: '#000', fontSize: 10, fontWeight: '800' }
});


