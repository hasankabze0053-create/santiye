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
    const { receiver_id, receiver_name, receiver_avatar, request_id, request_title } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
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
                    table: 'messages',
                    filter: `request_id=eq.${request_id}`
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
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: currentUser.id,
                    receiver_id: receiver_id,
                    request_id: request_id, // Context
                    content: text,
                    is_read: false
                });

            if (error) throw error;

            // Optimistic update if needed (Subscription usually handles it)
            // pushing locally just in case subscription is slow
            const optimisticMsg = {
                id: Math.random().toString(), // Temp ID
                sender_id: currentUser.id,
                receiver_id: receiver_id,
                content: text,
                created_at: new Date().toISOString(),
                is_read: false
            };
            // Check if already added by subscription to avoid dupe? 
            // Better rely on subscription OR check ID. 
            // For now, let's rely on subscription for single source of truth to avoid complexity.
            // But user wants "instant reaction".
            // We'll add it, and if subscription adds it again, we might have dupe if we don't handle IDs.
            // React Key extractor handles unique IDs.
            // Let's NOT add optimistic locally to avoid dupes, unless subscription fails.

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
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {receiver_avatar ? (
                                <Image source={{ uri: receiver_avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={{ color: '#DDD', fontWeight: 'bold' }}>
                                        {receiver_name ? receiver_name.charAt(0).toUpperCase() : '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={{ marginLeft: 10 }}>
                                <Text style={styles.headerTitle}>{receiver_name || 'Sohbet'}</Text>
                                {request_title && (
                                    <Text style={styles.headerSubtitle} numberOfLines={1}>{request_title}</Text>
                                )}
                            </View>
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
                            contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
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
                                { backgroundColor: inputText.trim() ? '#D4AF37' : '#333' }
                            ]}
                            disabled={!inputText.trim() || sending}
                            onPress={sendMessage}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {sending ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <Ionicons name="send" size={20} color={inputText.trim() ? '#000' : '#666'} />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222', zIndex: 10, backgroundColor: '#000' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#1A1A1A' },
    headerContent: { flex: 1, marginLeft: 10 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSubtitle: { color: '#888', fontSize: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#333' },

    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
    myMessage: { alignSelf: 'flex-end', backgroundColor: '#D4AF37', borderBottomRightRadius: 2 },
    theirMessage: { alignSelf: 'flex-start', backgroundColor: '#252525', borderBottomLeftRadius: 2 },
    messageText: { fontSize: 15 },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#111' },
    input: { flex: 1, backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});
