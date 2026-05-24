import { createClient } from '@supabase/supabase-js';

// ============================================
// Supabase Client — Frontend Version
//
// Ini SAMA dengan yang di backend bot, tapi
// untuk React kita pakai VITE_ prefix di .env
// karena Vite butuh itu untuk expose ke browser.
//
// Client ini digunakan untuk:
// - Query weight_logs
// - Query workout_logs
// - Query users
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);