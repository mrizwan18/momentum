import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";

export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  currentTotal: number;
  previousTotal: number;
  /** Percent change vs the previous window; null when the previous window had zero minutes (no meaningful ratio). */
  percentChange: number | null;
  direction: TrendDirection;
}

function sumMinutes(
  byDate: Map<string, StatisticsEntryRecord>,
  windowEnd: Date,
  windowDays: number,
): number {
  let total = 0;
  for (let offset = 0; offset < windowDays; offset += 1) {
    const date = new Date(windowEnd);
    date.setDate(date.getDate() - offset);
    total += byDate.get(toDateOnly(date))?.practiceMinutes ?? 0;
  }
  return total;
}

/** Compares the trailing `windowDays` days against the `windowDays` days before that. */
export function computeTrend(
  entries: StatisticsEntryRecord[],
  windowDays: number,
  today: Date = new Date(),
): Trend {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  const currentTotal = sumMinutes(byDate, today, windowDays);
  const previousEnd = new Date(today);
  previousEnd.setDate(previousEnd.getDate() - windowDays);
  const previousTotal = sumMinutes(byDate, previousEnd, windowDays);

  const percentChange =
    previousTotal > 0
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
      : null;

  let direction: TrendDirection = "flat";
  if (currentTotal > previousTotal) direction = "up";
  else if (currentTotal < previousTotal) direction = "down";

  return { currentTotal, previousTotal, percentChange, direction };
}
