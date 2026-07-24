"use client";

import * as React from "react";
import { ArrowLeft, Lock, Music } from "lucide-react";
import { Heading, ProgressRing, Reveal, Text, shadowStyle } from "@momentum/ui";

export interface UploadingScreenProps {
  onBack: () => void;
  /** Auto-advances to Analyzing once the simulated upload finishes. */
  onComplete: () => void;
}

const UPLOAD_DURATION_MS = 2200;
const TICK_MS = 40;

/** Screen 10: an auto-advancing upload animation — no real network call, just a believable pause before Analyzing. */
export function UploadingScreen({ onBack, onComplete }: UploadingScreenProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / UPLOAD_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [onComplete]);

  const isComplete = progress >= 100;

  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <button
        type="button"
        onClick={onBack}
        disabled={!isComplete}
        aria-label="Go back"
        aria-disabled={!isComplete}
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Uploading your recording
        </Heading>
        <Text tone="muted">This will just take a few seconds.</Text>
      </Reveal>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <ProgressRing
          value={progress}
          label="Upload progress"
          size={140}
          strokeWidth={10}
        >
          <span className="animate-pulse rounded-full bg-primary/10 p-5 text-primary">
            <Music aria-hidden="true" className="h-8 w-8" />
          </span>
        </ProgressRing>

        <Text tone="muted" className="text-center">
          Please don&apos;t close the app or go back.
        </Text>

        <span className="flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 text-xs font-medium text-foreground-muted">
          <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          Secure upload
        </span>
      </div>
    </div>
  );
}
