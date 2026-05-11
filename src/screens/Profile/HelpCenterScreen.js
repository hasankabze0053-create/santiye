import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HelpCenterScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const theme = {
        background:        isDarkMode ? '#000000' : '#EDE5D5',
        card:              isDarkMode ? '#1a1a1a' : '#FAF8F3',
        text:              isDarkMode ? '#FFFFFF' : '#1C1208',
        subText:           isDarkMode ? '#999999' : '#4A3D28',
        icon:              isDarkMode ? '#FFD700' : '#8C6200',
        border:            isDarkMode ? '#1a1a1a' : '#D4C4A8',
        placeholder:       isDarkMode ? '#666666' : '#8C7050',
    };

    const FAQItem = ({ question, answer }) => (
        <View style={styles.faqContainer}>
            <Text allowFontScaling={false} style={[styles.question, { color: theme.text }]}>{question}</Text>
            <Text allowFontScaling={false} style={[styles.answer, { color: theme.subText }]}>{answer}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.headerTitle, { color: theme.text }]}>Yardım Merkezi</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
                <Ionicons name="search" size={20} color={theme.placeholder} style={{ marginRight: 10 }} />
                <TextInput allowFontScaling={false}
                    placeholder="Nasıl yardımcı olabiliriz?"
                    placeholderTextColor={theme.placeholder}
                    style={[styles.searchInput, { color: theme.text }]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.icon }]}>SIKÇA SORULAN SORULAR</Text>

                <FAQItem
                    question="Nasıl teklif alabilirim?"
                    answer="Ana sayfadan ihtiyacınız olan hizmeti seçin (Örn: Nakliye) ve talep formunu doldurun. En uygun teklifler cebinize gelsin."
                />
                <FAQItem
                    question="Ödemeler güvenli mi?"
                    answer="Evet, tüm ödemeler 3D Secure altyapısı ile korunmaktadır. Hizmet tamamlanana kadar ödemeniz güvendedir."
                />
                <FAQItem
                    question="Kurumsal üye nasıl olurum?"
                    answer="Profil ekranından 'Kurumsal Üyelik Başvurusu' butonuna tıklayarak işletme bilgilerinizi girebilirsiniz."
                />
                <FAQItem
                    question="Şifremi unuttum, ne yapmalıyım?"
                    answer="Giriş ekranındaki 'Şifremi Unuttum' bağlantısını kullanarak e-posta adresinize sıfırlama linki gönderebilirsiniz."
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        margin: 20,
        padding: 12,
        borderRadius: 12
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16 },
    content: { padding: 20, paddingTop: 0 },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 20,
        letterSpacing: 0.5
    },
    faqContainer: { marginBottom: 25 },
    question: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    answer: { color: '#999', fontSize: 14, lineHeight: 20 }
});
