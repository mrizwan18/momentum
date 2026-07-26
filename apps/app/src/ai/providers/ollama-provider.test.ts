import { afterEach, describe, expect, it, vi } from "vitest";
import type { AiUserContext } from "../schemas";
import { AiUnavailableError } from "../types";
import { createOllamaProvider } from "./ollama-provider";

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

function ollamaResponse(content: unknown) {
  return new Response(JSON.stringify({ response: JSON.stringify(content) }), {
    status: 200,
  });
}

describe("createOllamaProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws AiUnavailableError when no base URL is configured", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "");
    const provider = createOllamaProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("parses a real /api/generate response", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        ollamaResponse({
          category: "pitch",
          title: "Practice scales",
          priority: 1,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOllamaProvider();
    const result = await provider.generateRecommendation({ context });

    expect(result).toEqual({
      category: "pitch",
      title: "Practice scales",
      priority: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("strips a trailing slash from the configured base URL", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434/");
    const fetchMock = vi.fn().mockResolvedValue(ollamaResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOllamaProvider();
    await provider.generateRecommendation({ context });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.anything(),
    );
  });

  it("throws AiUnavailableError on a non-ok response", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    const provider = createOllamaProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the network request itself fails", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const provider = createOllamaProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("throws AiUnavailableError when the response is missing text", async () => {
    vi.stubEnv("OLLAMA_BASE_URL", "http://localhost:11434");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    );

    const provider = createOllamaProvider();
    await expect(
      provider.generateRecommendation({ context }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
