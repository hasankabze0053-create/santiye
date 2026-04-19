const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const sql = fs.readFileSync('fix_security.sql', 'utf8');
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("Success");
    }
}
run();
