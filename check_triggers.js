require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function check() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    console.log("--- TRIGGERS ---");
    const tRes = await client.query("SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'profiles'");
    console.table(tRes.rows);

    console.log("--- POLICIES ---");
    const pRes = await client.query("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles'");
    console.table(pRes.rows);
    
    await client.end();
}
check();
