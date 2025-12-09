import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

const SECTIONS = [
    { id: 'material', title: 'MALZEME GİDERLERİ', icon: 'cube' },
    { id: 'labor', title: 'İŞÇİLİK GİDERLERİ', icon: 'people' },
    { id: 'other', title: 'RESMİ & DİĞER', icon: 'document-text' }
];

export default function DetailedCostScreen({ navigation }) {
    const [activeSection, setActiveSection] = useState('material');
    // Mock functionality - in real app would use complex state/reducer
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#121212', '#1C1C1E']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Horizontal Section Selector */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {SECTIONS.map((section) => (
                            <TouchableOpacity
                                key={section.id}
                                style={[styles.tab, activeSection === section.id && styles.activeTab]}
                                onPress={() => setActiveSection(section.id)}
                            >
                                <Ionicons
                                    name={section.icon}
                                    size={16}
                                    color={activeSection === section.id ? '#fff' : '#666'}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.tabText, activeSection === section.id && styles.activeTabText]}>
                                    {section.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>GİDER KALEMLERİ EKLE</Text>
                            <TouchableOpacity style={styles.addBtn}>
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.emptyState}>
                            <Ionicons name="clipboard" size={48} color="#333" />
                            <Text style={styles.emptyText}>Henüz kalem eklenmedi.</Text>
                            <Text style={styles.emptySubText}>{activeSection === 'material' ? 'Demir, beton, tuğla vb.' : activeSection === 'labor' ? 'Usta, kalfa, düz işçi vb.' : 'Ruhsat, proje, harç vb.'} kalemlerini buradan ekleyin.</Text>
                        </View>
                    </View>

                    {/* Summary Footer Mock */}
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>ARA TOPLAM</Text>
                            <Text style={styles.summaryValue}>₺0,00</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>KDV (%20)</Text>
                            <Text style={styles.summaryValue}>₺0,00</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: COLORS.success, fontSize: 16 }]}>GENEL TOPLAM</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.success, fontSize: 20 }]}>₺0,00</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    tabContainer: { marginVertical: 16, height: 40 },
    tab: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 8,
        marginRight: 10, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'transparent'
    },
    activeTab: { backgroundColor: '#4b6cb7', borderColor: 'rgba(255,255,255,0.2)' },
    tabText: { color: '#666', fontSize: 12, fontWeight: '700' },
    activeTabText: { color: '#fff' },

    content: { padding: 16 },
    card: {
        backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, minHeight: 200, marginBottom: 20
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { color: '#ccc', fontSize: 14, fontWeight: 'bold' },
    addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4b6cb7', alignItems: 'center', justifyContent: 'center' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { color: '#666', fontSize: 16, fontWeight: '600', marginTop: 12 },
    emptySubText: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 8, width: '70%' },

    summaryBox: {
        backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: '#888', fontWeight: '600', fontSize: 14 },
    summaryValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 }
});
