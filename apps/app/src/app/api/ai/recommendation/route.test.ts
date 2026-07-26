import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateRecommendation = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateRecommendation }),
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

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai/recommendation", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/recommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateRecommendation.mockResolvedValue({
      data: { title: "Practice scales" },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(makeRequest({ context: emptyContext }));

    expect(response.status).toBe(200);
    expect(generateRecommendation).toHaveBeenCalledWith({
      context: emptyContext,
    });
  });

  it("rejects a missing context", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns 503 when AI is unavailable", async () => {
    generateRecommendation.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(makeRequest({ context: emptyContext }));
    expect(response.status).toBe(503);
  });
});
