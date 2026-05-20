require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function addCol() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    await client.query("ALTER TABLE technical_requests ADD COLUMN IF NOT EXISTS assigned_provider_ids JSONB DEFAULT '[]'::jsonb;");
    console.log("Added assigned_provider_ids column to technical_requests");
    
    await client.query("ALTER TABLE law_requests ADD COLUMN IF NOT EXISTS assigned_provider_ids JSONB DEFAULT '[]'::jsonb;");
    console.log("Added assigned_provider_ids column to law_requests");
    
    await client.end();
}
addCol();
