import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiUserContext } from "../schemas";
import { AiUnavailableError } from "../types";
import { createOpenAiProvider } from "./openai-provider";

const context: AiUserContext = {
  profile: {
    displayName: "Riyaaz",
    age: 24,
    activeSkillId: "riyaaz",
    onboardingCompletedAt: 0,
  },
  streak: { current: 3, longest: 5, lastPracticeDate: "2026-07-24" },
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

function openAiResponse(content: unknown) {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
    { status: 200 },
  );
}

describe("createOpenAiProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws AiUnavailableError when no API key is configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const provider = createOpenAiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("parses a real JSON-mode chat completion response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue(
      openAiResponse({
        category: "pitch",
        title: "Practice scales",
        priority: 1,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOpenAiProvider();
    const result = await provider.generateRecommendation({ context });

    expect(result).toEqual({
      category: "pitch",
      title: "Practice scales",
      priority: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer test-key" }),
      }),
    );
  });

  it("throws AiUnavailableError on a non-ok response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    const provider = createOpenAiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the network request itself fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const provider = createOpenAiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the response is missing message content", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ choices: [] }), { status: 200 }),
        ),
    );

    const provider = createOpenAiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  describe("real audio analysis", () => {
    const audio = [
      {
        base64: "ZmFrZS13YXY=",
        format: "wav" as const,
        durationSeconds: 12,
        truncated: false,
        exerciseLabel: "Alaap — Pitch Accuracy",
      },
    ];

    it("uses the audio-capable model and sends an input_audio content part when audio is attached", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");
      const fetchMock = vi.fn().mockResolvedValue(
        openAiResponse({
          overallScore: 80,
          strengths: ["Good breath control"],
          areasToImprove: ["Pitch"],
          recommendedDailyPractice: "Scales",
          recommendedDurationMinutes: 15,
          suggestedSkillLevel: "beginner",
          difficulty: "easy",
          motivationalSummary: "Great start!",
          metrics: {
            pitchAccuracy: 80,
            pitchStability: 80,
            rhythm: 80,
            breathControl: 80,
            toneQuality: 80,
            consistency: 80,
            vocalRange: 80,
            confidence: 80,
            timing: 80,
            voiceClarity: 80,
            pronunciation: 80,
            energy: 80,
          },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const provider = createOpenAiProvider();
      await provider.generateAssessment({
        context,
        recordingDurationMs: 12000,
        audio,
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const body = JSON.parse(requestInit.body);
      expect(body.model).toBe("gpt-4o-audio-preview");
      expect(body.messages[0].content[0].type).toBe("text");
      expect(body.messages[0].content[1]).toEqual({
        type: "input_audio",
        input_audio: { data: "ZmFrZS13YXY=", format: "wav" },
      });
      // Audio input mode never requests OpenAI's json_object response format.
      expect(body.response_format).toBeUndefined();
    });

    it("falls back to the text-only path when no audio is attached", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");
      const fetchMock = vi.fn().mockResolvedValue(
        openAiResponse({
          category: "pitch",
          title: "Practice scales",
          priority: 1,
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const provider = createOpenAiProvider();
      await provider.generateSessionSummary({
        context,
        session: {
          sessionId: "s1",
          elapsedSeconds: 60,
          exercisesCompleted: 1,
          dailyScore: null,
        },
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const body = JSON.parse(requestInit.body);
      expect(body.model).toBe("gpt-4o-mini");
      expect(typeof body.messages[0].content).toBe("string");
    });

    it("throws AiUnavailableError when the audio request fails", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("", { status: 500 })),
      );

      const provider = createOpenAiProvider();
      await expect(
        provider.generateAssessment({
          context,
          recordingDurationMs: 12000,
          audio,
        }),
      ).rejects.toBeInstanceOf(AiUnavailableError);
    });
  });
});
