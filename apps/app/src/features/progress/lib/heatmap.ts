import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  date: string;
  minutes: number;
  level: HeatmapLevel;
  /** Days after `today` that pad out the final calendar week — not real, always level 0. */
  isFuture: boolean;
}

export interface HeatmapWeek {
  days: HeatmapCell[];
}

function levelForMinutes(minutes: number): HeatmapLevel {
  if (minutes <= 0) return 0;
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 60) return 3;
  return 4;
}

/**
 * A GitHub-contributions-style grid: `weeks` columns of Sun-Sat rows, ending
 * with the calendar week containing `today`. Days after `today` within that
 * final week are real dates that simply haven't happened yet — padded with
 * 0 minutes rather than fabricated activity.
 */
export function computeHeatmapWeeks(
  entries: StatisticsEntryRecord[],
  weeks: number,
  today: Date = new Date(),
): HeatmapWeek[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const todayKey = toDateOnly(today);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  const start = new Date(endOfWeek);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const result: HeatmapWeek[] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w += 1) {
    const days: HeatmapCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const dateKey = toDateOnly(cursor);
      const isFuture = dateKey > todayKey;
      const minutes = isFuture
        ? 0
        : (byDate.get(dateKey)?.practiceMinutes ?? 0);
      days.push({
        date: dateKey,
        minutes,
        level: levelForMinutes(minutes),
        isFuture,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    result.push({ days });
  }
  return result;
}
