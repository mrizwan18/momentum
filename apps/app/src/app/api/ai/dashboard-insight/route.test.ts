import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateDashboardInsight = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateDashboardInsight }),
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
  return new NextRequest("http://localhost/api/ai/dashboard-insight", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/dashboard-insight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateDashboardInsight.mockResolvedValue({
      data: { todaysFocus: "Breathing" },
      provider: "mock",
      fallback: false,
      cached: true,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({ context: emptyContext, date: "2026-07-26" }),
    );

    expect(response.status).toBe(200);
    expect(generateDashboardInsight).toHaveBeenCalledWith(
      expect.objectContaining({ context: emptyContext }),
      "2026-07-26",
    );
  });

  it("rejects an invalid body", async () => {
    const response = await POST(makeRequest({ context: emptyContext }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when AI is unavailable", async () => {
    generateDashboardInsight.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(
      makeRequest({ context: emptyContext, date: "2026-07-26" }),
    );
    expect(response.status).toBe(503);
  });
});
