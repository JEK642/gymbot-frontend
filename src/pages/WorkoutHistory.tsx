import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutLogs } from '../hooks/useWorkoutLogs';
import { useRecentSessions } from '../hooks/useWorkoutSessions';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

const MY_TELEGRAM_ID = 8041376316;

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] as const;
type MuscleFilter = typeof MUSCLE_GROUPS[number] | 'All';

const DATE_FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: '7 hari', value: '7d' },
  { label: '30 hari', value: '30d' },
  { label: '3 bulan', value: '90d' },
] as const;
type DateFilter = typeof DATE_FILTERS[number]['value'];

const WORKOUT_DISPLAY_NAME: Record<string, string> = {
  push:      "Push Day",
  pull:      "Pull Day",
  legs:      "Leg Day",
  upper:     "Upper Body",
  lower:     "Lower Body",
  fullbody:  "Full Body",
  chest:     "Chest Day",
  back:      "Back Day",
  shoulders: "Shoulder Day",
  arms:      "Arm Day",
  core:      "Core Day",
  cardio:    "Cardio",
  hiit:      "HIIT",
  mobility:  "Mobility",
  rest:      "Rest Day",
};

function getDisplayName(raw: string | null | undefined): string {
  if (!raw) return "Workout Session";
  return WORKOUT_DISPLAY_NAME[raw.toLowerCase()] ?? raw;
}

const WORKOUT_MUSCLE_MAP: Record<string, string[]> = {
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

function formatDuration(minutes: number | null): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
}

