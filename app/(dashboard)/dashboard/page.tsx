import { createClient } from "@/lib/supabase/server";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { SessionWithDetails } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(`
      *,
      company:companies(*),
      position:positions(*)
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedSessions = (sessions || []) as unknown as SessionWithDetails[];
  const recent = typedSessions.slice(0, 5);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your interview practice progress
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/new">
            <Plus className="h-4 w-4" />
            New session
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <StatsBar sessions={typedSessions} />

        {typedSessions.length > 0 && (
          <div>
            <h2 className="text-sm font-medium mb-3">Score over time</h2>
            <div className="rounded-lg border bg-card p-4">
              <ScoreChart sessions={typedSessions} />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Recent sessions</h2>
            {typedSessions.length > 5 && (
              <Link href="/sessions" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No sessions yet</p>
              <Button size="sm" asChild>
                <Link href="/new">Start your first session</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
