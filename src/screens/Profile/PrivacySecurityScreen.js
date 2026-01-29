import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacySecurityScreen() {
    const navigation = useNavigation();

    const ActionItem = ({ label, icon, onPress, isDestructive }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.leftContent}>
                <Ionicons name={icon} size={22} color={isDestructive ? '#FF3B30' : '#FFD700'} />
                <Text style={[styles.label, isDestructive && styles.destructiveText]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gizlilik ve Güvenlik</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>HESAP GÜVENLİĞİ</Text>
                <ActionItem
                    label="Şifre Değiştir"
                    icon="key-outline"
                    onPress={() => Alert.alert('Bilgi', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')}
                />
                <ActionItem
                    label="İki Adımlı Doğrulama"
                    icon="shield-checkmark-outline"
                    onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
                />

                <Text style={styles.sectionTitle}>GİZLİLİK</Text>
                <ActionItem
                    label="Gizlilik Politikası"
                    icon="document-text-outline"
                    onPress={() => Alert.alert('Link', 'Gizlilik politikası sayfasına yönlendiriliyorsunuz.')}
                />
                <ActionItem
                    label="Kullanım Koşulları"
                    icon="document-outline"
                    onPress={() => Alert.alert('Link', 'Kullanım koşulları sayfasına yönlendiriliyorsunuz.')}
                />

                <Text style={styles.sectionTitle}>VERİ YÖNETİMİ</Text>
                <ActionItem
                    label="Hesabımı Dondur"
                    icon="snow-outline"
                    onPress={() => Alert.alert('Uyarı', 'Hesabınızı dondurmak istediğinize emin misiniz?')}
                />
                <ActionItem
                    label="Hesabımı Sil"
                    icon="trash-outline"
                    isDestructive
                    onPress={() => Alert.alert('Kritik İşlem', 'Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: {
        color: '#666',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        letterSpacing: 1
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    leftContent: { flexDirection: 'row', alignItems: 'center' },
    label: { color: '#FFF', fontSize: 16, marginLeft: 15 },
    destructiveText: { color: '#FF3B30' }
});
