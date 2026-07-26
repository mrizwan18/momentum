import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateSessionSummary = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateSessionSummary }),
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

const session = {
  sessionId: "session-1",
  elapsedSeconds: 600,
  exercisesCompleted: 3,
  dailyScore: 80,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai/session-summary", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/session-summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateSessionSummary.mockResolvedValue({
      data: { bestMoment: "The song" },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({ context: emptyContext, session }),
    );

    expect(response.status).toBe(200);
    expect(generateSessionSummary).toHaveBeenCalledWith(
      expect.objectContaining({ session }),
      "session-1",
    );
  });

  it("forwards a valid audio array, each labeled by exercise, to the gateway", async () => {
    generateSessionSummary.mockResolvedValue({
      data: { bestMoment: "The song" },
      provider: "openai",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    await POST(
      makeRequest({
        context: emptyContext,
        session,
        audio: [
          {
            base64: "abc",
            format: "wav",
            durationSeconds: 30,
            truncated: false,
            exerciseLabel: "Alaap",
          },
        ],
      }),
    );

    expect(generateSessionSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: [expect.objectContaining({ exerciseLabel: "Alaap" })],
      }),
      "session-1",
    );
  });

  it("rejects an invalid body", async () => {
    const response = await POST(makeRequest({ context: emptyContext }));
    expect(response.status).toBe(400);
    expect(generateSessionSummary).not.toHaveBeenCalled();
  });

  it("returns 503 when AI is unavailable", async () => {
    generateSessionSummary.mockRejectedValue(new AiUnavailableError("down"));
    const response = await POST(
      makeRequest({ context: emptyContext, session }),
    );
    expect(response.status).toBe(503);
  });
});
