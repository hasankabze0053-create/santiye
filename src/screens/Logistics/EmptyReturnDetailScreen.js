import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function EmptyReturnDetailScreen({ navigation, route }) {
    // Mock data - normally would come from route.params
    const vehicleData = {
        id: '1',
        plate: 'TR-34 VR 1**',
        model: 'Mercedes Actros - 2021 Model',
        image: require('../../assets/logistics/opt_truck.png'), // Using existing asset or placeholder
        from: 'İstanbul - İkitelli OSB',
        to: 'Ankara - Ostim Sanayi',
        startTime: 'Yarın 09:00',
        endTime: 'Yarın 19:00',
        price: '6.500 ₺',
        driver: {
            name: 'Ahmet Y.',
            rating: 4.9,
            // image: require('../../assets/avatar_1.png'), // Removing missing asset
        }
    };

    const handleFitCheck = () => {
        Alert.alert("Sığar mı?", "Yük ebatlarınızı girin (En x Boy x Yükseklik) - Bu özellik yakında aktif!");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Main Content Scroll */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 1. Hero Section */}
                <View style={styles.heroContainer}>
                    <Image source={vehicleData.image} style={styles.heroImage} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.heroOverlay} />
                    {/* Fade to Black at bottom */}
                    <LinearGradient colors={['transparent', '#000']} style={styles.heroBottomFade} />

                    {/* Header Controls */}
                    <View style={styles.headerControls}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>ARAÇ DETAYI</Text>
                        <TouchableOpacity style={styles.iconBtn}>
                            <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.statusBadge}>
                        <MaterialCommunityIcons name="fire" size={16} color="#fff" />
                        <Text style={styles.statusText}>İstanbul'da Bekliyor</Text>
                    </View>

                    {/* Camera Button */}
                    <TouchableOpacity style={styles.cameraBtn}>
                        <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                        <Text style={styles.cameraText}>Kasa İçi</Text>
                    </TouchableOpacity>
                </View>

                {/* Vehicle Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.plateText}>{vehicleData.plate}</Text>
                    <Text style={styles.modelText}>{vehicleData.model}</Text>
                </View>

                {/* 2. Technical Specs - Single Card */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>TEKNİK ÖZELLİKLER</Text>

                    <View style={styles.techCard}>
                        {/* Top Row: Length, Capacity, Type */}
                        <View style={styles.techRowTop}>
                            <View style={styles.techItemCompact}>
                                <MaterialCommunityIcons name="arrow-expand-horizontal" size={22} color="#D4AF37" />
                                <Text style={styles.techLabelCompact}>Uzunluk</Text>
                                <Text style={styles.techValueCompact}>13.60 m</Text>
                            </View>
                            <View style={styles.techVerticalDivider} />
                            <View style={styles.techItemCompact}>
                                <MaterialCommunityIcons name="scale-balance" size={22} color="#D4AF37" />
                                <Text style={styles.techLabelCompact}>Kapasite</Text>
                                <Text style={styles.techValueCompact}>15 Ton</Text>
                            </View>
                            <View style={styles.techVerticalDivider} />
                            <View style={styles.techItemCompact}>
                                <MaterialCommunityIcons name="truck-trailer" size={22} color="#D4AF37" />
                                <Text style={styles.techLabelCompact}>Tip</Text>
                                <Text style={styles.techValueCompact}>Tente</Text>
                            </View>
                        </View>

                        <View style={styles.techDividerHorizontal} />

                        {/* Bottom Row: Floor, Loading */}
                        <View style={styles.techRowBottom}>
                            <View style={styles.techItemDetail}>
                                <MaterialCommunityIcons name="floor-plan" size={18} color="#D4AF37" />
                                <View style={{ marginLeft: 8 }}>
                                    <Text style={styles.techLabelDetail}>Taban</Text>
                                    <Text style={styles.techValueDetail}>Ahşap Zemin</Text>
                                </View>
                            </View>
                            <View style={styles.techVerticalDivider} />
                            <View style={styles.techItemDetail}>
                                <MaterialCommunityIcons name="forklift" size={18} color="#D4AF37" />
                                <View style={{ marginLeft: 8 }}>
                                    <Text style={styles.techLabelDetail}>Yükleme</Text>
                                    <Text style={styles.techValueDetail}>Tümü (Üst/Yan)</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* "Sığar Mı?" Feature - Enhanced */}
                    <TouchableOpacity style={styles.fitCheckBtnEnhanced} onPress={handleFitCheck}>
                        <MaterialCommunityIcons name="cube-scan" size={22} color="#FFD700" />
                        <Text style={styles.fitCheckTextEnhanced}>Benim Yüküm Sığar mı?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* 3. Driver & Trust */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>SÜRÜCÜ</Text>
                    <View style={styles.driverCard}>
                        <View style={styles.driverRow}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>AY</Text>
                            </View>
                            <View style={styles.driverInfo}>
                                <Text style={styles.driverName}>{vehicleData.driver.name}</Text>
                                <View style={styles.ratingRow}>
                                    <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{vehicleData.driver.rating}</Text>
                                </View>
                            </View>
                            {/* Message/Call Button */}
                            <TouchableOpacity style={styles.contactBtn}>
                                <MaterialCommunityIcons name="phone" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.badgesRow}>
                            <View style={styles.badgeItem}>
                                <MaterialCommunityIcons name="check-circle" size={14} color="#D4AF37" />
                                <Text style={styles.badgeText}>SRC Belgeli</Text>
                            </View>
                            <View style={styles.badgeItem}>
                                <MaterialCommunityIcons name="check-circle" size={14} color="#D4AF37" />
                                <Text style={styles.badgeText}>Psikoteknik</Text>
                            </View>
                            <View style={styles.badgeItem}>
                                <MaterialCommunityIcons name="shield-check" size={14} color="#D4AF37" />
                                <Text style={styles.badgeText}>Sigortalı</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 4. Route Info - Card & Dashed */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>ROTA DETAYI</Text>
                    <View style={styles.routeCard}>
                        <View style={styles.routeContainer}>
                            {/* Dashed Line */}
                            <View style={styles.dashedLineContainer}>
                                <View style={styles.dashedLine} />
                            </View>

                            {/* From */}
                            <View style={styles.routePoint}>
                                <View style={styles.iconDotStart}>
                                    <MaterialCommunityIcons name="arrow-up" size={12} color="#000" />
                                </View>
                                <View style={styles.routeTextContainer}>
                                    <Text style={styles.routeLabel}>Çıkış</Text>
                                    <Text style={styles.routeLocation}>{vehicleData.from}</Text>
                                    <Text style={styles.routeTime}>{vehicleData.startTime}</Text>
                                </View>
                            </View>

                            {/* To */}
                            <View style={[styles.routePoint, { marginTop: 32 }]}>
                                <View style={styles.iconDotEnd}>
                                    <MaterialCommunityIcons name="flag" size={12} color="#000" />
                                </View>
                                <View style={styles.routeTextContainer}>
                                    <Text style={styles.routeLabel}>Varış</Text>
                                    <Text style={styles.routeLocation}>{vehicleData.to}</Text>
                                    <View style={styles.flexTag}>
                                        <MaterialCommunityIcons name="map-marker-radius" size={12} color="#4CAF50" style={{ marginRight: 4 }} />
                                        <Text style={styles.flexTagText}>Şehir içi dağıtım noktası esnektir</Text>
                                    </View>
                                    <Text style={styles.routeTime}>{vehicleData.endTime} (Tahmini)</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* 5. Sticky Bottom Bar */}
            <View style={styles.bottomBar}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={{ position: 'absolute', top: -30, left: 0, right: 0, height: 30 }}
                />
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Toplam Fiyat</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.priceValue}>{vehicleData.price}</Text>
                        <Text style={styles.taxLabelStyle}>(KDV Dahil)</Text>
                    </View>
                </View>
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.mainBtnGlow}
                        onPress={() => navigation.navigate('EmptyReturnCheckout')}
                    >
                        <Text style={styles.mainBtnText}>ARACI BAĞLA</Text>
                    </TouchableOpacity>
                    <View style={styles.securityRow}>
                        <MaterialCommunityIcons name="lock" size={12} color="#888" />
                        <Text style={styles.securityText}>Ödeme teslimattan sonra aktarılır</Text>
                    </View>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollView: { flex: 1 },

    // Hero
    heroContainer: { height: 300, width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    heroBottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },

    headerControls: {
        position: 'absolute', top: 50, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, zIndex: 10
    },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
    iconBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    statusBadge: {
        position: 'absolute', bottom: 30, left: 20,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8
    },
    statusText: { color: '#000', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
    cameraBtn: {
        position: 'absolute', bottom: 30, right: 20,
        backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    cameraText: { color: '#fff', fontSize: 12, marginLeft: 8, fontWeight: '700' },

    // Info
    infoSection: { padding: 20, paddingBottom: 10 },
    plateText: { color: '#888', fontSize: 13, letterSpacing: 2, marginBottom: 6 },
    modelText: { color: '#fff', fontSize: 24, fontWeight: '800' },

    // Section Commons
    sectionContainer: { padding: 20 },
    sectionTitle: { color: '#D4AF37', fontSize: 12, fontWeight: '800', marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#222', marginHorizontal: 20 },

    // Tech Card (Consolidated)
    techCard: {
        backgroundColor: '#1A1A1A', borderRadius: 20, borderWidth: 1, borderColor: '#333',
        padding: 0 // Padding handled internally by rows
    },
    techRowTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
    techRowBottom: { flexDirection: 'row', padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    techDividerHorizontal: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' },
    techVerticalDivider: { width: 1, backgroundColor: '#333', height: '100%', marginHorizontal: 10 },

    techItemCompact: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    techLabelCompact: { color: '#D1D1D1', fontSize: 10, marginTop: 6, marginBottom: 2, textTransform: 'uppercase', fontWeight: '500' },
    techValueCompact: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    techItemDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    techLabelDetail: { color: '#D1D1D1', fontSize: 10, textTransform: 'uppercase', fontWeight: '500' },
    techValueDetail: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 },

    fitCheckBtnEnhanced: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 2, borderColor: '#D4AF37',
        padding: 16, borderRadius: 16, marginTop: 16
    },
    fitCheckTextEnhanced: { color: '#FFD700', fontWeight: '800', marginLeft: 10, fontSize: 14 },

    // Driver Card
    driverCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
    driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#333',
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
        borderWidth: 1, borderColor: '#444'
    },
    avatarText: { color: '#ccc', fontWeight: 'bold', fontSize: 16 },
    driverInfo: { flex: 1 },
    driverName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    ratingText: { color: '#FFD700', marginLeft: 4, fontWeight: 'bold', fontSize: 12 },
    contactBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' },

    badgesRow: { flexDirection: 'row', flexWrap: 'wrap' },
    badgeItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8, marginRight: 8, marginBottom: 4, borderWidth: 1, borderColor: '#333'
    },
    badgeText: { color: '#ccc', fontSize: 11, marginLeft: 6 },

    // Route Card
    routeCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
    routeContainer: { position: 'relative', paddingLeft: 6 },
    dashedLineContainer: { position: 'absolute', left: 16, top: 20, bottom: 40, alignItems: 'center', width: 2 },
    dashedLine: { width: 1, height: '100%', borderWidth: 1, borderColor: '#444', borderStyle: 'dashed' }, // Standard dashed border hack if View supports it, else use dots. View supports borderStyle on iOS/Android often.

    routePoint: { flexDirection: 'row', alignItems: 'flex-start' },
    iconDotStart: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', marginRight: 16, zIndex: 1 },
    iconDotEnd: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F44336', alignItems: 'center', justifyContent: 'center', marginRight: 16, zIndex: 1 },

    routeTextContainer: { flex: 1, paddingTop: 2 },
    routeLabel: { color: '#666', fontSize: 10, textTransform: 'uppercase', marginBottom: 4, fontWeight: '700' },
    routeLocation: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },

    flexTag: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 8
    },
    flexTagText: { color: '#4CAF50', fontSize: 11, fontWeight: '700' },
    routeTime: { color: '#D4AF37', fontSize: 13, fontWeight: '600' },

    // Bottom Bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 30,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: '#333'
    },
    priceContainer: {},
    priceLabel: { color: '#888', fontSize: 11 },
    priceValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    taxLabelStyle: { color: '#D4AF37', fontSize: 12, marginLeft: 6, fontWeight: '600' },

    actionContainer: { alignItems: 'center' },
    mainBtnGlow: {
        backgroundColor: '#D4AF37', paddingHorizontal: 32, paddingVertical: 16,
        borderRadius: 30, marginBottom: 4,
        shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 10
    },
    mainBtnText: { color: '#000', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
    securityRow: { flexDirection: 'row', alignItems: 'center' },
    securityText: { color: '#666', fontSize: 9, marginLeft: 4 }
});
