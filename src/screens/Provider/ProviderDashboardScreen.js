import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderDashboardScreen() {
    const navigation = useNavigation();
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Hizmet Paneli</Text>
                        <Text style={styles.headerSubtitle}>Hoşgeldin, Koray</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.availabilityBadge}>
                            <Text style={[styles.availabilityText, { color: isAvailable ? '#4ADE80' : '#94a3b8' }]}>
                                {isAvailable ? 'Müsait' : 'Meşgul'}
                            </Text>
                            <Switch
                                value={isAvailable}
                                onValueChange={setIsAvailable}
                                trackColor={{ false: "#334155", true: "#4ADE80" }}
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
                                size={20}
                                color="#FFD700"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                                <Ionicons name="wallet-outline" size={20} color="#4ADE80" />
                            </View>
                            <Text style={styles.statValue}>₺12.500</Text>
                            <Text style={styles.statLabel}>Bu Ayki Kazanç</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                <Ionicons name="calendar-outline" size={20} color="#38bdf8" />
                            </View>
                            <Text style={styles.statValue}>5</Text>
                            <Text style={styles.statLabel}>Bekleyen Randevu</Text>
                        </View>
                    </View>

                    {/* Upcoming Appointments */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Yaklaşan Randevular</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
                    </View>

                    <View style={styles.appointmentList}>
                        <AppointmentCard
                            name="Ahmet Yılmaz"
                            type="Online Görüşme"
                            date="Bugün, 14:00"
                            status="Onaylandı"
                            price="₺2.500"
                        />
                        <AppointmentCard
                            name="ABC İnşaat Ltd."
                            type="Şantiye Ziyareti"
                            date="Yarın, 10:00"
                            status="Bekliyor"
                            price="₺4.000"
                        />
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                    </View>

                    <View style={styles.actionsGrid}>
                        <QuickAction icon="create-outline" label="İlanı Düzenle" onPress={() => navigation.navigate('ProviderWizard')} />
                        <QuickAction icon="time-outline" label="Müsaitlik Ayarı" onPress={() => { }} />
                        <QuickAction icon="chatbubble-ellipses-outline" label="Sorular (2)" onPress={() => { }} badge={2} />
                        <QuickAction icon="stats-chart-outline" label="Raporlar" onPress={() => { }} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const AppointmentCard = ({ name, type, date, status, price }) => (
    <View style={styles.aptCard}>
        <View style={styles.aptInfo}>
            <Text style={styles.aptName}>{name}</Text>
            <Text style={styles.aptType}>{type} • {price}</Text>
            <View style={styles.dateRow}>
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text style={styles.aptDate}>{date}</Text>
            </View>
        </View>
        <View style={[styles.statusBadge, status === 'Bekliyor' && styles.statusPending]}>
            <Text style={[styles.statusText, status === 'Bekliyor' && styles.statusTextPending]}>{status}</Text>
        </View>
    </View>
);

const QuickAction = ({ icon, label, onPress, badge }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={styles.actionIcon}>
            <Ionicons name={icon} size={24} color="#f8fafc" />
            {badge > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10 },
    headerTitle: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    headerSubtitle: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },

    availabilityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingLeft: 12, paddingVertical: 4, paddingRight: 4, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
    availabilityText: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },

    content: { padding: 24, paddingTop: 0 },

    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#64748b', fontSize: 12 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '600' },
    seeAll: { color: '#4ADE80', fontSize: 14 },

    appointmentList: { gap: 12, marginBottom: 32 },
    aptCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    aptInfo: { flex: 1 },
    aptName: { color: '#f8fafc', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    aptType: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    aptDate: { color: '#94a3b8', fontSize: 12 },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(74, 222, 128, 0.1)' },
    statusText: { color: '#4ADE80', fontSize: 12, fontWeight: 'bold' },
    statusPending: { backgroundColor: 'rgba(251, 191, 36, 0.1)' },
    statusTextPending: { color: '#fbbf24' },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
    actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionLabel: { color: '#cbd5e1', fontWeight: '500' },

    badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1e293b' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    switchModeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 0 },
    switchModeText: { color: '#4ADE80', fontSize: 12, fontWeight: '600', marginLeft: 4 },
    exitBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#334155'
    }
});
