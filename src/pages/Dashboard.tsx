import { useWeightLogs } from '../hooks/useWeightLogs';
import { useWorkoutLogs } from '../hooks/useWorkoutLogs';
import { useStats } from '../hooks/useStats';
import { useMuscleData } from '../hooks/useMuscleData';
import { useBodyStats } from '../hooks/useBodyStats'; // ✅ TAMBAH INI
import { LoadingScreen } from '../components/ui/LoadingScreen';
import MuscleRadarChart from '../components/dashboard/MuscleRadarChart';
import ProgressionPreview from '../components/dashboard/Progressionpreview';
import RecentWorkouts from '../components/dashboard/Recentworkouts';
import AttendanceChart from '../components/dashboard/AttendanceChart';

// ⚠️ Ganti dengan Telegram ID kamu
const MY_TELEGRAM_ID = 8041376316;

function bmi(weight: number, height: number) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: "10px",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#181B26" }} />
    </div>
  );
}

export function Dashboard() {
  const { logs: weightLogs, loading: weightLoading } = useWeightLogs(MY_TELEGRAM_ID);
  const { logs: workoutLogs, loading: workoutLoading } = useWorkoutLogs(MY_TELEGRAM_ID);
  const stats = useStats(weightLogs, workoutLogs);
  const { data: muscleData, loading: muscleLoading } = useMuscleData(MY_TELEGRAM_ID);
  const { stats: bodyStats, loading: bodyLoading } = useBodyStats(MY_TELEGRAM_ID); // ✅ TAMBAH INI

  const loading = weightLoading || workoutLoading || muscleLoading || bodyLoading;

  const recentWorkouts = workoutLogs.slice(0, 5);

  if (loading) return <LoadingScreen />;

  // BMI hanya dihitung kalau kedua data tersedia
  const bmiValue = bodyStats.weight && bodyStats.height
    ? bmi(bodyStats.weight, bodyStats.height)
    : null;
  const bmiCategory = bmiValue
    ? Number(bmiValue) < 18.5 ? 'Underweight'
      : Number(bmiValue) < 25  ? 'Normal'
      : Number(bmiValue) < 30  ? 'Overweight'
      : 'Obese'
    : null;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ───────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label-xs mb-1.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-element-primary tracking-tight leading-none">
            Dashboard
          </h1>
        </div>

        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-2 bg-accent-subtle border border-accent/20 px-3.5 py-2 rounded-pill">
            <span className="text-sm leading-none">🔥</span>
            <span className="font-mono text-accent text-xs font-semibold tracking-wide">
              {stats.currentStreak} hari
            </span>
          </div>
        )}
      </div>

      {/* ── Body Stats Row ────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl"
        style={{ background: "#0F1117", border: "1px solid #1E2130" }}>

        <div className="flex items-baseline gap-1.5">
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>BB</span>
          <span className="font-display font-bold text-element-primary text-xl">
            {bodyStats.weight ?? '—'}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>kg</span>
        </div>

        <div style={{ width: 1, height: 24, background: "#1E2130" }} />

        <div className="flex items-baseline gap-1.5">
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>TB</span>
          <span className="font-display font-bold text-element-primary text-xl">
            {bodyStats.height ?? '—'}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>cm</span>
        </div>

        <div style={{ width: 1, height: 24, background: "#1E2130" }} />

        <div className="flex items-baseline gap-1.5">
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>BMI</span>
          <span className="font-display font-bold text-accent text-xl">
            {bmiValue ?? '—'}
          </span>
          {bmiCategory && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{bmiCategory}</span>
          )}
        </div>
      </div>

      {/* ── Muscle Coverage Radar ─────────────── */}
      <SectionDivider label="Muscle Coverage" />
      <MuscleRadarChart data={muscleData} /> {/* ✅ kirim data real */}

      {/* ── Attendance Chart ──────────────────── */}
      <SectionDivider label="Gym Attendance" />
      <AttendanceChart telegramId={MY_TELEGRAM_ID} />

      {/* ── Strength Progression ─────────────── */}
      <SectionDivider label="Progression" />
      <ProgressionPreview />

      {/* ── Recent Workouts ──────────────────── */}
      <SectionDivider label="Recent Sessions" />
      <RecentWorkouts
        sessions={recentWorkouts.map(w => ({
          id: String(w.id),
          title: w.workout_type,
          date: new Date(w.logged_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short',
          }),
          durationMin: w.duration ?? 0,
          totalSets: 0,
          muscleGroups: getMuscleGroups(w.workout_type),
          exercises: [],
        }))}
      />

    </div>
  );
}

function getMuscleGroups(type: string): string[] {
  const map: Record<string, string[]> = {
    push:      ['Chest', 'Shoulders', 'Arms'],
    pull:      ['Back', 'Arms'],
    legs:      ['Legs', 'Core'],
    upper:     ['Chest', 'Back', 'Shoulders'],
    lower:     ['Legs', 'Core'],
    chest:     ['Chest'],
    back:      ['Back'],
    shoulders: ['Shoulders'],
    arms:      ['Arms'],
    core:      ['Core'],
    cardio:    [],
    hiit:      ['Legs', 'Core'],
    mobility:  ['Core'],
  };
  return map[type.toLowerCase()] ?? [];
}