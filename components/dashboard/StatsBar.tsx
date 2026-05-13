import { Target, TrendingUp, Star } from "lucide-react";
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
    { label: "Total sessions", value: sessions.length.toString(), icon: Target, sub: sessions.length === 1 ? "session" : "sessions" },
    { label: "Average score", value: avgScore !== null ? `${avgScore}` : "—", icon: TrendingUp, sub: avgScore !== null ? scoreLabel(avgScore) : "No data yet" },
    { label: "Best score", value: bestScore !== null ? `${bestScore}` : "—", icon: Star, sub: bestScore !== null ? scoreLabel(bestScore) : "No data yet" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, sub }) => (
        <div key={label} className="rounded-xl border bg-white p-5 space-y-3 shadow-sm shadow-zinc-100">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-zinc-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
