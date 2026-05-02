import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { formatDate, formatLevel } from "@/lib/utils/format";
import type { SessionWithDetails } from "@/types/database";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: SessionWithDetails;
}

const statusLabel: Record<string, string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export function SessionCard({ session }: SessionCardProps) {
  const isCompleted = session.status === "completed";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
          {session.company.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{session.company.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {session.position.title} · {formatLevel(session.position.level)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-xs text-muted-foreground hidden sm:block">
          {formatDate(session.created_at)}
        </span>
        {isCompleted && session.overall_score !== null ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              scoreToBgClass(session.overall_score)
            )}
          >
            {Math.round(session.overall_score)}
          </span>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {statusLabel[session.status]}
          </Badge>
        )}
      </div>
    </Link>
  );
}
