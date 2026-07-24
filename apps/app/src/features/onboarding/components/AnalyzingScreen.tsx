"use client";

import * as React from "react";
import { ArrowLeft, Bot, Check, Circle } from "lucide-react";
import { Card, Heading, Reveal, Text, shadowStyle } from "@momentum/ui";

export interface AnalyzingScreenProps {
  onBack: () => void;
  /** Auto-advances to the Result screen once every stage has completed. */
  onComplete: () => void;
}

/** Sequential, staged progress (docs sprint's "no fake loading bars") — each stage takes a believable, different amount of time. */
const STAGES = [
  { label: "Detecting pitch accuracy", durationMs: 900 },
  { label: "Analyzing tone & clarity", durationMs: 1100 },
  { label: "Evaluating rhythm", durationMs: 1000 },
  { label: "Assessing range", durationMs: 900 },
  { label: "Preparing your report", durationMs: 800 },
];

type StageStatus = "done" | "current" | "pending";

function statusFor(index: number, completedCount: number): StageStatus {
  if (index < completedCount) return "done";
  if (index === completedCount) return "current";
  return "pending";
}

/** Screen 11: the AI avatar + a checklist that completes one stage at a time, then hands off to Result. */
export function AnalyzingScreen({ onBack, onComplete }: AnalyzingScreenProps) {
  const [completedCount, setCompletedCount] = React.useState(0);

  React.useEffect(() => {
    if (completedCount >= STAGES.length) {
      onComplete();
      return;
    }
    const timeout = setTimeout(() => {
      setCompletedCount((count) => count + 1);
    }, STAGES[completedCount].durationMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount]);

  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          AI is analyzing your voice
        </Heading>
        <Text tone="muted">This may take up to 30 seconds.</Text>
      </Reveal>

      <Reveal delay={0.1} className="flex justify-center py-6">
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute animate-pulse rounded-full bg-primary/10"
            style={{ height: "180px", width: "180px" }}
          />
          <span
            aria-hidden="true"
            className="absolute rounded-full bg-primary/15"
            style={{ height: "130px", width: "130px" }}
          />
          <span
            style={{ height: "88px", width: "88px", ...shadowStyle.hero }}
            className="relative flex items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Bot aria-hidden="true" className="h-9 w-9" />
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <Card elevation="hero" className="flex flex-col gap-4 p-5">
          {STAGES.map((stage, index) => {
            const status = statusFor(index, completedCount);
            return (
              <div key={stage.label} className="flex items-center gap-3">
                {status === "done" ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check aria-hidden="true" className="h-4 w-4" />
                  </span>
                ) : status === "current" ? (
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 animate-pulse rounded-full"
                    style={{ border: "2px solid hsl(var(--palette-primary))" }}
                  />
                ) : (
                  <Circle
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 text-foreground-muted"
                  />
                )}
                <Text
                  tone={status === "pending" ? "muted" : "default"}
                  style={{ fontWeight: status === "current" ? 600 : 400 }}
                >
                  {stage.label}
                </Text>
              </div>
            );
          })}
        </Card>
      </Reveal>
    </div>
  );
}
