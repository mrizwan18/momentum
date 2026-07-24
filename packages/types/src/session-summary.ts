import { z } from "zod";

/**
 * docs/features/practice.md Session Summary: overall score, XP, momentum
 * gained, achievements, coach message, tomorrow's one thing. `overallScore`
 * and `momentumDelta` stay null until the Scoring/Momentum engines exist —
 * see PROJECT_RULES.md's no-fake-data rule.
 */
export const SessionSummarySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  overallScore: z.number().min(0).max(100).nullable(),
  xpEarned: z.number().int().min(0),
  momentumDelta: z.number().nullable(),
  achievementIds: z.array(z.string()),
  coachMessage: z.string().nullable(),
  tomorrowRecommendationId: z.string().nullable(),
  createdAt: z.number(),
});

export type SessionSummaryRecord = z.infer<typeof SessionSummarySchema>;
