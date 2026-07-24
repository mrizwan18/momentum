import { generateId } from "@momentum/utils";
import {
  RecommendationSchema,
  type RecommendationCategory,
  type RecommendationRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateRecommendationInput {
  title: string;
  reason: string;
  category: RecommendationCategory;
  priority: number;
  expectedDurationSeconds: number;
  xpReward?: number;
  completionCriteria: string;
}

export function createRecommendation(
  input: CreateRecommendationInput,
): RecommendationRecord {
  return parseOrThrow(RecommendationSchema, "Recommendation", {
    id: generateId(),
    title: input.title,
    reason: input.reason,
    category: input.category,
    priority: input.priority,
    expectedDurationSeconds: input.expectedDurationSeconds,
    xpReward: input.xpReward ?? 0,
    completionCriteria: input.completionCriteria,
    createdAt: Date.now(),
  });
}
