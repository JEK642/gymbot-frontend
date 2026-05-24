interface ExerciseSummary {
  name: string;
  topSet: string;
}

interface WorkoutSession {
  id: string;
  title: string;
  date: string;
  durationMin: number;
  totalSets: number;
  muscleGroups: string[];
  exercises: ExerciseSummary[];
}

interface RecentWorkoutsProps {
  sessions?: WorkoutSession[];
  onViewAll?: () => void;
  onSessionClick?: (id: string) => void;
}

const mockSessions: WorkoutSession[] = [
  {
    id: "1",
    title: "Upper Power",
    date: "Today",
    durationMin: 58,
    totalSets: 24,
    muscleGroups: ["Chest", "Back", "Shoulders"],
    exercises: [
      { name: "Bench Press", topSet: "100kg × 5" },
      { name: "Pull-up", topSet: "BW+20kg × 8" },
    ],
  },
  {
    id: "2",
    title: "Lower Hypertrophy",
    date: "2 days ago",
    durationMin: 72,
    totalSets: 30,
    muscleGroups: ["Legs", "Core"],
    exercises: [
      { name: "Squat", topSet: "140kg × 4" },
      { name: "Romanian DL", topSet: "120kg × 10" },
    ],
  },
  {
    id: "3",
    title: "Pull Day",
    date: "3 days ago",
    durationMin: 51,
    totalSets: 22,
    muscleGroups: ["Back", "Arms"],
    exercises: [
      { name: "Deadlift", topSet: "175kg × 3" },
      { name: "Barbell Row", topSet: "100kg × 8" },
    ],
  },
];

const muscleColor: Record<string, string> = {
  Chest: "rgba(75,142,255,0.15)",
  Back: "rgba(93,202,165,0.15)",
  Legs: "rgba(239,159,39,0.15)",
  Shoulders: "rgba(209,109,255,0.15)",
  Arms: "rgba(255,99,132,0.15)",
  Core: "rgba(255,255,255,0.08)",
};

const muscleText: Record<string, string> = {
  Chest: "#4B8EFF",
  Back: "#5DCAA5",
  Legs: "#EF9F27",
  Shoulders: "#D16DFF",
  Arms: "#FF6384",
  Core: "rgba(255,255,255,0.4)",
};

export default function RecentWorkouts({
  sessions = mockSessions,
  onViewAll,
  onSessionClick,
}: RecentWorkoutsProps) {
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
            Recent Sessions
          </h3>
          <p className="label-xs mt-0.5" style={{ fontSize: "11px" }}>
            {sessions.length} workouts logged
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: "transparent",
              border: "1px solid #181B26",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "11px",
              padding: "5px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            View all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionClick?.(session.id)}
            className="card text-left w-full"
            style={{
              padding: "14px 16px",
              cursor: onSessionClick ? "pointer" : "default",
              transition: "border-color 0.15s ease, background 0.15s ease",
              display: "block",
            }}
            onMouseEnter={(e) => {
              if (onSessionClick) {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(75,142,255,0.3)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(75,142,255,0.03)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#181B26";
              (e.currentTarget as HTMLElement).style.background = "#0D0E14";
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#FFFFFF",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session.title}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "11px",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "11px",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {session.date}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {session.muscleGroups.map((mg) => (
                    <span
                      key={mg}
                      style={{
                        background: muscleColor[mg] ?? "rgba(255,255,255,0.06)",
                        color: muscleText[mg] ?? "rgba(255,255,255,0.4)",
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "10px",
                        fontWeight: 500,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {mg}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  {session.exercises.map((ex) => (
                    <div key={ex.name} className="flex flex-col">
                      <span
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          fontSize: "10px",
                          fontFamily: "'Outfit', sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {ex.name}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "'Fira Code', monospace",
                          fontSize: "11px",
                          marginTop: "1px",
                        }}
                      >
                        {ex.topSet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1,
                    }}
                  >
                    {session.durationMin}
                    <span
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.3)",
                        marginLeft: "2px",
                      }}
                    >
                      min
                    </span>
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "10px",
                      fontFamily: "'Outfit', sans-serif",
                      textAlign: "right",
                    }}
                  >
                    {session.totalSets} sets
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}