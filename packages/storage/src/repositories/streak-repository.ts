import { StreakSchema, type StreakRecord } from "@momentum/types";
import { daysBetween } from "@momentum/utils";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";
import { createStreak, streakIdForSkill } from "../factories/streak-factory";

export interface StreakRepository {
  get(skillId: string | null): Promise<StreakRecord | undefined>;
  /** Idempotent for repeat calls on the same date (multiple sessions/day). */
  recordPracticeDay(
    skillId: string | null,
    date: string,
  ): Promise<StreakRecord>;
}

export function createStreakRepository(db: MomentumDatabase): StreakRepository {
  return {
    async get(skillId) {
      return db.streaks.get(streakIdForSkill(skillId));
    },

    async recordPracticeDay(skillId, date) {
      return db.transaction("rw", db.streaks, async () => {
        const id = streakIdForSkill(skillId);
        const existing = await db.streaks.get(id);
        const base = existing ?? createStreak({ skillId });

        if (base.lastPracticeDate === date) {
          return base;
        }

        const gap = base.lastPracticeDate
          ? daysBetween(date, base.lastPracticeDate)
          : null;
        const current = gap === 1 ? base.current + 1 : 1;
        const longest = Math.max(base.longest, current);

        const updated = parseOrThrow(StreakSchema, "Streak", {
          ...base,
          current,
          longest,
          lastPracticeDate: date,
          updatedAt: Date.now(),
        });
        await db.streaks.put(updated);
        return updated;
      });
    },
  };
}
