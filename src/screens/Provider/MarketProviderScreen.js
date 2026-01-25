import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

const { width } = Dimensions.get('window');

export default function MarketProviderScreen() {

    const chartConfig = {
        backgroundGradientFrom: THEME.cardBg,
        backgroundGradientTo: THEME.cardBg,
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold
        strokeWidth: 2,
        barPercentage: 0.5,
        decimalPlaces: 0,
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
    };

    return (
        <ProviderScaffold title="Mağaza Paneli">

            {/* 1. TOP: MONTHLY REVENUE CHART */}
            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View>
                        <Text style={{ color: '#aaa', fontSize: 12 }}>AYLIK CİRO</Text>
                        <Text style={{ color: THEME.accent, fontSize: 24, fontWeight: 'bold' }}>₺845.200</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, height: 24 }}>
                        <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>▲ %12</Text>
                    </View>
                </View>

                <LineChart
                    data={{
                        labels: ["H1", "H2", "H3", "H4"],
                        datasets: [{ data: [150, 320, 240, 450] }]
                    }}
                    width={width - 66} // padding adjustments
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            </GlassCard>

            {/* 2. INCOMING QUOTE REQUESTS */}
            <SectionTitle title="GELEN TEKLİF TALEPLERİ (RFQ)" actionText="Tümü" />

            {/* Request 1 */}
            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="sack" size={20} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.itemTitle}>Portland Çimento</Text>
                            <Text style={styles.itemSub}>50 Ton • Şantiye Teslim</Text>
                            <Text style={styles.location}><MaterialCommunityIcons name="map-marker" size={10} /> Başakşehir, İstanbul</Text>
                        </View>
                    </View>
                    <View style={styles.timeTag}>
                        <Text style={styles.timeText}>20dk</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 12 }}>En İyi Teklif: </Text>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>₺195 / Torba</Text>
                    </View>
                    <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>TEKLİF VER</Text>
                    </View>
                </View>
            </GlassCard>

            {/* Request 2 */}
            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="grid" size={20} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.itemTitle}>Ø12 İnşaat Demiri</Text>
                            <Text style={styles.itemSub}>25 Ton • Kamyon Bazlı</Text>
                            <Text style={styles.location}><MaterialCommunityIcons name="map-marker" size={10} /> Pendik, İstanbul</Text>
                        </View>
                    </View>
                    <View style={styles.timeTag}>
                        <Text style={styles.timeText}>1s</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 12 }}>Kapanışa: </Text>
                        <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>40 dk</Text>
                    </View>
                    <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>TEKLİF VER</Text>
                    </View>
                </View>
            </GlassCard>


            {/* 3. INVENTORY STATUS */}
            <SectionTitle title="STOK DURUMU" />

            <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.alertIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 14 }}>KRİTİK STOK UYARISI</Text>
                    <Text style={{ color: '#aaa', fontSize: 12 }}>Beyaz Çimento ve 2 ürün daha tükenmek üzere.</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </GlassCard>

            <GlassCard style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 20, justifyContent: 'space-between' }}>
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>1,240</Text>
                    <Text style={styles.statLabel}>Toplam Ürün</Text>
                </View>
                <View style={styles.vertDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>85</Text>
                    <Text style={styles.statLabel}>Sipariş (Aktif)</Text>
                </View>
                <View style={styles.vertDivider} />
                <View style={styles.statItem}>
                    <Text style={{ ...styles.statVal, color: THEME.accent }}>4.9</Text>
                    <Text style={styles.statLabel}>Mağaza Puanı</Text>
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },
    itemTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    itemSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
    location: { color: '#666', fontSize: 11, marginTop: 4 },
    timeTag: { backgroundColor: '#27272a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    timeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#27272a', marginVertical: 12 },
    actionBtn: { backgroundColor: THEME.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
    alertIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    statItem: { alignItems: 'center', minWidth: 80 },
    statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#666', fontSize: 11 },
    vertDivider: { width: 1, backgroundColor: '#27272a', height: '80%' }
});
