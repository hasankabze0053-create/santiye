require('dotenv').config({ path: '.env' });

const { Client } = require('pg');

const CONNECTION_STRING = process.env.SUPABASE_DB_URL;

const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
});

async function check_policies() {
    await client.connect();

    const res = await client.query(`
        SELECT tablename, policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, cmd;
    `);

    console.log('--- POLICY AUDIT ---');
    console.log('Total Policies:', res.rows.length);
    res.rows.forEach(r => {
        console.log(`[${r.tablename}] (${r.cmd}): ${r.policyname}`);
    });

    await client.end();
}

check_policies();
