import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ KANKA: BURAYA KENDİ SUPABASE URL VE ANON KEY'İNİ GİRMEN GEREKİYOR
// Bunları Supabase Panelinden -> Project Settings -> API kısmından alabilirsin.
const SUPABASE_URL = 'https://nxsjokupnsaeemtnlexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c2pva3VwbnNhZWVtdG5sZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjQ4MTEsImV4cCI6MjA4NTAwMDgxMX0.AodrTSfuMDWtKz7Ilj0xgYDiezTtC4ILwnu_zJGGzEM';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
