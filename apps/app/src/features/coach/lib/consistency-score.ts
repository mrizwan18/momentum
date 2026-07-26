import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";

const WINDOW_DAYS = 7;

export interface ConsistencyScore {
  /** 0-100: percentage of the trailing 7 days (including today) with any practice. */
  current: number;
  /** 0-100: the same ratio for the 7 days before that. */
  previous: number;
  /** Percentage-point difference, current - previous. */
  changePoints: number;
}

function daysPracticedRatio(
  byDate: Map<string, StatisticsEntryRecord>,
  windowEnd: Date,
  windowDays: number,
): number {
  let count = 0;
  for (let offset = 0; offset < windowDays; offset += 1) {
    const date = new Date(windowEnd);
    date.setDate(date.getDate() - offset);
    const entry = byDate.get(toDateOnly(date));
    if (entry && (entry.practiceMinutes > 0 || entry.sessionsCompleted > 0)) {
      count += 1;
    }
  }
  return count / windowDays;
}

/** AI Coach's "Consistency Score": this week's practiced-day ratio vs. the prior week's, as a percentage-point delta. */
export function computeConsistencyScore(
  entries: StatisticsEntryRecord[],
  today: Date = new Date(),
): ConsistencyScore {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  const current = Math.round(
    daysPracticedRatio(byDate, today, WINDOW_DAYS) * 100,
  );
  const previousEnd = new Date(today);
  previousEnd.setDate(previousEnd.getDate() - WINDOW_DAYS);
  const previous = Math.round(
    daysPracticedRatio(byDate, previousEnd, WINDOW_DAYS) * 100,
  );

  return { current, previous, changePoints: current - previous };
}
