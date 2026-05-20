require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

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
