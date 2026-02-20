const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configuration from migrate.js
const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';
const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260220_add_company_name_to_profiles.sql');

async function runMigration() {
    console.log("Applying fix for missing company_name column...");

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });

    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('✅ SUCCESS: Connected!');

        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log('Running migration...');
        await client.query(sql);
        console.log('✅ Migration successfully applied!');
    } catch (err) {
        console.error('❌ Error executing migration:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
