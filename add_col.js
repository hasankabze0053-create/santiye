require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function addCol() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    await client.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS custom_services TEXT");
    console.log("Added custom_services column to companies");
    
    await client.end();
}
addCol();
