// PRCard.tsx
// Menampilkan Personal Record terbaik user
// Tampil di Dashboard sebagai highlight section

import type { PRDisplay } from '../../hooks/useExercises';

interface PRCardProps {
  prs: PRDisplay[];
  loading: boolean;
}

// Badge warna untuk equipment type
function EquipmentBadge({ equipment }: { equipment: string | null }) {
  const config: Record<string, { label: string; className: string }> = {
    barbell: { label: 'Barbell', className: 'bg-orange-100 text-orange-700' },
    dumbbell: { label: 'Dumbbell', className: 'bg-blue-100 text-blue-700' },
    machine: { label: 'Machine', className: 'bg-purple-100 text-purple-700' },
    bodyweight: { label: 'BW', className: 'bg-green-100 text-green-700' },
  };

  const key = equipment?.toLowerCase() ?? '';
  const badge = config[key] ?? {
    label: equipment ?? 'Other',
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

// Skeleton loader untuk state loading
function PRSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function PRCard({ prs, loading }: PRCardProps) {
  // Hanya tampilkan 5 PR teratas di dashboard
  const topPRs = prs.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h3 className="font-bold text-gray-800 text-base">Personal Records</h3>
        </div>
        {!loading && prs.length > 5 && (
          <span className="text-xs text-gray-400">{prs.length} total</span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <PRSkeleton />
      ) : topPRs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💪</div>
          <p className="text-sm text-gray-500 font-medium">Belum ada PR</p>
          <p className="text-xs text-gray-400 mt-1">
            Mulai latihan untuk catat rekor pertamamu!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {topPRs.map((pr, index) => {
            const achievedDate = new Date(pr.achieved_at).toLocaleDateString(
              'id-ID',
              { day: 'numeric', month: 'short' }
            );

            return (
              <div
                key={pr.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Rank + Exercise Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge — gold untuk #1 */}
                  <span
                    className={`text-sm font-black w-6 text-center flex-shrink-0 ${
                      index === 0
                        ? 'text-amber-500'
                        : index === 1
                        ? 'text-gray-400'
                        : index === 2
                        ? 'text-amber-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {pr.exercise_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <EquipmentBadge equipment={pr.equipment} />
                      <span className="text-xs text-gray-400">{achievedDate}</span>
                    </div>
                  </div>
                </div>

                {/* PR Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {pr.weight_kg}kg × {pr.reps}
                  </p>
                  <p className="text-xs text-indigo-600 font-semibold">
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