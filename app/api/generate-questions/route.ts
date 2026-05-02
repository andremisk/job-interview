import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic/client";
import { buildQuestionGenerationSystem } from "@/lib/anthropic/prompts";
import type { GeneratedQuestion } from "@/lib/anthropic/types";

const schema = z.object({
  sessionId: z.string().uuid(),
  companyId: z.string().uuid(),
  positionId: z.string().uuid(),
  level: z.enum(["intern", "junior", "mid", "senior", "lead"]),
  questionCount: z.number().int().min(1).max(10).default(5),
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

  const { sessionId, companyId, positionId, level, questionCount } = parsed.data;

  // Verify session belongs to this user
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("id, user_id, personal_context")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Check if questions already generated (idempotency)
  const { data: existingQuestions } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index");

  if (existingQuestions && existingQuestions.length > 0) {
    return NextResponse.json({ questions: existingQuestions });
  }

  // Fetch company and position
  const [{ data: company }, { data: position }] = await Promise.all([
    supabase.from("companies").select("*, segment:segments(name)").eq("id", companyId).single(),
    supabase.from("positions").select("*").eq("id", positionId).single(),
  ]);

  if (!company || !position) {
    return NextResponse.json({ error: "Company or position not found" }, { status: 404 });
  }

  const systemPrompt = buildQuestionGenerationSystem({
    companyName: company.name,
    industry: company.industry ?? "professional services",
    cultureNotes: company.culture_notes ?? "professional, collaborative, results-oriented",
    notableFacts: company.notable_facts ?? "",
    positionTitle: position.title,
    level,
    description: position.description ?? "",
    responsibilities: position.responsibilities ?? "",
    requirements: position.requirements ?? "",
    segmentName: (company.segment as { name: string } | null)?.name ?? "professional",
    questionCount,
    personalContext: (session as unknown as { personal_context: string | null }).personal_context ?? undefined,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Generate ${questionCount} interview questions.` }
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let generated: GeneratedQuestion[];
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    generated = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Failed to parse questions from AI" }, { status: 500 });
  }

  const rows = generated.map((q, i) => ({
    session_id: sessionId,
    question_text: q.question_text,
    question_type: q.question_type,
    order_index: i + 1,
  }));

  const { data: insertedQuestions, error: insertError } = await supabase
    .from("questions")
    .insert(rows)
    .select();

  if (insertError) {
    return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
  }

  // Update session to in_progress
  await supabase
    .from("interview_sessions")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ questions: insertedQuestions });
}
