require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.SUPABASE_DB_URL;

async function executeQuery(sqlStr) {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(sqlStr);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeQuery(process.argv[2]);
