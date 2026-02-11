
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRest() {
    console.log('Testing REST connection to:', SUPABASE_URL);
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ REST API Error:', error.message);
        } else {
            console.log('✅ REST API Success! Profile count (or access):', data);
        }
    } catch (err) {
        console.error('❌ REST API Exception:', err.message);
    }
}

testRest();
