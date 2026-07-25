"use client";

import {
  Card,
  CardContent,
  NumberDisplay,
  ProgressRing,
  Stack,
  Text,
} from "@momentum/ui";
import type { CompletionRateSummary } from "../lib/completion-rate";
import type { FrequencySummary } from "../lib/frequency";

export interface OverviewStatsProps {
  frequency: FrequencySummary;
  completionRate: CompletionRateSummary;
}

/** docs/design/references/activity.png's ring-stat pattern, backed by real Frequency/Completion Rate data. */
export function OverviewStats({
  frequency,
  completionRate,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card elevation="raised">
        <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
          <ProgressRing
            value={frequency.ratio * 100}
            size={88}
            label={`Practiced ${frequency.daysPracticed} of ${frequency.totalDays} days`}
          >
            <Stack gap="none" className="items-center">
              <NumberDisplay size="md">{frequency.daysPracticed}</NumberDisplay>
              <Text tone="muted" size="sm">
                / {frequency.totalDays}
              </Text>
            </Stack>
          </ProgressRing>
          <Text tone="muted" size="sm">
            Days practiced (30d)
          </Text>
        </CardContent>
      </Card>
      <Card elevation="raised">
        <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
          <ProgressRing
            value={completionRate.rate * 100}
            size={88}
            label={`${Math.round(completionRate.rate * 100)} percent completion rate`}
          >
            <NumberDisplay size="md">
              {Math.round(completionRate.rate * 100)}%
            </NumberDisplay>
          </ProgressRing>
          <Text tone="muted" size="sm">
            Completion rate
          </Text>
        </CardContent>
      </Card>
    </div>
  );
}
