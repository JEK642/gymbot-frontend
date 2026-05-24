// useWorkoutSessions.ts
// Hook untuk fetch data workout sessions dari Supabase
// Dipakai oleh SessionDetail page dan WorkoutHistory

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ── TYPES ────────────────────────────────────────────────────

export interface SessionSummary {
  id: string;
  telegram_id: string;
  name: string | null;
  split_name: string | null;
  started_at: string;
  finished_at: string | null;
  duration_minutes: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  exercise_count?: number;
  total_sets?: number;
  total_volume?: number;
  primary_exercises?: string[]; // nama 2-3 exercise pertama di sesi
}

export interface SessionExerciseDisplay {
  id: string;
  exercise_name: string;
  equipment: string | null;
  sets: SessionSetDisplay[];
}

export interface SessionSetDisplay {
  id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  set_type: string;
  is_pr: boolean;
}

export interface SessionDetail extends SessionSummary {
  exercises: SessionExerciseDisplay[];
}

// ── HOOK: useRecentSessions ───────────────────────────────────
// Ambil daftar session terbaru (untuk history page)
export function useRecentSessions(telegramId: number | null, limit = 20) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchSessions() {
      setLoading(true);
      setError(null);

      try {
        // Join ke splits untuk dapat nama split
        const { data, error: fetchError } = await supabase
          .from('workout_sessions')
          .select(`
            id,
            telegram_id,
            name,
            started_at,
            finished_at,
            duration_minutes,
            status,
            splits(name)
          `)
          .eq('telegram_id', telegramId)
          .eq('status', 'completed')
          .order('finished_at', { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        // Hitung stats tambahan per session
        const sessionsWithStats = await Promise.all(
          (data ?? []).map(async (s: any) => {
            // Fetch exercises — ambil nama sekalian untuk primary_exercises
            const { data: exercises } = await supabase
              .from('session_exercises')
              .select(`
                id,
                exercise_order,
                exercises(name),
                exercise_sets(weight_kg, reps)
              `)
              .eq('session_id', s.id)
              .order('exercise_order', { ascending: true });

            let total_sets = 0;
            let total_volume = 0;

            for (const ex of exercises ?? []) {
              const sets = (ex as any).exercise_sets ?? [];
              total_sets += sets.length;
              total_volume += sets.reduce(
                (acc: number, set: any) =>
                  acc + (set.weight_kg ?? 0) * (set.reps ?? 0),
                0
              );
            }

            // Ambil nama 3 exercise pertama untuk subtitle
            const primary_exercises = (exercises ?? [])
              .slice(0, 3)
              .map((ex: any) => ex.exercises?.name)
              .filter(Boolean) as string[];

            return {
              ...s,
              split_name: (s as any).splits?.name ?? null,
              exercise_count: exercises?.length ?? 0,
              total_sets,
              total_volume,
              primary_exercises,
            };
          })
        );

        setSessions(sessionsWithStats);
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat sessions');
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [telegramId, limit]);

  return { sessions, loading, error };
}

// ── HOOK: useSessionDetail ────────────────────────────────────
// Ambil detail satu session (untuk SessionDetail page)
export function useSessionDetail(sessionId: string | null) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      try {
        // Fetch session utama
        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_sessions')
          .select('*, splits(name)')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        // Fetch exercises + sets dalam satu query nested
        const { data: sessionExercises, error: exError } = await supabase
          .from('session_exercises')
          .select(`
            id,
            exercise_order,
            exercises(id, name, equipment),
            exercise_sets(
              id,
              set_number,
              weight_kg,
              reps,
              rpe,
              set_type,
              is_pr
            )
          `)
          .eq('session_id', sessionId)
          .order('exercise_order', { ascending: true });

        if (exError) throw exError;

        // Reshape data untuk display
        const exercises: SessionExerciseDisplay[] = (sessionExercises ?? []).map(
          (se: any) => ({
            id: se.id,
            exercise_name: se.exercises?.name ?? 'Unknown',
            equipment: se.exercises?.equipment ?? null,
            sets: (se.exercise_sets ?? []).sort(
              (a: any, b: any) => a.set_number - b.set_number
            ),
          })
        );

        // Hitung total volume
        let total_sets = 0;
        let total_volume = 0;
        exercises.forEach((ex) => {
          total_sets += ex.sets.length;
          total_volume += ex.sets.reduce(
            (acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0),
            0
          );
        });

        setSession({
          ...sessionData,
          split_name: sessionData.splits?.name ?? null,
          exercise_count: exercises.length,
          total_sets,
          total_volume,
          primary_exercises: exercises.slice(0, 3).map(e => e.exercise_name),
          exercises,
        });
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat detail session');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [sessionId]);

  return { session, loading, error };
}

// ── HOOK: useVolumeHistory ────────────────────────────────────
// Data volume per session untuk chart (30 session terakhir)
export function useVolumeHistory(telegramId: number | null) {
  const [data, setData] = useState<{ date: string; volume: number; duration: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchVolume() {
      try {
        const { data: sessions } = await supabase
          .from('workout_sessions')
          .select('id, finished_at, duration_minutes')
          .eq('telegram_id', telegramId)
          .eq('status', 'completed')
          .order('finished_at', { ascending: true })
          .limit(30);

        const volumeData = await Promise.all(
          (sessions ?? []).map(async (s) => {
            const { data: sets } = await supabase
              .from('exercise_sets')
              .select('weight_kg, reps, session_exercise_id')
              .in(
                'session_exercise_id',
                (
                  await supabase
                    .from('session_exercises')
                    .select('id')
                    .eq('session_id', s.id)
                ).data?.map((e) => e.id) ?? []
              );

            const volume = (sets ?? []).reduce(
              (acc, set) => acc + (set.weight_kg ?? 0) * (set.reps ?? 0),
              0
            );

            return {
              date: new Date(s.finished_at!).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              }),
              volume: Math.round(volume),
              duration: s.duration_minutes ?? 0,
            };
          })
        );

        setData(volumeData);
      } catch (err) {
        console.error('useVolumeHistory error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVolume();
  }, [telegramId]);

  return { data, loading };
}