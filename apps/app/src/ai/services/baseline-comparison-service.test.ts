import { describe, expect, it } from "vitest";
import { computeBaselineComparison } from "./baseline-comparison-service";
import type {
  AiSessionInsightRecord,
  BaselineAssessmentRecord,
  VocalMetrics,
} from "@momentum/types";

function metrics(base: number): VocalMetrics {
  return {
    pitchAccuracy: base,
    pitchStability: base,
    rhythm: base,
    breathControl: base,
    toneQuality: base,
    consistency: base,
    vocalRange: base,
    confidence: base,
    timing: base,
    voiceClarity: base,
    pronunciation: base,
    energy: base,
  };
}

function baseline(overallScore: number): BaselineAssessmentRecord {
  return {
    id: "baseline-1",
    recordingId: "recording-1",
    overallScore,
    metrics: metrics(overallScore),
    strengths: ["Tone"],
    areasToImprove: ["Pitch"],
    recommendedDailyPractice: "Scales",
    recommendedDurationMinutes: 15,
    suggestedSkillLevel: "beginner",
    difficulty: "easy",
    motivationalSummary: "Great start!",
    provider: "mock",
    createdAt: 0,
  };
}

function insight(
  score: number,
  createdAt: number,
  sessionId = `s-${score}-${createdAt}`,
): AiSessionInsightRecord {
  return {
    id: sessionId,
    sessionId,
    whatImproved: [],
    whatDeclined: [],
    bestMoment: "x",
    biggestOpportunity: "x",
    tomorrowsGoal: "x",
    encouragingSentence: "x",
    metricsSnapshot: metrics(score),
    provider: "mock",
    createdAt,
  };
}

const NOW = Date.UTC(2026, 6, 26);
const DAY = 24 * 60 * 60 * 1000;

describe("computeBaselineComparison", () => {
  it("returns null with no session insights yet", () => {
    expect(computeBaselineComparison(baseline(50), [], NOW)).toBeNull();
  });

  it("computes positive improvement percentages when the latest session beats the baseline", () => {
    const result = computeBaselineComparison(
      baseline(50),
      [insight(60, NOW - DAY)],
      NOW,
    );
    expect(result?.progressPercent).toBe(20);
    expect(result?.pitchImprovement).toBe(20);
  });

  it("computes negative improvement percentages when the latest session is worse", () => {
    const result = computeBaselineComparison(
      baseline(80),
      [insight(40, NOW - DAY)],
      NOW,
    );
    expect(result?.progressPercent).toBe(-50);
  });

  it("marks trend as improving when the latest session is a new personal best", () => {
    const result = computeBaselineComparison(
      baseline(50),
      [insight(55, NOW - 10 * DAY), insight(60, NOW - DAY)],
      NOW,
    );
    expect(result?.trend).toBe("improving");
  });

  it("marks trend as declining when the latest session falls well below the rolling average", () => {
    const result = computeBaselineComparison(
      baseline(50),
      [
        insight(80, NOW - 20 * DAY),
        insight(75, NOW - 15 * DAY),
        insight(40, NOW - DAY),
      ],
      NOW,
    );
    expect(result?.trend).toBe("declining");
  });

  it("marks trend as steady when the latest session is close to the rolling average", () => {
    const result = computeBaselineComparison(
      baseline(50),
      [
        insight(60, NOW - 20 * DAY),
        insight(61, NOW - 10 * DAY),
        insight(60, NOW - DAY),
      ],
      NOW,
    );
    expect(result?.trend).toBe("steady");
  });

  it("excludes insights older than 30 days from the rolling average", () => {
    const withOld = computeBaselineComparison(
      baseline(50),
      [insight(20, NOW - 60 * DAY), insight(60, NOW - DAY)],
      NOW,
    );
    // The 60-day-old low score should be excluded from the rolling window,
    // so the recent session still reads as a personal best / improving.
    expect(withOld?.trend).toBe("improving");
  });

  it("falls back to using all insights for the rolling average when none are within 30 days", () => {
    const result = computeBaselineComparison(
      baseline(50),
      [insight(60, NOW - 60 * DAY)],
      NOW,
    );
    expect(result).not.toBeNull();
    expect(result?.progressPercent).toBe(20);
  });
});
