import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Answer } from "@/types/database";

interface EvaluationPanelProps {
  answer: Answer | null;
  isEvaluating: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function EvaluationPanel({ answer, isEvaluating, isLastQuestion, onNext }: EvaluationPanelProps) {
  if (isEvaluating) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm shadow-zinc-100 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <p className="text-xs text-muted-foreground animate-pulse">Evaluating your answer…</p>
      </div>
    );
  }

  if (!answer || answer.score === null) return null;

  const score = Math.round(answer.score);

  return (
    <div className="rounded-2xl border bg-white shadow-sm shadow-zinc-100 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Score header */}
      <div className="p-6 border-b bg-zinc-50/60">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold border-2 shrink-0",
            scoreToBgClass(score)
          )}>
            {score}
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{scoreLabel(score)}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{answer.feedback}</p>
          </div>
        </div>
      </div>

      {/* Strengths & improvements */}
      <div className="p-6 space-y-5">
        {answer.strengths && answer.strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Strengths</p>
            <ul className="space-y-2">
              {answer.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-zinc-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {answer.improvements && answer.improvements.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">To improve</p>
            <ul className="space-y-2">
              {answer.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <TrendingUp className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-zinc-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onNext} className="w-full rounded-xl h-10 mt-2">
          {isLastQuestion ? "See results" : "Next question"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
