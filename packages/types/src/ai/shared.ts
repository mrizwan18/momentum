import { z } from "zod";

/** Every provider implements the same AiProvider contract (src/ai/providers) — swappable via config, never hardcoded per feature. */
export const AI_PROVIDER_NAMES = [
  "openai",
  "gemini",
  "ollama",
  "mock",
] as const;
export type AiProviderName = (typeof AI_PROVIDER_NAMES)[number];

/**
 * The 12 metrics docs/features asks the Initial Vocal Assessment to cover.
 * Reused identically for per-session AI insight snapshots so a baseline can
 * be diffed against any later session on the same shape.
 */
export const VOCAL_METRIC_KEYS = [
  "pitchAccuracy",
  "pitchStability",
  "rhythm",
  "breathControl",
  "toneQuality",
  "consistency",
  "vocalRange",
  "confidence",
  "timing",
  "voiceClarity",
  "pronunciation",
  "energy",
] as const;
export type VocalMetricKey = (typeof VOCAL_METRIC_KEYS)[number];

const metricScore = z.number().min(0).max(100);

export const VocalMetricsSchema = z.object({
  pitchAccuracy: metricScore,
  pitchStability: metricScore,
  rhythm: metricScore,
  breathControl: metricScore,
  toneQuality: metricScore,
  consistency: metricScore,
  vocalRange: metricScore,
  confidence: metricScore,
  timing: metricScore,
  voiceClarity: metricScore,
  pronunciation: metricScore,
  energy: metricScore,
});
export type VocalMetrics = z.infer<typeof VocalMetricsSchema>;
