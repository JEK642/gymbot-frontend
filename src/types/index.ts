// ============================================
// Shared TypeScript types — mirror dari Supabase tables
// Sama dengan yang di backend, tapi untuk frontend
// ============================================

export interface WeightLog {
  id: string;
  telegram_id: number;
  weight: number;
  logged_at: string;
}

export interface WorkoutLog {
  id: string;
  telegram_id: number;
  workout_type: string;
  duration: number | null;
  intensity: 'low' | 'medium' | 'high' | null;
  notes: string | null;
  logged_at: string;
}

export interface User {
  id: string;
  telegram_id: number;
  username: string | null;
  created_at: string;
}

// Stats yang sudah diolah untuk ditampilkan di dashboard
export interface DashboardStats {
  latestWeight: number | null;
  weeklyWorkouts: number;
  totalWorkouts: number;
  currentStreak: number;
  weightDiff: number | null;         // selisih dari log sebelumnya
  weightTrend: 'up' | 'down' | 'same' | 'none';
}

// Shape untuk Recharts chart data
export interface ChartDataPoint {
  date: string;       // label tanggal (e.g., "12 Mei")
  weight: number;     // berat dalam kg
  rawDate: string;    // ISO date untuk sorting
}