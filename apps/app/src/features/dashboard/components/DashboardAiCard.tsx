"use client";

import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Reveal,
  Text,
} from "@momentum/ui";
import type { DashboardInsightRecord } from "@momentum/types";
import type { DashboardInsightStatus } from "../hooks/use-dashboard-insight";

export interface DashboardAiCardProps {
  status: DashboardInsightStatus;
  insight: DashboardInsightRecord | null;
}

/** Sprint 9 "Dashboard AI" — Today's Focus, Daily Insight, and the day's practice recommendation. Never renders fabricated text; each state below is explicit. */
export function DashboardAiCard({ status, insight }: DashboardAiCardProps) {
  if (status === "unavailable") {
    return (
      <Reveal>
        <Card>
          <CardContent className="pt-6">
            <Text tone="muted" size="sm">
              Your AI insight will appear once you&apos;re back online.
            </Text>
          </CardContent>
        </Card>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Sparkles aria-hidden="true" className="h-5 w-5 text-primary" />
          <CardTitle as="h2">Today&apos;s Focus</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "loading" || !insight ? (
            <Text tone="muted" size="sm">
              Preparing today&apos;s insight…
            </Text>
          ) : (
            <>
              <Text className="font-semibold">{insight.todaysFocus}</Text>
              <Text tone="muted" size="sm">
                {insight.dailyInsight}
              </Text>
              <Text size="sm">{insight.motivationalMessage}</Text>
              <div className="flex flex-col gap-1">
                <Text size="sm" className="font-medium">
                  Recommended practice
                </Text>
                <Text tone="muted" size="sm">
                  {insight.practiceRecommendation} (
                  {insight.suggestedSessionLengthMinutes} min)
                </Text>
              </div>
              {insight.recoveryAdvice ? (
                <Text tone="muted" size="sm">
                  {insight.recoveryAdvice}
                </Text>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </Reveal>
  );
}
