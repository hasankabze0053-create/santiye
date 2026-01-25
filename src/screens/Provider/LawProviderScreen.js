import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

export default function LawProviderScreen() {
    return (
        <ProviderScaffold title="Hukuk Bürosu Paneli">

            {/* 1. STATUS SUMMARY */}
            <GlassCard style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name="file-document-edit" size={28} color={THEME.accent} />
                        <Text style={styles.statNum}>5</Text>
                        <Text style={styles.statName}>İncelenecek</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons name="scale-balance" size={28} color="#EF4444" />
                        <Text style={styles.statNum}>2</Text>
                        <Text style={styles.statName}>Acil Dava</Text>
                    </View>
                </View>
            </GlassCard>

            {/* 2. PENDING CONTRACT REVIEWS */}
            <SectionTitle title="SÖZLEŞME İNCELEME TALEPLERİ" />
            <GlassCard>
                <View style={styles.listItem}>
                    <MaterialCommunityIcons name="file-clock" size={24} color="#aaa" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.listTitle}>Kat Karşılığı İnşaat Sözleşmesi</Text>
                        <Text style={styles.listSub}>Gönderen: Mehmet Y. • 12 Sayfa (PDF)</Text>
                    </View>
                    <View style={styles.pendingTag}>
                        <Text style={styles.tagText}>BEKLİYOR</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.actionBtnFull}>
                    <Text style={styles.btnText}>İNCELEMEYİ BAŞLAT</Text>
                </TouchableOpacity>
            </GlassCard>

            {/* 3. DISPUTE CASES */}
            <SectionTitle title="UYUŞMAZLIK & DAVA DOSYALARI" />
            <GlassCard>
                <View style={styles.caseHeader}>
                    <View style={[styles.priorityTag, { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.priorityText}>YÜKSEK ÖNCELİK</Text>
                    </View>
                    <Text style={{ color: '#aaa', fontSize: 11 }}>İş Kazası</Text>
                </View>
                <Text style={styles.caseTitle}>Taşeron Firma İş Kazası Rücu Davası</Text>
                <Text style={styles.caseSnippet}>SGK tarafından işverene rücu edilen 250.000 TL tutarındaki cezanın itiraz süreci...</Text>

                <View style={styles.uploadRow}>
                    <TouchableOpacity style={styles.uploadBtn}>
                        <MaterialCommunityIcons name="cloud-upload" size={20} color={THEME.accent} />
                        <Text style={styles.uploadText}>Hukuki Görüş Yükle</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>

            <GlassCard>
                <View style={styles.caseHeader}>
                    <View style={[styles.priorityTag, { backgroundColor: '#F59E0B' }]}>
                        <Text style={styles.priorityText}>ORTA</Text>
                    </View>
                    <Text style={{ color: '#aaa', fontSize: 11 }}>Tahliye</Text>
                </View>
                <Text style={styles.caseTitle}>Kiracı Tahliye İhtarnamesi</Text>
                <Text style={styles.caseSnippet}>Kartal Şube deposu için kiracıya noter ihtarnamesi hazırlanması gerekmekte.</Text>
                <View style={styles.uploadRow}>
                    <TouchableOpacity style={styles.uploadBtn}>
                        <MaterialCommunityIcons name="cloud-upload" size={20} color={THEME.accent} />
                        <Text style={styles.uploadText}>İhtarname Taslağı Yükle</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>

        </ProviderScaffold>
    );
}

const styles = StyleSheet.create({
    statNum: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statName: { fontSize: 11, color: '#666' },

    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    listTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    listSub: { color: '#888', fontSize: 11 },
    pendingTag: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    tagText: { color: '#ccc', fontSize: 10, fontWeight: 'bold' },

    actionBtnFull: { backgroundColor: THEME.accent, padding: 12, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

    caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    priorityTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    priorityText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    caseTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    caseSnippet: { color: '#888', fontSize: 12, lineHeight: 18 },
    uploadRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    uploadText: { color: THEME.accent, fontWeight: '600', fontSize: 12 }
});
