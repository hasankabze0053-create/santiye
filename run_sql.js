const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeFile() {

    const sqlStr = `
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = 'companies'::regclass;
    `;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(sqlStr);
        console.log("Policies:", res.rows);
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
