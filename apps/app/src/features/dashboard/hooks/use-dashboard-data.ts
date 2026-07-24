"use client";

import * as React from "react";
import type { DailyGoalRecord, PracticeSessionRecord } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { computeStreak, toDateOnly, type StreakSummary } from "../lib/streak";
import {
  computeWeeklyByDay,
  type WeeklyByDayEntry,
} from "../lib/weekly-snapshot";

export interface DashboardData {
  streak: StreakSummary;
  weeklyByDay: WeeklyByDayEntry[];
  activeSession: PracticeSessionRecord | null;
  displayName: string | null;
  todayMinutes: number;
  todayGoal: DailyGoalRecord | undefined;
}

export type DashboardDataState =
  { status: "loading" } | { status: "ready"; data: DashboardData };

/**
 * Loads the Dashboard's read model from Dexie via the repository pattern
 * (never touches IndexedDB directly). Mirrors the Dashboard State machine
 * in docs/engineering/state-machines.md: Loading -> Hydrated -> Interactive.
 */
export function useDashboardData(): DashboardDataState {
  const storage = useStorage();
  const setActiveSessionId = useActiveSessionStore(
    (state) => state.setActiveSessionId,
  );
  const [state, setState] = React.useState<DashboardDataState>({
    status: "loading",
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const todayKey = toDateOnly(new Date());
      const [statistics, activeSession, user, todayGoal] = await Promise.all([
        storage.statistics.list(),
        storage.sessions.getActive(),
        storage.users.get(),
        storage.dailyGoals.getForDate(todayKey),
      ]);

      if (cancelled) return;

      const practiceDates = statistics
        .filter(
          (entry) => entry.practiceMinutes > 0 || entry.sessionsCompleted > 0,
        )
        .map((entry) => entry.date);

      setActiveSessionId(activeSession?.id ?? null);
      setState({
        status: "ready",
        data: {
          streak: computeStreak(practiceDates),
          weeklyByDay: computeWeeklyByDay(statistics),
          activeSession: activeSession ?? null,
          displayName: user?.displayName ?? null,
          todayMinutes:
            statistics.find((entry) => entry.date === todayKey)
              ?.practiceMinutes ?? 0,
          todayGoal,
        },
      });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [storage, setActiveSessionId]);

  return state;
}
