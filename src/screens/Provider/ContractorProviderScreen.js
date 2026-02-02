import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import ProviderScaffold, { GlassCard, SectionTitle, THEME } from '../../components/ProviderScaffold';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ConstructionService } from '../../services/ConstructionService';

export default function ContractorProviderScreen() {
    const [requests, setRequests] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadOpenRequests();
        }, [])
    );

    const loadOpenRequests = async () => {
        const data = await ConstructionService.getOpenRequests();
        setRequests(data);
    };
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

            {requests.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#666' }}>Henüz aktif bir ihale bulunmuyor.</Text>
                </View>
            ) : (
                requests.map((item) => (
                    <GlassCard key={item.id} style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>TEKLİF BEKLİYOR</Text>
                            </View>
                            <Text style={{ color: '#aaa', fontSize: 11 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>

                        <Text style={styles.projTitle}>Kentsel Dönüşüm Talebi</Text>
                        <Text style={styles.projSub}>{item.district}, {item.neighborhood}</Text>
                        <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 12 }}>{item.full_address}</Text>

                        <View style={styles.specsRow}>
                            <View style={styles.specItem}>
                                <MaterialCommunityIcons name="land-plots" size={16} color="#bbb" />
                                <Text style={styles.specText}>Ada: {item.ada}</Text>
                            </View>
                            <View style={styles.specItem}>
                                <MaterialCommunityIcons name="vector-square" size={16} color="#bbb" />
                                <Text style={styles.specText}>Parsel: {item.parsel}</Text>
                            </View>
                        </View>

                        <View style={styles.actionBlock}>
                            {item.deed_image_url && (
                                <View style={styles.pdfBtn}>
                                    <MaterialCommunityIcons name="image" size={20} color="#3b82f6" />
                                    <Text style={{ color: '#ccc', fontSize: 11, marginLeft: 4 }}>Tapu Görseli</Text>
                                </View>
                            )}
                            <View style={styles.submitBtn}>
                                <Text style={styles.btnText}>TEKLİF VER</Text>
                            </View>
                        </View>
                    </GlassCard>
                ))
            )}

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
