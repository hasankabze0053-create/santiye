
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChat() {
    console.log('Testing Chat Insert...');

    // 1. Login
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'korayzengin1999+1@gmail.com', // Using the email from terminal logs
        password: 'password' // Assuming dev password, or I might need to skip auth if RLS allows anon (unlikely)
    });

    if (authError || !user) {
        console.error('Auth failed:', authError);
        // Try getting session if local (not easy in node script without storage)
        // Check if I can just use the service role key if available?
        // User variables usually don't have service role.
        return;
    }

    console.log('Logged in as:', user.id);

    // 2. Insert Message
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: user.id,
            receiver_id: user.id, // Send to self for test
            content: 'Test message from script',
            is_read: false
        })
        .select();

    if (error) {
        console.error('Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert Success:', data);
    }
}

testChat();
