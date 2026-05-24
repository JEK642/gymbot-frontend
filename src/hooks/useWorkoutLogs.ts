import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { WorkoutLog } from '../types';

export function useWorkoutLogs(telegramId: number | null) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchWorkoutLogs() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('telegram_id', telegramId)
          .order('logged_at', { ascending: false }); // newest first untuk history

        if (supabaseError) throw supabaseError;

        setLogs(data as WorkoutLog[]);
      } catch (err) {
        console.error('useWorkoutLogs error:', err);
        setError('Gagal mengambil data workout.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkoutLogs();
  }, [telegramId]);

  return { logs, loading, error };
}