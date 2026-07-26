import { describe, expect, it } from "vitest";
import { createMockProvider } from "./mock-provider";
import type { AiUserContext } from "../schemas/ai-user-context";
import { AiUserContextSchema } from "../schemas/ai-user-context";
import {
  BaselineAssessmentGenerationSchema,
  CoachReplyGenerationSchema,
  DashboardInsightGenerationSchema,
  ProgressInsightGenerationSchema,
  RecommendationGenerationSchema,
  SessionInsightGenerationSchema,
  WeeklySummaryGenerationSchema,
} from "../schemas/generation-outputs";

function emptyContext(overrides: Partial<AiUserContext> = {}): AiUserContext {
  return AiUserContextSchema.parse({
    profile: {
      displayName: null,
      age: null,
      activeSkillId: null,
      onboardingCompletedAt: null,
    },
    streak: { current: 0, longest: 0, lastPracticeDate: null },
    statistics: { last30Days: [] },
    recentSessions: [],
    recentRecordings: [],
    achievements: [],
    goals: [],
    coachHistory: [],
    recommendations: [],
    exerciseDistribution: [],
    baseline: null,
    ...overrides,
  });
}

describe("createMockProvider", () => {
  const provider = createMockProvider();

  it("is named 'mock'", () => {
    expect(provider.name).toBe("mock");
  });

  it("generateAssessment produces schema-valid output", async () => {
    const result = await provider.generateAssessment({
      context: emptyContext(),
      recordingDurationMs: 12000,
    });
    expect(BaselineAssessmentGenerationSchema.safeParse(result).success).toBe(
      true,
    );
  });

  it("generateAssessment is deterministic for the same input", async () => {
    const context = emptyContext({
      profile: {
        displayName: "Alex",
        age: 30,
        activeSkillId: null,
        onboardingCompletedAt: null,
      },
    });
    const first = await provider.generateAssessment({
      context,
      recordingDurationMs: 12000,
    });
    const second = await provider.generateAssessment({
      context,
      recordingDurationMs: 12000,
    });
    expect(first).toEqual(second);
  });

  it("generateAssessment varies with different input", async () => {
    const first = await provider.generateAssessment({
      context: emptyContext(),
      recordingDurationMs: 12000,
    });
    const second = await provider.generateAssessment({
      context: emptyContext(),
      recordingDurationMs: 9000,
    });
    expect(first).not.toEqual(second);
  });

  it("never mentions a display name when the profile has none", async () => {
    const result = await provider.generateAssessment({
      context: emptyContext(),
      recordingDurationMs: 12000,
    });
    expect(result.motivationalSummary).not.toMatch(/undefined|null/i);
  });

  it("generateSessionSummary produces schema-valid output", async () => {
    const result = await provider.generateSessionSummary({
      context: emptyContext(),
      session: {
        sessionId: "s-1",
        elapsedSeconds: 600,
        exercisesCompleted: 3,
        dailyScore: 80,
      },
    });
    expect(SessionInsightGenerationSchema.safeParse(result).success).toBe(true);
  });

  it("generateDashboardInsight produces schema-valid output and reflects a real streak", async () => {
    const result = await provider.generateDashboardInsight({
      context: emptyContext({
        streak: { current: 5, longest: 5, lastPracticeDate: "2026-07-25" },
      }),
    });
    expect(DashboardInsightGenerationSchema.safeParse(result).success).toBe(
      true,
    );
    expect(result.dailyInsight).toContain("5-day streak");
  });

  it("generateDashboardInsight offers recovery advice only after a lapsed streak", async () => {
    const result = await provider.generateDashboardInsight({
      context: emptyContext({
        streak: { current: 0, longest: 5, lastPracticeDate: "2026-07-20" },
      }),
    });
    expect(result.recoveryAdvice).not.toBeNull();
  });

  it("generateCoachReply produces schema-valid output", async () => {
    const result = await provider.generateCoachReply({
      context: emptyContext(),
      message: "How do I improve my breath control?",
    });
    expect(CoachReplyGenerationSchema.safeParse(result).success).toBe(true);
  });

  it("generateProgressInsights narrates the given numbers without altering them", async () => {
    const comparison = {
      progressPercent: 12,
      pitchImprovement: 5,
      rhythmImprovement: 8,
      confidenceImprovement: 10,
      consistencyImprovement: 3,
      rangeImprovement: 1,
      trend: "improving" as const,
    };
    const result = await provider.generateProgressInsights({
      context: emptyContext(),
      comparison,
    });
    expect(ProgressInsightGenerationSchema.safeParse(result).success).toBe(
      true,
    );
    expect(result.progressPercent).toBe(12);
    expect(result.trend).toBe("improving");
  });

  it("generateRecommendation produces schema-valid output", async () => {
    const result = await provider.generateRecommendation({
      context: emptyContext(),
    });
    expect(RecommendationGenerationSchema.safeParse(result).success).toBe(true);
  });

  it("generateRecommendation prioritizes recovery after a lapsed streak", async () => {
    const result = await provider.generateRecommendation({
      context: emptyContext({
        streak: { current: 0, longest: 5, lastPracticeDate: "2026-07-20" },
      }),
    });
    expect(result.category).toBe("recovery");
  });

  it("generateWeeklySummary produces schema-valid output", async () => {
    const result = await provider.generateWeeklySummary({
      context: emptyContext(),
    });
    expect(WeeklySummaryGenerationSchema.safeParse(result).success).toBe(true);
  });
});
