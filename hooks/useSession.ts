"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { averageScores } from "@/lib/utils/score";
import type { Question, Answer, SessionWithDetails } from "@/types/database";
import type { EvaluationResult } from "@/lib/anthropic/types";

interface SessionState {
  session: SessionWithDetails | null;
  questions: Question[];
  answers: Record<string, Answer>;
  currentIndex: number;
  isGenerating: boolean;
  isSubmitting: boolean;
  isEvaluating: boolean;
  isComplete: boolean;
  error: string | null;
}

export function useSession(sessionId: string) {
  const supabase = createClient();
  const [state, setState] = useState<SessionState>({
    session: null,
    questions: [],
    answers: {},
    currentIndex: 0,
    isGenerating: false,
    isSubmitting: false,
    isEvaluating: false,
    isComplete: false,
    error: null,
  });

  const loadSession = useCallback(async () => {
    const { data: sessionData } = await supabase
      .from("interview_sessions")
      .select(`*, company:companies(*), position:positions(*)`)
      .eq("id", sessionId)
      .single();

    if (!sessionData) return;

    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("order_index");

    const { data: answersData } = await supabase
      .from("answers")
      .select("*")
      .eq("session_id", sessionId);

    const answersMap: Record<string, Answer> = {};
    (answersData || []).forEach((a) => {
      answersMap[a.question_id] = a as Answer;
    });

    const questions = (questionsData || []) as Question[];
    // Resume from first unanswered question
    let resumeIndex = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answersMap[questions[i].id]) resumeIndex = i + 1;
      else break;
    }
    resumeIndex = Math.min(resumeIndex, Math.max(0, questions.length - 1));

    setState((prev) => ({
      ...prev,
      session: sessionData as unknown as SessionWithDetails,
      questions,
      answers: answersMap,
      currentIndex: resumeIndex,
      isComplete: sessionData.status === "completed",
    }));

    return { session: sessionData, questions };
  }, [sessionId]);

  useEffect(() => {
    loadSession().then((result) => {
      if (!result) return;
      const { session, questions } = result;
      if (questions.length === 0) {
        generateQuestions(session as unknown as SessionWithDetails);
      }
    });
  }, [sessionId]);

  const generateQuestions = useCallback(async (session: SessionWithDetails) => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          companyId: session.company_id,
          positionId: session.position_id,
          level: session.position.level,
          questionCount: session.question_count,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const { questions } = await res.json();
      setState((prev) => ({
        ...prev,
        questions: questions as Question[],
        isGenerating: false,
        currentIndex: 0,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: "Failed to generate questions. Please try again.",
      }));
    }
  }, []);

  const runEvaluation = useCallback(
    async (
      answerId: string,
      answerText: string,
      question: Question,
      session: SessionWithDetails
    ): Promise<EvaluationResult | null> => {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId,
          questionId: question.id,
          answerText,
          questionText: question.question_text,
          questionType: question.question_type,
          companyName: session.company.name,
          cultureNotes: session.company.culture_notes ?? "",
          positionTitle: session.position.title,
          level: session.position.level,
        }),
      });
      if (!res.ok) return null;
      return res.json();
    },
    []
  );

  const submitTextAnswer = useCallback(
    async (answerText: string) => {
      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion || !state.session) return;

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      const { data: answer, error: insertError } = await supabase
        .from("answers")
        .insert({
          question_id: currentQuestion.id,
          session_id: sessionId,
          answer_type: "text",
          text_content: answerText,
        })
        .select()
        .single();

      if (insertError || !answer) {
        setState((prev) => ({ ...prev, isSubmitting: false, error: "Failed to save answer." }));
        return;
      }

      setState((prev) => ({ ...prev, isSubmitting: false, isEvaluating: true }));

      const evaluation = await runEvaluation(answer.id, answerText, currentQuestion, state.session!);

      const updatedAnswer: Answer = {
        ...(answer as Answer),
        score: evaluation?.score ?? null,
        feedback: evaluation?.feedback ?? null,
        strengths: evaluation?.strengths ?? null,
        improvements: evaluation?.improvements ?? null,
        evaluated_at: evaluation ? new Date().toISOString() : null,
      };

      setState((prev) => ({
        ...prev,
        isEvaluating: false,
        answers: { ...prev.answers, [currentQuestion.id]: updatedAnswer },
      }));
    },
    [state.questions, state.currentIndex, state.session, sessionId, runEvaluation]
  );

  const submitMediaAnswer = useCallback(
    async (
      transcription: string,
      storagePath: string,
      answerId: string,
      answerType: "audio" | "video"
    ) => {
      const currentQuestion = state.questions[state.currentIndex];
      if (!currentQuestion || !state.session) return;

      // Answer row already inserted by media component; just evaluate
      setState((prev) => ({ ...prev, isEvaluating: true, error: null }));

      const evaluation = await runEvaluation(answerId, transcription, currentQuestion, state.session);

      const { data: updatedRow } = await supabase
        .from("answers")
        .select("*")
        .eq("id", answerId)
        .single();

      const finalAnswer: Answer = {
        ...(updatedRow as Answer),
        score: evaluation?.score ?? null,
        feedback: evaluation?.feedback ?? null,
        strengths: evaluation?.strengths ?? null,
        improvements: evaluation?.improvements ?? null,
        evaluated_at: evaluation ? new Date().toISOString() : null,
      };

      setState((prev) => ({
        ...prev,
        isEvaluating: false,
        answers: { ...prev.answers, [currentQuestion.id]: finalAnswer },
      }));
    },
    [state.questions, state.currentIndex, state.session, runEvaluation]
  );

  const nextQuestion = useCallback(async () => {
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.questions.length) {
      const scores = state.questions.map((q) => state.answers[q.id]?.score ?? null);
      const overall = averageScores(scores);

      await supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          overall_score: overall,
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      setState((prev) => ({ ...prev, isComplete: true }));
    } else {
      setState((prev) => ({ ...prev, currentIndex: nextIndex }));
    }
  }, [state.currentIndex, state.questions, state.answers, sessionId]);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentAnswer = currentQuestion ? state.answers[currentQuestion.id] ?? null : null;

  return {
    ...state,
    currentQuestion,
    currentAnswer,
    submitTextAnswer,
    submitMediaAnswer,
    nextQuestion,
    totalQuestions: state.questions.length,
  };
}
