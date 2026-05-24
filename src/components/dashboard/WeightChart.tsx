import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";

interface WeightLog {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data?: WeightLog[];
  unit?: "kg" | "lbs";
}

const mockData: WeightLog[] = [
  { date: "Apr 1", weight: 83.5 },
  { date: "Apr 5", weight: 83.2 },
  { date: "Apr 10", weight: 82.8 },
  { date: "Apr 15", weight: 82.5 },
  { date: "Apr 20", weight: 82.1 },
  { date: "Apr 25", weight: 81.9 },
  { date: "May 1", weight: 81.5 },
  { date: "May 5", weight: 81.2 },
  { date: "May 10", weight: 80.9 },
  { date: "May 14", weight: 80.6 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: TooltipContentProps<any, any> & { unit: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0D0E14",
          border: "1px solid #181B26",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "11px",
            margin: 0,
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: "#4B8EFF",
            fontFamily: "'Fira Code', monospace",
            fontWeight: 700,
            fontSize: "14px",
            margin: "2px 0 0",
          }}
        >
          {payload[0]?.value ?? '-'} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeightChart({ data = mockData, unit = "kg" }: WeightChartProps) {
  const latest = data[data.length - 1]?.weight;
  const first = data[0]?.weight;
  const delta = latest && first ? (latest - first).toFixed(1) : null;
  const isDown = delta && parseFloat(delta) <= 0;

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
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
            Body Weight
          </h3>
          <p className="label-xs mt-0.5" style={{ fontSize: "11px" }}>
            6-week trend
          </p>
        </div>
        {delta && (
          <span
            style={{
              background: isDown
                ? "rgba(52,199,89,0.1)"
                : "rgba(255,69,58,0.1)",
              color: isDown ? "#34C759" : "#FF453A",
              fontFamily: "'Fira Code', monospace",
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {isDown ? "" : "+"}
            {delta} {unit}
          </span>
        )}
      </div>

      <div style={{ height: "160px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B8EFF" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#4B8EFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              stroke="rgba(255,255,255,0.04)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: "rgba(255,255,255,0.25)",
                fontSize: 10,
                fontFamily: "'Outfit', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tick={{
                fill: "rgba(255,255,255,0.25)",
                fontSize: 10,
                fontFamily: "'Fira Code', monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#4B8EFF"
              strokeWidth={2}
              fill="url(#weightGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#4B8EFF", stroke: "rgba(75,142,255,0.3)", strokeWidth: 4 }}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}