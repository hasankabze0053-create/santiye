const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nxsjokupnsaeemtnlexf.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Missing SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCostConfig() {
    console.log('Checking cost_screen config...');
    const { data, error } = await supabase
        .from('screen_section_config')
        .select('*')
        .eq('screen_id', 'cost_screen');

    if (error) {
        console.error('Error fetching config:', error);
    } else {
        console.log('Cost Screen Config:', data);
    }
}

checkCostConfig();
