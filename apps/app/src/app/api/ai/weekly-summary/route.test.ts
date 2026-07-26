import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateWeeklySummary = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateWeeklySummary }),
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
  return new NextRequest("http://localhost/api/ai/weekly-summary", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/weekly-summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateWeeklySummary.mockResolvedValue({
      data: { headline: "Great week" },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({ context: emptyContext, weekKey: "2026-W30" }),
    );

    expect(response.status).toBe(200);
    expect(generateWeeklySummary).toHaveBeenCalledWith(
      { context: emptyContext },
      "2026-W30",
    );
  });

  it("rejects a missing weekKey", async () => {
    const response = await POST(makeRequest({ context: emptyContext }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when AI is unavailable", async () => {
    generateWeeklySummary.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(
      makeRequest({ context: emptyContext, weekKey: "2026-W30" }),
    );
    expect(response.status).toBe(503);
  });
});
