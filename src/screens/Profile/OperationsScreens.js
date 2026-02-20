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
                subtitle: c.requestTitle || 'Genel Sohbet',
                created_at: c.lastMessageDate, // Correct property name for date formatting
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
                const isTurnkey = group.offers.some(o => o.unit_breakdown);

                if (group.offers.length > 1) {
                    displayPrice = `${group.offers.length} Farklı Teklif`;
                } else {
                    const singleOffer = group.offers[0];
                    displayPrice = isTurnkey
                        ? 'Kat Karşılığı'
                        : (singleOffer.price_estimate ? singleOffer.price_estimate.toLocaleString('tr-TR') + ' ₺' : 'Fiyat Teklifi');
                }

                return {
                    ...group,
                    price: displayPrice,
                    requestType: isTurnkey ? 'Kat Karşılığı' : 'Kentsel Dönüşüm',
                    companyName: group.profiles?.company_name || group.profiles?.full_name || 'Bilinmeyen Firma',
                    location: `${group.request?.city || 'İstanbul'} / ${group.request?.district || ''}`
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

    const renderItem = ({ item }) => {
        if (item.type === 'chat') {
            const isUnread = !item.isRead;
            return (
                <TouchableOpacity
                    style={styles.premiumChatCard}
                    onPress={() => {
                        navigation.navigate('Chat', {
                            receiver_id: item.otherPartyId,
                            receiver_name: item.title,
                            receiver_avatar: item.profiles?.avatar_url,
                            request_id: item.requestId,
                            request_title: item.request?.title,
                            request_owner_id: item.requestOwnerId
                        });
                    }}
                >
                    <View style={styles.premiumCardContent}>
                        <View style={styles.premiumHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                {item.profiles?.avatar_url ? (
                                    <Image source={{ uri: item.profiles.avatar_url }} style={styles.premiumAvatar} />
                                ) : (
                                    <View style={styles.premiumAvatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>
                                            {item.title?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.premiumCompanyName} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <MaterialCommunityIcons name="check-decagram" size={14} color="#D4AF37" style={{ marginLeft: 4 }} />
                                    </View>
                                    <Text style={styles.premiumLocationText} numberOfLines={1}>
                                        Sohbet • {item.request?.title || 'Genel'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.premiumTimeText}>
                                    {item.created_at ? new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </Text>
                                {isUnread && (
                                    <View style={styles.premiumUnreadBadge}>
                                        <Text style={styles.premiumUnreadText}>YENİ</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Text numberOfLines={2} style={[
                            styles.premiumChatPreview,
                            isUnread && { color: '#FFF', fontWeight: '600' }
                        ]}>
                            {item.subtitle || 'Mesaj gönderildi'}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        // --- PREMIUM NOTIFICATION CARD ---
        return (
            <TouchableOpacity
                style={styles.premiumNotificationCard}
                onPress={() => {
                    if (item.type === 'construction') {
                        navigation.navigate('OfferDetail', {
                            request: item.request,
                            offers: item.offers,
                            contractor_id: item.contractor_id,
                            request_id: item.request_id
                        });
                    } else if (item.request) {
                        navigation.navigate('RequestDetail', { request: item.request });
                    }
                }}
            >
                <View style={styles.premiumCardGlow} />

                <View style={styles.premiumCardContent}>
                    {/* Header: Company & Time */}
                    <View style={styles.premiumHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.premiumCompanyName}>
                                {item.companyName || item.profiles?.company_name || 'İsimsiz Firma'}
                            </Text>
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker" size={12} color="#D4AF37" />
                                <Text style={styles.premiumLocationText}>
                                    {item.location || 'İstanbul / Çatalca'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.premiumTimeText}>
                            {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <View style={styles.premiumDivider} />

                    {/* Body: Request Type & Price */}
                    <View style={styles.premiumBody}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.premiumLabelText}>TALEP TÜRÜ</Text>
                            <Text style={styles.premiumValueText}>
                                {item.requestType || 'Kat Karşılığı'}
                            </Text>
                        </View>

                        <LinearGradient
                            colors={['#D4AF37', '#AA8A2E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.premiumActionButton}
                        >
                            <Text style={styles.premiumActionText}>+ İNCELE</Text>
                        </LinearGradient>
                    </View>

                    {/* Footer: Price or Offer Count */}
                    <View style={styles.premiumFooter}>
                        <MaterialCommunityIcons name="cube-send" size={14} color="rgba(212, 175, 55, 0.6)" />
                        <Text style={styles.premiumFooterText}>
                            {item.price || 'Fiyat Teklifi'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
    premiumNotificationCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    premiumCardGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        backgroundColor: '#D4AF37',
        opacity: 0.5
    },
    premiumCardContent: {
        padding: 16
    },
    premiumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    premiumCompanyName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4
    },
    premiumLocationText: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500'
    },
    premiumTimeText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600'
    },
    premiumDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 14
    },
    premiumBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    premiumLabelText: {
        color: '#D4AF37',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 2
    },
    premiumValueText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700'
    },
    premiumActionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4
    },
    premiumActionText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900'
    },
    premiumFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
        borderRadius: 10,
        gap: 8
    },
    premiumFooterText: {
        color: 'rgba(212, 175, 55, 0.8)',
        fontSize: 13,
        fontWeight: '600'
    },
    // Premium Chat Styles
    premiumChatCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.1)',
        overflow: 'hidden'
    },
    premiumAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)'
    },
    premiumAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2C2C2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)'
    },
    avatarInitial: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: 'bold'
    },
    premiumUnreadBadge: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4
    },
    premiumUnreadText: {
        color: '#000',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5
    },
    premiumChatPreview: {
        color: '#888',
        fontSize: 13,
        marginTop: 10,
        lineHeight: 18
    }
});
