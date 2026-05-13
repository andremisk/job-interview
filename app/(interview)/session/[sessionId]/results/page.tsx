import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { formatDuration, formatLevel } from "@/lib/utils/format";
import { CheckCircle2, TrendingUp, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/database";

const typeConfig: Record<QuestionType, { label: string; pill: string }> = {
  behavioral:  { label: "Behavioral",  pill: "bg-blue-50 text-blue-700 border-blue-200" },
  technical:   { label: "Technical",   pill: "bg-violet-50 text-violet-700 border-violet-200" },
  culture_fit: { label: "Culture fit", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  situational: { label: "Situational", pill: "bg-amber-50 text-amber-700 border-amber-200" },
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
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

  if (!session) redirect("/dashboard");

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
  const company = session.company as { name: string; industry: string | null };
  const position = session.position as { title: string; level: string };
  const overallScore = session.overall_score ? Math.round(session.overall_score) : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 w-full">

      {/* Score hero */}
      <div className="rounded-2xl border bg-white shadow-sm shadow-zinc-100 p-8 text-center space-y-4">
        {overallScore !== null && (
          <div className="inline-flex flex-col items-center gap-2">
            <div className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold border-[3px]",
              scoreToBgClass(overallScore)
            )}>
              {overallScore}
            </div>
            <span className="text-sm font-semibold text-zinc-900">{scoreLabel(overallScore)}</span>
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Interview complete</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {company.name} · {position.title} · {formatLevel(position.level)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Duration: {formatDuration(session.started_at, session.completed_at)}
          </p>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/dashboard">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
          </Button>
          <Button className="rounded-xl" asChild>
            <Link href="/new">
              Practice again
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Q&A review */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-900">Question review</h2>
        {(questions || []).map((q, i) => {
          const answer = answersMap[q.id];
          const score = answer?.score ? Math.round(answer.score) : null;
          const tc = typeConfig[q.question_type as QuestionType];

          return (
            <div key={q.id} className="rounded-2xl border bg-white shadow-sm shadow-zinc-100 overflow-hidden">
              {/* Question header */}
              <div className="p-5 border-b bg-zinc-50/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-400">Q{i + 1}</span>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        tc.pill
                      )}>
                        {tc.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 leading-relaxed">{q.question_text}</p>
                  </div>
                  {score !== null && (
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-bold shrink-0",
                      scoreToBgClass(score)
                    )}>
                      {score}
                    </span>
                  )}
                </div>
              </div>

              {/* Answer & feedback */}
              <div className="p-5 space-y-4">
                {answer?.text_content && (
                  <div className="rounded-xl bg-zinc-50 border p-3.5">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Your answer</p>
                    <p className="text-sm text-zinc-700 leading-relaxed">{answer.text_content}</p>
                  </div>
                )}

                {answer?.feedback && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{answer.feedback}</p>
                )}

                {(answer?.strengths?.length || answer?.improvements?.length) ? (
                  <div className="grid grid-cols-2 gap-4">
                    {answer?.strengths && answer.strengths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Strengths</p>
                        <ul className="space-y-1.5">
                          {answer.strengths.map((s: string, si: number) => (
                            <li key={si} className="flex items-start gap-1.5 text-xs text-zinc-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {answer?.improvements && answer.improvements.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">To improve</p>
                        <ul className="space-y-1.5">
                          {answer.improvements.map((s: string, si: number) => (
                            <li key={si} className="flex items-start gap-1.5 text-xs text-zinc-600">
                              <TrendingUp className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
