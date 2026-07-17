"use client";

import * as React from "react";
import type {
  PracticeSessionRecord,
  RoadmapChapterRecord,
} from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { computeStreak, type StreakSummary } from "../lib/streak";
import {
  computeWeeklySnapshot,
  type WeeklySnapshot,
} from "../lib/weekly-snapshot";

export interface DashboardData {
  streak: StreakSummary;
  weekly: WeeklySnapshot;
  roadmapChapters: RoadmapChapterRecord[];
  activeSession: PracticeSessionRecord | null;
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
      const [statistics, roadmapChapters, activeSession] = await Promise.all([
        storage.statistics.list(),
        storage.roadmap.list(),
        storage.sessions.getActive(),
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
          weekly: computeWeeklySnapshot(statistics),
          roadmapChapters,
          activeSession: activeSession ?? null,
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
