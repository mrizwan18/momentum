import {
  DashboardInsightSchema,
  type AiProviderName,
  type DashboardInsightRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateDashboardInsightInput {
  date: string;
  todaysFocus: string;
  dailyInsight: string;
  motivationalMessage: string;
  practiceRecommendation: string;
  estimatedImprovementPercent: number | null;
  suggestedSessionLengthMinutes: number;
  recoveryAdvice: string | null;
  provider: AiProviderName;
}

/** One per calendar day, so it shares the date as its id (mirrors StatisticsEntry). */
export function createDashboardInsight(
  input: CreateDashboardInsightInput,
): DashboardInsightRecord {
  return parseOrThrow(DashboardInsightSchema, "DashboardInsight", {
    id: input.date,
    ...input,
    generatedAt: Date.now(),
  });
}
