// SessionDetail.tsx
// Halaman detail satu workout session
// Route: /sessions/:sessionId

import { useParams, useNavigate } from 'react-router-dom';
import { useSessionDetail } from '../hooks/useWorkoutSessions';

// ── SET ROW ───────────────────────────────────────────────────

function SetRow({
  set,
}: {
  set: {
    set_number: number;
    weight_kg: number | null;
    reps: number | null;
    rpe: number | null;
    set_type: string;
    is_pr: boolean;
  };
}) {
  const setTypeConfig: Record<string, { label: string; className: string }> = {
    working: { label: 'Working', className: 'text-element-muted' },
    warmup:  { label: 'Warmup',  className: 'text-signal-medium' },
    dropset: { label: 'Drop',    className: 'text-accent' },
    failure: { label: 'Failure', className: 'text-signal-high' },
  };

  const typeStyle = setTypeConfig[set.set_type] ?? setTypeConfig.working;

  return (
    <div className={`
      flex items-center justify-between
      py-2.5 px-3 rounded-lg
      transition-colors duration-100
      ${set.is_pr
        ? 'bg-signal-medium/8 border border-signal-medium/20'
        : 'hover:bg-slate-700/40'
      }
    `}>
      <div className="flex items-center gap-3">
        {/* Set number */}
        <span className="text-[10px] font-mono text-element-muted w-8 tracking-wider">
          Set {set.set_number}
        </span>
        {/* Type label */}
        <span className={`text-[10px] font-mono font-semibold tracking-wider ${typeStyle.className}`}>
          {typeStyle.label}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Weight × Reps */}
        <span className="font-mono font-semibold text-element-primary text-sm tabular-nums">
          {set.weight_kg ?? '—'} kg × {set.reps ?? '—'}
        </span>

        {/* RPE */}
        {set.rpe && (
          <span className="
            text-[10px] font-mono font-medium
            bg-[#0D0E14] border border-[#181B26]
            text-element-secondary
            px-2 py-0.5 rounded-pill
          ">
            RPE {set.rpe}
          </span>
        )}

        {/* PR Badge */}
        {set.is_pr && (
          <span className="
            text-[10px] font-mono font-bold
            bg-signal-medium/10 text-signal-medium
            border border-signal-medium/25
            px-2 py-0.5 rounded-pill
          ">
            🏆 PR
          </span>
        )}
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────

function ExerciseCard({
  exercise,
}: {
  exercise: {
    exercise_name: string;
    equipment: string | null;
    sets: any[];
  };
}) {
  const totalVolume = exercise.sets.reduce(
    (acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0),
    0
  );
  const hasPR = exercise.sets.some((s) => s.is_pr);

  return (
    <div className="card overflow-hidden p-0">
      {/* Exercise header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#181B26]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-semibold text-element-primary text-sm uppercase tracking-wide">
              {exercise.exercise_name}
            </h4>
            {hasPR && <span className="text-xs">🏆</span>}
          </div>
          <p className="text-[10px] font-mono text-element-muted mt-0.5 tracking-wide">
            {exercise.sets.length} set
            {exercise.equipment && ` · ${exercise.equipment}`}
            {totalVolume > 0 && ` · ${totalVolume.toLocaleString('id-ID')} kg vol`}
          </p>
        </div>
      </div>

      {/* Sets */}
      <div className="px-3 py-2 space-y-0.5">
        {exercise.sets.map((set) => (
          <SetRow key={set.id} set={set} />
        ))}
      </div>
    </div>
  );
}

// ── LOADING SKELETON ──────────────────────────────────────────

function SessionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-[#0D0E14] border border-[#181B26] rounded-lg" />
      <div className="card">
        <div className="h-4 w-40 bg-[#181B26] rounded mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#181B26] rounded-lg" />
          ))}
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="card">
          <div className="h-4 w-36 bg-[#181B26] rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-9 bg-[#181B26] rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading, error } = useSessionDetail(sessionId ?? null);

  if (loading) return <SessionSkeleton />;

  if (error || !session) {
    return (
      <div className="py-16 text-center">
        <p className="text-element-muted font-mono text-sm">
          {error ?? 'Session tidak ditemukan.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="
            mt-4 text-accent font-mono text-xs
            hover:text-accent-light transition-colors
          "
        >
          ← Kembali
        </button>
      </div>
    );
  }

  // ── FORMAT DATA ──
  const finishedDate = session.finished_at
    ? new Date(session.finished_at).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const prCount = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.is_pr).length,
    0
  );

  return (
    <div className="space-y-5 animate-fade-in pb-8">

      {/* ── Back Button ──────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="
          flex items-center gap-1.5
          text-xs font-mono text-element-muted
          hover:text-element-primary
          transition-colors duration-150
        "
      >
        ← Kembali
      </button>

      {/* ── Session Header Card ───────────────────────────── */}
      <div className="card-accent relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/80 via-accent to-accent/30" />

        <div className="flex items-start justify-between">
          <div>
            <p className="label-xs mb-1.5">
              {session.split_name ?? 'Workout Session'}
            </p>
            <h2 className="font-display font-bold text-xl text-element-primary tracking-tight">
              {session.name ?? finishedDate}
            </h2>
            {session.name && (
              <p className="text-[11px] font-mono text-element-muted mt-1">
                {finishedDate}
              </p>
            )}
          </div>

          {prCount > 0 && (
            <div className="
              bg-signal-medium/10 border border-signal-medium/20
              rounded-xl px-3 py-2 text-center shrink-0
            ">
              <p className="text-xl leading-none">🏆</p>
              <p className="text-[10px] font-mono font-bold text-signal-medium mt-1">
                {prCount} PR
              </p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            {
              value: session.duration_minutes ?? '—',
              label: 'menit',
            },
            {
              value: session.exercise_count,
              label: 'exercise',
            },
            {
              value: (session.total_volume ?? 0) >= 1000
                ? `${((session.total_volume ?? 0) / 1000).toFixed(1)}k`
                : (session.total_volume ?? 0),
              label: 'kg volume',
            },
          ].map(({ value, label }) => (
            <div key={label} className="
              bg-accent-subtle border border-accent/15
              rounded-xl p-3 text-center
            ">
              <p className="font-display font-bold text-xl text-element-primary leading-none tabular-nums">
                {value}
              </p>
              <p className="text-[10px] font-mono text-element-muted mt-1.5 tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Exercise List ─────────────────────────────────── */}
      {session.exercises.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-3xl mb-3">🏋️</p>
          <p className="text-xs font-mono text-element-muted">
            Tidak ada data exercise.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="label-xs">
              Exercise
            </h3>
            <span className="
              text-[10px] font-mono text-element-muted
              bg-[#0D0E14] border border-[#181B26]
              px-2 py-0.5 rounded-pill
            ">
              {session.exercises.length}
            </span>
          </div>

          {session.exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}