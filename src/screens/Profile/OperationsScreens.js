import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator // Added ActivityIndicator
    ,





















    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatService } from '../../services/ChatService';
import { ConstructionService } from '../../services/ConstructionService'; // Added ConstructionService
import { MarketService } from '../../services/MarketService';

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
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state, default true
    const theme = getTheme(isDarkMode);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const loadRequests = async () => {
        setLoading(true); // Start loading
        setRequests([]); // Clear list to force refresh visual


        try {
            const [marketData, constructionData] = await Promise.all([
                MarketService.getUserRequests(),
                ConstructionService.getUserRequests()
            ]);

            // Transform construction data to match request interface if needed
            const formattedConstructionData = constructionData.map(item => ({
                ...item,
                type: 'construction', // Tag to distinguish
                title: 'Kentsel Dönüşüm Talebi', // Or generic title
                subtitle: `${item.district} / ${item.neighborhood}`,
                created_at: item.created_at,
                status: item.status === 'pending' ? 'OPEN' : item.status, // Map status
                // Add other fields as needed
            }));

            // Merge and sort
            const allRequests = [...(marketData || []), ...formattedConstructionData];
            allRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setRequests(allRequests);
        } catch (error) {
            console.error("Load Requests Error:", error);
        } finally {
            setLoading(false); // End loading
        }
    };

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'Aktif') return r.status === 'OPEN';
        return r.status !== 'OPEN';
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RequestDetail', { request: item })}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
                {item.type === 'construction' ? (
                    <MaterialCommunityIcons name="office-building-cog" size={24} color={theme.accent} />
                ) : (
                    <MaterialCommunityIcons name="package-variant-closed" size={24} color={theme.accent} />
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.subText }]}>
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.bids && item.bids.length > 0 ? theme.accent : theme.iconBg }]}>
                <Text style={[styles.statusText, { color: item.bids && item.bids.length > 0 ? '#000' : theme.subText }]}>
                    {item.bids ? `${item.bids.length} Teklif` : 'Bekleniyor'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color={theme.subText} style={{ marginBottom: 10 }} />
            <Text style={{ color: theme.subText, textAlign: 'center', marginBottom: 20 }}>Henüz bir talebiniz yok.</Text>
            <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: theme.accent }]}
                onPress={() => navigation.navigate('MarketRequest')}
            >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>YENİ TALEP OLUŞTUR</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenLayout title="Taleplerim" theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} tabs={['Aktif', 'Geçmiş']}>
            {loading && requests.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderItem}
                    keyExtractor={i => i.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyState />}
                    onRefresh={loadRequests}
                    refreshing={loading}
                />
            )}
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

