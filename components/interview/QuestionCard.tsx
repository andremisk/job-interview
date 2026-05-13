"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";
import type { QuestionType } from "@/types/database";

const typeConfig: Record<QuestionType, { label: string; pill: string; bar: string; seconds: number }> = {
  behavioral:  { label: "Behavioral",  pill: "bg-blue-50 text-blue-700 border-blue-200",   bar: "bg-blue-500",    seconds: 180 },
  technical:   { label: "Technical",   pill: "bg-violet-50 text-violet-700 border-violet-200", bar: "bg-violet-500", seconds: 240 },
  culture_fit: { label: "Culture fit", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", seconds: 120 },
  situational: { label: "Situational", pill: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500",   seconds: 180 },
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

export function QuestionCard({ questionText, questionType, questionNumber, totalQuestions }: QuestionCardProps) {
  const config = typeConfig[questionType];
  const [remaining, setRemaining] = useState(config.seconds);

  useEffect(() => {
    setRemaining(config.seconds);
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [config.seconds]);

  const pct = Math.round((remaining / config.seconds) * 100);
  const timerColor = remaining <= 30 ? "text-red-600" : remaining <= 60 ? "text-amber-500" : "text-zinc-500";

  return (
    <div className="rounded-2xl border bg-white shadow-sm shadow-zinc-100 overflow-hidden">
      {/* Timer bar */}
      <div className="h-1 bg-zinc-100">
        <div
          className={cn("h-full transition-all duration-1000 ease-linear", config.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2.5">
            <span className={cn("flex items-center gap-1 text-xs font-mono font-semibold tabular-nums", timerColor)}>
              <Timer className="h-3 w-3" />
              {formatTime(remaining)}
            </span>
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              config.pill
            )}>
              {config.label}
            </span>
          </div>
        </div>

        <p className="text-base leading-relaxed font-medium text-zinc-900 pt-1">{questionText}</p>
      </div>
    </div>
  );
}
