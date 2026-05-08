const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function deleteDuplicates() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query("DELETE FROM public.screen_section_config WHERE id LIKE 'highlight_card_highlight_card_%'");
        console.log("Successfully deleted duplicated highlight cards from DB.");
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

deleteDuplicates();
