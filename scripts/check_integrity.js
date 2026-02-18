const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabaseIntegrity() {
    console.log('🔍 Checking Database Schema...');

    const checks = [
        {
            table: 'construction_requests',
            columns: ['campaign_unit_count', 'campaign_commercial_count', 'is_campaign_active']
        },
        {
            table: 'construction_offers',
            columns: ['floor_details', 'basement_count', 'request_id', 'contractor_id']
        },
        {
            table: 'messages',
            columns: ['id', 'sender_id', 'receiver_id', 'request_id', 'content', 'is_read']
        }
    ];

    let allGood = true;

    for (const check of checks) {
        process.stdout.write(`Checking ${check.table}... `);

        // Try to select 1 row with specific columns to see if they exist
        const { error } = await supabase
            .from(check.table)
            .select(check.columns.join(','))
            .limit(1);

        if (error) {
            console.log('❌ FAILED');
            console.error(`   Error accessing columns in ${check.table}:`, error.message);
            allGood = false;
        } else {
            console.log('✅ OK');
        }
    }

    if (allGood) {
        console.log('\n🎉 All critical tables and columns are present!');
    } else {
        console.log('\n⚠️ Some tables or columns are missing. Check the logs above.');
    }
}

checkDatabaseIntegrity();
