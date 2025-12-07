import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function AiArchitectScreen() {
    const [status, setStatus] = useState('idle'); // idle, analyzing, result

    const handleAnalyze = () => {
        setStatus('analyzing');
        setTimeout(() => {
            setStatus('result');
        }, 2000);
    };

    const handleReset = () => {
        setStatus('idle');
    };

    if (status === 'analyzing') {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={{ marginTop: 20, color: COLORS.white, fontSize: 18 }}>Oda Analiz Ediliyor...</Text>
                <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)' }}>Duvar m² ve zemin yapısı taranıyor</Text>
            </SafeAreaView>
        );
    }

    if (status === 'result') {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View style={styles.resultCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <MaterialCommunityIcons name="check-decagram" size={30} color={COLORS.success} />
                            <Text style={styles.resultTitle}>Analiz Tamamlandı</Text>
                        </View>

                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Tespit Edilen Alan:</Text>
                            <Text style={styles.statValue}>24 m²</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Duvar Tipi:</Text>
                            <Text style={styles.statValue}>Alçıpan + Saten Boya</Text>
                        </View>
                        <View style={styles.divider} />

                        <Text style={styles.costTitle}>Tahmini Tadilat Bütçesi</Text>
                        <Text style={styles.costValue}>₺12.500 - ₺15.000</Text>
                        <Text style={styles.disclaimer}>* Malzeme + İşçilik dahildir.</Text>

                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionBtnText}>Ustalardan Teklif Al</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Ionicons name="refresh" size={20} color={COLORS.white} />
                        <Text style={{ color: COLORS.white, marginLeft: 5 }}>Yeni Analiz</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.centerContent}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="camera-iris" size={60} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Cebimdeki Mimar</Text>
                <Text style={styles.text}>Odanızın fotoğrafını çekin veya yükleyin. Yapay zeka anında ölçü çıkarsın ve maliyet hesaplasın.</Text>

                <TouchableOpacity style={styles.button} onPress={handleAnalyze}>
                    <Ionicons name="camera" size={24} color={COLORS.primary} />
                    <Text style={styles.btnText}>Fotoğraf Çek</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.white, marginTop: 15 }]}>
                    <Ionicons name="images" size={24} color={COLORS.white} />
                    <Text style={[styles.btnText, { color: COLORS.white }]}>Galeriden Yükle</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    iconContainer: { width: 100, height: 100, backgroundColor: COLORS.white, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 10 },
    text: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
    button: { flexDirection: 'row', backgroundColor: COLORS.accent, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 12, width: '100%', justifyContent: 'center', alignItems: 'center' },
    btnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

    resultCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, ...SHADOWS.medium },
    resultTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginLeft: 10 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    statLabel: { fontSize: 16, color: COLORS.darkGray },
    statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    costTitle: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 5 },
    costValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.success, textAlign: 'center', marginBottom: 5 },
    disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
    actionButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    actionBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },

    resetButton: { flexDirection: 'row', alignSelf: 'center', marginTop: 20, padding: 10 }
});
