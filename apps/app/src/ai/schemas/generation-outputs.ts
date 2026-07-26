import { z } from "zod";
import {
  AiSessionInsightSchema,
  BaselineAssessmentSchema,
  CoachMessageSchema,
  DashboardInsightSchema,
  RecommendationSchema,
} from "@momentum/types";

/**
 * What a provider must return for each operation — derived by omitting the
 * storage-only fields (id/foreign keys/provider/timestamps) from the
 * already-existing persisted-record schemas in @momentum/types, so the
 * "what the AI generates" shape can never drift from "what we store."
 */
export const BaselineAssessmentGenerationSchema = BaselineAssessmentSchema.omit(
  { id: true, recordingId: true, provider: true, createdAt: true },
);
export type BaselineAssessmentGeneration = z.infer<
  typeof BaselineAssessmentGenerationSchema
>;

export const SessionInsightGenerationSchema = AiSessionInsightSchema.omit({
  id: true,
  sessionId: true,
  provider: true,
  createdAt: true,
});
export type SessionInsightGeneration = z.infer<
  typeof SessionInsightGenerationSchema
>;

export const DashboardInsightGenerationSchema = DashboardInsightSchema.omit({
  id: true,
  date: true,
  provider: true,
  generatedAt: true,
});
export type DashboardInsightGeneration = z.infer<
  typeof DashboardInsightGenerationSchema
>;

export const CoachReplyGenerationSchema = CoachMessageSchema.omit({
  id: true,
  role: true,
  provider: true,
  createdAt: true,
});
export type CoachReplyGeneration = z.infer<typeof CoachReplyGenerationSchema>;

export const RecommendationGenerationSchema = RecommendationSchema.omit({
  id: true,
  createdAt: true,
});
export type RecommendationGeneration = z.infer<
  typeof RecommendationGenerationSchema
>;

/** No stored-record precedent — new for Sprint 9, structured per docs/features/coach.md's "Weekly Report" fields. */
export const WeeklySummaryGenerationSchema = z.object({
  headline: z.string().min(1),
  sessionsCompleted: z.number().int().nonnegative(),
  practiceMinutes: z.number().nonnegative(),
  strongestHabit: z.string().min(1),
  improvementArea: z.string().min(1),
  recommendedFocus: z.string().min(1),
  comparedToPreviousWeek: z.string().min(1),
});
export type WeeklySummaryGeneration = z.infer<
  typeof WeeklySummaryGenerationSchema
>;

export const TREND_DIRECTIONS = ["improving", "steady", "declining"] as const;

/** The narrative wrapper around Baseline Comparison's computed numbers (src/ai/services/baseline-comparison-service.ts supplies the numbers; the provider only narrates them). */
export const ProgressInsightGenerationSchema = z.object({
  progressPercent: z.number(),
  pitchImprovement: z.number(),
  rhythmImprovement: z.number(),
  confidenceImprovement: z.number(),
  consistencyImprovement: z.number(),
  rangeImprovement: z.number(),
  trend: z.enum(TREND_DIRECTIONS),
  summary: z.string().min(1),
});
export type ProgressInsightGeneration = z.infer<
  typeof ProgressInsightGenerationSchema
>;
