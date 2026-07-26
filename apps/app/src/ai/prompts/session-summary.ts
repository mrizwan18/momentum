import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import type { AiAudioPart } from "../types";
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
  /** Every recording the user opted to have analyzed for this session, each labeled with its exercise when known. */
  audio?: AiAudioPart[];
}

/**
 * Sprint 9 "Practice Session AI" — opt-in, user-triggered (never fired
 * automatically on session completion). When real recordings are attached,
 * each one is labeled by exercise so the model can give exercise-specific
 * feedback and still synthesize ONE session-level summary.
 */
export function buildSessionSummaryPrompt({
  context,
  session,
  audio,
}: SessionSummaryPromptInput): string {
  const hasAudio = Boolean(audio && audio.length > 0);
  const listeningInstruction = hasAudio
    ? `You have been given ${audio!.length} real recording(s) from this session below, in order:\n${audio!
        .map(
          (part, index) =>
            `Recording ${index + 1}${part.exerciseLabel ? ` — Exercise: ${part.exerciseLabel}` : ""}${part.truncated ? " (audio truncated to the first minute)" : ""}`,
        )
        .join(
          "\n",
        )}\nListen to each and evaluate real pitch, tone, rhythm, and breath control from what you actually hear — then synthesize ONE cohesive session summary that references specific exercises by name where relevant. Do not estimate from context alone.`
    : "No audio is attached to this request — reflect using the session stats below only.";

  return `You are Momentum's vocal coach AI, reflecting on a practice session the user just finished.

${TONE_GUIDANCE}

${describeContext(context)}

Session just completed: ${Math.round(session.elapsedSeconds / 60)} minutes, ${session.exercisesCompleted} exercise(s) completed${session.dailyScore !== null ? `, daily score ${session.dailyScore}/100` : ""}.

${listeningInstruction}

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
