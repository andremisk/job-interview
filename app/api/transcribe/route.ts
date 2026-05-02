import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/openai/whisper";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const answerId = formData.get("answerId") as string | null;

  if (!file || !answerId) {
    return NextResponse.json({ error: "Missing file or answerId" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const transcription = await transcribeAudio(buffer, file.name || "recording.webm");

  const { error } = await supabase
    .from("answers")
    .update({ text_content: transcription })
    .eq("id", answerId);

  if (error) {
    return NextResponse.json({ error: "Failed to save transcription" }, { status: 500 });
  }

  return NextResponse.json({ transcription });
}
