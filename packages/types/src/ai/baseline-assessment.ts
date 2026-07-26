import { z } from "zod";
import { EXERCISE_DIFFICULTIES } from "../exercise";
import { AI_PROVIDER_NAMES, VocalMetricsSchema } from "./shared";

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

/**
 * The Initial Vocal Assessment, generated once from the onboarding baseline
 * recording. Immutable historical data (Sprint 9): never recomputed or
 * overwritten — every future comparison measures against this same row.
 */
export const BaselineAssessmentSchema = z.object({
  id: z.string(),
  recordingId: z.string(),
  overallScore: z.number().min(0).max(100),
  metrics: VocalMetricsSchema,
  strengths: z.array(z.string()).min(1),
  areasToImprove: z.array(z.string()).min(1),
  recommendedDailyPractice: z.string().min(1),
  recommendedDurationMinutes: z.number().int().positive(),
  suggestedSkillLevel: z.enum(SKILL_LEVELS),
  difficulty: z.enum(EXERCISE_DIFFICULTIES),
  motivationalSummary: z.string().min(1),
  provider: z.enum(AI_PROVIDER_NAMES),
  createdAt: z.number(),
});

export type BaselineAssessmentRecord = z.infer<typeof BaselineAssessmentSchema>;
