import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { formatDate, formatLevel } from "@/lib/utils/format";
import type { SessionWithDetails } from "@/types/database";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SessionCardProps {
  session: SessionWithDetails;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Not started", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  abandoned: { label: "Abandoned", className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

export function SessionCard({ session }: SessionCardProps) {
  const isCompleted = session.status === "completed";
  const initials = session.company.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center justify-between p-4 rounded-xl border bg-white hover:border-zinc-300 hover:shadow-sm shadow-zinc-100 transition-all group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-zinc-900 flex items-center justify-center text-xs font-bold text-white shrink-0 tracking-wide">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{session.company.name}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
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
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
              scoreToBgClass(session.overall_score)
            )}
          >
            {Math.round(session.overall_score)}
          </span>
        ) : (
          <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            statusConfig[session.status]?.className
          )}>
            {statusConfig[session.status]?.label}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
