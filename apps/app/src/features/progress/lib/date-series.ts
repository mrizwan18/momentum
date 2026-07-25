import type { StatisticsEntryRecord } from "@momentum/types";
import { toDateOnly } from "@/lib/date";

export interface DailySeriesPoint {
  date: string;
  label: string;
  minutes: number;
  isToday: boolean;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The trailing `days` days (inclusive of `today`), oldest first — one point
 * per calendar day. Used for both the Weekly graph (days=7, weekday labels)
 * and the Monthly graph (days=30, "M/D" labels).
 */
export function computeDailySeries(
  entries: StatisticsEntryRecord[],
  days: number,
  today: Date = new Date(),
): DailySeriesPoint[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const todayKey = toDateOnly(today);

  const series: DailySeriesPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = toDateOnly(date);
    series.push({
      date: dateKey,
      label:
        days <= 7
          ? WEEKDAY_LABELS[date.getDay()]
          : `${date.getMonth() + 1}/${date.getDate()}`,
      minutes: byDate.get(dateKey)?.practiceMinutes ?? 0,
      isToday: dateKey === todayKey,
    });
  }
  return series;
}
