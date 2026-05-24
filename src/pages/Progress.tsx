import { useMemo, useState } from 'react';
import { useWeightLogs } from '../hooks/useWeightLogs';
import { useRecentSessions, useVolumeHistory } from '../hooks/useWorkoutSessions';
import { useProgressAnalytics } from '../hooks/useProgressAnalytics';
import WeightChart from '../components/dashboard/WeightChart';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import type { ChartDataPoint } from '../types';

const MY_TELEGRAM_ID = 8041376316;

// ─── Chart Theme ──────────────────────────────────────────────────────────────
const CT = {
  grid:   '#181B26',
  text:   '#4A5068',
  accent: '#4B8EFF',
  purple: '#7B6FFF',
  green:  '#3ECFA4',
  red:    '#F06565',
};

// ─── Muscle Colours / Icons ───────────────────────────────────────────────────
const MUSCLE_COLOR: Record<string, string> = {
  Chest: '#4B8EFF', Back: '#7B6FFF', Legs: '#3ECFA4',
  Shoulders: '#F0A165', Arms: '#F06565', Core: '#A3C4FF', Other: '#4A5068',
};

const MUSCLE_ICON: Record<string, string> = {
  Chest: '💪', Back: '🏋️', Legs: '🦵', Shoulders: '🔝', Arms: '💪', Core: '⚡', Other: '🎯',
};

// ─── Shared Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D0E14] border border-[#181B26] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-mono text-element-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono font-semibold text-sm" style={{ color: p.color }}>
          {p.value}{unit}
        </p>
      ))}
    </div>
  );
}

// ─── Tiny stat card ───────────────────────────────────────────────────────────
function StatMini({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="card">
      <p className="label-xs mb-2">{label}</p>
      <p className="font-display font-bold text-3xl text-element-primary tracking-tight leading-none">
        {value}
      </p>
      <p className="text-[11px] font-mono text-element-muted mt-1.5">{unit}</p>
    </div>
  );
}

// ─── Section Tabs ─────────────────────────────────────────────────────────────
type Section = 'weight' | 'muscle' | 'exercise' | 'volume' | 'prs';

