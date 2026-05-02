import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          This page doesn't exist or has been moved.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
