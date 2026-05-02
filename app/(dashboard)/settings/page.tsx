import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/shared/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile</p>
      </div>
      <SettingsForm
        userId={user!.id}
        initialName={profile?.full_name ?? ""}
        email={user!.email ?? ""}
      />
    </div>
  );
}
