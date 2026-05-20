require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function checkChips() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id, title FROM public.screen_section_config WHERE id LIKE 'category_chip_%'");
        console.log("CHIPS:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

checkChips();
