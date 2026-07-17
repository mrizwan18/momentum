import Link from "next/link";
import { Button } from "@momentum/ui";
import type { PracticeSessionRecord } from "@momentum/types";

export interface PracticeCtaProps {
  activeSession: PracticeSessionRecord | null;
}

/** The screen's one primary action (docs/foundation/ten-laws.md Law 5). */
export function PracticeCta({ activeSession }: PracticeCtaProps) {
  const label = activeSession ? "Continue Practice" : "Start Practice";

  return (
    <Button asChild className="w-full">
      <Link href="/practice">{label}</Link>
    </Button>
  );
}
