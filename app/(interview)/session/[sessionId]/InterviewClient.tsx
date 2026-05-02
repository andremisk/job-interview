"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInput } from "@/components/interview/AnswerInput";
import { EvaluationPanel } from "@/components/interview/EvaluationPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { QuestionType } from "@/types/database";

interface InterviewClientProps {
  sessionId: string;
  userId: string;
}

export function InterviewClient({ sessionId, userId }: InterviewClientProps) {
  const router = useRouter();
  const {
    session,
    currentQuestion,
    currentAnswer,
    currentIndex,
    totalQuestions,
    isGenerating,
    isSubmitting,
    isEvaluating,
    isComplete,
    error,
    submitTextAnswer,
    submitMediaAnswer,
    nextQuestion,
  } = useSession(sessionId);

  useEffect(() => {
    if (isComplete) {
      router.push(`/session/${sessionId}/results`);
    }
  }, [isComplete, sessionId, router]);

  if (isGenerating || !session) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6 w-full">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <p className="text-sm text-muted-foreground animate-pulse text-center">
          Generating your interview questions…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progressPct = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isAnswered = !!currentAnswer;
  const isBusy = isSubmitting || isEvaluating;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 w-full">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {session.company.name} · {session.position.title}
          </span>
          <span>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <Progress value={progressPct} className="h-1" />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        questionText={currentQuestion.question_text}
        questionType={currentQuestion.question_type as QuestionType}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      {!isAnswered && (
        <div className="rounded-xl border bg-card p-6">
          <AnswerInput
            sessionId={sessionId}
            questionId={currentQuestion.id}
            userId={userId}
            disabled={isBusy}
            onTextSubmit={submitTextAnswer}
            onMediaSubmit={(transcription, storagePath, answerId) =>
              submitMediaAnswer(transcription, storagePath, answerId, "audio")
            }
          />
        </div>
      )}

      {(isAnswered || isEvaluating) && (
        <EvaluationPanel
          answer={currentAnswer}
          isEvaluating={isEvaluating}
          isLastQuestion={isLastQuestion}
          onNext={nextQuestion}
        />
      )}
    </div>
  );
}
