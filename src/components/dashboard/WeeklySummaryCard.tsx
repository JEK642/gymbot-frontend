// WeeklySummaryCard.tsx
// Weekly summary dengan progress ring dan motivational micro-copy
// Ditampilkan di atas Dashboard

interface WeeklySummaryCardProps {
  weeklyWorkouts: number;
  weeklyTarget?: number; // default 4
  currentStreak: number;
  totalWorkouts: number;
}

// Progress ring SVG
function ProgressRing({
  progress,
  size = 72,
  strokeWidth = 5,
  color = '#4B8EFF',
}: {
  progress: number; // 0–1
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));
  const center = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// Micro-copy berdasarkan kondisi
function getMotivationalCopy(
  weeklyWorkouts: number,
  target: number,
  streak: number
): { headline: string; sub: string } {
  const remaining = target - weeklyWorkouts;

  if (weeklyWorkouts === 0) {
    return {
      headline: 'Belum ada sesi minggu ini',
      sub: 'Ayo mulai — satu sesi sudah cukup untuk jaga momentum.',
    };
  }
  if (weeklyWorkouts >= target) {
    if (streak >= 7) {
      return {
        headline: `${streak} hari berturut-turut 🔥`,
        sub: 'Target minggu ini tercapai. Konsistensi kamu luar biasa.',
      };
    }
    return {
      headline: 'Target minggu ini selesai! 🎯',
      sub: streak > 1 ? `${streak} hari streak — jaga terus.` : 'Istirahat atau tambah bonus sesi.',
    };
  }
  if (remaining === 1) {
    return {
      headline: 'Tinggal 1 sesi lagi',
      sub: 'Kamu hampir capai target minggu ini. Push it.',
    };
  }
  if (weeklyWorkouts >= Math.ceil(target / 2)) {
    return {
      headline: `${weeklyWorkouts} dari ${target} sesi`,
      sub: 'Separuh lebih sudah — lanjutkan momentum ini.',
    };
  }
  return {
    headline: `${weeklyWorkouts} dari ${target} sesi`,
    sub: `${remaining} sesi lagi untuk capai target minggumu.`,
  };
}

// Warna ring berdasarkan progress
function getRingColor(progress: number): string {
  if (progress >= 1) return '#34C759';     // selesai — hijau
  if (progress >= 0.5) return '#4B8EFF';   // setengah — biru
  return '#EF9F27';                         // kurang — kuning
}

// Label hari minggu ini (Sen–Min), highlight yang sudah ada workout
function WeekDots({ workoutDays }: { workoutDays: number }) {
  const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
  const today = new Date().getDay(); // 0 = minggu
  const todayIndex = today === 0 ? 6 : today - 1; // convert ke 0=senin

  return (
    <div className="flex gap-1.5 items-center">
      {days.map((d, i) => {
        const isPast = i <= todayIndex;
        const isToday = i === todayIndex;
        // Simulasi: isi dari kiri sebanyak workoutDays
        // (tidak tahu hari mana persisnya, tapi cukup sebagai visual indicator)
        const isFilled = i < workoutDays;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              style={{
                width: isToday ? 8 : 6,
                height: isToday ? 8 : 6,
                borderRadius: '50%',
                background: isFilled
                  ? getRingColor(workoutDays / 4)
                  : isPast
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: isToday ? '1px solid rgba(255,255,255,0.3)' : 'none',
                transition: 'background 0.3s',
              }}
            />
            <span style={{
              fontSize: 8,
              fontFamily: "'Fira Code', monospace",
              color: isToday ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
              fontWeight: isToday ? 700 : 400,
            }}>
              {d}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function WeeklySummaryCard({
  weeklyWorkouts,
  weeklyTarget = 4,
  currentStreak,
  totalWorkouts,
}: WeeklySummaryCardProps) {
  const progress = weeklyWorkouts / weeklyTarget;
  const ringColor = getRingColor(progress);
  const copy = getMotivationalCopy(weeklyWorkouts, weeklyTarget, currentStreak);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, #0D0E14 0%, #0F1117 100%)',
        border: '1px solid #1E2130',
      }}
    >
      <div className="flex items-center gap-4">

        {/* Progress Ring */}
        <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
          <ProgressRing progress={progress} color={ringColor} />
          {/* Center text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ gap: 0 }}
          >
            <span
              style={{
                fontFamily: "'Fira Code', monospace",
                fontWeight: 700,
                fontSize: 18,
                color: ringColor,
                lineHeight: 1,
              }}
            >
              {weeklyWorkouts}
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                marginTop: 2,
              }}
            >
              /{weeklyTarget}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.3,
            }}
          >
            {copy.headline}
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {copy.sub}
          </p>

          {/* Week dots */}
          <div className="mt-3">
            <WeekDots workoutDays={weeklyWorkouts} />
          </div>
        </div>

        {/* Total workouts — right side stat */}
        <div className="flex-shrink-0 text-right">
          <p
            style={{
              fontFamily: "'Fira Code', monospace",
              fontWeight: 700,
              fontSize: 20,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1,
            }}
          >
            {totalWorkouts}
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 9,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}
          >
            total sesi
          </p>
        </div>

      </div>
    </div>
  );
}