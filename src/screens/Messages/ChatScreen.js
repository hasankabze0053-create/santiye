import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function ChatScreen() {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { receiver_id, receiver_name, receiver_avatar, request_id, request_title, request_owner_id } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserType, setCurrentUserType] = useState(null);
    const [receiverUserType, setReceiverUserType] = useState(null);
    const [offerData, setOfferData] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!receiver_id) {
            Alert.alert('Hata', 'Alıcı bilgisi bulunamadı.');
            navigation.goBack();
            return;
        }
        setupChat();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                    // removed filter: request_id to catch all and rely on RLS + client filter
                },
                (payload) => {
                    const newMessage = payload.new;
                    const isRelevantUser = (
                        (newMessage.sender_id === currentUser?.id && newMessage.receiver_id === receiver_id) ||
                        (newMessage.sender_id === receiver_id && newMessage.receiver_id === currentUser?.id)
                    );

                    const matchesRequest = request_id
                        ? newMessage.request_id === request_id
                        : !newMessage.request_id; // null or undefined

                    // Only add if relevant to THIS specific chat room (users + specific project)
                    if (isRelevantUser && matchesRequest) {
                        setMessages(prev => {
                            // 1. DEDUPLICATION: If this ID already exists, ignore it (prevents React duplicate key warning)
                            if (prev.some(m => m.id === newMessage.id)) return prev;

                            // 2. OPTIMISTIC UI CLEANUP: If the real message arrives before the insert resolves, 
                            // remove the temporary optimistic message that has the same content.
                            const cleanedPrev = prev.filter(m => 
                                !(String(m.id).startsWith('temp-') && m.content === newMessage.content && m.sender_id === newMessage.sender_id)
                            );

                            // 3. Add the new real message to the top
                            return [newMessage, ...cleanedPrev];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [receiver_id, request_id]);

    const setupChat = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            // Get both profile types
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, user_type')
                .in('id', [user.id, receiver_id]);
            
            if (profiles) {
                const myProfile = profiles.find(p => p.id === user.id);
                const recProfile = profiles.find(p => p.id === receiver_id);
                if (myProfile) setCurrentUserType(myProfile.user_type);
                if (recProfile) setReceiverUserType(recProfile.user_type);
            }

            await fetchMessages(user.id);
            if (request_id) {
                await fetchOfferData(user.id);
            }
        } catch (error) {
            console.error('Chat Setup Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        if (!receiver_id) return;

        // Base query for me and receiver
        let query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userId})`);

        // ISOLATION: Strict filter by request_id so different projects don't mix
        if (request_id) {
            query = query.eq('request_id', request_id);
        } else {
            query = query.is('request_id', null);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch Messages Error:', error);
        } else {
            // DEDUPLICATION: Ensure initial fetch has absolute unique IDs
            if (data && data.length > 0) {
                const uniqueMap = new Map();
                data.forEach(item => uniqueMap.set(item.id, item));
                setMessages(Array.from(uniqueMap.values()));
            } else {
                setMessages([]);
            }
        }
    };

    const fetchOfferData = async (userId) => {
        try {
            const contractorId = userId === request_owner_id ? receiver_id : userId;

            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests!request_id(*), profiles:profiles!contractor_id(full_name, avatar_url, company_name)')
                .eq('request_id', request_id)
                .eq('contractor_id', contractorId)
                .neq('status', 'draft');

            if (error) throw error;
            if (data && data.length > 0) {
                setOfferData({
                    offers: data,
                    request: data[0].request,
                    contractor_id: contractorId
                });
            }
        } catch (error) {
            console.error('Fetch Offer Data Error:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        if (!currentUser || !receiver_id) {
            Alert.alert('Hata', 'Mesaj gönderilemiyor. Oturum veya alıcı hatası.');
            return;
        }

        setSending(true);
        const text = inputText.trim();
        setInputText(''); // Optimistic clear

        try {
            // Optimistic Update
            const optimisticMsg = {
                id: `temp-${Math.random().toString(36).substring(2, 15)}`, // Temp ID
                sender_id: currentUser.id,
                receiver_id: receiver_id,
                content: text,
                request_id: request_id || null, // Ensure ID is saved if provided
                created_at: new Date().toISOString(),
                is_read: false
            };
            setMessages(prev => [optimisticMsg, ...prev]);

            const payload = {
                sender_id: currentUser.id,
                receiver_id: receiver_id,
                request_id: request_id || null, // Ensure null if undefined
                content: text,
                is_read: false
            };
            console.log('Sending message payload:', payload);

            const { error, data: insertedData } = await supabase
                .from('messages')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('Supabase Insert Error:', JSON.stringify(error, null, 2));
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                throw error;
            }

            // Successfully sent -> Swap the optimistic message with the REAL message from database
            setMessages(prev => {
                // If the realtime subscription already added the real message, just remove the temp one
                if (prev.some(m => m.id === insertedData.id)) {
                    return prev.filter(m => m.id !== optimisticMsg.id);
                }
                // Otherwise, replace the temp one with the real one
                return prev.map(m => m.id === optimisticMsg.id ? insertedData : m);
            });

        } catch (error) {
            console.error('Send Message Error:', error);
            Alert.alert('Hata', 'Mesaj gönderilemedi.');
            setInputText(text); // Restore text
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isSystemContactShare = item.content?.startsWith('SYSTEM_CONTACT_SHARE|');
        const isMe = item.sender_id === currentUser?.id;

        if (isSystemContactShare) {
            const phone = item.content.split('|')[1];
            return (
                <View style={[styles.systemMessageContainer, { 
                    backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(140, 98, 0, 0.08)',
                    borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(140, 98, 0, 0.2)'
                }]}>
                    <MaterialCommunityIcons name="shield-check" size={20} color={isDarkMode ? '#D4AF37' : '#8C6200'} style={{ marginBottom: 4 }} />
                    <Text allowFontScaling={false} style={[styles.systemMessageText, { color: isDarkMode ? '#E0E0E0' : '#444' }]}>
                        {isMe 
                            ? `İletişim bilgileriniz firma ile paylaşılmıştır.\n(${phone})`
                            : `Verdiğiniz Teklife İstinaden, ${phone} numaralı kişi sizden görüşme talep ederek numarasını paylaştı.`}
                    </Text>
                    <Text allowFontScaling={false} style={{ color: isDarkMode ? 'rgba(212, 175, 55, 0.6)' : 'rgba(140, 98, 0, 0.6)', fontSize: 10, marginTop: 6, fontWeight: 'bold' }}>SİSTEM MESAJI</Text>
                    
                    {!isMe && (
                        <TouchableOpacity 
                            style={{
                                marginTop: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#4CAF50',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 12,
                                gap: 6
                            }}
                            onPress={() => Linking.openURL(`tel:${phone}`)}
                        >
                            <MaterialCommunityIcons name="phone" size={16} color="#FFF" />
                            <Text allowFontScaling={false} style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>HEMEN ARA</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : (isDarkMode ? styles.theirMessageDark : styles.theirMessageLight)
            ]}>
                <Text allowFontScaling={false} style={[
                    styles.messageText, 
                    { color: isMe ? '#000' : (isDarkMode ? '#FFF' : '#333') }
                ]}>{item.content}</Text>
                <Text allowFontScaling={false} style={[
                    styles.timeText, 
                    { color: isMe ? 'rgba(0,0,0,0.5)' : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') }
                ]}>
                    {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    const getDisplayName = () => {
        if (!receiver_name) return 'Sohbet';

        const getInitials = (name) => {
            const words = name.trim().split(' ');
            if (words.length >= 2) return words.map(w => w.charAt(0).toUpperCase()).join('');
            return name.charAt(0).toUpperCase();
        };

        // Prevent flash of full name by obfuscating until user types are resolved
        if (currentUserType === null) {
            return getInitials(receiver_name);
        }

        if (currentUserType === 'corporate' && (!receiverUserType || receiverUserType === 'individual')) {
            return getInitials(receiver_name);
        }
        return receiver_name;
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0A0A0A' : '#F8F9FA' }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            {isDarkMode && <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />}
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={[styles.header, { 
                    backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
                    borderBottomColor: isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.05)'
                }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="arrow-back" size={20} color={isDarkMode ? "#FFF" : "#333"} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {receiver_avatar ? (
                                <Image source={{ uri: receiver_avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text allowFontScaling={false} style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                        {getDisplayName().charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text allowFontScaling={false} style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111' }]} numberOfLines={1}>{getDisplayName()}</Text>
                                <Text allowFontScaling={false} style={[styles.headerSubtitle, { color: isDarkMode ? '#D4AF37' : '#B8860B' }]} numberOfLines={1}>
                                    {request_title || 'GENEL PROJE'}
                                </Text>
                            </View>

                            {offerData && (
                                <TouchableOpacity
                                    style={[styles.quoteBtn, {
                                        borderColor: isDarkMode ? '#D4AF37' : '#8C6200',
                                        backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.05)' : 'rgba(140, 98, 0, 0.05)'
                                    }]}
                                    onPress={() => {
                                        navigation.navigate('OfferDetail', {
                                            request: offerData.request,
                                            offers: offerData.offers,
                                            contractor_id: offerData.contractor_id,
                                            request_id: request_id
                                        });
                                    }}
                                >
                                    <Text allowFontScaling={false} style={[styles.quoteBtnText, { color: isDarkMode ? '#D4AF37' : '#8C6200' }]}>TEKLİFİ GÖR</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Main Chat Area with Keyboard Handling */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    {loading ? (
                        <ActivityIndicator color="#D4AF37" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id.toString()}
                            inverted
                            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                                    <MaterialCommunityIcons name="message-text-outline" size={48} color="#666" />
                                    <Text allowFontScaling={false} style={{ color: '#666', marginTop: 10 }}>Henüz mesaj yok.</Text>
                                </View>
                            }
                        />
                    )}

                    {/* Input Area */}
                    <View style={[styles.inputContainer, { 
                        backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
                        borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }]}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                            <Ionicons name="add" size={24} color={isDarkMode ? "#D4AF37" : "#B8860B"} />
                        </TouchableOpacity>

                        <TextInput allowFontScaling={false}
                            style={[styles.input, { 
                                backgroundColor: isDarkMode ? '#1C1C1E' : '#F3F4F6',
                                color: isDarkMode ? '#FFF' : '#333',
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                            }]}
                            placeholder="Mesajınızı yazın..."
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                { backgroundColor: inputText.trim() ? '#D4AF37' : '#222' }
                            ]}
                            disabled={!inputText.trim() || sending}
                            onPress={sendMessage}
                            activeOpacity={0.7}
                        >
                            {sending ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <Ionicons name="send" size={18} color={inputText.trim() ? '#000' : (isDarkMode ? '#444' : '#999')} />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 175, 55, 0.1)',
        zIndex: 10,
        backgroundColor: '#121212'
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerContent: { flex: 1, marginLeft: 12 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
    headerSubtitle: { color: '#D4AF37', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginTop: 1 },
    avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },

    quoteBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.05)'
    },
    quoteBtnText: {
        color: '#D4AF37',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5
    },

    messageBubble: {
        maxWidth: '82%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 14,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(212, 175, 55, 0.9)',
        borderBottomRightRadius: 4,
    },
    theirMessageDark: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(40, 40, 40, 0.65)',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    theirMessageLight: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
        fontWeight: '500'
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#121212'
    },
    systemMessageContainer: {
        alignSelf: 'center',
        width: '85%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    systemMessageText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 10
    },
    input: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        color: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 10,
        maxHeight: 120,
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },
});
