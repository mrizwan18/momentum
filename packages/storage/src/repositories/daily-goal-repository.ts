import { DailyGoalSchema, type DailyGoalRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";
import {
  createDailyGoal,
  type CreateDailyGoalInput,
} from "../factories/daily-goal-factory";

export type { CreateDailyGoalInput };

export interface DailyGoalRepository {
  getForDate(date: string): Promise<DailyGoalRecord | undefined>;
  setForDate(input: CreateDailyGoalInput): Promise<DailyGoalRecord>;
  markCompleted(date: string): Promise<DailyGoalRecord>;
}

export function createDailyGoalRepository(
  db: MomentumDatabase,
): DailyGoalRepository {
  return {
    async getForDate(date) {
      return db.dailyGoals.get(date);
    },

    async setForDate(input) {
      return db.transaction("rw", db.dailyGoals, async () => {
        const record = createDailyGoal(input);
        await db.dailyGoals.put(record);
        return record;
      });
    },

    async markCompleted(date) {
      return db.transaction("rw", db.dailyGoals, async () => {
        const existing = await db.dailyGoals.get(date);
        if (!existing) {
          throw new Error(`Daily goal for ${date} was not found`);
        }
        const updated = parseOrThrow(DailyGoalSchema, "DailyGoal", {
          ...existing,
          completed: true,
        });
        await db.dailyGoals.put(updated);
        return updated;
      });
    },
  };
}
