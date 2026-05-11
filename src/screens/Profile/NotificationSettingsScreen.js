import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationSettingsScreen() {
    const navigation = useNavigation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [promoEnabled, setPromoEnabled] = useState(true);
    const { isDarkMode } = useTheme();

    const theme = {
        background:        isDarkMode ? '#000000' : '#EDE5D5',
        card:              isDarkMode ? '#1C1C1E' : '#FAF8F3',
        text:              isDarkMode ? '#FFFFFF' : '#1C1208',
        subText:           isDarkMode ? '#8E8E93' : '#4A3D28',
        icon:              isDarkMode ? '#FDCB58' : '#8C6200',
        border:            isDarkMode ? '#333333' : '#D4C4A8',
        switchTrackActive: isDarkMode ? '#FDCB58' : '#8C6200',
    };

    const ToggleItem = ({ label, value, onValueChange, description }) => (
        <View style={[styles.itemContainer, { borderBottomColor: theme.border }]}>
            <View style={styles.textContainer}>
                <Text allowFontScaling={false} style={[styles.label, { color: theme.text }]}>{label}</Text>
                {description && <Text allowFontScaling={false} style={[styles.description, { color: theme.subText }]}>{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: "#767577", true: theme.switchTrackActive }}
                thumbColor={value ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.headerTitle, { color: theme.text }]}>Bildirim Ayarları</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>GENEL BİLDİRİMLER</Text>
                <ToggleItem
                    label="Anlık Bildirimler"
                    description="Uygulama içi önemli güncellemeler ve uyarılar."
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                />

                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>İLETİŞİM KANALLARI</Text>
                <ToggleItem
                    label="E-Posta Bildirimleri"
                    description="Sipariş durumu ve fatura detayları."
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                />
                <ToggleItem
                    label="SMS Bildirimleri"
                    description="Acil durumlar ve güvenlik kodları."
                    value={smsEnabled}
                    onValueChange={setSmsEnabled}
                />

                <Text allowFontScaling={false} style={[styles.sectionTitle, { color: theme.subText }]}>PAZARLAMA</Text>
                <ToggleItem
                    label="Kampanyalar ve Fırsatlar"
                    description="Özel tekliflerden haberdar olun."
                    value={promoEnabled}
                    onValueChange={setPromoEnabled}
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
    textContainer: { flex: 1, marginRight: 15 },
    label: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    description: { color: '#999', fontSize: 12, marginTop: 4 }
});
