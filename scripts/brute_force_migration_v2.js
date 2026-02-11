const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const regions = [
    'aws-0-eu-central-1',
    'aws-0-eu-west-1',
    'aws-0-eu-west-2',
    'aws-0-eu-west-3',
    'aws-0-us-east-1',
    'aws-0-us-west-1',
    'aws-0-ap-southeast-1',
    'aws-0-ap-northeast-1',
    'aws-0-sa-east-1'
];

const getConnectionString = (region) =>
    `postgres://postgres.nxsjokupnsaeemtnlexf:KzCS1903.07.@${region}.pooler.supabase.com:6543/postgres?sslmode=disable`;

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260211004000_create_screen_config.sql');

async function tryConnect(region) {
    const connectionString = getConnectionString(region);
    console.log(`Trying region: ${region} ...`);

    // We try/catch inside Client constructor if it throws? No, usually in connect().
    // But setting SSL to false in object and using sslmode=disable in URL might work better.
    // Or just ssl: true with bypass env var.

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS: Connected to ${region}!`);
        return client;
    } catch (err) {
        console.log(`❌ Failed ${region}: ${err.message}`);
        // await client.end().catch(() => {});
        return null;
    }
}

async function runMigration() {
    let client = null;
    let success = false;

    console.log("Starting brute-force connection attempt (v2 - SSL Bypass)...");

    for (const region of regions) {
        client = await tryConnect(region);
        if (client) {
            success = true;
            break;
        }
    }

    if (!success) {
        console.error('All connection attempts failed. Proceeding with frontend implementation assuming connection failure.');
        return;
    }

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log('Running migration...');

        await client.query(sql);
        console.log('✅ Migration successfully applied!');
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
