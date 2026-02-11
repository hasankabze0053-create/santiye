-- Create chats table
CREATE TABLE IF NOT EXISTS transformation_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS transformation_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES transformation_chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id), -- Null means system/admin
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for chats
ALTER TABLE transformation_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON transformation_chats;
CREATE POLICY "Users can view their own chats"
ON transformation_chats FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chats" ON transformation_chats;
CREATE POLICY "Users can insert their own chats"
ON transformation_chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS for messages
ALTER TABLE transformation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON transformation_messages;
CREATE POLICY "Users can view messages in their chats"
ON transformation_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM transformation_chats
        WHERE transformation_chats.id = transformation_messages.chat_id
        AND transformation_chats.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON transformation_messages;
CREATE POLICY "Users can insert messages in their chats"
ON transformation_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM transformation_chats
        WHERE transformation_chats.id = transformation_messages.chat_id
        AND transformation_chats.user_id = auth.uid()
    )
    AND (sender_id = auth.uid())
);

-- Enable Realtime for these tables
COMMENT ON TABLE transformation_messages IS 'Realtime chat messages';
alter publication supabase_realtime add table transformation_messages;
