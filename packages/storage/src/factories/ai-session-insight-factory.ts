import {
  AiSessionInsightSchema,
  type AiProviderName,
  type AiSessionInsightRecord,
  type VocalMetrics,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateAiSessionInsightInput {
  sessionId: string;
  whatImproved: string[];
  whatDeclined: string[];
  bestMoment: string;
  biggestOpportunity: string;
  tomorrowsGoal: string;
  encouragingSentence: string;
  metricsSnapshot: VocalMetrics;
  provider: AiProviderName;
}

/** One insight per session, so it shares the session's id (mirrors SessionSummary). */
export function createAiSessionInsight(
  input: CreateAiSessionInsightInput,
): AiSessionInsightRecord {
  return parseOrThrow(AiSessionInsightSchema, "AiSessionInsight", {
    id: input.sessionId,
    ...input,
    createdAt: Date.now(),
  });
}
