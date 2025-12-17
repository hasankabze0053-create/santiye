import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export default function ProfileScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
                <Text style={styles.name}>Kral Kullanıcı</Text>
                <Text style={styles.role}>Müteahhit</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şantiye Günlüğü (Timeline)</Text>
                <View style={styles.timelineItem}>
                    <View style={styles.dot} />
                    <View style={styles.content}>
                        <Text style={styles.date}>Bugün, 09:41</Text>
                        <Text style={styles.desc}>500 torba çimento teslim alındı.</Text>
                    </View>
                </View>
                <View style={styles.timelineItem}>
                    <View style={styles.dot} />
                    <View style={styles.content}>
                        <Text style={styles.date}>Dün, 14:20</Text>
                        <Text style={styles.desc}>Banyo tadilatı için usta keşfe geldi.</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.gray },
    header: { alignItems: 'center', padding: 30, backgroundColor: COLORS.white },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    role: { color: 'gray' },

    providerButton: {
        marginTop: 20,
        backgroundColor: '#0f172a', // Dark Navy
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    providerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
    timelineItem: { flexDirection: 'row', marginBottom: 20, paddingLeft: 10 },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, marginTop: 5, marginRight: 15 },
    content: { flex: 1, backgroundColor: COLORS.white, padding: 15, borderRadius: 10 },
    date: { color: 'gray', fontSize: 12, marginBottom: 5 },
    desc: { color: COLORS.darkGray, fontWeight: '600' }
});
