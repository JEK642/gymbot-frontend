import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    up: boolean;
  };
  accent?: boolean;
}

export default function StatCard({
  label,
  value,
  unit,
  sub,
  icon,
  trend,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={`card relative overflow-hidden flex flex-col gap-4 p-5 ${
        accent ? "card-accent" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="label-xs">{label}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{
            background: accent
              ? "rgba(75,142,255,0.15)"
              : "rgba(255,255,255,0.04)",
            color: accent ? "#4B8EFF" : "rgba(255,255,255,0.4)",
          }}
        >
          {icon}
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        <span
          className="font-display leading-none"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 700,
            color: accent ? "#4B8EFF" : "#FFFFFF",
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="pb-1 text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Fira Code', monospace" }}
          >
            {unit}
          </span>
        )}
      </div>

      {sub && (
        <p
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", margin: 0 }}
        >
          {sub}
        </p>
      )}

      {trend && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: trend.up
                ? "rgba(52,199,89,0.12)"
                : "rgba(255,69,58,0.12)",
              color: trend.up ? "#34C759" : "#FF453A",
              fontFamily: "'Fira Code', monospace",
              fontSize: "11px",
            }}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}
          >
            vs last week
          </span>
        </div>
      )}

      {accent && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(75,142,255,0.07) 0%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
}