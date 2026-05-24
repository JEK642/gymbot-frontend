import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, type TooltipContentProps } from "recharts";

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

const mockLifts: LiftSeries[] = [
  {
    name: "Bench Press",
    unit: "kg",
    currentMax: 102.5,
    delta: 7.5,
    color: "#4B8EFF",
    data: [
      { week: "W1", weight: 85 },
      { week: "W2", weight: 87.5 },
      { week: "W3", weight: 90 },
      { week: "W4", weight: 90 },
      { week: "W5", weight: 95 },
      { week: "W6", weight: 97.5 },
      { week: "W7", weight: 100 },
      { week: "W8", weight: 102.5 },
    ],
  },
  {
    name: "Squat",
    unit: "kg",
    currentMax: 140,
    delta: 15,
    color: "#5DCAA5",
    data: [
      { week: "W1", weight: 110 },
      { week: "W2", weight: 115 },
      { week: "W3", weight: 117.5 },
      { week: "W4", weight: 120 },
      { week: "W5", weight: 125 },
      { week: "W6", weight: 130 },
      { week: "W7", weight: 135 },
      { week: "W8", weight: 140 },
    ],
  },
  {
    name: "Deadlift",
    unit: "kg",
    currentMax: 175,
    delta: 20,
    color: "#EF9F27",
    data: [
      { week: "W1", weight: 140 },
      { week: "W2", weight: 145 },
      { week: "W3", weight: 150 },
      { week: "W4", weight: 155 },
      { week: "W5", weight: 157.5 },
      { week: "W6", weight: 162.5 },
      { week: "W7", weight: 170 },
      { week: "W8", weight: 175 },
    ],
  },
];

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
          {payload[0]?.value ?? '-'} kg
        </span>
      </div>
    );
  }
  return null;
};

interface LiftCardProps {
  lift: LiftSeries;
}

function LiftCard({ lift }: LiftCardProps) {
  const isPositive = lift.delta >= 0;

  return (
    <div
      className="card flex flex-col gap-3 p-4"
      style={{ minWidth: 0 }}
    >
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
            <LineChart data={lift.data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
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

interface ProgressionPreviewProps {
  lifts?: LiftSeries[];
}

export default function ProgressionPreview({
  lifts = mockLifts,
}: ProgressionPreviewProps) {
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

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {lifts.map((lift) => (
          <LiftCard key={lift.name} lift={lift} />
        ))}
      </div>
    </div>
  );
}