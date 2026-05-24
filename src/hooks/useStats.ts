import { useMemo } from 'react';
import type { WeightLog, WorkoutLog, DashboardStats } from '../types';

// ============================================
// Hook untuk menghitung stats dari raw data
//
// Ini pure computation — tidak ada fetch di sini.
// Menerima logs yang sudah di-fetch oleh hook lain,
// lalu menghitung derived values.
//
// useMemo = hanya kalkulasi ulang kalau input berubah
// (optimasi performa — kayak useCallback tapi untuk values)
// ============================================
export function useStats(
  weightLogs: WeightLog[],
  workoutLogs: WorkoutLog[]
): DashboardStats {
  return useMemo(() => {

    // ── Latest Weight ──────────────────────────
    // weightLogs sudah ascending (oldest first dari hook)
    // jadi last index = paling baru
    const latestWeight = weightLogs.length > 0
      ? weightLogs[weightLogs.length - 1].weight
      : null;

    // ── Weight Diff & Trend ────────────────────
    let weightDiff: number | null = null;
    let weightTrend: DashboardStats['weightTrend'] = 'none';

    if (weightLogs.length >= 2) {
      const latest = weightLogs[weightLogs.length - 1].weight;
      const previous = weightLogs[weightLogs.length - 2].weight;
      weightDiff = Number((latest - previous).toFixed(1));

      if (weightDiff > 0) weightTrend = 'up';
      else if (weightDiff < 0) weightTrend = 'down';
      else weightTrend = 'same';
    }

    // ── Weekly Workouts ───────────────────────
    // Hitung workout dari Senin minggu ini
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const weeklyWorkouts = workoutLogs.filter(log => {
      return new Date(log.logged_at) >= monday;
    }).length;

    // ── Current Streak ─────────────────────────
    // Hitung berapa hari berturut-turut ada workout
    // (tidak counting rest day sebagai streak breaker)
    let currentStreak = 0;

    if (workoutLogs.length > 0) {
      // Ambil tanggal unik dari workout (sorted descending)
      const workoutDates = [...new Set(
        workoutLogs
          .filter(log => log.workout_type !== 'rest')
          .map(log => new Date(log.logged_at).toDateString())
      )];

      // Check berturut dari hari ini ke belakang
      const today = new Date();

      for (let i = 0; i < workoutDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (workoutDates[i] === expectedDate.toDateString()) {
          currentStreak++;
        } else {
          break; // streak putus
        }
      }
    }

    return {
      latestWeight,
      weeklyWorkouts,
      totalWorkouts: workoutLogs.length,
      currentStreak,
      weightDiff,
      weightTrend,
    };
  }, [weightLogs, workoutLogs]);
}