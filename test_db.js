const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing app_module_config table...");
    const { data, error } = await supabase.from('app_module_config').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
