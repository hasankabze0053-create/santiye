import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../constants/theme';

export default function RenovationScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primary, '#000000']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={{ flex: 1, padding: 20 }}>
                {/* AI Architect Banner - Now Here! */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('AI_Galeri')}
                    activeOpacity={0.9}
                    style={{ marginBottom: 30 }}
                >
                    <GlassCard style={styles.aiBanner}>
                        <View style={styles.aiContent}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.aiTitle}>Cebimdeki Mimar 🤖</Text>
                                <Text style={styles.aiDesc}>Yapay zeka ile odanı analiz et, maliyetini hemen öğren.</Text>
                                <View style={styles.btn}>
                                    <Text style={styles.btnText}>Analiz Et</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="robot" size={60} color={COLORS.accent} />
                        </View>
                    </GlassCard>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Hizmetler</Text>

                <GlassCard style={styles.serviceItem}>
                    <FontAwesome5 name="paint-roller" size={30} color={COLORS.white} />
                    <View style={{ marginLeft: 20 }}>
                        <Text style={styles.serviceTitle}>Boya & Badana</Text>
                        <Text style={styles.serviceDesc}>Usta bul, renk seç, teklif al.</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={20} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
                </GlassCard>

                <GlassCard style={styles.serviceItem}>
                    <FontAwesome5 name="hammer" size={30} color={COLORS.white} />
                    <View style={{ marginLeft: 20 }}>
                        <Text style={styles.serviceTitle}>Komple Tadilat</Text>
                        <Text style={styles.serviceDesc}>Anahtar teslim ev yenileme.</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={20} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
                </GlassCard>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary },
    aiBanner: { padding: 20, backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: COLORS.accent, borderWidth: 1 },
    aiContent: { flexDirection: 'row', alignItems: 'center' },
    aiTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 5 },
    aiDesc: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 15 },
    btn: { backgroundColor: COLORS.accent, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'flex-start' },
    btnText: { color: COLORS.white, fontWeight: 'bold' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 15 },
    serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 15, backgroundColor: 'rgba(30, 41, 59, 0.4)' },
    serviceTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
    serviceDesc: { fontSize: 12, color: COLORS.textSecondary }
});
