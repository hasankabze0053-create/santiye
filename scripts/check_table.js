const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTable() {
    console.log('Checking if table screen_section_config exists...');

    const { data, error } = await supabase
        .from('screen_section_config')
        .select('*')
        .limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.log('Table needs to be created, not found.');
        } else {
            console.error('Error checking table:', error);
            // If any other error (e.g. timeout), it might exist but failed to access.
        }
    } else {
        console.log('Table exists!');
        console.log('Data sample:', data);
    }
}

checkTable();
