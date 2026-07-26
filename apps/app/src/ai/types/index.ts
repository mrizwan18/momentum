import type { AiProviderName } from "@momentum/types";
import type { AiUserContext } from "../schemas/ai-user-context";
import type {
  BaselineAssessmentGeneration,
  CoachReplyGeneration,
  DashboardInsightGeneration,
  ProgressInsightGeneration,
  RecommendationGeneration,
  SessionInsightGeneration,
  WeeklySummaryGeneration,
} from "../schemas/generation-outputs";

export type { AiProviderName };

/**
 * Real recorded audio, converted client-side to a small WAV (see
 * src/lib/audio/encode-recording.ts) and attached to an assessment/session
 * request — only the OpenAI provider actually sends this to the model
 * (gpt-4o-audio-preview); other providers ignore it.
 */
export interface AiAudioPart {
  base64: string;
  format: "wav";
  durationSeconds: number;
  /** True if the source recording was longer than the analysis cap and had to be cut down. */
  truncated: boolean;
  /** Category/title of the exercise this take was recorded for, if known — lets the model give exercise-specific feedback instead of a generic one. */
  exerciseLabel?: string | null;
}

export interface GenerateAssessmentInput {
  context: AiUserContext;
  recordingDurationMs: number;
  /** The real baseline recording, when client-side encoding succeeded — absent falls back to context-only inference. */
  audio?: AiAudioPart[];
}

export interface GenerateSessionInsightInput {
  context: AiUserContext;
  session: {
    sessionId: string;
    elapsedSeconds: number;
    exercisesCompleted: number;
    dailyScore: number | null;
  };
  /** Every recording saved during this session, opt-in analyzed by the user — absent/empty falls back to context-only inference. */
  audio?: AiAudioPart[];
}

export interface GenerateDashboardInsightInput {
  context: AiUserContext;
}

export interface GenerateCoachReplyInput {
  context: AiUserContext;
  message: string;
}

export interface BaselineComparisonNumbers {
  progressPercent: number;
  pitchImprovement: number;
  rhythmImprovement: number;
  confidenceImprovement: number;
  consistencyImprovement: number;
  rangeImprovement: number;
  trend: "improving" | "steady" | "declining";
}

export interface GenerateProgressInsightsInput {
  context: AiUserContext;
  comparison: BaselineComparisonNumbers;
}

export interface GenerateRecommendationInput {
  context: AiUserContext;
}

export interface GenerateWeeklySummaryInput {
  context: AiUserContext;
}

/**
 * The single contract every provider (OpenAI, Gemini, Ollama, Mock)
 * implements identically — Sprint 9 "AI Provider Interface". The Gateway
 * depends on this interface only, never a concrete provider, so swapping
 * providers is a config change, not a code change.
 */
export interface AiProvider {
  readonly name: AiProviderName;
  generateAssessment(
    input: GenerateAssessmentInput,
  ): Promise<BaselineAssessmentGeneration>;
  generateSessionSummary(
    input: GenerateSessionInsightInput,
  ): Promise<SessionInsightGeneration>;
  generateDashboardInsight(
    input: GenerateDashboardInsightInput,
  ): Promise<DashboardInsightGeneration>;
  generateCoachReply(
    input: GenerateCoachReplyInput,
  ): Promise<CoachReplyGeneration>;
  generateProgressInsights(
    input: GenerateProgressInsightsInput,
  ): Promise<ProgressInsightGeneration>;
  generateRecommendation(
    input: GenerateRecommendationInput,
  ): Promise<RecommendationGeneration>;
  generateWeeklySummary(
    input: GenerateWeeklySummaryInput,
  ): Promise<WeeklySummaryGeneration>;
}

/** Every gateway call returns this envelope so callers can tell a graceful mock/fallback apart from the requested provider. */
export interface AiOperationResult<T> {
  data: T;
  provider: AiProviderName;
  /** True when the primary configured provider failed and the Gateway fell back to the Mock provider so the user still gets a real response. */
  fallback: boolean;
  cached: boolean;
  generatedAt: number;
}

export class AiUnavailableError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`AI unavailable: ${reason}`);
    this.name = "AiUnavailableError";
    this.reason = reason;
  }
}
