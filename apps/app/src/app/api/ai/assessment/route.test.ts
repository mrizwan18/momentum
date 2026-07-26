import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AiUnavailableError } from "@/ai/types";

const generateAssessment = vi.fn();
vi.mock("@/ai/gateway", () => ({
  getDefaultAiGateway: () => ({ generateAssessment }),
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
  return new NextRequest("http://localhost/api/ai/assessment", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/ai/assessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the gateway's result for a valid request", async () => {
    generateAssessment.mockResolvedValue({
      data: { overallScore: 72 },
      provider: "mock",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    const response = await POST(
      makeRequest({
        context: emptyContext,
        recordingId: "recording-1",
        recordingDurationMs: 12000,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ provider: "mock" });
    expect(generateAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ recordingDurationMs: 12000 }),
      "recording-1",
    );
  });

  it("forwards a valid audio array to the gateway", async () => {
    generateAssessment.mockResolvedValue({
      data: { overallScore: 72 },
      provider: "openai",
      fallback: false,
      cached: false,
      generatedAt: 123,
    });

    await POST(
      makeRequest({
        context: emptyContext,
        recordingId: "recording-1",
        recordingDurationMs: 12000,
        audio: [
          {
            base64: "abc",
            format: "wav",
            durationSeconds: 12,
            truncated: false,
          },
        ],
      }),
    );

    expect(generateAssessment).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: [expect.objectContaining({ base64: "abc", format: "wav" })],
      }),
      "recording-1",
    );
  });

  it("rejects an audio entry with an unsupported format", async () => {
    const response = await POST(
      makeRequest({
        context: emptyContext,
        recordingId: "recording-1",
        recordingDurationMs: 12000,
        audio: [
          {
            base64: "abc",
            format: "mp3",
            durationSeconds: 12,
            truncated: false,
          },
        ],
      }),
    );
    expect(response.status).toBe(400);
    expect(generateAssessment).not.toHaveBeenCalled();
  });

  it("rejects an invalid body", async () => {
    const response = await POST(makeRequest({ context: emptyContext }));
    expect(response.status).toBe(400);
    expect(generateAssessment).not.toHaveBeenCalled();
  });

  it("returns 503 when AI is unavailable", async () => {
    generateAssessment.mockRejectedValue(
      new AiUnavailableError("no provider configured"),
    );

    const response = await POST(
      makeRequest({
        context: emptyContext,
        recordingId: "recording-1",
        recordingDurationMs: 12000,
      }),
    );

    expect(response.status).toBe(503);
  });
});
