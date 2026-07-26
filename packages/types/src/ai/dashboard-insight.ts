import { z } from "zod";
import { AI_PROVIDER_NAMES } from "./shared";

/**
 * One per calendar day (id = date, upserted) — Sprint 9's Dashboard AI.
 * "Refresh intelligently, don't generate random text": the gateway only
 * regenerates when stale (see src/ai/services), reusing the same row
 * otherwise so a page reload doesn't produce a different message.
 */
export const DashboardInsightSchema = z.object({
  id: z.string(),
  date: z.string(),
  todaysFocus: z.string().min(1),
  dailyInsight: z.string().min(1),
  motivationalMessage: z.string().min(1),
  practiceRecommendation: z.string().min(1),
  estimatedImprovementPercent: z.number().min(-100).max(100).nullable(),
  suggestedSessionLengthMinutes: z.number().int().positive(),
  recoveryAdvice: z.string().nullable(),
  provider: z.enum(AI_PROVIDER_NAMES),
  generatedAt: z.number(),
});

export type DashboardInsightRecord = z.infer<typeof DashboardInsightSchema>;
