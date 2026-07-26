import {
  VOCAL_METRIC_KEYS,
  type AiSessionInsightRecord,
  type BaselineAssessmentRecord,
  type VocalMetrics,
} from "@momentum/types";
import type { BaselineComparisonNumbers } from "../types";

const ROLLING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const TREND_MARGIN = 2;

function overallOf(metrics: VocalMetrics): number {
  return (
    VOCAL_METRIC_KEYS.reduce((sum, key) => sum + metrics[key], 0) /
    VOCAL_METRIC_KEYS.length
  );
}

function percentChange(current: number, base: number): number {
  if (base === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - base) / base) * 100);
}

/**
 * Sprint 9 "Baseline Comparison": compares every future session against
 * Original Baseline, Latest Session, Best Session, and Rolling 30-day
 * Average — all four reference points feed the result, not just baseline
 * vs. latest. Pure compute (no AI call); the Gateway's
 * generateProgressInsights() only narrates these already-final numbers.
 */
export function computeBaselineComparison(
  baseline: BaselineAssessmentRecord,
  sessionInsights: AiSessionInsightRecord[],
  now: number = Date.now(),
): BaselineComparisonNumbers | null {
  if (sessionInsights.length === 0) return null;

  const latest = sessionInsights[sessionInsights.length - 1];
  const best = sessionInsights.reduce((champion, candidate) =>
    overallOf(candidate.metricsSnapshot) > overallOf(champion.metricsSnapshot)
      ? candidate
      : champion,
  );
  const rollingWindow = sessionInsights.filter(
    (insight) => insight.createdAt >= now - ROLLING_WINDOW_MS,
  );
  const rollingSet = rollingWindow.length > 0 ? rollingWindow : sessionInsights;
  const rollingOverallAvg =
    rollingSet.reduce(
      (sum, insight) => sum + overallOf(insight.metricsSnapshot),
      0,
    ) / rollingSet.length;

  const baselineOverall = overallOf(baseline.metrics);
  const latestOverall = overallOf(latest.metricsSnapshot);
  const bestOverall = overallOf(best.metricsSnapshot);

  let trend: BaselineComparisonNumbers["trend"] = "steady";
  if (latestOverall >= bestOverall) {
    // A new personal best is unambiguous progress regardless of rolling-average noise.
    trend = "improving";
  } else if (latestOverall > rollingOverallAvg + TREND_MARGIN) {
    trend = "improving";
  } else if (latestOverall < rollingOverallAvg - TREND_MARGIN) {
    trend = "declining";
  }

  return {
    progressPercent: percentChange(latestOverall, baselineOverall),
    pitchImprovement: percentChange(
      latest.metricsSnapshot.pitchAccuracy,
      baseline.metrics.pitchAccuracy,
    ),
    rhythmImprovement: percentChange(
      latest.metricsSnapshot.rhythm,
      baseline.metrics.rhythm,
    ),
    confidenceImprovement: percentChange(
      latest.metricsSnapshot.confidence,
      baseline.metrics.confidence,
    ),
    consistencyImprovement: percentChange(
      latest.metricsSnapshot.consistency,
      baseline.metrics.consistency,
    ),
    rangeImprovement: percentChange(
      latest.metricsSnapshot.vocalRange,
      baseline.metrics.vocalRange,
    ),
    trend,
  };
}
