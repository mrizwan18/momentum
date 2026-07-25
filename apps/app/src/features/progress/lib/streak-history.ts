import type { StatisticsEntryRecord } from "@momentum/types";
import { daysBetween } from "@momentum/utils";
import { toDateOnly } from "@/lib/date";

export interface StreakHistoryPoint {
  date: string;
  streakLength: number;
}

/**
 * The running streak length as of each day in the trailing `windowDays`
 * days. Computed from every practice date on record (not just the display
 * window) so a streak that started before the window still shows its real
 * length rather than restarting at the window boundary. A streak stays
 * "current" through the day immediately after the last practice (the same
 * grace period the rest of the app uses), lapsing to 0 only once a full day
 * has passed with no practice.
 */
export function computeStreakHistory(
  entries: StatisticsEntryRecord[],
  windowDays: number,
  today: Date = new Date(),
): StreakHistoryPoint[] {
  const practiceDates = Array.from(
    new Set(
      entries
        .filter(
          (entry) => entry.practiceMinutes > 0 || entry.sessionsCompleted > 0,
        )
        .map((entry) => entry.date),
    ),
  ).sort();

  const streakByDate = new Map<string, number>();
  let run = 0;
  let prevDate: string | null = null;
  for (const date of practiceDates) {
    run = prevDate && daysBetween(date, prevDate) === 1 ? run + 1 : 1;
    streakByDate.set(date, run);
    prevDate = date;
  }

  const start = new Date(today);
  start.setDate(start.getDate() - (windowDays - 1));

  const points: StreakHistoryPoint[] = [];
  let lastKnownStreak = 0;
  let lastKnownDate: string | null = null;
  const cursor = new Date(start);
  for (let i = 0; i < windowDays; i += 1) {
    const dateKey = toDateOnly(cursor);
    if (streakByDate.has(dateKey)) {
      lastKnownStreak = streakByDate.get(dateKey) ?? 0;
      lastKnownDate = dateKey;
    } else if (lastKnownDate && daysBetween(dateKey, lastKnownDate) > 1) {
      lastKnownStreak = 0;
    }
    points.push({ date: dateKey, streakLength: lastKnownStreak });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}