// --- 3. INBOX SCREEN (Gelen Kutusu / Teklifler) ---
export const InboxScreen = () => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark' || true;
    const [activeTab, setActiveTab] = useState('Mesajlar');
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const theme = getTheme(isDarkMode);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            loadInbox();
        }, [])
    );

    const loadInbox = async () => {
        setLoading(true);
        try {
            const [marketOffers, constructionOffers, activeChats] = await Promise.all([
                MarketService.getIncomingOffers(),
                ConstructionService.getIncomingOffers(),
                ChatService.getConversations() // Fetch chats
            ]);

            // Normalize Chats
            const normChats = (activeChats || []).map(c => ({
                id: c.key, // Use conversation key as unique ID
                type: 'chat',
                title: c.otherParty?.company_name || c.otherParty?.full_name || 'Kullanıcı',
                subtitle: c.lastMessage,
                date: c.lastMessageDate,
                price: '', // No price for chat
                status: c.isRead ? 'ok' : 'new',
                statusColor: c.isRead ? '#8E8E93' : '#FF3B30',
                profiles: c.otherParty, // Use other party as profile
                request: { title: c.requestTitle || 'Genel Sohbet' },
                // data for navigation
                otherPartyId: c.otherPartyId,
                requestId: c.requestId
            }));

            // Group Construction Offers by Request + Contractor
            const groupedConstruction = {};
            (constructionOffers || []).forEach(offer => {
                const key = `${offer.request_id}_${offer.contractor_id}`;
                if (!groupedConstruction[key]) {
                    groupedConstruction[key] = {
                        ...offer,
                        type: 'construction',
                        offers: [],
                        request: {
                            ...offer.request,
                            title: offer.request?.title || `${offer.request?.district || ''} / ${offer.request?.neighborhood || ''} - Kentsel Dönüşüm`
                        }
                    };
                }
                groupedConstruction[key].offers.push(offer);
            });

            // Normalize Market Offers
            const normMarket = (marketOffers || []).map(o => ({ ...o, type: 'market' }));

            // Normalize Construction Groups
            const normConstruction = Object.values(groupedConstruction).map(group => {
                // Determine display price/text
                let displayPrice;
                if (group.offers.length > 1) {
                    displayPrice = `${group.offers.length} Farklı Teklif`;
                } else {
                    const singleOffer = group.offers[0];
                    displayPrice = singleOffer.unit_breakdown
                        ? 'Kat Karşılığı Teklif'
                        : (singleOffer.price_estimate ? singleOffer.price_estimate.toLocaleString('tr-TR') + ' ₺' : 'Fiyat Teklifi');
                }

                return {
                    ...group,
                    price: displayPrice
                };
            });

            // Sort Lists
            const sortedChats = normChats.sort((a, b) => new Date(b.date) - new Date(a.date));
            const sortedNotifications = [...normMarket, ...normConstruction].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setChats(sortedChats);
            setNotifications(sortedNotifications);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.messageItem, { backgroundColor: theme.card }]}
            onPress={() => {
                if (item.type === 'chat') {
                    navigation.navigate('Chat', {
                        receiver_id: item.otherPartyId,
                        receiver_name: item.title,
                        receiver_avatar: item.profiles?.avatar_url,
                        request_id: item.requestId,
                        request_title: item.request?.title
                    });
                } else if (item.type === 'construction') {
                    // Navigate to Offer Detail (Carousel View) directly
                    // We pass the GROUP of offers
                    navigation.navigate('OfferDetail', {
                        request: item.request,
                        offers: item.offers,
                        contractor_id: item.contractor_id,
                        request_id: item.request_id
                    });
                } else if (item.request) {
                    // Market Request
                    navigation.navigate('RequestDetail', { request: item.request });
                }
            }}
        >
            <View style={[styles.messageContent, { marginLeft: 0 }]}>
                <View style={styles.messageRow}>
                    <Text style={[styles.senderName, { color: theme.text, fontSize: 16 }]}>
                        {item.profiles?.full_name || 'Bilinmeyen Tedarikçi'}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.subText }]}>
                        {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* Mesaj Yerine Teklif Özeti VEYA Chat Mesajı */}
                <Text numberOfLines={1} style={[styles.messagePreview, { color: theme.accent, marginTop: 2 }]}>
                    {item.type === 'chat'
                        ? (item.subtitle || 'Mesaj gönderildi')
                        : (item.price ? `${item.price} - Fiyat Teklifi` : 'Yeni bir teklif gönderdi.')
                    }
                </Text>
                <Text numberOfLines={1} style={[styles.cardSubtitle, { color: theme.subText, marginTop: 4, fontSize: 11 }]}>
                    {item.type === 'chat' ? 'Sohbet' : `Talep: ${item.request?.title}`}
                </Text>

            </View>

            {/* Status Badge / Button */}
            <View style={styles.rightCol}>
                {item.type === 'chat' ? (
                    <View style={{ alignItems: 'flex-end' }}>
                        {!item.isRead && (
                            <View style={{ backgroundColor: '#FF3B30', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>1</Text>
                            </View>
                        )}
                        <Text style={{ color: theme.subText, fontSize: 10 }}>
                            {new Date(item.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ) : (
                    item.status === 'pending' ? (
                        <LinearGradient
                            colors={['#D4AF37', '#AA8A2E']} // Richer Gold Gradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.premiumBadge}
                        >
                            <MaterialCommunityIcons name="star-four-points" size={12} color="#000" style={{ marginRight: 6 }} />
                            <Text style={styles.premiumBadgeText}>
                                İNCELE
                            </Text>
                        </LinearGradient>
                    ) : (
                        <Text style={[styles.statusText, { color: item.status === 'approved' ? '#34C759' : theme.subText, marginTop: 10 }]}>
                            {item.status === 'approved' ? 'ONAYLANDI' : item.status}
                        </Text>
                    )
                )}
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={{ alignItems: 'center', marginTop: 40, padding: 20 }}>
            <MaterialCommunityIcons name="email-off-outline" size={48} color={theme.subText} style={{ marginBottom: 10 }} />
            <Text style={{ color: theme.subText, textAlign: 'center' }}>Henüz gelen bir mesaj veya teklif yok.</Text>
        </View>
    );

    return (
        <ScreenLayout title="Gelen Kutusu" theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} tabs={['Mesajlar', 'Bildirimler']} icon="check-all">
            <FlatList
                data={activeTab === 'Mesajlar' ? chats : notifications}
                renderItem={renderItem}
                keyExtractor={i => i.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<EmptyState />}
                onRefresh={loadInbox}
                refreshing={loading}
            />
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
    createBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20, // More rounded/pill shape
        elevation: 6,
        shadowColor: '#D4AF37',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    premiumBadgeText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1
    },
});
