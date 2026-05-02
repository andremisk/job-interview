import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/database";

const typeConfig: Record<QuestionType, { label: string; className: string }> = {
  behavioral: { label: "Behavioral", className: "bg-blue-50 text-blue-700 border-blue-200" },
  technical: { label: "Technical", className: "bg-purple-50 text-purple-700 border-purple-200" },
  culture_fit: { label: "Culture fit", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  situational: { label: "Situational", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

interface QuestionCardProps {
  questionText: string;
  questionType: QuestionType;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  questionText,
  questionType,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const config = typeConfig[questionType];

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            config.className
          )}
        >
          {config.label}
        </span>
      </div>
      <p className="text-base leading-relaxed font-medium">{questionText}</p>
    </div>
  );
}
