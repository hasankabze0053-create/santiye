const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

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
