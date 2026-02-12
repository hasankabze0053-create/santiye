const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nxsjokupnsaeemtnlexf.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Missing SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfig() {
    console.log('Checking app_module_config...');
    const { data, error } = await supabase
        .from('app_module_config')
        .select('*');

    if (error) {
        console.error('Error fetching config:', error);
    } else {
        console.log('Config data:', data);
    }
}

checkConfig();
