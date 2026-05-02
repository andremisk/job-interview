import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InterviewClient } from "./InterviewClient";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify this session belongs to the user
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/dashboard");
  if (session.status === "completed") redirect(`/session/${sessionId}/results`);

  return <InterviewClient sessionId={sessionId} userId={user.id} />;
}
