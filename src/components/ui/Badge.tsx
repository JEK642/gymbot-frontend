type IntensityLevel = 'low' | 'medium' | 'high' | null;

const config = {
  high: {
    label: 'HIGH',
    className: 'bg-signal-high/10 text-signal-high border border-signal-high/20',
  },
  medium: {
    label: 'MED',
    className: 'bg-signal-medium/10 text-signal-medium border border-signal-medium/20',
  },
  low: {
    label: 'LOW',
    className: 'bg-signal-low/10 text-signal-low border border-signal-low/20',
  },
};

export function Badge({ intensity }: { intensity: IntensityLevel }) {
  if (!intensity) return null;
  const c = config[intensity];
  return (
    <span className={`badge ${c.className}`}>
      {c.label}
    </span>
  );
}