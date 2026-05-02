import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Interview Prep</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Practice interviews that feel real
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI-generated questions tailored to your target company and role.
              Submit text, audio, or video answers and get instant scored feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start practicing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          <ul className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
            {[
              "Company-specific questions",
              "Text, audio & video answers",
              "Instant AI scoring",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-foreground shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
