import { Button } from "@/components/ui/button";
import { cn, } from "@/lib/utils";
import { scoreToBgClass, scoreLabel } from "@/lib/utils/score";
import { CheckCircle2, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Answer } from "@/types/database";

interface EvaluationPanelProps {
  answer: Answer | null;
  isEvaluating: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function EvaluationPanel({
  answer,
  isEvaluating,
  isLastQuestion,
  onNext,
}: EvaluationPanelProps) {
  if (isEvaluating) {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-32" />
        <p className="text-xs text-muted-foreground animate-pulse">Evaluating your answer…</p>
      </div>
    );
  }

  if (!answer || answer.score === null) return null;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold border-2 shrink-0",
            scoreToBgClass(answer.score)
          )}
        >
          {Math.round(answer.score)}
        </div>
        <div>
          <p className="font-medium">{scoreLabel(answer.score)}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{answer.feedback}</p>
        </div>
      </div>

      {answer.strengths && answer.strengths.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {answer.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.improvements && answer.improvements.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            To improve
          </p>
          <ul className="space-y-1.5">
            {answer.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onNext} className="w-full">
        {isLastQuestion ? "See results" : "Next question"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
