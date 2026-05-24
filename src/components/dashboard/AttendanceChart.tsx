/**
 * AttendanceChart.tsx
 * Rekap absensi gym per minggu dalam bulan berjalan.
 * Phase 4: label lebih readable, bar lebih polished, spacing konsisten.
 */

import { useMemo } from 'react';
import { useWorkoutLogs } from '../../hooks/useWorkoutLogs';

interface Props {
  telegramId: number;
}

interface WeekSummary {
  label: string;
  sessions: number;
  startDate: Date;
  endDate: Date;
}

function getWeeksOfMonth(year: number, month: number): WeekSummary[] {
  const weeks: WeekSummary[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  let weekStart = new Date(firstDay);
  let weekNum   = 1;

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

    weeks.push({
      label: `W${weekNum}`,
      sessions: 0,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd),
    });

    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  return weeks;
}

// Warna pakai design system token dari index.css
function getMood(sessions: number): { color: string; glow: string; label: string } {
  if (sessions === 0) return { color: 'rgba(255,92,92,0.25)',  glow: 'none',                        label: 'Skip' };
  if (sessions === 1) return { color: '#EF9F27',               glow: '0 0 10px rgba(239,159,39,0.3)', label: '1×' };
  if (sessions === 2) return { color: '#4B8EFF',               glow: '0 0 10px rgba(75,142,255,0.3)', label: '2×' };
  return                      { color: '#34C759',               glow: '0 0 10px rgba(52,199,89,0.35)', label: `${sessions}×` };
}

export default function AttendanceChart({ telegramId }: Props) {
  const { logs, loading } = useWorkoutLogs(telegramId);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const weeks = useMemo(() => {
    const base = getWeeksOfMonth(year, month);

    logs.forEach(log => {
      const logDate = new Date(log.logged_at);
      const weekIdx = base.findIndex(
        w => logDate >= w.startDate && logDate <= w.endDate
      );
      if (weekIdx !== -1) base[weekIdx].sessions++;
    });

    return base;
  }, [logs, year, month]);

  const maxSessions = Math.max(...weeks.map(w => w.sessions), 1);
  const totalSessions = weeks.reduce((s, w) => s + w.sessions, 0);
  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div
        className="card animate-pulse"
        style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>—</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.25rem 1.375rem' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1,
            }}
          >
            Gym Attendance
          </p>
          <p className="label-xs mt-1.5">
            {totalSessions} sesi · {monthName}
          </p>
        </div>

        {/* Mini legend pills */}
        <div className="flex items-center gap-2">
          {[
            { color: '#34C759', label: '3+' },
            { color: '#4B8EFF', label: '2' },
            { color: '#EF9F27', label: '1' },
            { color: 'rgba(255,92,92,0.4)', label: '0' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div style={{ width: 6, height: 6, borderRadius: 2, background: item.color }} />
              <span style={{ fontSize: 9, fontFamily: "'Fira Code', monospace", color: 'rgba(255,255,255,0.25)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 8,
          alignItems: 'flex-end',
          height: 100,
        }}
      >
        {weeks.map((week, i) => {
          const mood = getMood(week.sessions);
          const heightPct = week.sessions === 0
            ? 6
            : Math.max(18, (week.sessions / maxSessions) * 100);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: 5,
              }}
            >
              {/* Session count — only show if > 0 */}
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Fira Code', monospace",
                  fontWeight: 700,
                  color: week.sessions > 0 ? mood.color : 'rgba(255,255,255,0.15)',
                  lineHeight: 1,
                  minHeight: 14,
                }}
              >
                {week.sessions > 0 ? `${week.sessions}×` : ''}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: week.sessions === 0
                    ? 'rgba(255,255,255,0.04)'
                    : mood.color,
                  borderRadius: '5px 5px 3px 3px',
                  boxShadow: mood.glow,
                  transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)',
                  minHeight: 6,
                  border: week.sessions === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Week labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 8,
          marginTop: 8,
        }}
      >
        {weeks.map((week, i) => {
          // Format: "1–7 Jan"
          const start = week.startDate.getDate();
          const end   = week.endDate.getDate();
          const mon   = week.startDate.toLocaleDateString('id-ID', { month: 'short' });

          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 9,
                  fontFamily: "'Fira Code', monospace",
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.03em',
                  lineHeight: 1.4,
                }}
              >
                {week.label}
              </p>
              <p
                style={{
                  fontSize: 8,
                  fontFamily: "'Outfit', sans-serif",
                  color: 'rgba(255,255,255,0.15)',
                  marginTop: 1,
                }}
              >
                {start}–{end} {mon}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}