function getDateCutoff(filter: DateFilter): Date | null {
  if (filter === 'all') return null;
  const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 99,
        border: active ? '1px solid rgba(75,142,255,0.5)' : '1px solid #1E2130',
        background: active ? 'rgba(75,142,255,0.12)' : 'transparent',
        color: active ? '#4B8EFF' : 'rgba(255,255,255,0.35)',
        fontSize: 11,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

export function WorkoutHistory() {
  const navigate = useNavigate();
  const { logs, loading } = useWorkoutLogs(MY_TELEGRAM_ID);
  const { sessions, loading: sessionsLoading } = useRecentSessions(MY_TELEGRAM_ID);

  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // ✅ PINDAH KE SINI — semua useMemo harus sebelum return kondisional
  const filteredSessions = useMemo(() => {
    const cutoff = getDateCutoff(dateFilter);
    return sessions.filter((s) => {
      if (cutoff) {
        const sessionDate = new Date(s.finished_at ?? s.started_at);
        if (sessionDate < cutoff) return false;
      }
      if (muscleFilter !== 'All') {
        const type = (s.split_name ?? s.name ?? '').toLowerCase();
        const muscles = WORKOUT_MUSCLE_MAP[type] ?? [];
        if (!muscles.includes(muscleFilter)) return false;
      }
      return true;
    });
  }, [sessions, muscleFilter, dateFilter]);

  const filteredLogs = useMemo(() => {
    const cutoff = getDateCutoff(dateFilter);
    return logs.filter((log) => {
      if (cutoff && new Date(log.logged_at) < cutoff) return false;
      if (muscleFilter !== 'All') {
        const muscles = WORKOUT_MUSCLE_MAP[log.workout_type?.toLowerCase()] ?? [];
        if (!muscles.includes(muscleFilter)) return false;
      }
      return true;
    });
  }, [logs, muscleFilter, dateFilter]);

  const groupedByMonth = useMemo(() => {
    return filteredLogs.reduce<Record<string, typeof filteredLogs>>(
      (acc, log) => {
        const monthKey = new Date(log.logged_at).toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(log);
        return acc;
      },
      {}
    );
  }, [filteredLogs]);

  // ✅ return kondisional setelah semua hooks
  if (loading) return <LoadingScreen />;

  const hasActiveFilter = muscleFilter !== 'All' || dateFilter !== 'all';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label-xs mb-1.5">Workout</p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-element-primary tracking-tight leading-none">
            History
          </h1>
          <p className="text-xs text-element-muted font-mono mt-2">
            {sessionsLoading ? '...' : sessions.length} sesi latihan total
          </p>
        </div>

        {hasActiveFilter && (
          <button
            onClick={() => { setMuscleFilter('All'); setDateFilter('all'); }}
            style={{
              fontSize: 10,
              fontFamily: "'Fira Code', monospace",
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid #1E2130',
              borderRadius: 99,
              padding: '4px 10px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            reset filter
          </button>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DATE_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              active={dateFilter === f.value}
              onClick={() => setDateFilter(f.value)}
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            label="Semua Otot"
            active={muscleFilter === 'All'}
            onClick={() => setMuscleFilter('All')}
          />
          {MUSCLE_GROUPS.map((mg) => (
            <FilterChip
              key={mg}
              label={mg}
              active={muscleFilter === mg}
              onClick={() => setMuscleFilter(mg)}
            />
          ))}
        </div>
      </div>

      {/* ── Sesi Latihan ─────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="label-xs">Sesi Latihan</h2>
          {hasActiveFilter && !sessionsLoading && (
            <span style={{ fontSize: 10, fontFamily: "'Fira Code', monospace", color: 'rgba(255,255,255,0.25)' }}>
              {filteredSessions.length} hasil
            </span>
          )}
        </div>

        {sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#0D0E14] border border-[#181B26] rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Tidak ada sesi yang cocok"
            description={
              hasActiveFilter
                ? 'Coba ubah filter otot atau rentang tanggal.'
                : 'Mulai dengan /session start di bot.'
            }
            action={
              hasActiveFilter
                ? { label: 'Reset Filter', onClick: () => { setMuscleFilter('All'); setDateFilter('all'); } }
                : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => {
              const date = new Date(
                session.finished_at ?? session.started_at
              ).toLocaleDateString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short',
              });

              return (
                <button
                  key={session.id}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="card w-full text-left hover:border-outline-strong hover:bg-slate-700/30 transition-all duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-element-primary text-sm uppercase tracking-wide">
                        {getDisplayName(session.split_name ?? session.name)}
                      </p>
                      {session.primary_exercises && session.primary_exercises.length > 0 && (
                        <p className="text-[10px] font-mono text-element-muted mt-0.5 truncate">
                          {session.primary_exercises.join(' · ')}
                          {(session.exercise_count ?? 0) > 3 && (
                            <span className="opacity-50"> +{(session.exercise_count ?? 0) - 3}</span>
                          )}
                        </p>
                      )}
                      <p className="text-[10px] font-mono text-element-muted mt-0.5 tracking-wide opacity-50">
                        {date}
                      </p>
                    </div>
                    <span className="text-element-muted text-base leading-none mt-0.5 ml-2">›</span>
                  </div>

                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="label-xs mb-1">Durasi</p>
                      <p className="font-display font-semibold text-element-primary text-sm tracking-wide">
                        {formatDuration(session.duration_minutes)}
                      </p>
                    </div>
                    <div>
                      <p className="label-xs mb-1">Exercise</p>
                      <p className="font-display font-semibold text-element-primary text-sm tracking-wide">
                        {session.exercise_count ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="label-xs mb-1">Volume</p>
                      <p className="font-display font-semibold text-element-primary text-sm tracking-wide">
                        {session.total_volume
                          ? `${(session.total_volume / 1000).toFixed(1)}k kg`
                          : '—'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Workout Log (grouped by month) ───────────────── */}
      {filteredLogs.length === 0 ? (
        logs.length > 0 ? (
          <EmptyState
            icon="🔍"
            title="Tidak ada log yang cocok"
            description="Coba ubah filter untuk melihat lebih banyak."
            action={{ label: 'Reset Filter', onClick: () => { setMuscleFilter('All'); setDateFilter('all'); } }}
          />
        ) : (
          <EmptyState
            icon="🏋️"
            title="Belum ada workout"
            description="Kirim /workout push ke bot untuk mulai mencatat sesi latihan kamu."
          />
        )
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([month, monthLogs]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="label-xs">{month}</h2>
                <div className="text-[10px] font-mono text-element-muted bg-[#0D0E14] border border-[#181B26] px-2 py-0.5 rounded-pill">
                  {monthLogs.length} sesi
                </div>
              </div>

              <div className="space-y-2">
                {monthLogs.map((workout) => (
                  <div
                    key={workout.id}
                    className="card flex items-start justify-between gap-4 hover:border-outline-strong hover:bg-slate-700/20 transition-all duration-150 cursor-default"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg shrink-0 mt-0.5 bg-accent-subtle border border-accent/12 flex items-center justify-center text-sm">
                        {getWorkoutEmoji(workout.workout_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-semibold text-element-primary text-sm uppercase tracking-wide">
                            {workout.workout_type}
                          </span>
                          <Badge intensity={workout.intensity} />
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-element-muted tracking-wide">
                            {new Date(workout.logged_at).toLocaleDateString('id-ID', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })}
                          </span>
                          {workout.duration && (
                            <span className="text-[10px] font-mono text-element-muted">
                              ⏱ {workout.duration} mnt
                            </span>
                          )}
                        </div>

                        {workout.notes && (
                          <p className="text-[11px] text-element-secondary mt-1.5 italic font-mono truncate">
                            "{workout.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-element-muted shrink-0 mt-0.5">
                      {new Date(workout.logged_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getWorkoutEmoji(type: string): string {
  const map: Record<string, string> = {
    push: '💪', pull: '🔙', legs: '🦵',
    cardio: '🏃', hiit: '⚡', core: '🎯',
    chest: '💥', back: '🏋️', shoulders: '🔝',
    arms: '💪', mobility: '🧘', rest: '😴',
    upper: '⬆️', lower: '⬇️',
  };
  return map[type] ?? '🏋️';
}