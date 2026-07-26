import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateProgressInsights = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateProgressInsights }),
}));

const { POST } = await import("./route");

const emptyContext = {
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
};

const comparison = {
  progressPercent: 10,
  pitchImprovement: 5,
  rhythmImprovement: 5,
  confidenceImprovement: 5,
  consistencyImprovement: 5,
  rangeImprovement: 5,
  trend: "improving" as const,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai/progress-insights", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/progress-insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateProgressInsights.mockResolvedValue({
      data: { ...comparison, summary: "Great progress!" },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({ context: emptyContext, comparison }),
    );

    expect(response.status).toBe(200);
    expect(generateProgressInsights).toHaveBeenCalledWith({
      context: emptyContext,
      comparison,
    });
  });

  it("rejects an invalid trend value", async () => {
    const response = await POST(
      makeRequest({
        context: emptyContext,
        comparison: { ...comparison, trend: "unknown" },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when AI is unavailable", async () => {
    generateProgressInsights.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(
      makeRequest({ context: emptyContext, comparison }),
    );
    expect(response.status).toBe(503);
  });
});
