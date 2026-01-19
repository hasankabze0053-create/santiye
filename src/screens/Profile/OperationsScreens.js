import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

// --- MOCK DATA ---

const REQUESTS_DATA = [
    {
        id: '1',
        title: '30 Ton İnşaat Demiri',
        subtitle: '12 Ocak • Kadıköy Şantiyesi',
        status: '3 Teklif',
        statusState: 'action',
        category: 'material',
    },
    {
        id: '2',
        title: 'Kiralık Vinç (3 Gün)',
        subtitle: '10 Ocak • Ataşehir',
        status: 'Bekleniyor',
        statusState: 'waiting',
        category: 'logistics',
    },
];

const OFFERS_DATA = [
    {
        id: '1',
        title: 'Kadıköy Konut Projesi',
        subtitle: 'İç Mimari Tasarım Teklifi',
        date: '14 Ocak',
        price: '150.000 ₺',
        status: 'Onaylandı',
        statusColor: '#34C759', // Green
    },
    {
        id: '2',
        title: 'Ataşehir AVM İnşaatı',
        subtitle: 'Kaba İnşaat Malzeme Tedariği',
        date: '11 Ocak',
        price: 'Teklif Gönderildi',
        status: 'Değerlendiriliyor',
        statusColor: '#FF9500', // Orange
    },
];

const MESSAGES_DATA = [
    {
        id: '1',
        sender: 'BetonSA Hazır Beton',
        message: 'Fiyat teklifimiz ektedir.',
        time: '10:30',
        avatar: 'https://images.unsplash.com/photo-1590059390492-d5495eb8302f?auto=format&fit=crop&w=150&q=80',
        unread: 2,
    },
    {
        id: '2',
        sender: 'Yılmazlar Nakliyat',
        message: 'Araçlar yola çıktı.',
        time: 'Dün',
        avatar: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=150&q=80',
        unread: 0,
    }
];

// --- SHARED COMPONENTS ---

const SegmentedTab = ({ tabs, activeTab, onTabChange, theme }) => (
    <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tabButton,
                        isActive && { backgroundColor: theme.accent }
                    ]}
                    onPress={() => onTabChange(tab)}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.tabText,
                        { color: isActive ? (theme.isDark ? '#000' : '#FFF') : theme.subText }
                    ]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

// --- 1. REQUESTS SCREEN (Taleplerim) ---
export const RequestsScreen = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true;
    const [activeTab, setActiveTab] = useState('Aktif');

    const theme = getTheme(isDarkMode);

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
                <MaterialCommunityIcons name={item.category === 'material' ? 'package-variant-closed' : 'truck-outline'} size={24} color={theme.accent} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.subText }]}>{item.subtitle}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.statusState === 'action' ? theme.accent : theme.iconBg }]}>
                <Text style={[styles.statusText, { color: item.statusState === 'action' ? '#000' : theme.subText }]}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <ScreenLayout title="Taleplerim" theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} tabs={['Aktif', 'Geçmiş']}>
            <FlatList data={REQUESTS_DATA} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={styles.listContent} />
        </ScreenLayout>
    );
};

// --- 2. OFFERS SCREEN (Tekliflerim) ---
export const OffersScreen = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true;
    const [activeTab, setActiveTab] = useState('Verilen');

    const theme = getTheme(isDarkMode);

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
                {/* Main Page Icon Match: File Document */}
                <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.accent} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.subText }]}>{item.subtitle}</Text>
                <Text style={[styles.priceText, { color: theme.accent }]}>{item.price}</Text>
            </View>
            <View style={styles.rightCol}>
                <Text style={[styles.statusSimple, { color: item.statusColor }]}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <ScreenLayout title="Tekliflerim" theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} tabs={['Verilen', 'Taslak']} icon="plus">
            <FlatList data={OFFERS_DATA} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={styles.listContent} />
        </ScreenLayout>
    );
};

// --- 3. INBOX SCREEN (Gelen Kutusu) ---
export const InboxScreen = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true;
    const [activeTab, setActiveTab] = useState('Mesajlar');
    const theme = getTheme(isDarkMode);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.messageItem, { backgroundColor: theme.card }]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.messageContent}>
                <View style={styles.messageRow}>
                    <Text style={[styles.senderName, { color: theme.text }]}>{item.sender}</Text>
                    <Text style={[styles.timeText, { color: theme.subText }]}>{item.time}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.messagePreview, { color: theme.subText }]}>{item.message}</Text>
            </View>
            {item.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>}
        </TouchableOpacity>
    );

    return (
        <ScreenLayout title="Gelen Kutusu" theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} tabs={['Mesajlar', 'Bildirimler']} icon="check-all">
            <FlatList data={MESSAGES_DATA} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={styles.listContent} />
        </ScreenLayout>
    );
};


// --- HELPERS ---

const getTheme = (isDarkMode) => ({
    isDark: isDarkMode,
    background: isDarkMode ? '#000000' : '#F2F2F7',
    card: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#121212',
    subText: isDarkMode ? '#8E8E93' : '#636366',
    accent: isDarkMode ? '#FDCB58' : '#121212',
    iconBg: isDarkMode ? '#2C2C2E' : '#E5E5EA',
});

const ScreenLayout = ({ title, theme, activeTab, setActiveTab, tabs, children, icon = "filter-variant" }) => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.iconBg }]}>
                <MaterialCommunityIcons name={icon} size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <SegmentedTab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
        </View>
        {children}
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
    headerTitle: { fontSize: 26, fontWeight: '800' },
    iconBtn: { padding: 8, borderRadius: 12 },
    tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    tabText: { fontWeight: '600', fontSize: 13 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },

    // Cards
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 16 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1, marginLeft: 16 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    cardSubtitle: { fontSize: 12 },
    statusBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
    statusText: { fontSize: 10, fontWeight: '700' },

    // Offers Special
    priceText: { fontSize: 14, fontWeight: '700', marginTop: 4 },
    rightCol: { alignItems: 'flex-end' },
    statusSimple: { fontSize: 12, fontWeight: '600' },

    // Messages
    messageItem: { flexDirection: 'row', padding: 16, marginBottom: 12, borderRadius: 16 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
    messageContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
    messageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    senderName: { fontWeight: 'bold', fontSize: 15 },
    timeText: { fontSize: 11, fontWeight: '500' },
    messagePreview: { fontSize: 13 },
    unreadBadge: { backgroundColor: '#FF3B30', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
    unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
