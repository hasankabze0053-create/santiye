import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

export default function TechnicalProviderScreen() {
    return (
        <ProviderScaffold title="Mühendis Paneli">

            {/* 1. MAP: SURVEY REQUESTS NEARBY */}
            <SectionTitle title="YAKINDAKİ KEŞİF TALEPLERİ" />
            <GlassCard style={{ padding: 0, height: 160 }}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=600' }}
                    style={{ width: '100%', height: '100%', opacity: 0.6 }}
                />
                <View style={{ position: 'absolute', top: 40, left: 150, alignItems: 'center' }}>
                    <View style={styles.pin}>
                        <MaterialCommunityIcons name="home-search" size={16} color="#000" />
                    </View>
                    <View style={styles.pinLabel}><Text style={styles.labelT}>Keşif</Text></View>
                </View>
                <View style={{ position: 'absolute', top: 90, left: 80, alignItems: 'center' }}>
                    <View style={styles.pin}>
                        <MaterialCommunityIcons name="ruler" size={16} color="#000" />
                    </View>
                    <View style={styles.pinLabel}><Text style={styles.labelT}>Metraj</Text></View>
                </View>
            </GlassCard>

            {/* 2. PENDING STATIC REPORTS */}
            <SectionTitle title="BEKLEYEN RAPOR & PROJELER" />

            <GlassCard>
                <View style={styles.reportRow}>
                    <View style={styles.typeIcon}>
                        <MaterialCommunityIcons name="pillar" size={24} color="#000" />
                    </View>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={styles.repTitle}>Statik Performans Analizi</Text>
                        <Text style={styles.repSub}>Konak Apt. • 5 Katlı Betonarme</Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>TAMAMLA</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.reportRow}>
                    <View style={[styles.typeIcon, { backgroundColor: '#ddd' }]}>
                        <MaterialCommunityIcons name="floor-plan" size={24} color="#000" />
                    </View>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={styles.repTitle}>Zemin Etüdü Raporu</Text>
                        <Text style={styles.repSub}>Pendik Şantiye Alanı</Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>TAMAMLA</Text>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#000" />
                    </TouchableOpacity>
                </View>
            </GlassCard>

            {/* 3. QUICK ACTIONS */}
            <SectionTitle title="HIZLI İŞLEMLER" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <GlassCard style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                    <MaterialCommunityIcons name="calculator" size={32} color={THEME.accent} />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Statik Hesap</Text>
                </GlassCard>
                <GlassCard style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                    <MaterialCommunityIcons name="file-sign" size={32} color={THEME.accent} />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>İmza At</Text>
                </GlassCard>
            </View>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    pin: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    pinLabel: { backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    labelT: { color: THEME.accent, fontSize: 10, fontWeight: 'bold' },

    reportRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    typeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },
    repTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    repSub: { color: '#888', fontSize: 11, marginTop: 2 },

    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: THEME.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
    actionText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#27272a', marginVertical: 16 },
});
