import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure this is installed/available
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import { COLORS } from '../../constants/theme';

// Placeholder for the generated image. In a real scenario, this would be a require() from assets.
// I will use a remote placeholder or the URI if I can, but to ensure it works without file system errors for the user immediately:
// I will simulate the visual with an Icon for now if the image path isn't guaranteed, BUT I will try to use the artifact path logic if possible visually.
// For robustness in this code block, I'll rely on the Icon + Styling to sell the "3D" effect or use a URI container.

const { width, height } = Dimensions.get('window');

// MOCK DATA - Active Shipment
const ACTIVE_SHIPMENT = {
    id: 'TR-8821',
    status: 'Yolda',
    from: 'Kadıköy',
    to: 'Gebze',
    subStatusHead: 'TEM Otoyolu',
    subStatusDist: '12 km',
    subStatusTail: 'kaldı',
    driver: 'Ahmet Y.',
    rating: '4.9',
    plate: '34 VR 123',
    vehicle: '10 Teker Kamyon',
    eta: '14:30',
    progress: 0.65, // 65%
    phone: '05551234567'
};



const NOTIFICATIONS = [
    { id: 1, text: 'TR-8821 Şantiye Girişi Yaptı', time: '10 dk önce', type: 'info' },
    { id: 2, text: 'Yeni İrsaliye Yüklendi', time: '32 dk önce', type: 'doc' },
    { id: 3, text: 'Sevkiyat Tamamlandı (12 Adet)', time: '2 saat önce', type: 'success' }
];

