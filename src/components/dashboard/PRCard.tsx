// PRCard.tsx
// Menampilkan Personal Record terbaik user
// Tampil di Dashboard sebagai highlight section

import type { PRDisplay } from '../../hooks/useExercises';

interface PRCardProps {
  prs: PRDisplay[];
  loading: boolean;
}

// Badge warna untuk equipment type (dark theme)
function EquipmentBadge({ equipment }: { equipment: string | null }) {
  const config: Record<string, { label: string; color: string }> = {
    barbell:    { label: 'Barbell',   color: 'rgba(239,159,39,0.15)'  },
    dumbbell:   { label: 'Dumbbell',  color: 'rgba(75,142,255,0.15)'  },
    machine:    { label: 'Machine',   color: 'rgba(175,82,222,0.15)'  },
    bodyweight: { label: 'BW',        color: 'rgba(52,199,89,0.15)'   },
  };

  const key = equipment?.toLowerCase() ?? '';
  const badge = config[key] ?? {
    label: equipment ?? 'Other',
    color: 'rgba(255,255,255,0.08)',
  };

  return (
    <span
      style={{
        background: badge.color,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.06em',
        padding: '2px 7px',
        borderRadius: 99,
        textTransform: 'uppercase',
      }}
    >
      {badge.label}
    </span>
  );
}

// Skeleton loader untuk state loading
function PRSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: '#0D0E14', border: '1px solid #181B26' }}
        >
          <div className="space-y-2">
            <div className="h-3.5 w-32 rounded" style={{ background: '#1E2130' }} />
            <div className="h-2.5 w-20 rounded" style={{ background: '#181B26' }} />
          </div>
          <div className="h-8 w-20 rounded-lg" style={{ background: '#1E2130' }} />
        </div>
      ))}
    </div>
  );
}

export default function PRCard({ prs, loading }: PRCardProps) {
  const topPRs = prs.slice(0, 5);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#0D0E14', border: '1px solid #181B26' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">🏆</span>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.01em',
            }}
          >
            Personal Records
          </h3>
        </div>
        {!loading && prs.length > 5 && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Fira Code', monospace",
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            {prs.length} total
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <PRSkeleton />
      ) : topPRs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
            style={{ background: 'rgba(75,142,255,0.08)', border: '1px solid rgba(75,142,255,0.15)' }}
          >
            💪
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit', sans-serif" }}>
            Belum ada PR
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'Fira Code', monospace", marginTop: 4 }}>
            Kirim /session start di bot untuk mulai
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {topPRs.map((pr, index) => {
            const achievedDate = new Date(pr.achieved_at).toLocaleDateString(
              'id-ID',
              { day: 'numeric', month: 'short', year: 'numeric' }
            );

            return (
              <div
                key={pr.id}
                className="flex items-center justify-between p-3 rounded-xl transition-colors"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Rank + Exercise Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge */}
                  <span className="text-sm w-6 text-center flex-shrink-0">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                        #{index + 1}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0">
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {pr.exercise_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <EquipmentBadge equipment={pr.equipment} />
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Fira Code', monospace",
                          color: 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {achievedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PR Stats */}
                <div className="text-right flex-shrink-0 ml-3">
                  <p
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {pr.weight_kg}kg × {pr.reps}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 10,
                      color: '#4B8EFF',
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    1RM ~{pr.estimated_1rm}kg
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}