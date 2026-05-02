import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic/client";
import { buildEvaluationSystem } from "@/lib/anthropic/prompts";
import type { EvaluationResult } from "@/lib/anthropic/types";
import type { QuestionType } from "@/types/database";

const schema = z.object({
  answerId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerText: z.string().min(1),
  questionText: z.string(),
  questionType: z.enum(["behavioral", "technical", "culture_fit", "situational"]),
  companyName: z.string(),
  cultureNotes: z.string(),
  positionTitle: z.string(),
  level: z.string(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    answerId,
    answerText,
    questionText,
    questionType,
    companyName,
    cultureNotes,
    positionTitle,
    level,
  } = parsed.data;

  const systemPrompt = buildEvaluationSystem({
    questionText,
    questionType: questionType as QuestionType,
    answerText,
    companyName,
    cultureNotes,
    positionTitle,
    level,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: "Evaluate this interview answer." }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let result: EvaluationResult;
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Failed to parse evaluation" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("answers")
    .update({
      score: result.score,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      evaluated_at: new Date().toISOString(),
    })
    .eq("id", answerId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
  }

  return NextResponse.json(result);
}
