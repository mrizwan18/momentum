import { z } from "zod";

/**
 * One row per calendar day, keyed by ISO date ("YYYY-MM-DD") so writes for
 * the same day are idempotent upserts rather than duplicate inserts.
 */
export const StatisticsEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  practiceMinutes: z.number().min(0),
  sessionsCompleted: z.number().int().min(0),
  growthScore: z.number().nullable(),
  updatedAt: z.number(),
});

export type StatisticsEntryRecord = z.infer<typeof StatisticsEntrySchema>;
