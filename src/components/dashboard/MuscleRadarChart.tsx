import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MuscleData {
  muscle: string;
  sets: number;
  fullMark: number;
}

interface MuscleRadarChartProps {
  data?: MuscleData[];
}

const defaultData: MuscleData[] = [
  { muscle: "Chest", sets: 42, fullMark: 60 },
  { muscle: "Back", sets: 55, fullMark: 60 },
  { muscle: "Legs", sets: 38, fullMark: 60 },
  { muscle: "Shoulders", sets: 30, fullMark: 60 },
  { muscle: "Arms", sets: 48, fullMark: 60 },
  { muscle: "Core", sets: 22, fullMark: 60 },
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MuscleData; value: number }>;
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
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
            color: "#4B8EFF",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
            fontSize: "13px",
            margin: 0,
          }}
        >
          {d.muscle}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Fira Code', monospace",
            fontSize: "12px",
            margin: "2px 0 0",
          }}
        >
          {d.sets} sets this month
        </p>
      </div>
    );
  }
  return null;
};

const CustomAngleAxis = (props: {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { value: string };
}) => {
  const { x = 0, y = 0, cx = 0, cy = 0, payload } = props;
  const dx = x - cx;
  const dy = y - cy;
  const anchor =
    Math.abs(dx) < 5 ? "middle" : dx > 0 ? "start" : "end";
  const adjustX =
    Math.abs(dx) < 5 ? 0 : dx > 0 ? 8 : -8;
  const adjustY = dy < 0 ? -6 : 6;

  return (
    <text
      x={x + adjustX}
      y={y + adjustY}
      textAnchor={anchor}
      dominantBaseline="central"
      style={{
        fill: "rgba(255,255,255,0.45)",
        fontSize: "11px",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {payload?.value}
    </text>
  );
};

export default function MuscleRadarChart({ data = defaultData }: MuscleRadarChartProps) {
  return (
    <div className="card p-5 flex flex-col gap-4">
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
            Muscle Coverage
          </h3>
          <p
            className="label-xs mt-0.5"
            style={{ fontSize: "11px" }}
          >
            Volume distribution · this month
          </p>
        </div>
        <span
          className="badge"
          style={{
            background: "rgba(75,142,255,0.1)",
            color: "#4B8EFF",
            border: "1px solid rgba(75,142,255,0.2)",
            fontSize: "10px",
            fontFamily: "'Fira Code', monospace",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          {new Date().toLocaleString("default", { month: "short" }).toUpperCase()}{" "}
          {new Date().getFullYear()}
        </span>
      </div>

      <div style={{ height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="0"
            />
            <PolarAngleAxis
              dataKey="muscle"
              tick={CustomAngleAxis as unknown as boolean}
              tickLine={false}
              axisLine={false}
            />
            <Radar
              name="Sets"
              dataKey="sets"
              stroke="#4B8EFF"
              strokeWidth={2}
              fill="#4B8EFF"
              fillOpacity={0.12}
              dot={{
                r: 3,
                fill: "#4B8EFF",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: "#4B8EFF",
                stroke: "rgba(75,142,255,0.3)",
                strokeWidth: 4,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {data.map((d) => {
          const pct = Math.round((d.sets / d.fullMark) * 100);
          return (
            <div
              key={d.muscle}
              className="flex flex-col gap-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #181B26",
                borderRadius: "8px",
                padding: "8px 10px",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "10px",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {d.muscle}
                </span>
                <span
                  style={{
                    color: pct >= 70 ? "#4B8EFF" : "rgba(255,255,255,0.3)",
                    fontSize: "10px",
                    fontFamily: "'Fira Code', monospace",
                  }}
                >
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: "2px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background:
                      pct >= 70
                        ? "#4B8EFF"
                        : pct >= 40
                        ? "rgba(75,142,255,0.5)"
                        : "rgba(255,255,255,0.15)",
                    borderRadius: "1px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}