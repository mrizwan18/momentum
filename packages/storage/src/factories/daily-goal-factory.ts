import { DailyGoalSchema, type DailyGoalRecord } from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateDailyGoalInput {
  date: string;
  requiredExerciseIds: string[];
  targetDurationSeconds: number;
  xpReward?: number;
}

/** Keyed by date, so there is exactly one goal row per day. */
export function createDailyGoal(input: CreateDailyGoalInput): DailyGoalRecord {
  return parseOrThrow(DailyGoalSchema, "DailyGoal", {
    id: input.date,
    date: input.date,
    requiredExerciseIds: input.requiredExerciseIds,
    targetDurationSeconds: input.targetDurationSeconds,
    xpReward: input.xpReward ?? 0,
    completed: false,
  });
}
