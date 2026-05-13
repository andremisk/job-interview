import type { QuestionType } from "@/types/database";

export interface GeneratedQuestion {
  question_text: string;
  question_type: QuestionType;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface QuestionGenerationContext {
  companyName: string;
  industry: string;
  cultureNotes: string;
  notableFacts: string;
  positionTitle: string;
  level: string;
  description: string;
  responsibilities: string;
  requirements: string;
  segmentName: string;
  questionCount: number;
  personalContext?: string;
  resumeText?: string;
  jobDescription?: string;
}

export interface EvaluationContext {
  questionText: string;
  questionType: QuestionType;
  answerText: string;
  companyName: string;
  cultureNotes: string;
  positionTitle: string;
  level: string;
}
