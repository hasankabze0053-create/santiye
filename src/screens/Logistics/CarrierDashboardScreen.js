import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CarrierDashboardScreen() {
    const navigation = useNavigation();
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a1100', '#000000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>FİRMA TAŞIYICI PANELİ</Text>
                        <Text style={styles.headerSubtitle}>Jet Lojistik A.Ş.</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: isAvailable ? '#FFD700' : '#666' }]}>
                                {isAvailable ? 'Filo Aktif' : 'Mesai Dışı'}
                            </Text>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: "#332a00", true: "#FFD700" }}
                                thumbColor={isAvailable ? "#000" : "#888"}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.exitBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialCommunityIcons
                                name="truck-fast"
                                size={20}
                                color="#000"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                                <MaterialCommunityIcons name="wallet-outline" size={24} color="#FFD700" />
                            </View>
                            <Text style={styles.statValue}>₺245k</Text>
                            <Text style={styles.statLabel}>Aylık Ciro</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                                <MaterialCommunityIcons name="map-marker-distance" size={24} color="#4CAF50" />
                            </View>
                            <Text style={styles.statValue}>28</Text>
                            <Text style={styles.statLabel}>Tamamlanan Sefer</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
                                <MaterialCommunityIcons name="truck-outline" size={24} color="#2196F3" />
                            </View>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Aktif Araç</Text>
                        </View>
                    </View>

                    {/* Quick Tools */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Operasyon Yönetimi</Text>
                    </View>

                    <View style={styles.actionsGrid}>
                        <QuickAction icon="truck-plus" label="Araç Ekle" color="#FFD700" onPress={() => { }} />
                        <QuickAction icon="map-plus" label="Sefer Ekle" color="#4CAF50" onPress={() => { }} />
                        <QuickAction icon="clipboard-text-outline" label="İhaleler" color="#2196F3" onPress={() => { }} />
                        <QuickAction icon="cog" label="Firma Profili" color="#94a3b8" onPress={() => { }} />
                    </View>

                    {/* Active Fleet / Vehicles */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Filo Durumu</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Tümü (12)</Text></TouchableOpacity>
                    </View>

                    <View style={styles.fleetList}>
                        <FleetCard
                            plate="34 VR 123"
                            type="10 Teker Kamyon"
                            location="İstanbul > Ankara"
                            status="Yolda"
                            load="İnşaat Demiri"
                        />
                        <FleetCard
                            plate="06 ANKs 99"
                            type="Tır (Lowbed)"
                            location="Gebze (Bekliyor)"
                            status="Boşta"
                            load="-"
                        />
                        <FleetCard
                            plate="35 IZM 45"
                            type="Kamyonet"
                            location="İzmir > Bursa"
                            status="Yolda"
                            load="Seramik"
                        />
                    </View>

                    {/* Load Board (Opportunity) */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Yük Fırsatları (Dönüş Yükü)</Text>
                    </View>
                    <LoadOpportunityCard
                        from="Ankara"
                        to="İstanbul"
                        cargo="Tuğla, 12 Palet"
                        price="₺14.000"
                        distance="450 km"
                    />

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const FleetCard = ({ plate, type, location, status, load }) => (
    <View style={styles.fleetCard}>
        <View style={styles.fleetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.plateBox}>
                    <Text style={styles.plateText}>{plate}</Text>
                </View>
                <Text style={styles.vehicleType}>{type}</Text>
            </View>
            <View style={[styles.statusTag, status === 'Yolda' ? { backgroundColor: 'rgba(76, 175, 80, 0.2)' } : { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
                <Text style={[styles.statusTagText, status === 'Yolda' ? { color: '#4CAF50' } : { color: '#FFC107' }]}>{status}</Text>
            </View>
        </View>

        <View style={styles.fleetBody}>
            <View style={styles.fleetRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#888" />
                <Text style={{ color: '#ccc', fontSize: 13, marginLeft: 6 }}>{location}</Text>
            </View>
            <View style={styles.fleetRow}>
                <MaterialCommunityIcons name="package-variant-closed" size={14} color="#888" />
                <Text style={{ color: '#ccc', fontSize: 13, marginLeft: 6 }}>Yük: {load}</Text>
            </View>
        </View>

        {status === 'Boşta' && (
            <TouchableOpacity style={styles.assignBtn}>
                <Text style={styles.assignBtnText}>YÜK ATA</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color="#000" />
            </TouchableOpacity>
        )}
    </View>
);

const LoadOpportunityCard = ({ from, to, cargo, price, distance }) => (
    <TouchableOpacity style={styles.loadCard}>
        <View style={styles.loadHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.routeText}>{from}</Text>
                <MaterialCommunityIcons name="arrow-right-thin" size={16} color="#666" style={{ marginHorizontal: 6 }} />
                <Text style={styles.routeText}>{to}</Text>
            </View>
            <Text style={styles.distanceText}>{distance}</Text>
        </View>
        <View style={{ marginVertical: 8 }}>
            <Text style={styles.cargoText}>{cargo}</Text>
        </View>
        <View style={styles.loadFooter}>
            <Text style={styles.priceText}>{price}</Text>
            <TouchableOpacity style={styles.takeJobBtn}>
                <Text style={styles.takeJobText}>AL</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1100' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#332a00' },
    headerTitle: { color: '#FFD700', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#e7e5e4', fontSize: 18, fontWeight: 'bold', marginTop: 2 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#332a00', paddingLeft: 12, paddingVertical: 4, paddingRight: 4, borderRadius: 20, borderWidth: 1, borderColor: '#4d4000' },
    statusText: { fontSize: 11, fontWeight: 'bold', marginRight: 8 },

    exitBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#FFD700',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#cca300'
    },

    content: { padding: 24 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#1f1a0a', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#332a00', alignItems: 'center' },
    iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { color: '#f5f5f4', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    statLabel: { color: '#a8a29e', fontSize: 10, textAlign: 'center' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '600' },
    seeAll: { color: '#FFD700', fontSize: 13 },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1f1a0a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#332a00', alignItems: 'center', flexDirection: 'row', gap: 12 },
    actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { color: '#d6d3d1', fontWeight: 'bold', fontSize: 12 },

    fleetList: { gap: 12 },
    fleetCard: { backgroundColor: '#1f1a0a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#332a00' },
    fleetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    plateBox: { backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#000' },
    plateText: { color: '#000', fontSize: 12, fontWeight: '900', fontFamily: 'monospace' },
    vehicleType: { color: '#eee', fontSize: 13, fontWeight: 'bold' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusTagText: { fontSize: 10, fontWeight: 'bold' },
    fleetBody: { gap: 6 },
    fleetRow: { flexDirection: 'row', alignItems: 'center' },
    assignBtn: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
    assignBtnText: { color: '#000', fontSize: 11, fontWeight: 'bold' },

    loadCard: { backgroundColor: '#1f1a0a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#4CAF50', borderStyle: 'dashed' },
    loadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    routeText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    distanceText: { color: '#888', fontSize: 12 },
    cargoText: { color: '#ccc', fontSize: 13 },
    loadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    priceText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
    takeJobBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
    takeJobText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
