import { z } from "zod";

/**
 * A materialized snapshot, recomputed and upserted after each completed
 * session, so features can read streak state without recomputing it from
 * Statistics every time. Keyed by skill so each skill pack tracks its own
 * streak independently; `skillId: null` is the cross-skill/global streak.
 */
export const StreakSchema = z.object({
  id: z.string(),
  skillId: z.string().nullable(),
  current: z.number().int().min(0),
  longest: z.number().int().min(0),
  lastPracticeDate: z.string().nullable(),
  updatedAt: z.number(),
});

export type StreakRecord = z.infer<typeof StreakSchema>;
