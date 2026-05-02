import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { formatDate, formatDuration, formatLevel } from "@/lib/utils/format";
import { CheckCircle2, TrendingUp, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/database";

const typeLabels: Record<QuestionType, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  culture_fit: "Culture fit",
  situational: "Situational",
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("interview_sessions")
    .select(`*, company:companies(*), position:positions(*)`)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/sessions");

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index");

  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("session_id", sessionId);

  const answersMap = Object.fromEntries((answers || []).map((a) => [a.question_id, a]));
  const company = session.company as { name: string };
  const position = session.position as { title: string; level: string };
  const overallScore = session.overall_score ? Math.round(session.overall_score) : null;

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
          <h1 className="text-xl font-semibold tracking-tight">
            {company.name} · {position.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatLevel(position.level)} · Duration: {formatDuration(session.started_at, session.completed_at)}
          </p>
        </div>
        {overallScore !== null && (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold",
              scoreToBgClass(overallScore)
            )}
          >
            {overallScore} — {scoreLabel(overallScore)}
          </span>
        )}
      </div>

      {session.status !== "completed" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            This session was not completed.{" "}
            {session.status === "in_progress" && (
              <Link href={`/session/${session.id}`} className="underline font-medium">
                Continue session →
              </Link>
            )}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(questions || []).map((q, i) => {
          const answer = answersMap[q.id];
          const score = answer?.score ? Math.round(answer.score) : null;

          return (
            <div key={q.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs text-muted-foreground">
                      Q{i + 1} · {typeLabels[q.question_type as QuestionType]}
                    </p>
                    <p className="text-sm font-medium leading-relaxed">{q.question_text}</p>
                  </div>
                  {score !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-bold shrink-0",
                        scoreToBgClass(score)
                      )}
                    >
                      {score}
                    </span>
                  )}
                </div>

                {answer?.text_content && (
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Answer</p>
                    <p className="text-sm leading-relaxed">{answer.text_content}</p>
                  </div>
                )}

                {answer?.feedback && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{answer.feedback}</p>
                )}

                {answer?.strengths && answer.strengths.length > 0 && (
                  <ul className="space-y-1">
                    {answer.strengths.map((s: string, si: number) => (
                      <li key={si} className="flex items-start gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                {answer?.improvements && answer.improvements.length > 0 && (
                  <ul className="space-y-1">
                    {answer.improvements.map((s: string, si: number) => (
                      <li key={si} className="flex items-start gap-2 text-xs text-amber-700">
                        <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                {!answer && (
                  <p className="text-xs text-muted-foreground italic">Not answered</p>
                )}
              </div>
            </div>
          );
        })}

        {(!questions || questions.length === 0) && (
          <p className="text-sm text-muted-foreground">No questions were generated for this session.</p>
        )}
      </div>

      <Button variant="outline" size="sm" asChild>
        <Link href="/sessions">
          <ArrowLeft className="h-4 w-4" />
          All sessions
        </Link>
      </Button>
    </div>
  );
}
