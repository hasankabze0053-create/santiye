import { supabase } from '../lib/supabase';

export const ChatService = {
    // Get active conversations for the current user
    async getConversations() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch distinct conversations where user is sender OR receiver
            // We will group by request_id and the "other party"
            // Since supabase doesn't support complex distinct + join easily in JS client, we might use a RPC or client-side grouping.
            // Let's try fetching all messages involving the user, order by created_at desc, and then group in JS.

            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url),
          receiver:profiles!receiver_id(full_name, avatar_url),
          request:request_id(district, neighborhood, ada, parsel, user_id)
        `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by conversation (Request ID + Other Party ID)
            const conversations = new Map();

            data.forEach(msg => {
                const otherPartyId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                const otherParty = msg.sender_id === user.id ? msg.receiver : msg.sender;
                const requestId = msg.request_id || 'general'; // Group by request, or general if null

                const key = `${requestId}_${otherPartyId}`;

                if (!conversations.has(key)) {
                    conversations.set(key, {
                        id: msg.id, // Use latest msg id as conversation id for list
                        conversationKey: key,
                        otherPartyId: otherPartyId,
                        otherParty: otherParty,
                        requestId: msg.request_id,
                        requestTitle: msg.request
                            ? `${msg.request.district} / ${msg.request.neighborhood} - ${msg.request.ada || '?'}/${msg.request.parsel || '?'}`
                            : 'Genel Sohbet',
                        lastMessage: msg.content,
                        lastMessageDate: msg.created_at,
                        requestOwnerId: msg.request?.user_id,
                        isRead: msg.sender_id === user.id ? true : msg.is_read,
                        type: 'chat' // To distinguish in Inbox
                    });
                }
            });

            return Array.from(conversations.values());

        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    },

    // Mark all messages in a conversation as read
    async markAsRead(otherPartyId, requestId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', otherPartyId)
                .eq('request_id', requestId); // Optional: if we track per request

            if (error) throw error;
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }
};
