import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacySecurityScreen() {
    const navigation = useNavigation();

    const { isDarkMode } = useTheme();

    const theme = {
        background:        isDarkMode ? '#000000' : '#EDE5D5',
        text:              isDarkMode ? '#FFFFFF' : '#1C1208',
        subText:           isDarkMode ? '#8E8E93' : '#4A3D28',
        icon:              isDarkMode ? '#FDCB58' : '#8C6200',
        border:            isDarkMode ? '#333333' : '#D4C4A8',
    };

    const ActionItem = ({ label, icon, onPress, isDestructive }) => (
        <TouchableOpacity style={[styles.itemContainer, { borderBottomColor: theme.border }]} onPress={onPress}>
            <View style={styles.leftContent}>
                <Ionicons name={icon} size={22} color={isDestructive ? '#FF3B30' : theme.icon} />
                <Text allowFontScaling={false} style={[styles.label, { color: theme.text }, isDestructive && styles.destructiveText]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.headerTitle, { color: theme.text }]}>Gizlilik ve Güvenlik</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>HESAP GÜVENLİĞİ</Text>
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

                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>GİZLİLİK</Text>
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

                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>VERİ YÖNETİMİ</Text>
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
