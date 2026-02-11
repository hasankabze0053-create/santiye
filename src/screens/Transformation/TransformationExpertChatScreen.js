import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function TransformationExpertChatScreen() {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState(null);
    const [userId, setUserId] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        initializeChat();

        return () => {
            // Cleanup subscription on unmount
            if (chatId) {
                supabase.removeAllChannels();
            }
        };
    }, []);

    const initializeChat = async () => {
        try {
            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Hata", "Oturum açmanız gerekiyor.");
                navigation.goBack();
                return;
            }
            setUserId(user.id);

            // 2. Check if chat exists for this user, OR create one
            let { data: chat, error } = await supabase
                .from('transformation_chats')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (!chat) {
                // Create new chat
                const { data: newChat, error: createError } = await supabase
                    .from('transformation_chats')
                    .insert([{ user_id: user.id, status: 'open' }])
                    .select()
                    .single();

                if (createError) throw createError;
                chat = newChat;
            }

            setChatId(chat.id);

            // 3. Fetch existing messages
            const { data: existingMessages, error: msgError } = await supabase
                .from('transformation_messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;
            setMessages(existingMessages || []);

            // 4. Subscribe to Realtime Updates
            const subscription = supabase
                .channel(`chat:${chat.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'transformation_messages',
                        filter: `chat_id=eq.${chat.id}`
                    },
                    (payload) => {
                        setMessages(current => {
                            // Prevent duplicates just in case
                            if (current.some(msg => msg.id === payload.new.id)) return current;
                            return [...current, payload.new];
                        });
                    }
                )
                .subscribe();

        } catch (error) {
            console.error('Chat init error:', error);
            Alert.alert("Hata", "Sohbet başlatılamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !chatId || !userId) return;

        const textToSend = inputText.trim();
        setInputText(''); // Clear input immediately for better UX

        try {
            const { error } = await supabase
                .from('transformation_messages')
                .insert([{
                    chat_id: chatId,
                    sender_id: userId,
                    text: textToSend,
                    is_read: false
                }]);

            if (error) {
                Alert.alert("Hata", "Mesaj gönderilemedi.");
                setInputText(textToSend); // Restore text on error
            }
        } catch (e) {
            console.error(e);
            setInputText(textToSend);
        }
    };

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const renderMessage = ({ item }) => {
        const isUser = item.sender_id === userId;
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.systemBubble
            ]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="face-agent" size={20} color="#000" />
                    </View>
                )}
                <View style={[
                    styles.messageContent,
                    isUser ? styles.userContent : styles.systemContent
                ]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.systemText]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>UZMANA DANIŞIN</Text>
                        <Text style={styles.headerSubtitle}>Kentsel Dönüşüm Destek</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Chat Area */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading && (
                            <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                                <MaterialCommunityIcons name="message-text-outline" size={48} color="#FFD700" />
                                <Text style={{ color: '#FFF', marginTop: 10 }}>Merak ettiklerinizi sorun.</Text>
                            </View>
                        )
                    }
                />

                {/* Input Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Sorunuzu yazın..."
                            placeholderTextColor="#666"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Ionicons name="send" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#222',
        borderRadius: 12
    },
    headerTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    headerSubtitle: {
        color: '#666',
        fontSize: 11,
        textAlign: 'center'
    },
    chatContent: {
        padding: 20,
        paddingBottom: 40
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'flex-end'
    },
    userBubble: {
        justifyContent: 'flex-end'
    },
    systemBubble: {
        justifyContent: 'flex-start'
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    messageContent: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    userContent: {
        backgroundColor: '#FFD700',
        borderBottomRightRadius: 4
    },
    systemContent: {
        backgroundColor: '#222',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#333'
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20
    },
    userText: {
        color: '#000'
    },
    systemText: {
        color: '#FFF'
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-end',
        marginTop: 4
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#222',
        backgroundColor: '#111'
    },
    input: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#FFF',
        maxHeight: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
