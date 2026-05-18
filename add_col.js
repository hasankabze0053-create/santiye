const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function addCol() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    await client.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS custom_services TEXT");
    console.log("Added custom_services column to companies");
    
    await client.end();
}
addCol();
