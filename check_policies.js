require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function executeFile() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT tgname FROM pg_trigger WHERE tgrelid = 'profiles'::regclass OR tgrelid = 'companies'::regclass");
        console.log("Triggers:");
        console.table(res.rows);
    } catch (err) {
        console.error('SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
