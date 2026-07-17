"use client";

import { PageShell, Skeleton, SkeletonGroup, SkeletonText } from "@momentum/ui";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { getPracticeStatus } from "./lib/streak";
import { AchievementWidget } from "./components/AchievementWidget";
import { Greeting } from "./components/Greeting";
import { MomentumCard } from "./components/MomentumCard";
import { OneThingCard } from "./components/OneThingCard";
import { PracticeChecklist } from "./components/PracticeChecklist";
import { PracticeCta } from "./components/PracticeCta";
import { RoadmapWidget } from "./components/RoadmapWidget";
import { ScoreCard } from "./components/ScoreCard";
import { StreakCard } from "./components/StreakCard";
import { WeeklySnapshotCard } from "./components/WeeklySnapshotCard";

export function DashboardSkeleton() {
  return (
    <PageShell withBottomNav={false} className="gap-4">
      <SkeletonGroup label="Loading dashboard">
        <div className="flex flex-col gap-4">
          <SkeletonText lines={2} />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </SkeletonGroup>
    </PageShell>
  );
}

/** docs/features/dashboard.md Layout Order, rendered top to bottom. */
export function DashboardView() {
  const state = useDashboardData();

  if (state.status === "loading") {
    return <DashboardSkeleton />;
  }

  const { streak, weekly, roadmapChapters, activeSession } = state.data;
  const status = getPracticeStatus(streak);

  return (
    <PageShell withBottomNav={false} className="gap-4">
      <Greeting status={status} />
      <StreakCard streak={streak} />
      <ScoreCard />
      <OneThingCard />
      <PracticeCta activeSession={activeSession} />
      <PracticeChecklist activeSession={activeSession} />
      <MomentumCard />
      <WeeklySnapshotCard weekly={weekly} />
      <RoadmapWidget chapters={roadmapChapters} />
      <AchievementWidget />
    </PageShell>
  );
}
