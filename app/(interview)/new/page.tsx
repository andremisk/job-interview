import { createClient } from "@/lib/supabase/server";
import { SessionSetup } from "@/components/interview/SessionSetup";

export default async function NewSessionPage() {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    return <SessionSetup userId="dev-user" />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <SessionSetup userId={user!.id} />;
}
