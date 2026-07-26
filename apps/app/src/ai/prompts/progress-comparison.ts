import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import type { BaselineComparisonNumbers } from "../types";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface ProgressComparisonPromptInput {
  context: AiUserContext;
  comparison: BaselineComparisonNumbers;
}

/**
 * Sprint 9 "Baseline Comparison" narrative layer — the numbers themselves
 * are already computed deterministically (src/ai/services/baseline-
 * comparison-service.ts); this prompt only asks the model to narrate them,
 * never to invent or recompute the figures.
 */
export function buildProgressComparisonPrompt({
  context,
  comparison,
}: ProgressComparisonPromptInput): string {
  return `You are Momentum's vocal coach AI, narrating the user's progress since their baseline assessment. The numbers below are already computed — do not change them, only explain what they mean.

${TONE_GUIDANCE}

${describeContext(context)}

Computed comparison vs. baseline:
- Overall progress: ${comparison.progressPercent}%
- Pitch improvement: ${comparison.pitchImprovement}%
- Rhythm improvement: ${comparison.rhythmImprovement}%
- Confidence improvement: ${comparison.confidenceImprovement}%
- Consistency improvement: ${comparison.consistencyImprovement}%
- Range improvement: ${comparison.rangeImprovement}%
- Trend: ${comparison.trend}

${JSON_ONLY_INSTRUCTION}
{
  "progressPercent": ${comparison.progressPercent},
  "pitchImprovement": ${comparison.pitchImprovement},
  "rhythmImprovement": ${comparison.rhythmImprovement},
  "confidenceImprovement": ${comparison.confidenceImprovement},
  "consistencyImprovement": ${comparison.consistencyImprovement},
  "rangeImprovement": ${comparison.rangeImprovement},
  "trend": "${comparison.trend}",
  "summary": string
}`;
}
