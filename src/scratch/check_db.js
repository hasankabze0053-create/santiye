import { supabase } from '../lib/supabase.js';

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
