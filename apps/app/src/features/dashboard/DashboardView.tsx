"use client";

import {
  PageShell,
  Reveal,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from "@momentum/ui";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { getPracticeStatus } from "./lib/streak";
import { DashboardBottomNav } from "./components/DashboardBottomNav";
import { DashboardHeader } from "./components/DashboardHeader";
import { Greeting } from "./components/Greeting";
import { QuickPracticeRow } from "./components/QuickPracticeRow";
import { StreakCard } from "./components/StreakCard";
import { TodayPracticeCard } from "./components/TodayPracticeCard";

export function DashboardSkeleton() {
  return (
    <PageShell className="gap-10">
      <SkeletonGroup label="Loading dashboard">
        <div className="flex flex-col gap-6">
          <SkeletonText lines={2} />
          <Skeleton className="h-40 w-full rounded-hero" />
          <Skeleton className="h-14 w-full rounded-control" />
        </div>
      </SkeletonGroup>
    </PageShell>
  );
}

/**
 * docs/design/references/dashboard.png layout, matched exactly: header
 * (avatar/greeting/bell) -> hero "Today's Practice" -> Quick Practice
 * shortcuts -> Current Streak (with its weekly chart) -> floating bottom
 * nav. No separate "Start/Continue Practice" button — the hero card's own
 * floating arrow is the one primary CTA into Practice (docs/foundation/
 * ten-laws.md Law 5), matching the reference exactly. No Checklist section
 * either — the reference doesn't have one, and Activity/Stats screens
 * don't exist yet (CLAUDE.md phase order) for it to link anywhere real.
 */
export function DashboardView() {
  const state = useDashboardData();

  if (state.status === "loading") {
    return <DashboardSkeleton />;
  }

  const { streak, weeklyByDay, displayName, todayMinutes, todayGoal } =
    state.data;
  const status = getPracticeStatus(streak);

  return (
    <>
      <PageShell className="gap-10">
        <Reveal className="flex flex-col gap-6">
          <DashboardHeader displayName={displayName} />
          <Greeting status={status} />
          <TodayPracticeCard
            todayMinutes={todayMinutes}
            todayGoal={todayGoal}
          />
          <QuickPracticeRow />
          <StreakCard streak={streak} weeklyByDay={weeklyByDay} />
        </Reveal>
      </PageShell>
      <DashboardBottomNav />
    </>
  );
}