const TABS: { id: Section; label: string; icon: string }[] = [
  { id: 'weight',   label: 'Berat',   icon: '⚖️' },
  { id: 'muscle',   label: 'Otot',    icon: '💪' },
  { id: 'exercise', label: 'Latihan', icon: '📈' },
  { id: 'volume',   label: 'Volume',  icon: '📊' },
  { id: 'prs',      label: 'PR',      icon: '🏆' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function Progress() {
  const [activeSection, setActiveSection] = useState<Section>('weight');

  const { logs: weightLogs, loading: wLoading }    = useWeightLogs(MY_TELEGRAM_ID);
  const { sessions,         loading: sLoading }    = useRecentSessions(MY_TELEGRAM_ID, 50);
  const { data: volHistory, loading: vLoading }    = useVolumeHistory(MY_TELEGRAM_ID);
  const { analytics,        loading: aLoading }    = useProgressAnalytics(MY_TELEGRAM_ID);

  // Weight chart data
  const chartData: ChartDataPoint[] = useMemo(() => weightLogs.map(log => ({
    rawDate: log.logged_at,
    date: new Date(log.logged_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    weight: log.weight,
  })), [weightLogs]);

  // Weight summary stats
  const weightStats = useMemo(() => {
    if (!weightLogs.length) return null;
    const ws = weightLogs.map(l => l.weight);
    return {
      first:       ws[0],
      latest:      ws[ws.length - 1],
      totalChange: Number((ws[ws.length - 1] - ws[0]).toFixed(1)),
    };
  }, [weightLogs]);

  // Volume section derived data
  const volumeCharts = useMemo(() => {
    const sessionVol = volHistory.slice(-12).map(e => ({
      date:     e.date,
      volume:   Math.round(e.volume / 1000),
      duration: e.duration,
    }));
    const totalVol  = Math.round(volHistory.reduce((s, e) => s + e.volume, 0) / 1000);
    const avgVol    = volHistory.length ? Math.round(totalVol / volHistory.length) : 0;
    const latest    = volHistory[volHistory.length - 1]?.volume ?? 0;
    const prev      = volHistory[volHistory.length - 2]?.volume ?? 0;
    const weekChange = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0;
    return { sessionVol, totalVol, avgVol, weekChange };
  }, [volHistory]);

  if (wLoading || sLoading || vLoading || aLoading) return <LoadingScreen />;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label-xs mb-1.5">Analytics</p>
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-element-primary tracking-tight leading-none">
            Progress
          </h1>
          <p className="text-xs text-element-muted font-mono mt-1.5">
            {sessions.length} sesi · {weightLogs.length} log berat
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#181B26] bg-[#0D0E14]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-element-muted">Live</span>
        </div>
      </div>

      {/* ── Section Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#0D0E14] border border-[#181B26] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`
              flex-1 min-w-max flex items-center justify-center gap-1.5
              px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
              ${activeSection === tab.id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-element-muted hover:text-element-secondary hover:bg-white/[0.03]'
              }
            `}
          >
            <span className="text-sm leading-none">{tab.icon}</span>
            <span className="font-mono tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Sections ────────────────────────────────────────────────── */}
      {activeSection === 'weight'   && (
        <WeightSection logs={weightLogs} stats={weightStats} chartData={chartData} />
      )}
      {activeSection === 'muscle'   && (
        <MuscleSection muscleArr={analytics.muscleArr} />
      )}
      {activeSection === 'exercise' && (
        <ExerciseSection exerciseArr={analytics.exerciseArr} />
      )}
      {activeSection === 'volume'   && (
        <VolumeSection volumeCharts={volumeCharts} muscleArr={analytics.muscleArr} />
      )}
      {activeSection === 'prs'      && (
        <PRSection prs={analytics.prs} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION — WEIGHT
// ═══════════════════════════════════════════════════════════════════════════════
function WeightSection({ logs, stats, chartData }: any) {
  if (!logs.length)
    return (
      <EmptyState
        icon="⚖️"
        title="Belum ada data berat"
        description="Kirim /weight 72.5 ke bot untuk mulai tracking."
      />
    );

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatMini label="Berat Awal" value={`${stats.first}`} unit="kg" />

          <div className="card-accent relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/80 via-accent to-accent/30" />
            <p className="label-xs mb-2">Berat Sekarang</p>
            <p className="font-display font-bold text-3xl text-accent tracking-tight leading-none">
              {stats.latest}
            </p>
            <p className="text-[11px] font-mono text-element-muted mt-1.5">kg</p>
          </div>

          <div className="card">
            <p className="label-xs mb-2">Total Perubahan</p>
            <p className={`font-display font-bold text-3xl tracking-tight leading-none ${
              stats.totalChange > 0 ? 'text-signal-high'
              : stats.totalChange < 0 ? 'text-signal-low'
              : 'text-element-primary'
            }`}>
              {stats.totalChange > 0 ? '+' : ''}{stats.totalChange}
            </p>
            <p className="text-[11px] font-mono text-element-muted mt-1.5">kg sejak awal</p>
          </div>

          <StatMini label="Total Log" value={`${logs.length}`} unit="entri" />
        </div>
      )}

      <div className="card">
        <div className="mb-5">
          <h2 className="font-display font-semibold text-element-primary">Grafik Berat Badan</h2>
          <p className="label-xs mt-1">{chartData.length} log</p>
        </div>
        <WeightChart data={chartData} />
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-element-primary mb-4">Riwayat Log</h2>
        <div className="space-y-0">
          {[...logs].reverse().map((log: any, index: number) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-3 border-b border-[#181B26] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-element-muted w-5 text-right tabular-nums">
                  {index + 1}
                </span>
                <span className="text-xs text-element-secondary font-mono tracking-wide">
                  {new Date(log.logged_at).toLocaleDateString('id-ID', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              <span className="font-mono font-semibold text-element-primary tabular-nums">
                {log.weight}{' '}
                <span className="text-element-muted text-xs font-normal">kg</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION — MUSCLE GROUP ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function MuscleSection({ muscleArr }: { muscleArr: any[] }) {
  if (!muscleArr.length)
    return (
      <EmptyState
        icon="💪"
        title="Belum ada data muscle"
        description="Log beberapa sesi untuk melihat muscle analytics."
      />
    );

  const maxVol = Math.max(...muscleArr.map(m => m.volume), 1);
  const radarData = muscleArr.slice(0, 6).map(m => ({ muscle: m.name, volume: m.volume }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-element-primary">Distribusi Otot</h2>
            <p className="label-xs mt-1">Volume per kelompok otot</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={CT.grid} />
              <PolarAngleAxis
                dataKey="muscle"
                tick={{ fill: CT.text, fontSize: 11, fontFamily: 'Fira Code' }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar
                dataKey="volume" stroke={CT.accent} fill={CT.accent}
                fillOpacity={0.15} strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-element-primary">Top Kelompok Otot</h2>
            <p className="label-xs mt-1">Berdasarkan total volume</p>
          </div>
          <div className="space-y-4">
            {muscleArr.slice(0, 3).map((m, i) => {
              const color = MUSCLE_COLOR[m.name] ?? CT.text;
              const pct   = Math.round((m.volume / maxVol) * 100);
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{MUSCLE_ICON[m.name] ?? '🎯'}</span>
                      <span className="text-sm font-medium text-element-primary">{m.name}</span>
                      {i === 0 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}20`, color }}>
                          #1
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-element-muted">{m.volume}t</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#181B26] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {muscleArr.map(m => {
          const color = MUSCLE_COLOR[m.name] ?? CT.text;
          return (
            <div key={m.name} className="card relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${color}90, ${color}20)` }}
              />
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl leading-none">{MUSCLE_ICON[m.name] ?? '🎯'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${color}15`, color }}>
                  {m.sessions}x
                </span>
              </div>
              <p className="font-display font-semibold text-element-primary text-sm mb-3">{m.name}</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Volume',    value: `${m.volume}t` },
                  { label: 'Sesi',      value: `${m.sessions}` },
                  { label: 'Frekuensi', value: `${m.frequency}x/minggu` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-[10px] font-mono text-element-muted">{row.label}</span>
                    <span className="text-[11px] font-mono text-element-secondary tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION — EXERCISE PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════════
function ExerciseSection({ exerciseArr }: { exerciseArr: any[] }) {
  const [selected, setSelected] = useState(0);

  if (!exerciseArr.length)
    return (
      <EmptyState
        icon="📈"
        title="Belum cukup data"
        description="Log minimal 2 sesi per exercise untuk melihat progression."
      />
    );

  const ex = exerciseArr[selected];
  const pctChange = ex.history[0]?.maxWeight > 0
    ? Math.round(((ex.pr - ex.history[0].maxWeight) / ex.history[0].maxWeight) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Exercise picker */}
      <div className="card p-2">
        <div className="flex gap-1.5 flex-wrap">
          {exerciseArr.map((e: any, i: number) => (
            <button
              key={e.name}
              onClick={() => setSelected(i)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200
                ${selected === i
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-element-muted hover:text-element-secondary hover:bg-white/[0.03] border border-transparent'
                }
              `}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-accent relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/80 via-accent to-accent/30" />
          <p className="label-xs mb-2">Current PR</p>
          <p className="font-display font-bold text-3xl text-accent tracking-tight leading-none">
            {ex.pr}
          </p>
          <p className="text-[11px] font-mono text-element-muted mt-1.5">kg × {ex.prReps} reps</p>
        </div>

        <div className="card">
          <p className="label-xs mb-2">Peningkatan</p>
          <p className={`font-display font-bold text-3xl tracking-tight leading-none ${
            ex.change >= 0 ? 'text-signal-high' : 'text-signal-low'
          }`}>
            {ex.change >= 0 ? '+' : ''}{ex.change}
          </p>
          <p className="text-[11px] font-mono text-element-muted mt-1.5">kg total</p>
        </div>

        <div className="card">
          <p className="label-xs mb-2">Progress</p>
          <p className={`font-display font-bold text-3xl tracking-tight leading-none ${
            pctChange >= 0 ? 'text-signal-high' : 'text-signal-low'
          }`}>
            {pctChange >= 0 ? '+' : ''}{pctChange}%
          </p>
          <p className="text-[11px] font-mono text-element-muted mt-1.5">dari awal</p>
        </div>
      </div>

      {/* Progression chart */}
      <div className="card">
        <div className="mb-5">
          <h2 className="font-display font-semibold text-element-primary">{ex.name}</h2>
          <p className="label-xs mt-1">
            Max weight per sesi · est. 1RM{' '}
            <span className="text-accent">{ex.e1rm}kg</span>
          </p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ex.history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CT.accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CT.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CT.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: CT.text, fontSize: 10, fontFamily: 'Fira Code' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: CT.text, fontSize: 10, fontFamily: 'Fira Code' }}
              axisLine={false} tickLine={false} domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTip unit="kg" />} />
            <Area
              type="monotone" dataKey="maxWeight"
              stroke={CT.accent} strokeWidth={2} fill="url(#progGrad)"
              dot={{ fill: CT.accent, r: 3, strokeWidth: 0 }}
              activeDot={{ fill: CT.accent, r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* All exercises list */}
      <div className="card">
        <h2 className="font-display font-semibold text-element-primary mb-4">Semua Latihan</h2>
        <div className="space-y-0">
          {exerciseArr.map((e: any, i: number) => (
            <button
              key={e.name}
              onClick={() => setSelected(i)}
              className={`
                w-full flex items-center justify-between py-3 border-b border-[#181B26]
                last:border-0 text-left transition-opacity duration-150
                ${selected === i ? 'opacity-100' : 'opacity-60 hover:opacity-85'}
              `}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: selected === i ? CT.accent : CT.grid }}
                />
                <span className="text-sm font-medium text-element-primary">{e.name}</span>
                <span className="text-[10px] font-mono text-element-muted">{e.history.length}x</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-element-muted tabular-nums">{e.pr}kg</span>
                <span className={`text-[11px] font-mono tabular-nums ${
                  e.change >= 0 ? 'text-signal-high' : 'text-signal-low'
                }`}>
                  {e.change >= 0 ? '+' : ''}{e.change}kg
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION — VOLUME ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function VolumeSection({ volumeCharts, muscleArr }: any) {
  const { sessionVol, totalVol, avgVol, weekChange } = volumeCharts;
  const maxMVol = Math.max(...muscleArr.map((m: any) => m.volume), 1);

  if (!sessionVol.length)
    return (
      <EmptyState
        icon="📊"
        title="Belum ada data volume"
        description="Log beberapa sesi untuk melihat volume analytics."
      />
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatMini label="Total Volume"   value={`${totalVol}t`} unit="keseluruhan" />
        <StatMini label="Avg per Sesi"   value={`${avgVol}t`}  unit="kg × 1000"   />
        <div className="card">
          <p className="label-xs mb-2">vs Sesi Sebelumnya</p>
          <p className={`font-display font-bold text-3xl tracking-tight leading-none ${
            weekChange >= 0 ? 'text-signal-high' : 'text-signal-low'
          }`}>
            {weekChange >= 0 ? '+' : ''}{weekChange}%
          </p>
          <p className="text-[11px] font-mono text-element-muted mt-1.5">trend</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-5">
          <h2 className="font-display font-semibold text-element-primary">Volume per Sesi</h2>
          <p className="label-xs mt-1">Total volume dalam ribuan kg (12 sesi terakhir)</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sessionVol} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CT.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: CT.text, fontSize: 9, fontFamily: 'Fira Code' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: CT.text, fontSize: 10, fontFamily: 'Fira Code' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<ChartTip unit="t" />} />
            <Bar dataKey="volume" fill={CT.accent} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {sessionVol.some((e: any) => e.duration > 0) && (
        <div className="card">
          <div className="mb-5">
            <h2 className="font-display font-semibold text-element-primary">Durasi Sesi</h2>
            <p className="label-xs mt-1">Menit per sesi</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={sessionVol} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CT.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: CT.text, fontSize: 9, fontFamily: 'Fira Code' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: CT.text, fontSize: 10, fontFamily: 'Fira Code' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<ChartTip unit=" min" />} />
              <Line
                type="monotone" dataKey="duration"
                stroke={CT.purple} strokeWidth={2}
                dot={{ fill: CT.purple, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: CT.purple, r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {muscleArr.length > 0 && (
        <div className="card">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-element-primary">Distribusi Volume Otot</h2>
            <p className="label-xs mt-1">Deteksi imbalance antar kelompok otot</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {muscleArr.map((m: any) => {
              const color   = MUSCLE_COLOR[m.name] ?? CT.text;
              const pct     = Math.round((m.volume / maxMVol) * 100);
              const hexAlpha = Math.round(Math.max(0.08, pct / 100) * 255)
                .toString(16).padStart(2, '0');
              return (
                <div
                  key={m.name}
                  className="relative rounded-xl p-3 border border-[#181B26]"
                  style={{ background: `${color}${hexAlpha}` }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-sm font-medium text-element-primary">{m.name}</span>
                    <span className="text-[10px] font-mono" style={{ color }}>{pct}%</span>
                  </div>
                  <p className="text-[11px] font-mono text-element-muted">{m.volume}t</p>
                  <div className="mt-2 h-1 rounded-full bg-black/20 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION — PERSONAL RECORDS
// ═══════════════════════════════════════════════════════════════════════════════
function PRSection({ prs }: { prs: any[] }) {
  if (!prs.length)
    return (
      <EmptyState
        icon="🏆"
        title="Belum ada PR"
        description="Log latihan dengan beban untuk melihat personal records."
      />
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatMini label="Total PR Tercatat" value={`${prs.length}`} unit="lift" />
        <div className="card">
          <p className="label-xs mb-2">PR Terbaru</p>
          <p className="font-display font-semibold text-lg text-element-primary truncate">
            {prs[0]?.name ?? '—'}
          </p>
          <p className="text-[11px] font-mono text-element-muted mt-1.5">
            {prs[0]
              ? new Date(prs[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              : '—'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {prs.map((pr: any, i: number) => {
          const isTop = i === 0;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏋️';
          return (
            <div key={pr.name} className={`card relative overflow-hidden ${isTop ? 'card-accent' : ''}`}>
              {isTop && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/80 via-accent to-accent/30" />
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{medal}</span>
                  <div>
                    <p className="font-display font-semibold text-element-primary text-sm leading-tight">
                      {pr.name}
                    </p>
                    <p className="text-[10px] font-mono text-element-muted mt-0.5">
                      {new Date(pr.date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {isTop && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    LATEST
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`font-display font-bold text-3xl tracking-tight leading-none ${
                    isTop ? 'text-accent' : 'text-element-primary'
                  }`}>
                    {pr.weight}
                    <span className="text-lg text-element-muted font-normal ml-1">kg</span>
                  </p>
                  <p className="text-xs font-mono text-element-muted mt-1">× {pr.reps} reps</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-element-muted mb-0.5">1RM est.</p>
                  <p className="font-mono font-semibold text-element-secondary text-sm tabular-nums">
                    {pr.e1rm}kg
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}