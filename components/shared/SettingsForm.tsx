"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";

interface SettingsFormProps {
  userId: string;
  initialName: string;
  email: string;
}

export function SettingsForm({ userId, initialName, email }: SettingsFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, updated_at: new Date().toISOString() })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {saved && <Check className="h-4 w-4" />}
        {saved ? "Saved" : "Save changes"}
      </Button>
    </form>
  );
}
