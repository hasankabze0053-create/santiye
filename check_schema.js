require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const connectionString = process.env.SUPABASE_DB_URL;

async function query() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='companies';
    `);
    console.log(res.rows.map(r => r.column_name).join(', '));
    await client.end();
}
query();
