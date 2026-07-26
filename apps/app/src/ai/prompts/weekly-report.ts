import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface WeeklyReportPromptInput {
  context: AiUserContext;
}

/** Sprint 9 generateWeeklySummary() — structure matches docs/features/coach.md's "Weekly Report" section exactly. */
export function buildWeeklyReportPrompt({
  context,
}: WeeklyReportPromptInput): string {
  return `You are Momentum's vocal coach AI, writing this week's summary report.

${TONE_GUIDANCE}

${describeContext(context)}

Summarize: sessions completed, practice time, strongest habit, improvement area, recommended focus, and how this week compares to the previous week.

${JSON_ONLY_INSTRUCTION}
{
  "headline": string,
  "sessionsCompleted": number,
  "practiceMinutes": number,
  "strongestHabit": string,
  "improvementArea": string,
  "recommendedFocus": string,
  "comparedToPreviousWeek": string
}`;
}
