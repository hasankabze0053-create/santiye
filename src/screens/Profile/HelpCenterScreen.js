import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HelpCenterScreen() {
    const navigation = useNavigation();

    const FAQItem = ({ question, answer }) => (
        <View style={styles.faqContainer}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yardım Merkezi</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Nasıl yardımcı olabiliriz?"
                    placeholderTextColor="#666"
                    style={styles.searchInput}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>SIKÇA SORULAN SORULAR</Text>

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
