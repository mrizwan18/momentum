"use client";

import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Button, Heading, Text } from "@momentum/ui";

export interface PracticeHeaderProps {
  /** The active skill/plan name, e.g. "Alankaar Practice". */
  subtitle: string;
  onExitRequest: () => void;
}

/**
 * docs/design/references/practice.md Practice Header: back-chevron (exit),
 * centered title + subtitle, overflow menu. Session timer/pause/progress
 * moved to SessionStatusCard and the exercise action row — this header is
 * now pure chrome. The overflow button is decorative (no menu content exists
 * yet), matching the Dashboard's inert bell precedent.
 */
export function PracticeHeader({
  subtitle,
  onExitRequest,
}: PracticeHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Exit practice"
        onClick={onExitRequest}
      >
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </Button>
      <div className="flex flex-col items-center">
        <Heading as="h1" size="lg">
          Practice
        </Heading>
        <Text as="span" tone="muted" size="sm">
          {subtitle}
        </Text>
      </div>
      <Button variant="ghost" size="icon" aria-label="More options" disabled>
        <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
      </Button>
    </header>
  );
}
