import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";

export interface FrequencySummary {
  daysPracticed: number;
  totalDays: number;
  ratio: number;
}

/** How many of the trailing `windowDays` days (inclusive of `today`) had any practice. */
export function computeFrequency(
  entries: StatisticsEntryRecord[],
  windowDays: number,
  today: Date = new Date(),
): FrequencySummary {
  const start = new Date(today);
  start.setDate(start.getDate() - (windowDays - 1));
  const startKey = toDateOnly(start);
  const todayKey = toDateOnly(today);

  const daysPracticed = entries.filter(
    (entry) =>
      entry.date >= startKey &&
      entry.date <= todayKey &&
      (entry.practiceMinutes > 0 || entry.sessionsCompleted > 0),
  ).length;

  return {
    daysPracticed,
    totalDays: windowDays,
    ratio: windowDays > 0 ? daysPracticed / windowDays : 0,
  };
}
