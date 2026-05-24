/**
 * AttendanceChart.tsx
 * Rekap absensi gym per minggu dalam bulan berjalan.
 * Menampilkan bar chart sederhana: tiap kolom = 1 minggu,
 * tinggi bar = jumlah sesi, warna = indikasi semangat vs malas.
 */

import { useMemo } from 'react';
import { useWorkoutLogs } from '../../hooks/useWorkoutLogs';

interface Props {
  telegramId: number;
}

interface WeekSummary {
  label: string;       // "Minggu 1", "Minggu 2", dst
  sessions: number;    // jumlah gym di minggu itu
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
      label: `Minggu ${weekNum}`,
      sessions: 0,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd),
    });

    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  return weeks;
}

// Threshold: >= 3 sesi seminggu = semangat, >= 1 = lumayan, 0 = malas
function getMood(sessions: number): { color: string; label: string } {
  if (sessions === 0) return { color: '#EF4444', label: 'Ga gym 😴' };
  if (sessions === 1) return { color: '#F59E0B', label: 'Sekali doang' };
  if (sessions === 2) return { color: '#3B82F6', label: 'Lumayan' };
  return { color: '#22C55E', label: 'Rajin! 💪' };
}

export default function AttendanceChart({ telegramId }: Props) {
  const { logs, loading } = useWorkoutLogs(telegramId);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const weeks = useMemo(() => {
    const base = getWeeksOfMonth(year, month);

    // Hitung sesi per minggu
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

  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="card" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading...</span>
      </div>
    );
  }

  const totalSessions = weeks.reduce((s, w) => s + w.sessions, 0);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-semibold text-element-primary">
            Gym Attendance
          </h2>
          <p className="label-xs mt-1">
            {totalSessions} sesi · {monthName}
          </p>
        </div>
        <span
          className="badge font-mono text-[10px] font-semibold"
          style={{
            background: 'rgba(59,130,246,0.1)',
            color: '#3B82F6',
            border: '1px solid rgba(59,130,246,0.2)',
            padding: '3px 8px',
            borderRadius: 99,
          }}
        >
          {monthName.toUpperCase()}
        </span>
      </div>

      {/* Bar Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 10,
          alignItems: 'flex-end',
          height: 120,
        }}
      >
        {weeks.map((week, i) => {
          const mood = getMood(week.sessions);
          const heightPct = week.sessions === 0
            ? 8  // sedikit visible walau 0
            : Math.max(20, (week.sessions / maxSessions) * 100);

          return (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}
            >
              {/* Jumlah sesi */}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', monospace", fontWeight: 600 }}>
                {week.sessions}x
              </span>

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: week.sessions === 0
                    ? 'rgba(239,68,68,0.15)'
                    : mood.color,
                  borderRadius: '6px 6px 3px 3px',
                  opacity: 0.9,
                  transition: 'height 0.4s ease',
                  minHeight: 8,
                  boxShadow: week.sessions > 0 ? `0 0 12px ${mood.color}40` : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 10,
          marginTop: 8,
        }}
      >
        {weeks.map((week, i) => {
          const mood = getMood(week.sessions);
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em' }}>
                {week.label.replace('Minggu ', 'Wk')}
              </p>
              <p style={{ fontSize: 9, color: mood.color, marginTop: 2, fontWeight: 600 }}>
                {mood.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#EF4444', label: '0 sesi = Ga gym' },
          { color: '#F59E0B', label: '1 sesi = Kurang' },
          { color: '#3B82F6', label: '2 sesi = Lumayan' },
          { color: '#22C55E', label: '3+ sesi = Rajin' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}