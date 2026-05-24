import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface MuscleData {
  muscle: string;
  sets: number;
  fullMark: number;
}

export function useMuscleData(telegramId: number) {
  const [data, setData] = useState<MuscleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      // Ambil awal bulan ini
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      // Ambil semua session bulan ini punya user ini
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('telegram_id', telegramId)
        .gte('started_at', start.toISOString());

      if (!sessions || sessions.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const sessionIds = sessions.map(s => s.id);

      // Ambil exercise dari session tsb + muscle group-nya
      const { data: rows } = await supabase
        .from('session_exercises')
        .select(`
          id,
          exercises (
            exercise_muscles (
              muscle_groups ( name )
            )
          )
        `)
        .in('workout_session_id', sessionIds);

      // Hitung jumlah sets per muscle group
      // Ambil jumlah exercise_sets per session_exercise
      const { data: sets } = await supabase
        .from('exercise_sets')
        .select('session_exercise_id')
        .in('session_exercise_id', (rows ?? []).map(r => r.id));

      // Mapping: muscle → jumlah sets
      const muscleSetCount: Record<string, number> = {};

      for (const row of rows ?? []) {
        const muscles: string[] = (row.exercises as any)
          ?.exercise_muscles
          ?.map((em: any) => em.muscle_groups?.name)
          ?.filter(Boolean) ?? [];

        const setCount = (sets ?? []).filter(
          s => s.session_exercise_id === row.id
        ).length;

        for (const muscle of muscles) {
          muscleSetCount[muscle] = (muscleSetCount[muscle] ?? 0) + setCount;
        }
      }

      // Format untuk RadarChart
      const muscleOrder = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const maxSets = Math.max(...Object.values(muscleSetCount), 1);
      const fullMark = Math.ceil(maxSets / 10) * 10 + 10;

      const result = muscleOrder.map(muscle => ({
        muscle,
        sets: muscleSetCount[muscle] ?? 0,
        fullMark,
      }));

      setData(result);
      setLoading(false);
    }

    fetch();
  }, [telegramId]);

  return { data, loading };
}