export default function LogisticsScreen({ navigation }) {
    const [viewMode, setViewMode] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    const [userRole, setUserRole] = useState('Şantiye Şefi'); // Demo Role

    // --- CARRIER MODE STATE (NEW) ---
    const [isCarrierMode, setIsCarrierMode] = useState(false);
    const [addVehicleModalVisible, setAddVehicleModalVisible] = useState(false);
    const [newRoute, setNewRoute] = useState({ from: '', to: '', vehicleType: '', price: '' });

    // Dynamic Routes Data
    const [availableRoutes, setAvailableRoutes] = useState([
        {
            id: '1',
            from: 'İstanbul',
            to: 'Ankara',
            vehicleType: '10 Teker Kamyon',
            price: '18.000',
            discount: '%40 İNDİRİM', // or calculated
            isMock: true
        }
    ]);

    const handleAddRoute = () => {
        if (!newRoute.from || !newRoute.to || !newRoute.vehicleType || !newRoute.price) {
            Alert.alert("Eksik Bilgi", "Lütfen tüm bilgileri eksiksiz doldurunuz.");
            return;
        }

        const newRouteItem = {
            id: Date.now().toString(),
            from: newRoute.from,
            to: newRoute.to,
            vehicleType: newRoute.vehicleType,
            price: newRoute.price,
            discount: '%30 İNDİRİM', // Mock discount for new items
            isMock: false
        };

        setAvailableRoutes([newRouteItem, ...availableRoutes]);
        setAddVehicleModalVisible(false);
        setNewRoute({ from: '', to: '', vehicleType: '', price: '' });
        Alert.alert("Başarılı", "Aracınız/Seferiniz şantiye ağına eklendi.");
    };

    // Blinking Dot Animation
    const fadeAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);



    // --- DASHBOARD ---
    const QuickActionButtons = () => (
        <View style={styles.actionContainer}>
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.mainActionBtn, styles.glowEffect, { flex: 1.2 }]}
                    onPress={() => navigation.navigate('CreateTransport')}
                >
                    <LinearGradient
                        colors={[COLORS.amberGradientStart, COLORS.amberGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.btnGradient}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="plus" size={32} color="#000" />
                        </View>
                        <Text style={styles.mainBtnText}>HIZLI TALEP OLUŞTUR</Text>
                        <Text style={styles.mainBtnSub}>Saniyeler içinde</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.mainActionBtn, { flex: 1 }]}
                    onPress={() => Alert.alert("Planlı Nakliye", "Takvim özelliği yakında eklenecek.")}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={[styles.btnGradient, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <MaterialCommunityIcons name="calendar-clock" size={32} color="#FFD700" />
                        <Text style={[styles.mainBtnText, { color: '#fff', marginTop: 10 }]}>PLANLI NAKLİYE</Text>
                        <Text style={[styles.mainBtnSub, { color: '#ccc' }]}>İleri Tarihli</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    // NEW: Shared Load List (Dynamic)
    const SharedLoadList = () => (
        <View>
            {availableRoutes.map((route) => (
                <TouchableOpacity
                    key={route.id}
                    style={styles.activeCardContainer}
                    activeOpacity={0.9}
                    onPress={() => Alert.alert("Rota Detayı", `${route.from} > ${route.to} güzergahındaki araç için talep oluşturuluyor.`)}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.activeCardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.liveBadge}>
                                <MaterialCommunityIcons name="map-marker-path" size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                                <Text style={styles.liveText}>ROTA FIRSATI</Text>
                            </View>
                            <Text style={[styles.trackingId, { color: COLORS.neon, fontWeight: '900', fontSize: 13 }]}>{route.discount}</Text>
                        </View>

                        {/* Map Mock Content */}
                        <View style={styles.mapContainer}>
                            <LinearGradient colors={['#1a1a1a', '#000']} style={StyleSheet.absoluteFill} />
                            <View style={styles.mapGrid} />
                            <View style={styles.mapRoute} />
                            <View style={[styles.mapTruck, { left: '60%', top: '35%' }]}>
                                <View style={styles.truckPulse} />
                                <MaterialCommunityIcons name="truck-outline" size={24} color="#FFD700" style={{ transform: [{ rotate: '-15deg' }] }} />
                            </View>
                            <View style={styles.mapOverlay}>
                                <Text style={styles.mapStatusText}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{route.from}</Text> <Text style={styles.boldHighlight}>{'>'}</Text> <Text style={{ color: '#fff', fontWeight: 'bold' }}>{route.to}</Text>
                                </Text>
                            </View>
                        </View>

                        {/* Info Text */}
                        <View style={styles.progressSection}>
                            <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 5 }}>
                                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{route.vehicleType}</Text> ile yükünü daha uyguna taşı.
                            </Text>
                        </View>

                        {/* Action Footer */}
                        <View style={styles.driverSection}>
                            <View style={styles.driverInfo}>
                                <View style={[styles.avatar, { backgroundColor: 'rgba(255,193,7,0.1)', borderColor: '#FFC107' }]}>
                                    <MaterialCommunityIcons name="percent" size={18} color="#FFC107" />
                                </View>
                                <View>
                                    <Text style={styles.driverName}>₺{route.price}</Text>
                                    <Text style={styles.plateTextBox}>Tahmini Fiyat</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.callBtn}>
                                <Text style={styles.callBtnText}>TALEP ET</Text>
                                <Ionicons name="chevron-forward" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity >
            ))}
        </View>
    );

    // Minimized Active Shipments Button
    const ActiveShipmentsButton = () => (
        <TouchableOpacity style={styles.minimizedBtn} onPress={() => Alert.alert("Aktif Taşımalar", "Detay sayfasına gidiliyor...")}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Animated.View style={[styles.greenDot, { opacity: fadeAnim }]} />
                    <Text style={[styles.minimizedBtnText, { color: COLORS.success, fontSize: 10, fontWeight: 'bold' }]}>CANLI</Text>
                </View>
                <Text style={styles.minimizedBtnText}>| TR-8821 • Kadıköy {'>'} Gebze</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity style={styles.docIconBtn} onPress={() => Alert.alert("Belgeler", "İrsaliye ve diğer belgeler.")}>
                    <MaterialCommunityIcons name="file-document-outline" size={18} color="#ccc" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
        </TouchableOpacity>
    );

    const StatsDashboard = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard} onPress={() => Alert.alert("Rapor", "Finansal raporlar açılıyor...")}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}><MaterialCommunityIcons name="chart-bar" size={22} color="#FFD700" /></View>
                <View>
                    <Text style={styles.statLabel}>Bu Ay Harcama</Text>
                    <Text style={[styles.statValue, { fontSize: 16, fontWeight: '900' }]}>₺42.500</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}><MaterialCommunityIcons name="truck-check-outline" size={22} color="#2196F3" /></View>
                <View><Text style={styles.statLabel}>Toplam Sefer</Text><Text style={styles.statValue}>12 Adet</Text></View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, { marginRight: 0 }]}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}><MaterialCommunityIcons name="clock-outline" size={22} color="#4CAF50" /></View>
                <View><Text style={styles.statLabel}>Ort. Teslim</Text><Text style={styles.statValue}>2.4 Saat</Text></View>
            </TouchableOpacity>
        </ScrollView>
    );



    // --- NOTIFICATION MODAL ---
    const NotificationModal = () => (
        <Modal transparent visible={showNotifications} animationType="fade" onRequestClose={() => setShowNotifications(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifications(false)}>
                <View style={styles.notificationBox}>
                    <View style={styles.notifHeader}>
                        <Text style={styles.notifTitle}>BİLDİRİM MERKEZİ</Text>
                        <TouchableOpacity onPress={() => setShowNotifications(false)}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {NOTIFICATIONS.map(notif => (
                        <View key={notif.id} style={styles.notifItem}>
                            <View style={[styles.notifDot, { backgroundColor: notif.type === 'success' ? '#4CAF50' : '#FFD700' }]} />
                            <View>
                                <Text style={styles.notifText}>{notif.text}</Text>
                                <Text style={styles.notifTime}>{notif.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // --- MAIN RENDER ---
    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>NAKLİYE & LOJİSTİK</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{userRole}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)}>
                            <View style={styles.badgedIcon}>
                                <MaterialCommunityIcons name="bell-outline" size={20} color="#fff" />
                                <View style={styles.redBadge} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.iconBtn,
                                { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 1, borderColor: '#332a00' }
                            ]}
                            onPress={() => navigation.navigate('CarrierDashboard')}
                        >
                            <MaterialCommunityIcons
                                name="domain"
                                size={20}
                                color="#FFD700"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Carrier Banner */}
                {isCarrierMode && (
                    <View style={styles.carrierBanner}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="domain" size={20} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.carrierBannerText}>FİRMA TAŞIYICI MODU</Text>
                        </View>
                        <TouchableOpacity style={styles.addRouteBtnHeader} onPress={() => setAddVehicleModalVisible(true)}>
                            <Ionicons name="add-circle" size={18} color="#fff" />
                            <Text style={styles.addRouteTextHeader}>ARAÇ EKLE</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 1. Main Actions */}
                    <QuickActionButtons />

                    {/* 2. Shared Load (Rich Card) */}
                    <Text style={styles.sectionTitle}>FIRSATLAR</Text>
                    <SharedLoadList />

                    {/* 3. Active Shipments (Minimized) */}
                    <View style={{ marginTop: 20 }}>
                        <ActiveShipmentsButton />
                    </View>

                    {/* 4. Stats */}
                    <Text style={styles.sectionTitle}>OPERASYON ÖZETİ</Text>
                    <StatsDashboard />
                </ScrollView>



                {/* ADD VEHICLE MODAL (CARRIER) */}
                <Modal
                    visible={addVehicleModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddVehicleModalVisible(false)}
                >
                    <View style={styles.modalOverlayCompat}>
                        <View style={styles.modalContent}>
                            <View style={styles.notifHeader}>
                                <Text style={styles.notifTitle}>YENİ SEFER / ARAÇ EKLE</Text>
                                <TouchableOpacity onPress={() => setAddVehicleModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 10 }}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Nereden (Çıkış Noktası)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: İstanbul, Anadolu Yakası"
                                        placeholderTextColor="#666"
                                        value={newRoute.from}
                                        onChangeText={(t) => setNewRoute({ ...newRoute, from: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Nereye (Varış Noktası)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Ankara, Ostim"
                                        placeholderTextColor="#666"
                                        value={newRoute.to}
                                        onChangeText={(t) => setNewRoute({ ...newRoute, to: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Araç Tipi</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: 10 Teker, Tır, Kamyonet"
                                        placeholderTextColor="#666"
                                        value={newRoute.vehicleType}
                                        onChangeText={(t) => setNewRoute({ ...newRoute, vehicleType: t })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Tahmini Fiyat (₺)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="18000"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newRoute.price}
                                        onChangeText={(t) => setNewRoute({ ...newRoute, price: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleAddRoute}>
                                    <Text style={styles.submitBtnText}>İLAN YAYINLA</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* NOTIFICATIONS */}
                <NotificationModal />

            </SafeAreaView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
    headerRight: { flexDirection: 'row', gap: 10 },
    iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

    scrollContent: { padding: 20, paddingBottom: 100 },

    // ACTIONS
    actionContainer: { marginBottom: 10 }, // Reduced margin
    actionRow: { flexDirection: 'row', gap: 15 },

    // Shared Load Card
    sharedLoadCard: { height: 90, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)', position: 'relative' },
    sharedContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    sharedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sharedIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(76, 175, 80, 0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4CAF50' },
    sharedTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    sharedSub: { color: '#bbb', fontSize: 11, marginTop: 2 },
    sharedRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    sharedDiscount: { color: '#4CAF50', fontWeight: '900', fontSize: 12 },

    mapPathMock: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: '5deg' }] },

    mainActionBtn: { borderRadius: 20, overflow: 'hidden' },
    glowEffect: { shadowColor: '#FFC107', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
    btnGradient: { padding: 15, alignItems: 'center', justifyContent: 'center', height: 130 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    mainBtnText: { fontSize: 14, fontWeight: '800', textAlign: 'center', color: '#000', letterSpacing: 0.5 },
    mainBtnSub: { fontSize: 11, marginTop: 4, letterSpacing: 0, fontWeight: '500' },

    // REUSED RICH CARD (Now for Shared Load)
    activeCardContainer: { borderRadius: 24, overflow: 'hidden', marginBottom: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#FFC107', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
    activeCardContent: { backgroundColor: 'transparent' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)' },
    pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 },
    liveText: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold' },
    trackingId: { color: '#888', fontSize: 12, fontFamily: 'monospace' },

    mapContainer: { height: 140, position: 'relative', overflow: 'hidden' },
    mapGrid: { position: 'absolute', width: '200%', height: '200%', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.03)', transform: [{ rotate: '15deg' }] },
    mapRoute: { position: 'absolute', top: '45%', left: 0, right: 0, height: 3, backgroundColor: '#FFD700', shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 10 },
    mapTruck: { position: 'absolute', width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    truckPulse: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 193, 7, 0.2)' },
    mapOverlay: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5, borderColor: '#333' },
    mapStatusText: { color: '#ccc', fontSize: 11 },
    boldHighlight: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    progressSection: { padding: 16, paddingBottom: 10 },
    progressBarBg: { height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 6 },
    progressBarFill: { height: '100%', borderRadius: 2 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progLabel: { color: '#555', fontSize: 10, width: '30%' },
    progLabelActive: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', width: '30%' },

    driverSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    driverInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#333' },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    driverName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    ratingText: { fontSize: 9, fontWeight: 'bold', color: '#000', marginLeft: 2 },
    plateTextBox: { color: '#ccc', fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
    driverActions: { flexDirection: 'row', gap: 10 },
    msgBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
    callBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    callBtnText: { color: '#000', fontSize: 11, fontWeight: 'bold', marginRight: 6 },

    // Minimized Button
    minimizedBtn: { backgroundColor: '#181818', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
    minimizedBtnText: { color: '#ccc', fontSize: 13, fontWeight: '600' },

    statsContainer: { paddingRight: 20, paddingBottom: 20 },
    statCard: { width: 150, backgroundColor: '#181818', padding: 15, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#252525', flexDirection: 'row', alignItems: 'center', gap: 12 },
    statIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statLabel: { color: '#666', fontSize: 10, marginBottom: 2 },
    statValue: { color: '#eee', fontSize: 14, fontWeight: 'bold' },

    sectionTitle: { color: '#555', fontSize: 12, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1, marginTop: 10, textTransform: 'uppercase' },

    // --- SHEET STYLES ---
    sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    sheetContainer: { height: height * 0.9, backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', paddingBottom: 20 },

    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#252525', backgroundColor: '#181818' },
    headerActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerActionText: { color: '#FFD700', fontSize: 14, fontWeight: '500' },
    sheetTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    // Grid System
    gridContainer: { padding: 20, paddingBottom: 100 },
    gridColumnWrapper: { justifyContent: 'space-between', marginBottom: 20 },
    gridCard: { backgroundColor: '#181818', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#252525', minHeight: 180 },
    gridCardActive: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.05)' },
    gridIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    gridTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 },
    gridSubtitle: { color: '#888', fontSize: 10, textAlign: 'center', marginBottom: 10, fontStyle: 'italic', height: 28 }, // fix height for alignment

    gridFeatures: { width: '100%', marginTop: 5 },
    gridFeatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#555' },
    gridFeatText: { color: '#666', fontSize: 9 },

    stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 30, backgroundColor: '#121212', borderTopWidth: 1, borderTopColor: '#252525', gap: 15 },
    estLabel: { color: '#888', fontSize: 12 },
    estPrice: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
    confirmBtn: { flex: 1, height: 50, borderRadius: 12, overflow: 'hidden' },
    confirmGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    confirmText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

    // New Styles
    docIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

    // Notifications & Role
    roleBadge: { backgroundColor: 'rgba(255, 215, 0, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
    roleText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    badgedIcon: { position: 'relative' },
    redBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#1A1A1A' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 60, paddingRight: 20 },
    notificationBox: { width: 280, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    notifTitle: { color: '#eee', fontWeight: 'bold', fontSize: 12 },
    notifItem: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
    notifText: { color: '#ccc', fontSize: 12, width: '90%' },
    notifTime: { color: '#666', fontSize: 10, marginTop: 2 },

    // Carrier Mode Styles
    carrierBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10
    },
    carrierBannerText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
    addRouteBtnHeader: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6
    },
    addRouteTextHeader: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

    // Modal & Form Styles
    modalOverlayCompat: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },

    formGroup: { marginBottom: 15 },
    label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
    input: { backgroundColor: '#1E1E1E', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },

    submitBtn: { backgroundColor: '#FFD700', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
