import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MaliyetScreen({ navigation }) {
    const [area, setArea] = useState('');
    const [cost, setCost] = useState(null);

    // Simple Dummy Calculation Logic for "Approximate Cost"
    const calculateCost = () => {
        const sqm = parseFloat(area);
        if (!sqm) return;

        // Base cost per m2 (Example: 15.000 TL)
        const baseRate = 15000;
        const total = sqm * baseRate;

        setCost(total);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>YAKLAŞIK MALİYET</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.label}>İnşaat Alanı (m²)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: 120"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={area}
                            onChangeText={setArea}
                        />

                        <TouchableOpacity style={styles.calcButton} onPress={calculateCost}>
                            <Text style={styles.calcButtonText}>HESAPLA</Text>
                        </TouchableOpacity>
                    </View>

                    {cost !== null && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Tahmini İnşaat Maliyeti</Text>
                            <Text style={styles.resultValue}>
                                {cost.toLocaleString('tr-TR')} ₺
                            </Text>
                            <Text style={styles.note}>
                                *Bu rakam yaklaşık kaba inşaat maliyetidir. Proje detaylarına göre ±%20 değişebilir.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { padding: 8, backgroundColor: '#333', borderRadius: 12 },
    headerTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    card: { backgroundColor: '#111', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
    label: { color: '#ccc', marginBottom: 10, fontSize: 16 },
    input: {
        backgroundColor: '#222',
        color: '#fff',
        padding: 15,
        borderRadius: 12,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#444',
        marginBottom: 20
    },
    calcButton: { backgroundColor: '#FFD700', padding: 15, borderRadius: 12, alignItems: 'center' },
    calcButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    resultCard: {
        marginTop: 30,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    resultLabel: { color: '#FFD700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
    resultValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
    note: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 10 }
});
