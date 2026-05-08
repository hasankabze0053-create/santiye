const { Client } = require('pg');

const connectionString = 'postgresql://postgres.nxsjokupnsaeemtnlexf:Cs1907Kz0354@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function updateUrbanPills() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        // Fetch the current row
        const res = await client.query("SELECT metadata FROM public.screen_section_config WHERE id = 'highlight_card_urban'");
        if (res.rows.length > 0) {
            const metadata = res.rows[0].metadata;
            metadata.pills = ['Ada', 'Parsel', 'Adres']; // Add the default pills
            
            await client.query("UPDATE public.screen_section_config SET metadata = $1 WHERE id = 'highlight_card_urban'", [metadata]);
            console.log("Successfully updated urban card to use standard pills.");
        }
    } catch (err) {
        console.error('❌ SQL execution failed:', err.message);
    } finally {
        await client.end();
    }
}

updateUrbanPills();
