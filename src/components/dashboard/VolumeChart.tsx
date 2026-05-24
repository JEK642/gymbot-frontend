// VolumeChart.tsx
// Bar chart total volume per session (pakai Recharts)
// Volume = total kg yang dipindahkan (weight × reps semua set)

import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';

interface VolumeDataPoint {
  date: string;
  volume: number;
  duration: number;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  loading: boolean;
}

// Custom tooltip agar info lebih informatif
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const volume = payload.find((p: any) => p.dataKey === 'volume')?.value ?? 0;
  const duration = payload.find((p: any) => p.dataKey === 'duration')?.value ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      <p className="text-indigo-600">
        📦 Volume:{' '}
        <span className="font-semibold">
          {volume.toLocaleString('id-ID')} kg
        </span>
      </p>
      <p className="text-emerald-600">
        ⏱️ Durasi: <span className="font-semibold">{duration} menit</span>
      </p>
    </div>
  );
}

// Skeleton loader
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-end gap-2 h-40 px-4">
        {[60, 85, 45, 92, 70, 55, 88, 40, 75, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex gap-2 px-4 mt-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function VolumeChart({ data, loading }: VolumeChartProps) {
  // Format angka besar: 12500 → "12.5k"
  const formatVolume = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(value);
  };

  // Hitung rata-rata volume untuk insight
  const avgVolume =
    data.length > 0
      ? Math.round(data.reduce((acc, d) => acc + d.volume, 0) / data.length)
      : 0;

  const maxVolume = data.length > 0 ? Math.max(...data.map((d) => d.volume)) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="font-bold text-gray-800 text-base">Volume per Sesi</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-7">
            Total beban yang dipindahkan (kg)
          </p>
        </div>

        {/* Stats ringkas */}
        {!loading && data.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Rata-rata</p>
            <p className="font-bold text-indigo-600 text-sm">
              {avgVolume.toLocaleString('id-ID')} kg
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-sm text-gray-500 font-medium">Belum ada data</p>
          <p className="text-xs text-gray-400 mt-1">
            Selesaikan beberapa sesi untuk melihat progresmu
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                tickFormatter={formatVolume}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Area untuk kesan gradien di bawah bar */}
              <Area
                type="monotone"
                dataKey="volume"
                fill="url(#volumeGradient)"
                stroke="none"
              />

              <Bar
                dataKey="volume"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Insight bawah chart */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-400">Sesi</p>
              <p className="font-bold text-gray-700 text-sm">{data.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Tertinggi</p>
              <p className="font-bold text-gray-700 text-sm">
                {maxVolume.toLocaleString('id-ID')} kg
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Rata-rata</p>
              <p className="font-bold text-indigo-600 text-sm">
                {avgVolume.toLocaleString('id-ID')} kg
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}