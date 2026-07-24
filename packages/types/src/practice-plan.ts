import { z } from "zod";

/**
 * The template/blueprint for a practice session (the "Exercise Queue") —
 * distinct from PracticeSessionRecord, which is one concrete instance of
 * following a plan. docs/features/practice.md Recovery Mode is modeled as
 * `isRecoveryPlan: true` rather than a separate entity.
 */
export const PracticePlanSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  exerciseIds: z.array(z.string()),
  targetDurationSeconds: z.number().int().min(0),
  isRecoveryPlan: z.boolean(),
  createdAt: z.number(),
});

export type PracticePlanRecord = z.infer<typeof PracticePlanSchema>;
