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

export interface InitialAssessmentScreenProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Illustrative baseline scores — this app has no real voice-analysis model
 * yet (this sprint is UI-only, per its own "do not change business logic"
 * constraint), so these numbers match the reference exactly rather than
 * being computed. Same "marketing preview content" precedent as
 * IntroProgress's WEEK_DATA. The captured recording itself, saved via
 * saveBaselineRecording, is real.
 */
const OVERALL_SCORE = 72;
const BREAKDOWN = [
  { icon: Target, label: "Pitch Accuracy", value: 76 },
  { icon: Music2, label: "Tone & Clarity", value: 74 },
  { icon: Activity, label: "Rhythm", value: 68 },
  { icon: Music, label: "Range", value: 65 },
  { icon: Repeat, label: "Consistency", value: 72 },
];

/** Screen 12: the baseline summary — real recording, illustrative scores, explains what this baseline is for. */
export function InitialAssessmentScreen({
  onBack,
  onNext,
}: InitialAssessmentScreenProps) {
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
              <NumberDisplay size="hero">{OVERALL_SCORE}</NumberDisplay>
              <Text tone="muted">/100</Text>
            </div>
            <Text size="sm" className="font-semibold text-success">
              Good Start!
            </Text>
          </div>
          <ProgressRing
            value={OVERALL_SCORE}
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
            {BREAKDOWN.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-primary"
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Text size="sm">{label}</Text>
                    <Text size="sm" tone="muted">
                      {value}%
                    </Text>
                  </div>
                  <ProgressBar value={value} label={label} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

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
