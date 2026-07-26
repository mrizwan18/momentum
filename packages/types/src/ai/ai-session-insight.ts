import { z } from "zod";
import { AI_PROVIDER_NAMES, VocalMetricsSchema } from "./shared";

/**
 * Generated once per completed session (Sprint 9 "Practice Session AI").
 * `metricsSnapshot` reuses the exact baseline shape so Baseline Comparison
 * can diff any session against the immutable baseline on equal terms.
 */
export const AiSessionInsightSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  whatImproved: z.array(z.string()),
  whatDeclined: z.array(z.string()),
  bestMoment: z.string().min(1),
  biggestOpportunity: z.string().min(1),
  tomorrowsGoal: z.string().min(1),
  encouragingSentence: z.string().min(1),
  metricsSnapshot: VocalMetricsSchema,
  provider: z.enum(AI_PROVIDER_NAMES),
  createdAt: z.number(),
});

export type AiSessionInsightRecord = z.infer<typeof AiSessionInsightSchema>;
