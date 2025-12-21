import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellerDashboardScreen() {
    const navigation = useNavigation();
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>MAĞAZA PANELİ</Text>
                        <Text style={styles.headerSubtitle}>Demir Dünyası A.Ş.</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: isStoreOpen ? '#4ADE80' : '#94a3b8' }]}>
                                {isStoreOpen ? 'Açık' : 'Kapalı'}
                            </Text>
                            <Switch
                                value={isStoreOpen}
                                onValueChange={setIsStoreOpen}
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
                                size={18}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                                <Ionicons name="wallet-outline" size={20} color="#FFD700" />
                            </View>
                            <Text style={styles.statValue}>₺45.250</Text>
                            <Text style={styles.statLabel}>Bu Ayki Satış</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                                <MaterialCommunityIcons name="dolly" size={20} color="#38bdf8" />
                            </View>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Bekleyen Sipariş</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                    </View>

                    <View style={styles.actionsGrid}>
                        <QuickAction icon="plus-box" label="Ürün Ekle" color="#4ADE80" onPress={() => { /* Navigate to Add Product */ }} />
                        <QuickAction icon="format-list-bulleted" label="Ürünlerim" color="#FFD700" onPress={() => { }} />
                        <QuickAction icon="bullhorn" label="Kampanya" color="#f472b6" onPress={() => { }} />
                        <QuickAction icon="cog" label="Ayarlar" color="#94a3b8" onPress={() => { }} />
                    </View>

                    {/* Recent Orders */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Text style={styles.sectionTitle}>Son Siparişler</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
                    </View>

                    <View style={styles.ordersList}>
                        <OrderCard
                            id="#SIP-2849"
                            customer="Ahmet Yılmaz"
                            items="2x Çimento (50kg), 1x Mala"
                            price="₺450"
                            status="Hazırlanıyor"
                            time="10 dk önce"
                        />
                        <OrderCard
                            id="#SIP-2848"
                            customer="Kaya İnşaat Ltd."
                            items="500x Tuğla, 10x Kireç"
                            price="₺5.200"
                            status="Yeni"
                            time="35 dk önce"
                        />
                        <OrderCard
                            id="#SIP-2847"
                            customer="Mehmet Demir"
                            items="1x Matkap Seti"
                            price="₺2.800"
                            status="Tamamlandı"
                            time="2 saat önce"
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
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const OrderCard = ({ id, customer, items, price, status, time }) => (
    <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{id}</Text>
            <View style={[styles.orderStatusBadge,
            status === 'Yeni' ? { backgroundColor: 'rgba(239, 68, 68, 0.2)' } :
                status === 'Hazırlanıyor' ? { backgroundColor: 'rgba(234, 179, 8, 0.2)' } :
                    { backgroundColor: 'rgba(74, 222, 128, 0.2)' }
            ]}>
                <Text style={[styles.orderStatusText,
                status === 'Yeni' ? { color: '#ef4444' } :
                    status === 'Hazırlanıyor' ? { color: '#eab308' } :
                        { color: '#4ade80' }
                ]}>{status}</Text>
            </View>
        </View>
        <Text style={styles.customerName}>{customer}</Text>
        <Text style={styles.orderItems}>{items}</Text>
        <View style={styles.orderFooter}>
            <Text style={styles.orderTime}>{time}</Text>
            <Text style={styles.orderPrice}>{price}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
    headerTitle: { color: '#FFD700', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginTop: 2 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingLeft: 12, paddingVertical: 4, paddingRight: 4, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
    statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },

    exitBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#3b5998',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#4a6fa5'
    },

    content: { padding: 24 },

    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#64748b', fontSize: 12 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '600' },
    seeAll: { color: '#FFD700', fontSize: 14 },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: '48%', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center', flexDirection: 'row', gap: 12 },
    actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 },

    ordersList: { gap: 12 },
    orderCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
    orderStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    orderStatusText: { fontSize: 10, fontWeight: 'bold' },
    customerName: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    orderItems: { color: '#94a3b8', fontSize: 13, marginBottom: 12 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
    orderTime: { color: '#64748b', fontSize: 12 },
    orderPrice: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
});
