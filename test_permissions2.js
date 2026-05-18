require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            is_admin,
            companies!companies_owner_id_fkey (
                id,
                company_services (
                    service_type,
                    status
                )
            )
        `)
        .limit(5);

    if (error) console.error("Error:", error);
    else console.log(JSON.stringify(data, null, 2));
}

test();
