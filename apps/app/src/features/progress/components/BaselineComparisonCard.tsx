"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import type { BaselineComparisonNumbers } from "@/ai/types";
import type { BaselineComparisonAiStatus } from "../hooks/use-baseline-comparison";

export interface BaselineComparisonCardProps {
  comparison: BaselineComparisonNumbers;
  aiSummary: string | null;
  aiStatus: BaselineComparisonAiStatus;
}

const METRIC_ROWS = [
  { key: "pitchImprovement", label: "Pitch" },
  { key: "rhythmImprovement", label: "Rhythm" },
  { key: "confidenceImprovement", label: "Confidence" },
  { key: "consistencyImprovement", label: "Consistency" },
  { key: "rangeImprovement", label: "Range" },
] as const;

const TREND_LABEL: Record<BaselineComparisonNumbers["trend"], string> = {
  improving: "Improving",
  steady: "Steady",
  declining: "Declining",
};

function arrowFor(value: number): string {
  if (value > 0) return "▲";
  if (value < 0) return "▼";
  return "";
}

/**
 * Sprint 9 "Baseline Comparison" — Original Baseline vs. Latest Session,
 * Best Session, and the Rolling 30-day Average, boiled down to the per-
 * metric percent changes docs/features/coach.md-style deterministic
 * numbers. Only appears once a baseline exists and at least one session
 * has an AI insight to compare against (see useBaselineComparison).
 */
export function BaselineComparisonCard({
  comparison,
  aiSummary,
  aiStatus,
}: BaselineComparisonCardProps) {
  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Since Your Baseline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <NumberDisplay size="hero">
            {comparison.progressPercent > 0 ? "+" : ""}
            {comparison.progressPercent}%
          </NumberDisplay>
          <Text tone="muted" size="sm">
            {TREND_LABEL[comparison.trend]}
          </Text>
        </div>

        <div className="flex flex-col gap-2">
          {METRIC_ROWS.map(({ key, label }) => {
            const value = comparison[key];
            return (
              <div key={key} className="flex items-center justify-between">
                <Text size="sm">{label}</Text>
                <Text
                  size="sm"
                  className={
                    value < 0
                      ? "font-semibold text-danger"
                      : "font-semibold text-success"
                  }
                >
                  {arrowFor(value)} {Math.abs(value)}%
                </Text>
              </div>
            );
          })}
        </div>

        {aiStatus === "loading" ? (
          <Text tone="muted" size="sm">
            Your AI coach is reviewing your progress…
          </Text>
        ) : aiStatus === "ready" && aiSummary ? (
          <Text size="sm">{aiSummary}</Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
