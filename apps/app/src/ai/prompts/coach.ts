import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface CoachPromptInput {
  context: AiUserContext;
  message: string;
}

/**
 * Sprint 9 "AI Coach Screen" — conversational, grounded in real history.
 * Structure follows docs/features/coach.md's Message Structure exactly:
 * Observation -> Encouragement -> Action, never inventing data the context
 * doesn't contain.
 */
export function buildCoachPrompt({
  context,
  message,
}: CoachPromptInput): string {
  return `You are Momentum's AI Coach — the user's encouraging vocal-practice mentor. Answer their question, explain mistakes, recommend exercises, review progress, suggest next practice, celebrate milestones, or warn about plateaus as appropriate.

${TONE_GUIDANCE}

Every reply should follow this structure where relevant: an Observation grounded in the data below, brief Encouragement, then exactly one actionable suggestion. Never invent facts not present in this context — if you don't have enough history to answer specifically, say so plainly and give general guidance instead.

${describeContext(context)}

User's message: "${message}"

${JSON_ONLY_INSTRUCTION}
{
  "message": string,
  "suggestedExercises": string[] | null
}`;
}
