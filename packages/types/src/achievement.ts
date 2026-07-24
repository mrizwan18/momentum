import { z } from "zod";

export const ACHIEVEMENT_STATUSES = ["locked", "unlocked"] as const;
export type AchievementStatus = (typeof ACHIEVEMENT_STATUSES)[number];

/**
 * docs/engineering/state-machines.md ACHIEVEMENT_UNLOCKED event. `key` is
 * the stable definition identifier (e.g. "first_recording"); `id` is the
 * row's own primary key so the same achievement could theoretically be
 * re-seeded without colliding with a user's unlocked record.
 */
export const AchievementSchema = z.object({
  id: z.string(),
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum(ACHIEVEMENT_STATUSES),
  unlockedAt: z.number().nullable(),
});

export type AchievementRecord = z.infer<typeof AchievementSchema>;
