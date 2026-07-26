import { describe, expect, it, vi } from "vitest";
import { createAiGateway } from "./ai-gateway";
import { createMemoryResponseCache } from "../cache/response-cache";
import type { AiProvider } from "../types";

function fakeContext() {
  return {
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
  } as never;
}

function makeProvider(
  name: string,
  overrides: Partial<AiProvider> = {},
): AiProvider {
  const stub = async () => ({ overallScore: 1 }) as never;
  return {
    name: name as AiProvider["name"],
    generateAssessment: stub,
    generateSessionSummary: stub,
    generateDashboardInsight: stub,
    generateCoachReply: stub,
    generateProgressInsights: stub,
    generateRecommendation: stub,
    generateWeeklySummary: stub,
    ...overrides,
  };
}

describe("createAiGateway", () => {
  it("returns validated data from the configured provider on success", async () => {
    const provider = makeProvider("openai", {
      generateRecommendation: async () => ({
        title: "Practice scales",
        reason: "Builds pitch accuracy",
        category: "weakest_habit",
        priority: 1,
        expectedDurationSeconds: 300,
        xpReward: 50,
        completionCriteria: "Complete one exercise",
      }),
    });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    const result = await gateway.generateRecommendation({
      context: fakeContext(),
    });

    expect(result.provider).toBe("openai");
    expect(result.fallback).toBe(false);
    expect(result.data.title).toBe("Practice scales");
  });

  it("caches by identity so a second call doesn't hit the provider again", async () => {
    const generateAssessment = vi.fn().mockResolvedValue({
      overallScore: 70,
      metrics: {
        pitchAccuracy: 70,
        pitchStability: 70,
        rhythm: 70,
        breathControl: 70,
        toneQuality: 70,
        consistency: 70,
        vocalRange: 70,
        confidence: 70,
        timing: 70,
        voiceClarity: 70,
        pronunciation: 70,
        energy: 70,
      },
      strengths: ["Good tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Practice scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Nice start!",
    });
    const provider = makeProvider("openai", { generateAssessment });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    const input = { context: fakeContext(), recordingDurationMs: 12000 };
    const first = await gateway.generateAssessment(input, "recording-1");
    const second = await gateway.generateAssessment(input, "recording-1");

    expect(generateAssessment).toHaveBeenCalledTimes(1);
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.data).toEqual(first.data);
  });

  it("does not share the cache across different identities", async () => {
    const generateAssessment = vi.fn().mockResolvedValue({
      overallScore: 70,
      metrics: {
        pitchAccuracy: 70,
        pitchStability: 70,
        rhythm: 70,
        breathControl: 70,
        toneQuality: 70,
        consistency: 70,
        vocalRange: 70,
        confidence: 70,
        timing: 70,
        voiceClarity: 70,
        pronunciation: 70,
        energy: 70,
      },
      strengths: ["Good tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Practice scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Nice start!",
    });
    const provider = makeProvider("openai", { generateAssessment });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    const input = { context: fakeContext(), recordingDurationMs: 12000 };
    await gateway.generateAssessment(input, "recording-1");
    await gateway.generateAssessment(input, "recording-2");

    expect(generateAssessment).toHaveBeenCalledTimes(2);
  });

  it("falls back to the mock provider when the configured provider throws", async () => {
    const provider = makeProvider("openai", {
      generateDashboardInsight: async () => {
        throw new Error("network down");
      },
    });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    const result = await gateway.generateDashboardInsight(
      { context: fakeContext() },
      "2026-07-26",
    );

    expect(result.provider).toBe("mock");
    expect(result.fallback).toBe(true);
  });

  it("falls back to the mock provider when the configured provider returns invalid shape", async () => {
    const provider = makeProvider("openai", {
      generateDashboardInsight: async () => ({ garbage: true }) as never,
    });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    const result = await gateway.generateDashboardInsight(
      { context: fakeContext() },
      "2026-07-26",
    );

    expect(result.provider).toBe("mock");
    expect(result.fallback).toBe(true);
  });

  it("throws AiUnavailableError if even the mock provider fails validation", async () => {
    const provider = makeProvider("mock", {
      generateDashboardInsight: async () => ({ garbage: true }) as never,
    });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    await expect(
      gateway.generateDashboardInsight(
        { context: fakeContext() },
        "2026-07-26",
      ),
    ).rejects.toThrow(/AI unavailable/);
  });

  it("never caches coach replies", async () => {
    const generateCoachReply = vi.fn().mockResolvedValue({
      message: "Keep going!",
      suggestedExercises: null,
    });
    const provider = makeProvider("openai", { generateCoachReply });
    const gateway = createAiGateway({
      provider,
      cache: createMemoryResponseCache(),
    });

    await gateway.generateCoachReply({ context: fakeContext(), message: "Hi" });
    await gateway.generateCoachReply({ context: fakeContext(), message: "Hi" });

    expect(generateCoachReply).toHaveBeenCalledTimes(2);
  });
});
