import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CorporateDashboardScreen() {
    const navigation = useNavigation();
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1c1917', '#292524']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>KURUMSAL KİRALAMA</Text>
                        <Text style={styles.headerSubtitle}>Kaya Vinç Platform A.Ş.</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: isAvailable ? '#4ADE80' : '#94a3b8' }]}>
                                {isAvailable ? 'Müsait' : 'Meşgul'}
                            </Text>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: "#44403c", true: "#4ADE80" }}
                                thumbColor="#fff"
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.exitBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <FontAwesome5
                                name="briefcase"
                                size={18}
                                color="#000"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.exitBtn, { backgroundColor: '#1A1A1A', borderColor: '#333' }]}
                            onPress={() => navigation.navigate('Market')}
                        >
                            <MaterialCommunityIcons
                                name="store"
                                size={20}
                                color="#D4AF37"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                                <MaterialCommunityIcons name="finance" size={24} color="#FFD700" />
                            </View>
                            <Text style={styles.statValue}>₺128.500</Text>
                            <Text style={styles.statLabel}>Bu Ayki Hakediş</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                                <MaterialCommunityIcons name="crane" size={24} color="#f97316" />
                            </View>
                            <Text style={styles.statValue}>8 / 12</Text>
                            <Text style={styles.statLabel}>Sahadaki Makine</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Filo Yönetimi</Text>
                    </View>

                    <View style={styles.actionsGrid}>
                        <QuickAction icon="plus-circle" label="Makine Ekle" color="#4ADE80" onPress={() => { }} />
                        <QuickAction icon="format-list-checks" label="Makinelerim" color="#FFD700" onPress={() => { }} />
                        <QuickAction icon="calendar-clock" label="Takvim" color="#60a5fa" onPress={() => { }} />
                        <QuickAction icon="cog" label="Firma Profili" color="#94a3b8" onPress={() => { }} />
                    </View>

                    {/* Active Rentals */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Aktif Kiralamalar</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
                    </View>

                    <View style={styles.rentalList}>
                        <RentalCard
                            id="#KIR-921"
                            project="Tema İstanbul Şantiyesi"
                            machine="30 Ton Mobil Vinç"
                            duration="15 Gün"
                            status="Çalışıyor"
                            income="₺45.000"
                        />
                        <RentalCard
                            id="#KIR-922"
                            project="Finans Merkezi"
                            machine="Makaslı Platform (12m)"
                            duration="30 Gün"
                            status="Sevkiyat Bekliyor"
                            income="₺12.000"
                        />
                        <RentalCard
                            id="#KIR-920"
                            project="Vadi İstanbul"
                            machine="Forklift (3 Ton)"
                            duration="1 Hafta"
                            status="Tamamlandı"
                            income="₺8.500"
                        />
                    </View>

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

const RentalCard = ({ id, project, machine, duration, status, income }) => (
    <View style={styles.rentalCard}>
        <View style={styles.rentalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="hard-hat" size={16} color="#78716c" style={{ marginRight: 6 }} />
                <Text style={styles.projectName}>{project}</Text>
            </View>
            <View style={[styles.statusTag,
            status === 'Çalışıyor' ? { backgroundColor: 'rgba(74, 222, 128, 0.2)' } :
                status === 'Sevkiyat Bekliyor' ? { backgroundColor: 'rgba(234, 179, 8, 0.2)' } :
                    { backgroundColor: 'rgba(148, 163, 184, 0.2)' }
            ]}>
                <Text style={[styles.statusTagText,
                status === 'Çalışıyor' ? { color: '#4ade80' } :
                    status === 'Sevkiyat Bekliyor' ? { color: '#eab308' } :
                        { color: '#94a3b8' }
                ]}>{status}</Text>
            </View>
        </View>

        <View style={styles.rentalBody}>
            <Text style={styles.machineName}>{machine}</Text>
            <Text style={styles.durationText}>{duration} Kiralama</Text>
        </View>

        <View style={styles.rentalFooter}>
            <Text style={styles.rentalId}>{id}</Text>
            <Text style={styles.incomeText}>{income}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0c0a09' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#44403c' },
    headerTitle: { color: '#FFD700', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#e7e5e4', fontSize: 20, fontWeight: 'bold', marginTop: 2 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#292524', paddingLeft: 12, paddingVertical: 4, paddingRight: 4, borderRadius: 20, borderWidth: 1, borderColor: '#44403c' },
    statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },

    exitBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#FFD700',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#ca8a04'
    },

    content: { padding: 24 },

    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#1c1917', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#44403c' },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    statValue: { color: '#f5f5f4', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#a8a29e', fontSize: 13 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#e7e5e4', fontSize: 18, fontWeight: '600' },
    seeAll: { color: '#FFD700', fontSize: 14 },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1c1917', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#44403c', alignItems: 'center', flexDirection: 'row', gap: 12 },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { color: '#d6d3d1', fontWeight: 'bold', fontSize: 13 },

    rentalList: { gap: 12 },
    rentalCard: { backgroundColor: '#1c1917', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#44403c' },
    rentalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    projectName: { color: '#a8a29e', fontSize: 13, fontWeight: '500' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusTagText: { fontSize: 11, fontWeight: 'bold' },

    rentalBody: { marginBottom: 16 },
    machineName: { color: '#f5f5f4', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    durationText: { color: '#78716c', fontSize: 13 },

    rentalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#292524', paddingTop: 12 },
    rentalId: { color: '#57534e', fontSize: 12, fontWeight: 'bold' },
    incomeText: { color: '#FFD700', fontSize: 16, fontWeight: '900' },
});
