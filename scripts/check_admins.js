const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nxsjokupnsaeemtnlexf.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Missing SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
    console.log('Checking for admin users...');
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin')
        .eq('is_admin', true);

    if (error) {
        console.error('Error fetching admins:', error);
    } else {
        console.log('Admin Users:', data);
    }
}

checkAdmins();
