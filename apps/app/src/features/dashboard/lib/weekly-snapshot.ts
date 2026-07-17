import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "./streak";

export interface WeeklySnapshot {
  practiceMinutes: number;
  sessionsCompleted: number;
  daysPracticed: number;
}

/** Aggregates the trailing 7 days (inclusive of `today`) from real statistics rows. */
export function computeWeeklySnapshot(
  entries: StatisticsEntryRecord[],
  today: Date = new Date(),
): WeeklySnapshot {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffKey = toDateOnly(cutoff);
  const todayKey = toDateOnly(today);

  const inRange = entries.filter(
    (entry) => entry.date >= cutoffKey && entry.date <= todayKey,
  );

  return {
    practiceMinutes: inRange.reduce(
      (sum, entry) => sum + entry.practiceMinutes,
      0,
    ),
    sessionsCompleted: inRange.reduce(
      (sum, entry) => sum + entry.sessionsCompleted,
      0,
    ),
    daysPracticed: inRange.filter(
      (entry) => entry.practiceMinutes > 0 || entry.sessionsCompleted > 0,
    ).length,
  };
}
