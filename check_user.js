require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function executeFile() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id, email, user_type FROM profiles WHERE email = 'korayzengin1999+9@gmail.com'");
        console.table(res.rows);
    } catch (err) {
        console.error('SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

executeFile();
