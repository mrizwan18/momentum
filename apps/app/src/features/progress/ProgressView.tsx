"use client";

import { DashboardBottomNav } from "@/features/dashboard";
import {
  EmptyState,
  PageHeader,
  PageShell,
  Reveal,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from "@momentum/ui";
import { useProgressData } from "./hooks/use-progress-data";
import {
  ExerciseDistributionCard,
  HeatmapCard,
  HistoryList,
  MonthlyGraphCard,
  OverviewStats,
  PersonalRecordsCard,
  StreakHistoryCard,
  WeeklyGraphCard,
} from "./components";

export function ProgressSkeleton() {
  return (
    <PageShell className="gap-6">
      <SkeletonGroup label="Loading progress">
        <div className="flex flex-col gap-6">
          <SkeletonText lines={2} />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </SkeletonGroup>
    </PageShell>
  );
}

/**
 * History / weekly & monthly graphs / heatmap / practice frequency /
 * completion rate / exercise distribution / streak history / personal
 * records / trend calculations — all real Dexie-backed data (packages/
 * storage), no AI insights, recommendations, or roadmap content.
 */
export function ProgressView() {
  const state = useProgressData();

  if (state.status === "loading") {
    return <ProgressSkeleton />;
  }

  const { data } = state;
  const hasAnyHistory = data.history.length > 0;

  return (
    <>
      <PageShell className="gap-6">
        <Reveal className="flex flex-col gap-6">
          <PageHeader title="Progress" description="Riyaaz practice progress" />

          {hasAnyHistory ? (
            <>
              <OverviewStats
                frequency={data.frequency}
                completionRate={data.completionRate}
              />
              <WeeklyGraphCard weekly={data.weekly} trend={data.weeklyTrend} />
              <MonthlyGraphCard
                monthly={data.monthly}
                trend={data.monthlyTrend}
              />
              <HeatmapCard weeks={data.heatmap} />
              <ExerciseDistributionCard
                distribution={data.exerciseDistribution}
              />
              <StreakHistoryCard points={data.streakHistory} />
              <PersonalRecordsCard records={data.personalRecords} />
              <HistoryList history={data.history} />
            </>
          ) : (
            <EmptyState
              title="No progress yet"
              description="Finish your first practice session and your progress will start showing up here."
            />
          )}
        </Reveal>
      </PageShell>
      <DashboardBottomNav />
    </>
  );
}
