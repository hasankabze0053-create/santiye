import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

export default function LogisticsProviderScreen() {
    return (
        <ProviderScaffold title="Nakliyeci Paneli">

            {/* 1. EMPTY RETURN OPPORTUNITY CARD */}
            <SectionTitle title="BOŞ DÖNÜŞ FIRSATLARI" />
            <GlassCard style={{ borderColor: '#10B981', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="recycle-variant" size={20} color="#10B981" />
                        <Text style={{ color: '#10B981', fontWeight: 'bold' }}>ROTANIZLA EŞLEŞTİ</Text>
                    </View>
                    <Text style={{ color: '#666', fontSize: 11 }}>Az Önce</Text>
                </View>

                <View style={styles.routeRow}>
                    <Text style={styles.routeText}>ANKARA</Text>
                    <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#666" />
                    <Text style={styles.routeText}>İSTANBUL</Text>
                </View>
                <Text style={styles.loadDetail}>Ev Eşyası (Parça) • 2+1 • 15m³</Text>

                <View style={styles.offerBox}>
                    <Text style={styles.offerPrice}>₺12.000</Text>
                    <View style={styles.acceptBtn}>
                        <Text style={styles.btnText}>HEMEN AL</Text>
                    </View>
                </View>
            </GlassCard>

            {/* 2. MAP PREVIEW: ACTIVE TRUCKS */}
            <SectionTitle title="AKTİF ARAÇLARIM" />
            <GlassCard style={{ padding: 0, height: 180 }}>
                {/* Mock Map Image */}
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600' }}
                    style={{ width: '100%', height: '100%', opacity: 0.6 }}
                />
                <View style={[styles.mapPin, { top: 50, left: 100 }]}>
                    <MaterialCommunityIcons name="truck-delivery" size={16} color="#000" />
                </View>
                <View style={[styles.mapPin, { top: 100, left: 220 }]}>
                    <MaterialCommunityIcons name="truck-check" size={16} color="#000" />
                </View>
                <View style={styles.mapOverlay}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>2 Araç Yolda</Text>
                </View>
            </GlassCard>

            {/* 3. AVAILABLE LOADS LIST */}
            <SectionTitle title="YÜK İLANLARI" actionText="Filtrele" />

            <GlassCard>
                {/* Load 1 */}
                <View style={styles.loadItem}>
                    <View style={styles.loadIcon}>
                        <MaterialCommunityIcons name="pallet" size={24} color="#000" />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.loadTitle}>Paletli Seramik Yükü</Text>
                        <Text style={styles.loadRoute}>İstanbul → İzmir</Text>
                        <Text style={styles.loadInfo}>Lowbed • 24 Ton</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.profitText}>₺45.000</Text>
                        <Text style={styles.tripText}>Gidiş</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Load 2 */}
                <View style={styles.loadItem}>
                    <View style={styles.loadIcon}>
                        <MaterialCommunityIcons name="cube-send" size={24} color="#000" />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.loadTitle}>İnşaat Malzemesi</Text>
                        <Text style={styles.loadRoute}>Bursa → Ankara</Text>
                        <Text style={styles.loadInfo}>Kamyon • 15 Ton</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.profitText}>₺28.000</Text>
                        <Text style={styles.tripText}>Gidiş</Text>
                    </View>
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
    routeText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    loadDetail: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 12 },
    offerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 12, borderRadius: 10 },
    offerPrice: { color: THEME.accent, fontSize: 18, fontWeight: 'bold' },
    acceptBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    mapPin: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    mapOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },

    // Loads
    loadItem: { flexDirection: 'row', alignItems: 'center' },
    loadIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
    loadTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    loadRoute: { color: THEME.accent, fontSize: 12, fontWeight: '600' },
    loadInfo: { color: '#666', fontSize: 11 },
    profitText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    tripText: { color: '#666', fontSize: 10 },
    divider: { height: 1, backgroundColor: '#27272a', marginVertical: 12 },
});
