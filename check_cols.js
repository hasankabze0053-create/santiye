const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function check() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    const res = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'companies'");
    console.table(res.rows);
    
    await client.end();
}
check();
