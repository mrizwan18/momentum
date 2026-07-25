"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import {
  computeCompletionRate,
  type CompletionRateSummary,
} from "../lib/completion-rate";
import { computeDailySeries, type DailySeriesPoint } from "../lib/date-series";
import {
  computeExerciseDistribution,
  type ExerciseDistributionEntry,
} from "../lib/exercise-distribution";
import { computeFrequency, type FrequencySummary } from "../lib/frequency";
import { computeHeatmapWeeks, type HeatmapWeek } from "../lib/heatmap";
import { buildHistory, type HistoryEntry } from "../lib/history";
import {
  computePersonalRecords,
  type PersonalRecords,
} from "../lib/personal-records";
import {
  computeStreakHistory,
  type StreakHistoryPoint,
} from "../lib/streak-history";
import { computeTrend, type Trend } from "../lib/trend";

const HEATMAP_WEEKS = 12;
const MONTH_WINDOW_DAYS = 30;
const WEEK_WINDOW_DAYS = 7;

export interface ProgressData {
  weekly: DailySeriesPoint[];
  monthly: DailySeriesPoint[];
  heatmap: HeatmapWeek[];
  frequency: FrequencySummary;
  completionRate: CompletionRateSummary;
  exerciseDistribution: ExerciseDistributionEntry[];
  streakHistory: StreakHistoryPoint[];
  personalRecords: PersonalRecords;
  weeklyTrend: Trend;
  monthlyTrend: Trend;
  history: HistoryEntry[];
}

export type ProgressDataState =
  { status: "loading" } | { status: "ready"; data: ProgressData };

/**
 * Loads Progress's read model from Dexie via the repository pattern.
 * Mirrors useDashboardData's Loading -> Ready shape.
 */
export function useProgressData(): ProgressDataState {
  const storage = useStorage();
  const [state, setState] = React.useState<ProgressDataState>({
    status: "loading",
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const [
        statistics,
        terminalSessions,
        summaries,
        attempts,
        exercises,
        streak,
      ] = await Promise.all([
        storage.statistics.list(),
        storage.sessions.listTerminal(),
        storage.sessionSummaries.list(),
        storage.exerciseAttempts.listAll(),
        storage.exercises.listAll(),
        storage.streaks.get(null),
      ]);

      if (cancelled) return;

      const completedSessions = terminalSessions.filter(
        (session) => session.status === "completed",
      );

      const completedAttemptCountsBySession = new Map<string, number>();
      for (const attempt of attempts) {
        if (attempt.status !== "completed") continue;
        completedAttemptCountsBySession.set(
          attempt.sessionId,
          (completedAttemptCountsBySession.get(attempt.sessionId) ?? 0) + 1,
        );
      }

      const today = new Date();

      setState({
        status: "ready",
        data: {
          weekly: computeDailySeries(statistics, WEEK_WINDOW_DAYS, today),
          monthly: computeDailySeries(statistics, MONTH_WINDOW_DAYS, today),
          heatmap: computeHeatmapWeeks(statistics, HEATMAP_WEEKS, today),
          frequency: computeFrequency(statistics, MONTH_WINDOW_DAYS, today),
          completionRate: computeCompletionRate(terminalSessions),
          exerciseDistribution: computeExerciseDistribution(
            attempts,
            exercises,
          ),
          streakHistory: computeStreakHistory(
            statistics,
            MONTH_WINDOW_DAYS,
            today,
          ),
          personalRecords: computePersonalRecords({
            completedSessions,
            summaries,
            completedAttemptCountsBySession,
            streak,
            statistics,
          }),
          weeklyTrend: computeTrend(statistics, WEEK_WINDOW_DAYS, today),
          monthlyTrend: computeTrend(statistics, MONTH_WINDOW_DAYS, today),
          history: buildHistory(
            terminalSessions,
            summaries,
            completedAttemptCountsBySession,
          ),
        },
      });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [storage]);

  return state;
}
