import { createClient } from "@/lib/supabase/server";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import type { SessionWithDetails } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(`*, company:companies(*), position:positions(*)`)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedSessions = (sessions || []) as unknown as SessionWithDetails[];
  const recent = typedSessions.slice(0, 5);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your interview practice progress
          </p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg" asChild>
          <Link href="/new">
            <Plus className="h-3.5 w-3.5" />
            New session
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <StatsBar sessions={typedSessions} />

        {typedSessions.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-zinc-900 mb-3">Score over time</h2>
            <div className="rounded-xl border bg-white p-5 shadow-sm shadow-zinc-100">
              <ScoreChart sessions={typedSessions} />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-900">Recent sessions</h2>
            {typedSessions.length > 5 && (
              <Link href="/sessions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto">
                <Sparkles className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium">No sessions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a session to practice your interview skills</p>
              </div>
              <Button size="sm" className="rounded-lg" asChild>
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
