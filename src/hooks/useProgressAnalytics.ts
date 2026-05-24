// useProgressAnalytics.ts
// Hook khusus untuk Phase 3 — analytics mendalam per exercise & muscle group
// Dipakai HANYA oleh Progress page

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface MuscleAnalytics {
  name: string;
  volume: number;        // total kg (ribuan)
  sessions: number;      // jumlah session yang berisi otot ini
  frequency: number;     // rata-rata sesi per minggu
}

export interface ExerciseProgression {
  name: string;
  muscleGroup: string;
  history: { date: string; maxWeight: number; volume: number }[];
  pr: number;
  prReps: number;
  change: number;        // selisih max weight pertama vs terakhir
  e1rm: number;          // estimated 1RM (Epley)
}

export interface PREntry {
  name: string;
  weight: number;
  reps: number;
  e1rm: number;
  date: string;
}

export interface ProgressAnalytics {
  muscleArr: MuscleAnalytics[];
  exerciseArr: ExerciseProgression[];
  prs: PREntry[];
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useProgressAnalytics(telegramId: number | null) {
  const [analytics, setAnalytics] = useState<ProgressAnalytics>({
    muscleArr: [],
    exerciseArr: [],
    prs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        // ── Step 1: Ambil recent completed sessions ───────────────────────────
        const { data: sessions, error: sErr } = await supabase
          .from('workout_sessions')
          .select('id, finished_at')
          .eq('telegram_id', telegramId)
          .eq('status', 'completed')
          .order('finished_at', { ascending: true })
          .limit(50);

        if (sErr) throw sErr;
        if (!sessions || sessions.length === 0) {
          setLoading(false);
          return;
        }

        const sessionIds = sessions.map(s => s.id);
        const sessionDateMap: Record<string, string> = {};
        sessions.forEach(s => { sessionDateMap[s.id] = s.finished_at ?? ''; });
        const totalSessions = sessions.length;

        // ── Step 2: Ambil session_exercises + nama exercise ───────────────────
        const { data: sessionExercises, error: seErr } = await supabase
          .from('session_exercises')
          .select(`
            id,
            session_id,
            exercises(name, primary_muscle)
          `)
          .in('session_id', sessionIds);

        if (seErr) throw seErr;
        if (!sessionExercises || sessionExercises.length === 0) {
          setLoading(false);
          return;
        }

        const seIds = sessionExercises.map(se => se.id);

        // ── Step 3: Ambil semua sets sekaligus ────────────────────────────────
        const { data: sets, error: setErr } = await supabase
          .from('exercise_sets')
          .select('session_exercise_id, weight_kg, reps, is_pr')
          .in('session_exercise_id', seIds);

        if (setErr) throw setErr;

        // Build sets lookup map
        const setsMap: Record<string, { weight_kg: number | null; reps: number | null; is_pr: boolean }[]> = {};
        for (const s of sets ?? []) {
          if (!setsMap[s.session_exercise_id]) setsMap[s.session_exercise_id] = [];
          setsMap[s.session_exercise_id].push(s);
        }

        // ── Step 4: Build analytics ───────────────────────────────────────────
        const muscleMap: Record<string, {
          volumeKg: number;
          sessionSet: Set<string>;
        }> = {};

        const exerciseMap: Record<string, {
          muscleGroup: string;
          history: { date: string; maxWeight: number; volume: number }[];
          prWeight: number;
          prReps: number;
          prDate: string;
        }> = {};

        for (const se of sessionExercises) {
          const ex = (se as any).exercises;
          const exerciseName: string = ex?.name ?? 'Unknown';
          const muscle: string = ex?.primary_muscle ?? 'Other';
          const sessionDate = sessionDateMap[se.session_id] ?? '';
          const exSets = setsMap[se.id] ?? [];

          let maxWeight = 0;
          let totalVolume = 0;
          let maxWeightReps = 1;

          for (const s of exSets) {
            const w = s.weight_kg ?? 0;
            const r = s.reps ?? 0;
            totalVolume += w * r;
            if (w > maxWeight) {
              maxWeight = w;
              maxWeightReps = r;
            }
          }

          if (totalVolume === 0) continue; // skip bodyweight/no-weight exercises

          // Muscle group accumulation
          if (!muscleMap[muscle]) muscleMap[muscle] = { volumeKg: 0, sessionSet: new Set() };
          muscleMap[muscle].volumeKg += totalVolume;
          muscleMap[muscle].sessionSet.add(se.session_id);

          // Exercise progression
          if (!exerciseMap[exerciseName]) {
            exerciseMap[exerciseName] = {
              muscleGroup: muscle,
              history: [],
              prWeight: 0,
              prReps: 1,
              prDate: '',
            };
          }

          const dateLabel = new Date(sessionDate).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short',
          });

          exerciseMap[exerciseName].history.push({
            date: dateLabel,
            maxWeight,
            volume: Math.round(totalVolume),
          });

          // PR detection via estimated 1RM (Epley formula)
          const e1rm = maxWeight * (1 + maxWeightReps / 30);
          const prevE1rm = exerciseMap[exerciseName].prWeight
            * (1 + exerciseMap[exerciseName].prReps / 30);

          if (e1rm > prevE1rm) {
            exerciseMap[exerciseName].prWeight = maxWeight;
            exerciseMap[exerciseName].prReps = maxWeightReps;
            exerciseMap[exerciseName].prDate = sessionDate;
          }
        }

        // ── Step 5: Format output ─────────────────────────────────────────────
        const muscleArr: MuscleAnalytics[] = Object.entries(muscleMap)
          .map(([name, d]) => ({
            name,
            volume: Math.round(d.volumeKg / 1000),
            sessions: d.sessionSet.size,
            frequency: +(d.sessionSet.size / Math.max(1, totalSessions) * 7).toFixed(1),
          }))
          .sort((a, b) => b.volume - a.volume);

        const exerciseArr: ExerciseProgression[] = Object.entries(exerciseMap)
          .filter(([, d]) => d.history.length >= 2)
          .map(([name, d]) => {
            const first = d.history[0]?.maxWeight ?? 0;
            const last = d.history[d.history.length - 1]?.maxWeight ?? 0;
            return {
              name,
              muscleGroup: d.muscleGroup,
              history: d.history.slice(-8),
              pr: d.prWeight,
              prReps: d.prReps,
              change: last - first,
              e1rm: +(d.prWeight * (1 + d.prReps / 30)).toFixed(1),
            };
          })
          .sort((a, b) => b.history.length - a.history.length)
          .slice(0, 8);

        const prs: PREntry[] = Object.entries(exerciseMap)
          .filter(([, d]) => d.prWeight > 0)
          .map(([name, d]) => ({
            name,
            weight: d.prWeight,
            reps: d.prReps,
            e1rm: +(d.prWeight * (1 + d.prReps / 30)).toFixed(1),
            date: d.prDate,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);

        setAnalytics({ muscleArr, exerciseArr, prs });
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [telegramId]);

  return { analytics, loading, error };
}