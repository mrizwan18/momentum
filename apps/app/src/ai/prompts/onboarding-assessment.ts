import "server-only";

import type { AiUserContext } from "../schemas/ai-user-context";
import {
  describeContext,
  JSON_ONLY_INSTRUCTION,
  TONE_GUIDANCE,
} from "./shared";

export interface AssessmentPromptInput {
  context: AiUserContext;
  recordingDurationMs: number;
}

/**
 * Sprint 9 "AI During Onboarding". Note: this prompt frames the assessment
 * around the user's stated profile/context, not a literal acoustic analysis
 * of the recording — real pitch/rhythm signal-processing is a separate
 * discipline outside this sprint's Gateway/provider architecture (see the
 * completion report's Future Extension Points).
 */
export function buildAssessmentPrompt({
  context,
  recordingDurationMs,
}: AssessmentPromptInput): string {
  return `You are Momentum's vocal coach AI, producing an Initial Vocal Assessment from a new user's first baseline recording (${Math.round(recordingDurationMs / 1000)} seconds long).

${TONE_GUIDANCE}

${describeContext(context)}

This is the user's very first recording — there is no prior history to compare against. Evaluate across these 12 metrics (each 0-100): pitchAccuracy, pitchStability, rhythm, breathControl, toneQuality, consistency, vocalRange, confidence, timing, voiceClarity, pronunciation, energy.

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
