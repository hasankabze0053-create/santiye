import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

export default function ContractorProviderScreen() {
    return (
        <ProviderScaffold title="Müteahhit Paneli">

            {/* 1. TOP: ACTIVE TENDERS COUNTER */}
            <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24 }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={styles.counterVal}>3</Text>
                    <Text style={styles.counterLabel}>Aktif Teklif</Text>
                </View>
                <View style={styles.vertLine} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ ...styles.counterVal, color: '#10B981' }}>1</Text>
                    <Text style={styles.counterLabel}>Kazanılan</Text>
                </View>
                <View style={styles.vertLine} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ ...styles.counterVal, color: '#aaa' }}>12</Text>
                    <Text style={styles.counterLabel}>Bekleyen İhale</Text>
                </View>
            </GlassCard>

            {/* 2. BUILDING RENEWAL REQUESTS */}
            <SectionTitle title="YERİNDE DÖNÜŞÜM İHALELERİ" />

            {/* Project 1 */}
            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>RİSKLİ YAPI</Text>
                    </View>
                    <Text style={{ color: '#aaa', fontSize: 11 }}>3 Hafta Kaldı</Text>
                </View>

                <Text style={styles.projTitle}>Karanfil Apt. Dönüşüm Projesi</Text>
                <Text style={styles.projSub}>Kadıköy, İstanbul</Text>

                <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="home-outline" size={16} color="#bbb" />
                        <Text style={styles.specText}>1.200 m²</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#bbb" />
                        <Text style={styles.specText}>35 Yaş</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="account-group-outline" size={16} color="#bbb" />
                        <Text style={styles.specText}>12 Malik</Text>
                    </View>
                </View>

                <View style={styles.actionBlock}>
                    <View style={styles.pdfBtn}>
                        <MaterialCommunityIcons name="file-pdf-box" size={20} color="#EF4444" />
                        <Text style={{ color: '#ccc', fontSize: 11, marginLeft: 4 }}>Risk Raporu</Text>
                    </View>
                    <View style={styles.submitBtn}>
                        <Text style={styles.btnText}>TEKLİFİNİ SUN</Text>
                    </View>
                </View>
            </GlassCard>

            {/* Project 2 */}
            <GlassCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={[styles.tag, { backgroundColor: '#333' }]}>
                        <Text style={[styles.tagText, { color: '#ccc' }]}>KAT KARŞILIĞI</Text>
                    </View>
                    <Text style={{ color: '#aaa', fontSize: 11 }}>Yeni Eklendi</Text>
                </View>

                <Text style={styles.projTitle}>Yeşilvadi Sitesi B Blok</Text>
                <Text style={styles.projSub}>Beylikdüzü, İstanbul</Text>

                <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="floor-plan" size={16} color="#bbb" />
                        <Text style={styles.specText}>4.500 m²</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="layers-outline" size={16} color="#bbb" />
                        <Text style={styles.specText}>8 Kat</Text>
                    </View>
                </View>

                <View style={styles.actionBlock}>
                    <View style={styles.pdfBtn}>
                        <MaterialCommunityIcons name="file-chart-outline" size={20} color="#3b82f6" />
                        <Text style={{ color: '#ccc', fontSize: 11, marginLeft: 4 }}>İmar Durumu</Text>
                    </View>
                    <View style={styles.submitBtn}>
                        <Text style={styles.btnText}>TEKLİFİNİ SUN</Text>
                    </View>
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    counterVal: { color: THEME.accent, fontSize: 24, fontWeight: 'bold' },
    counterLabel: { color: '#666', fontSize: 11, marginTop: 4 },
    vertLine: { width: 1, backgroundColor: '#333', height: 40 },

    tag: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
    tagText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
    projTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
    projSub: { color: '#888', fontSize: 13, marginBottom: 12 },
    specsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    specItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    specText: { color: '#ccc', fontSize: 12 },
    actionBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 },
    pdfBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 8, borderRadius: 8 },
    submitBtn: { backgroundColor: THEME.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 12 }
});
