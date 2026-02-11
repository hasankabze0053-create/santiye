
const { Client } = require('pg');

const CONNECTION_STRING = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
});

async function audit() {
    await client.connect();

    // Get all tables and their RLS status
    const res = await client.query(`
        SELECT 
            tablename, 
            rowsecurity,
            hasindexes,
            hasrules,
            hastriggers
        FROM pg_tables 
        JOIN pg_class ON pg_tables.tablename = pg_class.relname
        WHERE pg_tables.schemaname = 'public'
        ORDER BY tablename;
    `);

    console.log('--- DATABASE AUDIT ---');
    console.log('Found', res.rows.length, 'tables in public schema.');

    res.rows.forEach(r => {
        const rlsStatus = r.rowsecurity ? '✅ SECURE (RLS ON)' : '❌ UNPROTECTED (RLS OFF)';
        console.log(`[${r.tablename}] -> ${rlsStatus}`);
    });

    await client.end();
}

audit();
