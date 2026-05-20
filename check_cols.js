require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function check() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    const res = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'companies'");
    console.table(res.rows);
    
    await client.end();
}
check();
