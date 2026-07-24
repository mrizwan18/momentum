import { z } from "zod";

/**
 * docs/features/practice.md Daily Mission — today's concrete target,
 * keyed by ISO date so there is exactly one goal row per day.
 */
export const DailyGoalSchema = z.object({
  id: z.string(),
  date: z.string(),
  requiredExerciseIds: z.array(z.string()),
  targetDurationSeconds: z.number().int().min(0),
  xpReward: z.number().int().min(0),
  completed: z.boolean(),
});

export type DailyGoalRecord = z.infer<typeof DailyGoalSchema>;
