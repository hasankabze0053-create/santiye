import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ContactUsScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const theme = {
        background:        isDarkMode ? '#000000' : '#EDE5D5',
        card:              isDarkMode ? '#1a1a1a' : '#FAF8F3',
        text:              isDarkMode ? '#FFFFFF' : '#1C1208',
        subText:           isDarkMode ? '#999999' : '#4A3D28',
        icon:              isDarkMode ? '#FFD700' : '#8C6200',
        border:            isDarkMode ? '#333333' : '#D4C4A8',
        iconBg:            isDarkMode ? 'rgba(253, 203, 88, 0.1)' : 'rgba(140, 98, 0, 0.1)',
    };

    const ContactItem = ({ icon, title, subtitle, onPress, isMaterial }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
                {isMaterial ? (
                    <MaterialCommunityIcons name={icon} size={28} color={theme.icon} />
                ) : (
                    <Ionicons name={icon} size={28} color={theme.icon} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text allowFontScaling={false} style={[styles.title, { color: theme.text }]}>{title}</Text>
                <Text allowFontScaling={false} style={[styles.subtitle, { color: theme.subText }]}>{subtitle}</Text>
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
                <Text allowFontScaling={false} style={[styles.headerTitle, { color: theme.text }]}>Bize Ulaşın</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text allowFontScaling={false} style={[styles.description, { color: theme.subText }]}>
                    Projenizle ilgili sorularınız veya destek talepleriniz için bize aşağıdaki kanallardan ulaşabilirsiniz.
                </Text>

                <ContactItem
                    icon="call"
                    title="Müşteri Hizmetleri"
                    subtitle="0850 123 45 67"
                    onPress={() => Linking.openURL('tel:08501234567')}
                />
                <ContactItem
                    icon="mail"
                    title="E-Posta Desteği"
                    subtitle="destek@ceptesef.com"
                    onPress={() => Linking.openURL('mailto:destek@ceptesef.com')}
                />
                <ContactItem
                    icon="whatsapp"
                    isMaterial
                    title="WhatsApp Hattı"
                    subtitle="+90 555 123 45 67"
                    onPress={() => Linking.openURL('https://wa.me/905551234567')}
                />
                <ContactItem
                    icon="location"
                    title="Genel Merkez"
                    subtitle="Maslak, İstanbul"
                    onPress={() => { }}
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
    description: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333'
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(253, 203, 88, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    textContainer: { flex: 1 },
    title: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { color: '#999', fontSize: 14 }
});
