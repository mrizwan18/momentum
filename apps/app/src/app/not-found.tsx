import Link from "next/link";
import { Button } from "@momentum/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-sm text-foreground-muted">
        Let&apos;s get you back to familiar ground.
      </p>
      <Button asChild>
        <Link href="/">Back to Momentum</Link>
      </Button>
    </main>
  );
}
