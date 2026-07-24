"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button, Heading, Reveal, Text } from "@momentum/ui";

/**
 * Shown when a session is cancelled/abandoned rather than completed — the
 * completed path now goes through SessionSummaryScreen instead (see
 * features/summary), which has its own celebratory treatment.
 */
export function PracticeEnded() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <Reveal variant="scale">
        <div className="rounded-full bg-surface-raised p-6">
          <XCircle
            aria-hidden="true"
            className="h-16 w-16 text-foreground-muted"
          />
        </div>
      </Reveal>

      <Reveal delay={0.15} className="flex flex-col items-center gap-3">
        <Heading as="h1" size="hero">
          Session ended
        </Heading>
        <Text tone="muted" size="lg">
          Come back anytime — nothing was lost.
        </Text>
      </Reveal>

      <Reveal delay={0.3} className="w-full">
        <Button asChild className="h-14 w-full text-base font-semibold">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </Reveal>
    </div>
  );
}
