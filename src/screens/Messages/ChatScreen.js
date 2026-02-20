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
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ChatScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { receiver_id, receiver_name, receiver_avatar, request_id, request_title, request_owner_id } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
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
                    // Only add if relevant to this chat (redundant check but safe)
                    if (
                        (newMessage.sender_id === currentUser?.id && newMessage.receiver_id === receiver_id) ||
                        (newMessage.sender_id === receiver_id && newMessage.receiver_id === currentUser?.id)
                    ) {
                        setMessages(prev => [newMessage, ...prev]);
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

        // Fetch messages between me and receiver
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch Messages Error:', error);
        } else {
            setMessages(data || []);
        }
    };

    const fetchOfferData = async (userId) => {
        try {
            const contractorId = userId === request_owner_id ? receiver_id : userId;

            const { data, error } = await supabase
                .from('construction_offers')
                .select('*, request:construction_requests(*), profiles:contractor_id(full_name, avatar_url, company_name)')
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

            const { error } = await supabase
                .from('messages')
                .insert(payload);

            if (error) {
                console.error('Supabase Insert Error:', JSON.stringify(error, null, 2));
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                throw error;
            }

            // Successfully sent
            // The subscription will eventually bring the real message with its actual ID.
            // The `setMessages` logic in the subscription handler will replace the optimistic message
            // or handle potential duplicates.

        } catch (error) {
            console.error('Send Message Error:', error);
            Alert.alert('Hata', 'Mesaj gönderilemedi.');
            setInputText(text); // Restore text
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.sender_id === currentUser?.id;
        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[styles.messageText, { color: isMe ? '#000' : '#FFF' }]}>{item.content}</Text>
                <Text style={[styles.timeText, { color: isMe ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                    {new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#000000', '#121212']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {receiver_avatar ? (
                                <Image source={{ uri: receiver_avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                        {receiver_name ? receiver_name.charAt(0).toUpperCase() : '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.headerTitle} numberOfLines={1}>{receiver_name || 'Sohbet'}</Text>
                                <Text style={styles.headerSubtitle} numberOfLines={1}>
                                    {request_title || 'GENEL PROJE'}
                                </Text>
                            </View>

                            {offerData && (
                                <TouchableOpacity
                                    style={styles.quoteBtn}
                                    onPress={() => {
                                        navigation.navigate('OfferDetail', {
                                            request: offerData.request,
                                            offers: offerData.offers,
                                            contractor_id: offerData.contractor_id,
                                            request_id: request_id
                                        });
                                    }}
                                >
                                    <Text style={styles.quoteBtnText}>TEKLİFİ GÖR</Text>
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
                            keyExtractor={item => item.id.toString()}
                            inverted
                            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                            ListEmptyComponent={
                                <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                                    <MaterialCommunityIcons name="message-text-outline" size={48} color="#666" />
                                    <Text style={{ color: '#666', marginTop: 10 }}>Henüz mesaj yok.</Text>
                                </View>
                            }
                        />
                    )}

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="add" size={24} color="#D4AF37" />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Mesajınızı yazın..."
                            placeholderTextColor="#666"
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
                                <Ionicons name="send" size={18} color={inputText.trim() ? '#000' : '#444'} />
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
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(40, 40, 40, 0.65)',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
