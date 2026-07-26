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
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
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
});
