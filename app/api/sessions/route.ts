import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  segmentId: z.string().uuid().optional(),
  customIndustry: z.string().max(100).optional(),
  companyId: z.string().uuid().optional(),
  customCompanyName: z.string().max(100).optional(),
  positionId: z.string().uuid().optional(),
  customPositionTitle: z.string().max(100).optional(),
  customPositionLevel: z.enum(["intern", "junior", "mid", "senior", "lead"]).default("mid"),
  personalContext: z.string().max(2000).optional(),
  resumeText: z.string().max(12000).optional(),
  jobDescription: z.string().max(6000).optional(),
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

  const {
    segmentId, customIndustry,
    companyId, customCompanyName,
    positionId, customPositionTitle, customPositionLevel,
    personalContext, resumeText, jobDescription, questionCount,
  } = parsed.data;

  if (!segmentId && !customIndustry) {
    return NextResponse.json({ error: "Industry is required" }, { status: 400 });
  }
  if (!companyId && !customCompanyName) {
    return NextResponse.json({ error: "Company is required" }, { status: 400 });
  }
  if (!positionId && !customPositionTitle) {
    return NextResponse.json({ error: "Position is required" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Resolve segment
  let finalSegmentId = segmentId;
  if (!finalSegmentId && customIndustry) {
    const slug = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: seg } = await service
      .from("segments")
      .insert({ name: customIndustry, slug, description: `${customIndustry} sector` })
      .select()
      .single();
    finalSegmentId = seg?.id;
  }

  if (!finalSegmentId) {
    return NextResponse.json({ error: "Failed to resolve industry" }, { status: 500 });
  }

  // Resolve company
  let finalCompanyId = companyId;
  if (!finalCompanyId && customCompanyName) {
    const slug = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: co } = await service
      .from("companies")
      .insert({
        name: customCompanyName,
        slug,
        segment_id: finalSegmentId,
        industry: customIndustry ?? "Other",
      })
      .select()
      .single();
    finalCompanyId = co?.id;
  }

  if (!finalCompanyId) {
    return NextResponse.json({ error: "Failed to resolve company" }, { status: 500 });
  }

  // Resolve position
  let finalPositionId = positionId;
  if (!finalPositionId && customPositionTitle) {
    const { data: pos } = await service
      .from("positions")
      .insert({
        title: customPositionTitle,
        level: customPositionLevel,
        segment_id: finalSegmentId,
        company_id: finalCompanyId,
      })
      .select()
      .single();
    finalPositionId = pos?.id;
  }

  if (!finalPositionId) {
    return NextResponse.json({ error: "Failed to resolve position" }, { status: 500 });
  }

  // Build notes
  const notes: Record<string, string> = {};
  if (resumeText?.trim()) notes.resumeText = resumeText.trim();
  if (jobDescription?.trim()) notes.jobDescription = jobDescription.trim();

  const { data: session, error } = await service
    .from("interview_sessions")
    .insert({
      user_id: user.id,
      company_id: finalCompanyId,
      position_id: finalPositionId,
      status: "pending",
      question_count: questionCount,
      personal_context: personalContext?.trim() || null,
      notes: Object.keys(notes).length > 0 ? JSON.stringify(notes) : null,
    })
    .select()
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id });
}
