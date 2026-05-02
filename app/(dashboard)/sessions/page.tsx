import { createClient } from "@/lib/supabase/server";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { SessionWithDetails } from "@/types/database";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(`*, company:companies(*), position:positions(*)`)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const typedSessions = (sessions || []) as unknown as SessionWithDetails[];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {typedSessions.length} total session{typedSessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/new">
            <Plus className="h-4 w-4" />
            New session
          </Link>
        </Button>
      </div>

      {typedSessions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">No sessions yet</p>
          <Button size="sm" asChild>
            <Link href="/new">Start your first session</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {typedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
