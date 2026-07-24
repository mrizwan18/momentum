import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "./streak";

export interface WeeklyByDayEntry {
  label: string;
  minutes: number;
  isToday: boolean;
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * The trailing 7 days (inclusive of `today`) as one entry per calendar day,
 * oldest first — the shape the Dashboard's weekly bar chart needs.
 */
export function computeWeeklyByDay(
  entries: StatisticsEntryRecord[],
  today: Date = new Date(),
): WeeklyByDayEntry[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const todayKey = toDateOnly(today);

  const days: WeeklyByDayEntry[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = toDateOnly(date);
    days.push({
      label: DAY_LETTERS[date.getDay()],
      minutes: byDate.get(dateKey)?.practiceMinutes ?? 0,
      isToday: dateKey === todayKey,
    });
  }
  return days;
}
