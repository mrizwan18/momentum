import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import type { AiAudioPart } from "../types";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface AssessmentPromptInput {
  context: AiUserContext;
  recordingDurationMs: number;
  /** The real baseline recording, when client-side audio encoding succeeded. */
  audio?: AiAudioPart[];
}

/**
 * Sprint 9 "AI During Onboarding", extended to genuinely analyze real
 * audio when it's attached (see openai-provider.ts's chatJsonWithAudio) —
 * only the OpenAI provider actually receives the audio bytes; other
 * providers fall back to context-only inference regardless of this prompt's
 * wording, since they never see the `audio` field at all.
 */
export function buildAssessmentPrompt({
  context,
  recordingDurationMs,
  audio,
}: AssessmentPromptInput): string {
  const hasAudio = Boolean(audio && audio.length > 0);
  const listeningInstruction = hasAudio
    ? "You have been given the user's actual recorded audio below — listen to it and evaluate real pitch accuracy, tone, rhythm, breath control, and the other metrics from what you actually hear. Do not estimate from context alone."
    : "No audio is attached to this request — evaluate as best you can from the context below, and keep scores conservative rather than overconfident.";

  return `You are Momentum's vocal coach AI, producing an Initial Vocal Assessment from a new user's first baseline recording (${Math.round(recordingDurationMs / 1000)} seconds long).

${TONE_GUIDANCE}

${describeContext(context)}

This is the user's very first recording — there is no prior history to compare against. ${listeningInstruction} Evaluate across these 12 metrics (each 0-100): pitchAccuracy, pitchStability, rhythm, breathControl, toneQuality, consistency, vocalRange, confidence, timing, voiceClarity, pronunciation, energy.

${JSON_ONLY_INSTRUCTION}
{
  "overallScore": number,
  "metrics": { "pitchAccuracy": number, "pitchStability": number, "rhythm": number, "breathControl": number, "toneQuality": number, "consistency": number, "vocalRange": number, "confidence": number, "timing": number, "voiceClarity": number, "pronunciation": number, "energy": number },
  "strengths": string[],
  "areasToImprove": string[],
  "recommendedDailyPractice": string,
  "recommendedDurationMinutes": number,
  "suggestedSkillLevel": "beginner" | "intermediate" | "advanced",
  "difficulty": "easy" | "medium" | "hard",
  "motivationalSummary": string
}`;
}
