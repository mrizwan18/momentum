import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiUserContext } from "../schemas";
import { AiUnavailableError } from "../types";
import { createGeminiProvider } from "./gemini-provider";

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

function geminiResponse(content: unknown) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(content) }] } }],
    }),
    { status: 200 },
  );
}

describe("createGeminiProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws AiUnavailableError when no API key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const provider = createGeminiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("parses a real generateContent response", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        geminiResponse({
          category: "pitch",
          title: "Practice scales",
          priority: 1,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createGeminiProvider();
    const result = await provider.generateRecommendation({ context });

    expect(result).toEqual({
      category: "pitch",
      title: "Practice scales",
      priority: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("generativelanguage.googleapis.com"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws AiUnavailableError on a non-ok response", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    const provider = createGeminiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the network request itself fails", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const provider = createGeminiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the response is missing text", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
        ),
    );

    const provider = createGeminiProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
