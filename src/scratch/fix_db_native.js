const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function fixDatabase() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('Connected to Postgres natively!');

        // 1. Update Renovation Showcase Image and Colors
        const query1 = `
            UPDATE renovation_showcase 
            SET image_url = 'https://i.imgur.com/HmoPx5P.jpeg', 
                tag_color = '#B8820F'
            WHERE title LIKE '%Modern Salon%';
        `;
        const res1 = await client.query(query1);
        console.log(`Updated Renovation Showcase: ${res1.rowCount} rows affected.`);

        // 2. Update Urban Highlight Card Pills
        const query2 = `
            UPDATE screen_section_config 
            SET metadata = jsonb_set(
                metadata, 
                '{pills}', 
                '["Ada Parsel Adres"]'::jsonb
            )
            WHERE id = 'highlight_card_urban';
        `;
        const res2 = await client.query(query2);
        console.log(`Updated Urban Highlight Card: ${res2.rowCount} rows affected.`);

        console.log('✅ Database fix completed natively!');
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

fixDatabase();
