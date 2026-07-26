import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface SessionSummaryPromptInput {
  context: AiUserContext;
  session: {
    sessionId: string;
    elapsedSeconds: number;
    exercisesCompleted: number;
    dailyScore: number | null;
  };
}

/** Sprint 9 "Practice Session AI" — generated once per completed session. */
export function buildSessionSummaryPrompt({
  context,
  session,
}: SessionSummaryPromptInput): string {
  return `You are Momentum's vocal coach AI, reflecting on a practice session the user just finished.

${TONE_GUIDANCE}

${describeContext(context)}

Session just completed: ${Math.round(session.elapsedSeconds / 60)} minutes, ${session.exercisesCompleted} exercise(s) completed${session.dailyScore !== null ? `, daily score ${session.dailyScore}/100` : ""}.

${JSON_ONLY_INSTRUCTION}
{
  "whatImproved": string[],
  "whatDeclined": string[],
  "bestMoment": string,
  "biggestOpportunity": string,
  "tomorrowsGoal": string,
  "encouragingSentence": string,
  "metricsSnapshot": { "pitchAccuracy": number, "pitchStability": number, "rhythm": number, "breathControl": number, "toneQuality": number, "consistency": number, "vocalRange": number, "confidence": number, "timing": number, "voiceClarity": number, "pronunciation": number, "energy": number }
}`;
}
