import { useNavigate } from 'react-router-dom';
import { useWorkoutLogs } from '../hooks/useWorkoutLogs';
import { useRecentSessions } from '../hooks/useWorkoutSessions';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

const MY_TELEGRAM_ID = 8041376316;

function formatDuration(minutes: number | null): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
}

export function WorkoutHistory() {
  const navigate = useNavigate();
  const { logs, loading } = useWorkoutLogs(MY_TELEGRAM_ID);
  const { sessions, loading: sessionsLoading } = useRecentSessions(MY_TELEGRAM_ID);

  if (loading) return <LoadingScreen />;

  const groupedByMonth = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const monthKey = new Date(log.logged_at).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label-xs mb-1.5">Workout</p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-element-primary tracking-tight leading-none">
            History
          </h1>
          <p className="text-xs text-element-muted font-mono mt-2">
            {logs.length} sesi latihan total
          </p>
        </div>
      </div>

      {/* ── Sesi Latihan ─────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="label-xs">Sesi Latihan</h2>
        </div>

        {sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#0D0E14] border border-[#181B26] rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="Belum ada sesi latihan"
            description="Mulai dengan /session start di bot"
          />
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const date = new Date(
                session.finished_at ?? session.started_at
              ).toLocaleDateString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short',
              });

              return (
                <button
                  key={session.id}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="
                    card w-full text-left
                    hover:border-outline-strong hover:bg-slate-700/30
                    transition-all duration-150
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold text-element-primary text-sm uppercase tracking-wide">
                        {session.split_name ?? session.name ?? 'Workout Session'}
                      </p>
                      <p className="text-[10px] font-mono text-element-muted mt-0.5 tracking-wide">
                        {date}
                      </p>
                    </div>
                    <span className="text-element-muted text-base leading-none mt-0.5">›</span>
                  </div>

                  {/* Stats row */}
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
      {logs.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="Belum ada workout"
          description="Kirim /workout push ke bot untuk mulai mencatat sesi latihan kamu."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([month, monthLogs]) => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="label-xs">{month}</h2>
                <div className="
                  text-[10px] font-mono text-element-muted
                  bg-[#0D0E14] border border-[#181B26]
                  px-2 py-0.5 rounded-pill
                ">
                  {monthLogs.length} sesi
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {monthLogs.map((workout) => (
                  <div
                    key={workout.id}
                    className="
                      card flex items-start justify-between gap-4
                      hover:border-outline-strong hover:bg-slate-700/20
                      transition-all duration-150 cursor-default
                    "
                  >
                    {/* Left */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="
                        w-9 h-9 rounded-lg shrink-0 mt-0.5
                        bg-accent-subtle border border-accent/12
                        flex items-center justify-center text-sm
                      ">
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

                    {/* Right: time */}
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