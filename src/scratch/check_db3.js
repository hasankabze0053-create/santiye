const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking elevator_requests schema...');
    // A trick to get columns if we have insert access: just insert a bad column and see the error.
    // However, querying information_schema might fail if blocked by postgrest settings.
    
    // Attempting to select 1 row
    const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'elevator_requests' }); // usually not available
    
    if (error) {
        console.error('RPC Error:', error);
    }
    
    // Instead, just run a query with an intentionally bad column to get an error message containing valid columns (sometimes) or just verify if assigned_provider_ids is missing
    const { error: error2 } = await supabase
        .from('elevator_requests')
        .update({ assigned_provider_ids: [] })
        .eq('id', '00000000-0000-0000-0000-000000000000');
        
    console.log('Update Error (assigned_provider_ids):', error2);
}

checkColumns();
