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
    <nav className="flex flex-col h-full py-5 px-3">
      <div className="mb-6 px-2 flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-bold tracking-tight">IP</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">Interview Prep</span>
      </div>

      <Button size="sm" className="mb-5 w-full justify-start gap-2 rounded-lg h-9" asChild>
        <Link href="/new">
          <Plus className="h-3.5 w-3.5" />
          New session
        </Link>
      </Button>

      <ul className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t pt-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
