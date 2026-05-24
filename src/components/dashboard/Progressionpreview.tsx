import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, type TooltipContentProps } from "recharts";
import { supabase } from "../../lib/supabase";

// ⚠️ Ganti dengan Telegram ID kamu
const MY_TELEGRAM_ID = 8041376316;

interface LiftDataPoint {
  week: string;
  weight: number;
}

interface LiftSeries {
  name: string;
  unit: string;
  data: LiftDataPoint[];
  color: string;
  currentMax: number;
  delta: number;
}

// Warna per exercise (bisa ditambah)
const LIFT_COLORS: Record<string, string> = {
  default0: "#4B8EFF",
  default1: "#5DCAA5",
  default2: "#EF9F27",
  default3: "#FF6B6B",
  default4: "#C77DFF",
};

// ─── Hook fetch dari Supabase ─────────────────────────────
function useProgressionData(telegramId: number) {
  const [lifts, setLifts] = useState<LiftSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Ambil 8 minggu ke belakang
      const since = new Date();
      since.setDate(since.getDate() - 56);

      const { data: records, error } = await supabase
        .from("personal_records")
        .select(`
          weight_kg,
          achieved_at,
          exercises ( name )
        `)
        .eq("telegram_id", telegramId)
        .gte("achieved_at", since.toISOString())
        .order("achieved_at", { ascending: true });

      if (error || !records || records.length === 0) {
        setLifts([]);
        setLoading(false);
        return;
      }

      // Kelompokkan per exercise
      const grouped: Record<string, { weight: number; date: string }[]> = {};
      for (const r of records) {
        const name = (r.exercises as any)?.name ?? "Unknown";
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push({ weight: r.weight_kg, date: r.achieved_at });
      }

      // Format ke LiftSeries
      const result: LiftSeries[] = Object.entries(grouped).map(
        ([name, entries], idx) => {
          // Kelompokkan per minggu
          const byWeek: Record<string, number> = {};
          for (const e of entries) {
            const d = new Date(e.date);
            const weekNum = `W${Math.ceil(
              (d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7
            )}`;
            byWeek[weekNum] = Math.max(byWeek[weekNum] ?? 0, e.weight);
          }

          const data: LiftDataPoint[] = Object.entries(byWeek).map(
            ([week, weight]) => ({ week, weight })
          );

          const weights = entries.map((e) => e.weight);
          const currentMax = Math.max(...weights);
          const firstWeight = weights[0] ?? currentMax;
          const delta = Number((currentMax - firstWeight).toFixed(1));

          return {
            name,
            unit: "kg",
            data,
            color: LIFT_COLORS[`default${idx}`] ?? "#4B8EFF",
            currentMax,
            delta,
          };
        }
      );

      setLifts(result);
      setLoading(false);
    }

    fetchData();
  }, [telegramId]);

  return { lifts, loading };
}

// ─── Mini Tooltip ─────────────────────────────────────────
const MiniTooltip = ({
  active,
  payload,
  color,
}: TooltipContentProps<any, any> & { color: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0D0E14",
          border: "1px solid #181B26",
          borderRadius: "6px",
          padding: "5px 8px",
        }}
      >
        <span
          style={{
            color,
            fontFamily: "'Fira Code', monospace",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {payload[0]?.value ?? "-"} kg
        </span>
      </div>
    );
  }
  return null;
};

// ─── Lift Card ────────────────────────────────────────────
function LiftCard({ lift }: { lift: LiftSeries }) {
  const isPositive = lift.delta >= 0;

  return (
    <div className="card flex flex-col gap-3 p-4" style={{ minWidth: 0 }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {lift.name}
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
              margin: "2px 0 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            8-week trend
          </p>
        </div>
        <span
          style={{
            background: isPositive
              ? "rgba(52,199,89,0.1)"
              : "rgba(255,69,58,0.1)",
            color: isPositive ? "#34C759" : "#FF453A",
            fontFamily: "'Fira Code', monospace",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {isPositive ? "+" : ""}
          {lift.delta} {lift.unit}
        </span>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <span
            style={{
              fontFamily: "'Fira Code', monospace",
              fontWeight: 700,
              fontSize: "22px",
              color: lift.color,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {lift.currentMax}
          </span>
          <span
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              marginLeft: "3px",
            }}
          >
            {lift.unit}
          </span>
        </div>
        <div style={{ flex: 1, height: "48px", minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lift.data}
              margin={{ top: 4, right: 0, left: 0, bottom: 4 }}
            >
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={lift.color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: lift.color, strokeWidth: 0 }}
              />
              <Tooltip
                content={(props) => (
                  <MiniTooltip {...props} color={lift.color} />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────
function EmptyProgression() {
  return (
    <div
      className="card p-6"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        minHeight: "140px",
      }}
    >
      <span style={{ fontSize: "32px" }}>📈</span>
      <p
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "13px",
          margin: 0,
          textAlign: "center",
        }}
      >
        Belum ada personal record
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.15)",
          fontFamily: "'Fira Code', monospace",
          fontSize: "11px",
          margin: 0,
          textAlign: "center",
        }}
      >
        PR otomatis tercatat saat kamu log workout via bot
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function ProgressionPreview() {
  const { lifts, loading } = useProgressionData(MY_TELEGRAM_ID);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Strength Progression
          </h3>
          <p className="label-xs mt-0.5" style={{ fontSize: "11px" }}>
            Personal records · last 8 weeks
          </p>
        </div>
        <button
          style={{
            background: "rgba(75,142,255,0.08)",
            border: "1px solid rgba(75,142,255,0.15)",
            color: "#4B8EFF",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          Full Analytics →
        </button>
      </div>

      {loading ? (
        // Loading skeleton
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="card p-4"
              style={{
                height: "110px",
                background: "rgba(255,255,255,0.02)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : lifts.length === 0 ? (
        <EmptyProgression />
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {lifts.map((lift) => (
            <LiftCard key={lift.name} lift={lift} />
          ))}
        </div>
      )}
    </div>
  );
}