import { z } from "zod";

/** What kind of running total a milestone threshold is measured against. */
export const MILESTONE_TYPES = [
  "streak",
  "practice_hours",
  "roadmap_chapter",
  "recordings",
] as const;
export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export const MilestoneSchema = z.object({
  id: z.string(),
  type: z.enum(MILESTONE_TYPES),
  threshold: z.number().min(0),
  achieved: z.boolean(),
  achievedAt: z.number().nullable(),
});

export type MilestoneRecord = z.infer<typeof MilestoneSchema>;
