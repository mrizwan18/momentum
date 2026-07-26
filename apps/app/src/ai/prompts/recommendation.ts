import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface RecommendationPromptInput {
  context: AiUserContext;
}

/** Sprint 9's standalone generateRecommendation() — the "Today's One Thing" the recommendations table has always supported but never had a real generator for. */
export function buildRecommendationPrompt({
  context,
}: RecommendationPromptInput): string {
  return `You are Momentum's recommendation engine, choosing exactly ONE next practice recommendation for the user (docs/engineering/recommendation-engine.md's "Today's One Thing" concept).

${TONE_GUIDANCE}

${describeContext(context)}

${JSON_ONLY_INSTRUCTION}
{
  "title": string,
  "reason": string,
  "category": "recovery" | "roadmap_mission" | "skipped_exercise" | "weakest_habit" | "weekly_assessment" | "recording_reminder" | "side_quest",
  "priority": number,
  "expectedDurationSeconds": number,
  "xpReward": number,
  "completionCriteria": string
}`;
}
