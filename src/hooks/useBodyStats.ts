import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BodyStats {
  weight: number | null;  // dari weight_logs (terbaru)
  height: number | null;  // dari users.height_cm
}

export function useBodyStats(telegramId: number | null) {
  const [stats, setStats] = useState<BodyStats>({ weight: null, height: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchBodyStats() {
      // Fetch berat terbaru + tinggi badan sekaligus
      const [weightRes, userRes] = await Promise.all([
        supabase
          .from('weight_logs')
          .select('weight')
          .eq('telegram_id', telegramId)
          .order('logged_at', { ascending: false })
          .limit(1)
          .single(),

        supabase
          .from('users')
          .select('height_cm')
          .eq('telegram_id', telegramId)
          .single(),
      ]);

      setStats({
        weight: weightRes.data?.weight ?? null,
        height: userRes.data?.height_cm ?? null,
      });
      setLoading(false);
    }

    fetchBodyStats();
  }, [telegramId]);

  return { stats, loading };
}