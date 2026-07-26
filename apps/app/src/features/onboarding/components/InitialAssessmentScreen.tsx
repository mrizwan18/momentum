"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Music,
  Music2,
  Repeat,
  Target,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Heading,
  NumberDisplay,
  ProgressBar,
  ProgressRing,
  Reveal,
  Text,
  shadowStyle,
} from "@momentum/ui";
import type { BaselineAssessmentRecord } from "@momentum/types";

export interface InitialAssessmentScreenProps {
  onBack: () => void;
  onNext: () => void;
  /** The real, AI-generated Initial Vocal Assessment — null while still pending (offline/queued). */
  assessment: BaselineAssessmentRecord | null;
  /** True only when the assessment couldn't be generated yet (offline) and will finish automatically once back online. */
  pending: boolean;
}

/**
 * Breakdown rows map 5 of the assessment's 12 metrics onto the exact 5 rows
 * docs/design/references shows for this screen — the reference's layout
 * only ever depicts 5, so the other 7 (breathControl, confidence, timing,
 * voiceClarity, pronunciation, energy) live in the stored record for later
 * screens (e.g. Baseline Comparison) without needing a 6th+ row here.
 */
function buildBreakdown(assessment: BaselineAssessmentRecord | null) {
  return [
    {
      icon: Target,
      label: "Pitch Accuracy",
      value: assessment?.metrics.pitchAccuracy ?? null,
    },
    {
      icon: Music2,
      label: "Tone & Clarity",
      value: assessment?.metrics.toneQuality ?? null,
    },
    {
      icon: Activity,
      label: "Rhythm",
      value: assessment?.metrics.rhythm ?? null,
    },
    {
      icon: Music,
      label: "Range",
      value: assessment?.metrics.vocalRange ?? null,
    },
    {
      icon: Repeat,
      label: "Consistency",
      value: assessment?.metrics.consistency ?? null,
    },
  ];
}

/** Screen 12: the baseline summary — real recording, real AI-generated scores (or a pending state if still queued offline). */
export function InitialAssessmentScreen({
  onBack,
  onNext,
  assessment,
  pending,
}: InitialAssessmentScreenProps) {
  const breakdown = buildBreakdown(assessment);

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

      <Reveal variant="scale" className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Your Initial Assessment 🎉
        </Heading>
        <Text tone="muted">
          This is your baseline. We&apos;ll use this to track your progress over
          time.
        </Text>
      </Reveal>

      <Reveal delay={0.1}>
        <Card
          elevation="hero"
          className="flex items-center justify-between gap-4 p-5"
        >
          <div className="flex flex-col gap-1">
            <Text tone="muted" size="sm">
              Overall Score
            </Text>
            <div className="flex items-end gap-1">
              <NumberDisplay size="hero">
                {assessment?.overallScore ?? "—"}
              </NumberDisplay>
              {assessment ? <Text tone="muted">/100</Text> : null}
            </div>
            <Text size="sm" className="font-semibold text-success">
              {pending ? "Analyzing…" : "Good Start!"}
            </Text>
          </div>
          <ProgressRing
            value={assessment?.overallScore}
            label="Overall score"
            size={88}
            strokeWidth={9}
          />
        </Card>
      </Reveal>

      <Reveal delay={0.2} className="flex flex-col gap-3">
        <Text style={{ fontWeight: 600 }}>Breakdown</Text>
        <Card>
          <CardContent className="flex flex-col gap-4">
            {breakdown.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-primary"
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Text size="sm">{label}</Text>
                    <Text size="sm" tone="muted">
                      {value !== null ? `${value}%` : "—"}
                    </Text>
                  </div>
                  <ProgressBar value={value ?? 0} label={label} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      {pending ? (
        <Reveal delay={0.25}>
          <Text tone="muted" size="sm" className="text-center">
            We&apos;ll finish your analysis automatically once you&apos;re back
            online.
          </Text>
        </Reveal>
      ) : null}

      <div
        style={{ marginTop: "auto" }}
        className="flex flex-col items-center gap-3 pt-6"
      >
        <Button
          onClick={onNext}
          className="h-14 w-full gap-2 text-base font-semibold"
        >
          Continue to Dashboard
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
        <Text
          as="span"
          tone="muted"
          size="sm"
          aria-disabled="true"
          className="pointer-events-none"
        >
          View detailed report
        </Text>
      </div>
    </div>
  );
}
