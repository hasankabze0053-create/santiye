require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkData() {
    const { data, error } = await supabase
        .from('screen_section_config')
        .select('*')
        .like('id', 'highlight_card_%');
        
    console.log("Error:", error);
    console.log("Data length:", data?.length);
    console.log("Data:", JSON.stringify(data, null, 2));
}

checkData();
