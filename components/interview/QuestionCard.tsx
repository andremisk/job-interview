"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";
import type { QuestionType } from "@/types/database";

const typeConfig: Record<QuestionType, { label: string; className: string; seconds: number }> = {
  behavioral: { label: "Behavioral", className: "bg-blue-50 text-blue-700 border-blue-200", seconds: 180 },
  technical: { label: "Technical", className: "bg-purple-50 text-purple-700 border-purple-200", seconds: 240 },
  culture_fit: { label: "Culture fit", className: "bg-emerald-50 text-emerald-700 border-emerald-200", seconds: 120 },
  situational: { label: "Situational", className: "bg-amber-50 text-amber-700 border-amber-200", seconds: 180 },
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

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
  const [remaining, setRemaining] = useState(config.seconds);

  useEffect(() => {
    setRemaining(config.seconds);
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [config.seconds]);

  const timerColor =
    remaining <= 30
      ? "text-red-600"
      : remaining <= 60
      ? "text-amber-500"
      : "text-muted-foreground";

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1 text-xs font-mono font-medium tabular-nums", timerColor)}>
            <Timer className="h-3 w-3" />
            {formatTime(remaining)}
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
      </div>
      <p className="text-base leading-relaxed font-medium">{questionText}</p>
    </div>
  );
}
