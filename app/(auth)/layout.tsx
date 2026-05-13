import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-6 w-6 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold tracking-tight">IP</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Interview Prep</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-sm shadow-zinc-100 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
