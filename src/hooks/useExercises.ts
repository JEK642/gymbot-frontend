// useExercises.ts
// Hook untuk data PR dan exercise-related stats

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PRDisplay {
  id: string;
  exercise_id: string;
  exercise_name: string;
  equipment: string | null;
  weight_kg: number;
  reps: number;
  estimated_1rm: number;
  achieved_at: string;
}

// ── HOOK: usePersonalRecords ──────────────────────────────────
// Ambil PR terbaik user per exercise
export function usePersonalRecords(telegramId: number | null) {
  const [prs, setPRs] = useState<PRDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetchPRs() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('personal_records')
          .select('*, exercises(id, name, equipment)')
          .eq('telegram_id', telegramId)
          .order('estimated_1rm', { ascending: false });

        if (fetchError) throw fetchError;

        // Deduplicate: ambil 1 PR terbaik per exercise
        const prMap = new Map<string, PRDisplay>();
        for (const pr of data ?? []) {
          const existing = prMap.get(pr.exercise_id);
          if (!existing || pr.estimated_1rm > existing.estimated_1rm) {
            prMap.set(pr.exercise_id, {
              id: pr.id,
              exercise_id: pr.exercise_id,
              exercise_name: (pr as any).exercises?.name ?? 'Unknown',
              equipment: (pr as any).exercises?.equipment ?? null,
              weight_kg: pr.weight_kg,
              reps: pr.reps,
              estimated_1rm: pr.estimated_1rm,
              achieved_at: pr.achieved_at,
            });
          }
        }

        // Sort by estimated_1rm descending
        setPRs(
          Array.from(prMap.values()).sort(
            (a, b) => b.estimated_1rm - a.estimated_1rm
          )
        );
      } catch (err: any) {
        setError(err.message ?? 'Gagal memuat PR');
      } finally {
        setLoading(false);
      }
    }

    fetchPRs();
  }, [telegramId]);

  return { prs, loading, error };
}

// ── HOOK: useFrequentExercises ────────────────────────────────
// Exercise yang paling sering dilakukan (untuk insight)
export function useFrequentExercises(telegramId: number | null, limit = 5) {
  const [exercises, setExercises] = useState<{ name: string; count: number; last_done: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    async function fetch() {
      try {
        // Ambil semua session_exercises dari completed sessions user
        const { data: sessions } = await supabase
          .from('workout_sessions')
          .select('id')
          .eq('telegram_id', telegramId)
          .eq('status', 'completed');

        const sessionIds = (sessions ?? []).map((s) => s.id);
        if (sessionIds.length === 0) {
          setExercises([]);
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from('session_exercises')
          .select('exercise_id, exercises(name), workout_sessions(finished_at)')
          .in('session_id', sessionIds);

        // Count per exercise
        const countMap = new Map<string, { name: string; count: number; last_done: string }>();

        for (const se of data ?? []) {
          const id = se.exercise_id;
          const name = (se as any).exercises?.name ?? 'Unknown';
          const lastDone = (se as any).workout_sessions?.finished_at ?? '';
          const existing = countMap.get(id);

          if (!existing) {
            countMap.set(id, { name, count: 1, last_done: lastDone });
          } else {
            countMap.set(id, {
              ...existing,
              count: existing.count + 1,
              last_done:
                lastDone > existing.last_done ? lastDone : existing.last_done,
            });
          }
        }

        setExercises(
          Array.from(countMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
        );
      } catch (err) {
        console.error('useFrequentExercises error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [telegramId, limit]);

  return { exercises, loading };
}