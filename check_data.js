require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function checkData() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id, metadata FROM public.screen_section_config WHERE id LIKE 'highlight_card_%'");
        console.log("ROWS:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

checkData();
