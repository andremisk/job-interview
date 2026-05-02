import { scoreLabel } from "@/lib/utils/score";
import type { InterviewSession } from "@/types/database";

interface StatsBarProps {
  sessions: InterviewSession[];
}

export function StatsBar({ sessions }: StatsBarProps) {
  const completed = sessions.filter((s) => s.status === "completed");
  const scores = completed
    .map((s) => s.overall_score)
    .filter((s): s is number => s !== null);

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const bestScore = scores.length ? Math.max(...scores) : null;

  const stats = [
    { label: "Total sessions", value: sessions.length.toString() },
    { label: "Average score", value: avgScore !== null ? `${avgScore}` : "—" },
    { label: "Best score", value: bestScore !== null ? `${bestScore}` : "—" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
