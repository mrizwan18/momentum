import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateCoachReply = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateCoachReply }),
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
  return new NextRequest("http://localhost/api/ai/coach-reply", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/coach-reply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateCoachReply.mockResolvedValue({
      data: { message: "Keep going!" },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({ context: emptyContext, message: "How do I improve?" }),
    );

    expect(response.status).toBe(200);
    expect(generateCoachReply).toHaveBeenCalledWith({
      context: emptyContext,
      message: "How do I improve?",
    });
  });

  it("rejects an empty message", async () => {
    const response = await POST(
      makeRequest({ context: emptyContext, message: "" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when AI is unavailable", async () => {
    generateCoachReply.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(
      makeRequest({ context: emptyContext, message: "Hi" }),
    );
    expect(response.status).toBe(503);
  });
});
