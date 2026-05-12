const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
    console.log('Checking elevator_requests table...');
    
    // Check if assigned_provider_ids exists
    const { data, error } = await supabase
        .from('elevator_requests')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error('Error fetching elevator_requests:', error);
    } else {
        console.log('Sample data from elevator_requests:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkDB();
