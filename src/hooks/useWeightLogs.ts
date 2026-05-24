import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { WeightLog } from '../types';

// ============================================
// Custom hook untuk fetch weight logs
//
// Ini seperti pola yang kamu kenal di React:
// useEffect untuk fetch data + useState untuk store
// Bedanya sekarang kita fetch dari Supabase langsung
// ============================================
export function useWeightLogs(telegramId: number | null) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Jangan fetch kalau belum ada telegramId
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchWeightLogs() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('telegram_id', telegramId)
          .order('logged_at', { ascending: true }); // ascending untuk chart

        if (supabaseError) throw supabaseError;

        setLogs(data as WeightLog[]);
      } catch (err) {
        console.error('useWeightLogs error:', err);
        setError('Gagal mengambil data berat badan.');
      } finally {
        setLoading(false);
      }
    }

    fetchWeightLogs();
  }, [telegramId]); // re-fetch kalau telegramId berubah

  return { logs, loading, error };
}