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
    async function fetchMuscleData() {
      // Ambil awal bulan ini
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      // 1. Ambil semua workout_sessions bulan ini milik user ini
      const { data: sessions, error: sessErr } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('telegram_id', telegramId)
        .gte('started_at', start.toISOString());

      if (sessErr || !sessions || sessions.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const sessionIds = sessions.map((s) => s.id);

      // 2. Ambil session_exercises + info muscle group via join
      const { data: sessionExercises, error: seErr } = await supabase
        .from('session_exercises')
        .select(`
          id,
          exercises (
            exercise_muscles (
              muscle_groups ( name )
            )
          )
        `)
        .in('session_id', sessionIds);

      if (seErr || !sessionExercises || sessionExercises.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const sessionExerciseIds = sessionExercises.map((se) => se.id);

      // 3. Hitung jumlah sets per session_exercise
      const { data: sets, error: setsErr } = await supabase
        .from('exercise_sets')
        .select('session_exercise_id')
        .in('session_exercise_id', sessionExerciseIds);

      if (setsErr) {
        setData([]);
        setLoading(false);
        return;
      }

      // 4. Agregasi: hitung sets per muscle group
      const muscleSetCount: Record<string, number> = {};

      for (const se of sessionExercises) {
        const muscles: string[] =
          (se.exercises as any)?.exercise_muscles
            ?.map((em: any) => em.muscle_groups?.name)
            ?.filter(Boolean) ?? [];

        const setCount = (sets ?? []).filter(
          (s) => s.session_exercise_id === se.id
        ).length;

        for (const muscle of muscles) {
          muscleSetCount[muscle] = (muscleSetCount[muscle] ?? 0) + setCount;
        }
      }

      // 5. Format untuk RadarChart — urutan tetap biar chart konsisten
      const muscleOrder = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const maxSets = Math.max(...Object.values(muscleSetCount), 1);
      const fullMark = Math.ceil(maxSets / 10) * 10 + 10;

      const result = muscleOrder.map((muscle) => ({
        muscle,
        sets: muscleSetCount[muscle] ?? 0,
        fullMark,
      }));

      setData(result);
      setLoading(false);
    }

    fetchMuscleData();
  }, [telegramId]);

  return { data, loading };
}