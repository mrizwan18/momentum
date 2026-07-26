import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface DashboardInsightPromptInput {
  context: AiUserContext;
}

/** Sprint 9 "Dashboard AI" — refreshed at most once per day (src/ai/services decides staleness), never on every render. */
export function buildDashboardInsightPrompt({
  context,
}: DashboardInsightPromptInput): string {
  return `You are Momentum's vocal coach AI, writing today's Dashboard insight for the user before they've practiced today.

${TONE_GUIDANCE}

${describeContext(context)}

${JSON_ONLY_INSTRUCTION}
{
  "todaysFocus": string,
  "dailyInsight": string,
  "motivationalMessage": string,
  "practiceRecommendation": string,
  "estimatedImprovementPercent": number | null,
  "suggestedSessionLengthMinutes": number,
  "recoveryAdvice": string | null
}`;
}
