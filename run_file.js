const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    try {
        const { data, error } = await supabase
            .rpc('exec_sql', { sql_query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'companies'" });
        
        console.log("Companies columns:");
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
run();
