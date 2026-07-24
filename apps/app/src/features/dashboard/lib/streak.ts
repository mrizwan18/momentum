import { toDateOnly } from "@/lib/date";

export { toDateOnly };

const MILESTONES = [7, 14, 30, 60, 100, 180, 365];

export interface StreakSummary {
  current: number;
  longest: number;
  lastPracticeDate: string | null;
  nextMilestone: number | null;
  daysUntilMilestone: number | null;
}

export type PracticeStatus =
  "new" | "practiced-today" | "streak-active" | "recovery";

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

/**
 * `practiceDates` are the distinct ISO ("YYYY-MM-DD") dates on which at
 * least one practice session was completed, in any order.
 */
export function computeStreak(
  practiceDates: string[],
  today: Date = new Date(),
): StreakSummary {
  if (practiceDates.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastPracticeDate: null,
      nextMilestone: MILESTONES[0],
      daysUntilMilestone: MILESTONES[0],
    };
  }

  const sorted = Array.from(new Set(practiceDates)).sort();
  const lastPracticeDate = sorted[sorted.length - 1];

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = diffInDays(
      parseDateOnly(sorted[i]),
      parseDateOnly(sorted[i - 1]),
    );
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // The streak is only "current" if the last practice was today or
  // yesterday — otherwise it has already lapsed.
  const gapFromToday = diffInDays(today, parseDateOnly(lastPracticeDate));
  let current = 0;
  if (gapFromToday <= 1) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i -= 1) {
      const gap = diffInDays(
        parseDateOnly(sorted[i]),
        parseDateOnly(sorted[i - 1]),
      );
      if (gap !== 1) break;
      current += 1;
    }
  }

  const nextMilestone =
    MILESTONES.find((milestone) => milestone > current) ?? null;
  const daysUntilMilestone = nextMilestone ? nextMilestone - current : null;

  return {
    current,
    longest,
    lastPracticeDate,
    nextMilestone,
    daysUntilMilestone,
  };
}

export function getPracticeStatus(
  streak: StreakSummary,
  today: Date = new Date(),
): PracticeStatus {
  if (!streak.lastPracticeDate) return "new";
  if (streak.lastPracticeDate === toDateOnly(today)) return "practiced-today";
  if (streak.current > 0) return "streak-active";
  return "recovery";
}
