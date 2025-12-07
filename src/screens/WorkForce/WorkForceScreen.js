import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export default function WorkForceScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primary, '#000000']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={styles.content}>
                <MaterialCommunityIcons name="account-hard-hat" size={80} color={COLORS.accent} />
                <Text style={styles.title}>Personel & Usta</Text>
                <Text style={styles.text}>Yakında: Operatör, usta ve ekip arkadaşı bul.</Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
    text: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10 }
});
