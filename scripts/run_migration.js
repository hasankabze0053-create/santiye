const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Try both EU (Frankfurt) and US (Virginia) poolers as fallback
const connectionStrings = [
    'postgres://postgres.nxsjokupnsaeemtnlexf:KzCS1903.07.@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
    'postgres://postgres.nxsjokupnsaeemtnlexf:KzCS1903.07.@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
];

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260211004000_create_screen_config.sql');

async function tryConnect(connectionString) {
    console.log(`Trying connection: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database!');
        return client;
    } catch (err) {
        console.log(`Connection failed: ${err.message}`);
        return null;
    }
}

async function runMigration() {
    let client = null;

    for (const connStr of connectionStrings) {
        client = await tryConnect(connStr);
        if (client) break;
    }

    if (!client) {
        console.error('All connection attempts failed. Please check your internet connection or project region.');
        return;
    }

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log('Running migration...');

        await client.query(sql);
        console.log('Migration successfully applied!');
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
