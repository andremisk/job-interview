"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, Settings, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col h-full py-4 px-3">
      <div className="mb-6 px-2">
        <span className="text-sm font-semibold tracking-tight">Interview Prep</span>
      </div>

      <Button size="sm" className="mb-4 w-full justify-start gap-2" asChild>
        <Link href="/new">
          <Plus className="h-4 w-4" />
          New session
        </Link>
      </Button>

      <ul className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </nav>
  );
}
