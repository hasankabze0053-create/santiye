import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

const { width } = Dimensions.get('window');

export default function MachineryProviderScreen() {

    // Mock Data for Pie Chart
    const pieData = [
        { name: "Kirada", population: 14, color: THEME.accent, legendFontColor: "#aaa", legendFontSize: 12 },
        { name: "Boşta", population: 6, color: "#333", legendFontColor: "#aaa", legendFontSize: 12 },
        { name: "Bakımda", population: 2, color: "#EF4444", legendFontColor: "#aaa", legendFontSize: 12 },
    ];

    return (
        <ProviderScaffold title="Makine Parkuru">

            {/* 1. TOP: FLEET AVAILABILITY DASHBOARD */}
            <GlassCard>
                <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>FİLO DURUMU</Text>
                <View style={{ alignItems: 'center' }}>
                    <PieChart
                        data={pieData}
                        width={width - 40}
                        height={160}
                        chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                </View>
            </GlassCard>

            {/* 2. NEW RENTAL REQUESTS */}
            <SectionTitle title="YENİ KİRALAMA TALEPLERİ" actionText="Tümü" />

            {/* Req 1 */}
            <GlassCard>
                <View style={styles.reqRow}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="excavator" size={24} color={THEME.accent} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.reqTitle}>30 Ton Ekskavatör</Text>
                        <Text style={styles.reqDetail}>3 Gün • Operatörlü</Text>
                        <View style={styles.locRow}>
                            <MaterialCommunityIcons name="map-marker-outline" size={12} color="#666" />
                            <Text style={styles.locText}>Sancaktepe, İst (15km)</Text>
                        </View>
                    </View>
                    <View style={styles.actionCol}>
                        <Text style={styles.priceText}>₺35.000</Text>
                        <View style={styles.approveBtn}>
                            <Text style={styles.btnText}>ONAYLA</Text>
                        </View>
                    </View>
                </View>
            </GlassCard>

            {/* Req 2 */}
            <GlassCard>
                <View style={styles.reqRow}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="bullldozer" size={24} color={THEME.accent} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.reqTitle}>Dozer D6</Text>
                        <Text style={styles.reqDetail}>1 Hafta • Yakıt Hariç</Text>
                        <View style={styles.locRow}>
                            <MaterialCommunityIcons name="map-marker-outline" size={12} color="#666" />
                            <Text style={styles.locText}>Gebze, Kocaeli (42km)</Text>
                        </View>
                    </View>
                    <View style={styles.actionCol}>
                        <Text style={styles.priceText}>₺80.000</Text>
                        <View style={styles.approveBtn}>
                            <Text style={styles.btnText}>ONAYLA</Text>
                        </View>
                    </View>
                </View>
            </GlassCard>

            {/* 3. MAINTENANCE ALERTS & STATUS */}
            <SectionTitle title="DURUM & BAKIM" />

            <GlassCard style={{ borderColor: '#EF4444', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons name="wrench-clock" size={28} color="#EF4444" />
                    <View>
                        <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>BAKIM ZAMANI GELDİ</Text>
                        <Text style={{ color: '#ccc', fontSize: 13 }}>CAT 336 (Seri No: #4829) - 5 Saat Geçti</Text>
                    </View>
                </View>
            </GlassCard>

            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <MaterialCommunityIcons name="calendar-check" size={24} color={THEME.accent} />
                        <View>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Yarın Dönecekler</Text>
                            <Text style={{ color: '#aaa', fontSize: 12 }}>2 Makine (JCB, Silindir)</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    reqRow: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
    reqTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    reqDetail: { color: '#aaa', fontSize: 12, marginVertical: 2 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locText: { color: '#666', fontSize: 11 },
    actionCol: { alignItems: 'flex-end', justifyContent: 'center' },
    priceText: { color: THEME.accent, fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
    approveBtn: { backgroundColor: THEME.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 10 }
});
