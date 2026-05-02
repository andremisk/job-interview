import { createClient } from "@/lib/supabase/server";
import { SessionSetup } from "@/components/interview/SessionSetup";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <SessionSetup userId={user!.id} />;
}
