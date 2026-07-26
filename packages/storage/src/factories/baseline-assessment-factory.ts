import { generateId } from "@momentum/utils";
import {
  BaselineAssessmentSchema,
  type AiProviderName,
  type BaselineAssessmentRecord,
  type SkillLevel,
  type VocalMetrics,
} from "@momentum/types";
import type { ExerciseDifficulty } from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateBaselineAssessmentInput {
  recordingId: string;
  overallScore: number;
  metrics: VocalMetrics;
  strengths: string[];
  areasToImprove: string[];
  recommendedDailyPractice: string;
  recommendedDurationMinutes: number;
  suggestedSkillLevel: SkillLevel;
  difficulty: ExerciseDifficulty;
  motivationalSummary: string;
  provider: AiProviderName;
}

export function createBaselineAssessment(
  input: CreateBaselineAssessmentInput,
): BaselineAssessmentRecord {
  return parseOrThrow(BaselineAssessmentSchema, "BaselineAssessment", {
    id: generateId(),
    ...input,
    createdAt: Date.now(),
  });
}
