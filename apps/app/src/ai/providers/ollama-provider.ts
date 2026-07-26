import "server-only";

import {
  buildAssessmentPrompt,
  buildCoachPrompt,
  buildDashboardInsightPrompt,
  buildProgressComparisonPrompt,
  buildRecommendationPrompt,
  buildSessionSummaryPrompt,
  buildWeeklyReportPrompt,
} from "../prompts";
import { AiUnavailableError, type AiProvider } from "../types";
import { extractJson } from "./parse-json-response";

/**
 * Real Ollama (self-hosted) integration via its /api/generate endpoint with
 * `format: "json"`. No API key — just a reachable base URL, which makes
 * this the one "real" provider that could plausibly be reached from a
 * sandboxed/offline-friendly dev machine running Ollama locally, though it
 * was not available to verify in this environment either.
 */
async function generateJson(prompt: string): Promise<unknown> {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  if (!baseUrl) {
    throw new AiUnavailableError("OLLAMA_BASE_URL is not configured");
  }
  const model = process.env.OLLAMA_MODEL ?? "llama3.1";

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, prompt, format: "json", stream: false }),
    });
  } catch (error) {
    throw new AiUnavailableError(
      `Ollama request failed to send: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new AiUnavailableError(
      `Ollama request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as { response?: string };
  if (typeof payload.response !== "string") {
    throw new AiUnavailableError("Ollama response missing text");
  }
  return extractJson(payload.response);
}

export function createOllamaProvider(): AiProvider {
  return {
    name: "ollama",
    async generateAssessment(input) {
      return (await generateJson(buildAssessmentPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateAssessment"]>
      >;
    },
    async generateSessionSummary(input) {
      return (await generateJson(buildSessionSummaryPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateSessionSummary"]>
      >;
    },
    async generateDashboardInsight(input) {
      return (await generateJson(
        buildDashboardInsightPrompt(input),
      )) as Awaited<ReturnType<AiProvider["generateDashboardInsight"]>>;
    },
    async generateCoachReply(input) {
      return (await generateJson(buildCoachPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateCoachReply"]>
      >;
    },
    async generateProgressInsights(input) {
      return (await generateJson(
        buildProgressComparisonPrompt(input),
      )) as Awaited<ReturnType<AiProvider["generateProgressInsights"]>>;
    },
    async generateRecommendation(input) {
      return (await generateJson(buildRecommendationPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateRecommendation"]>
      >;
    },
    async generateWeeklySummary(input) {
      return (await generateJson(buildWeeklyReportPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateWeeklySummary"]>
      >;
    },
  };
}
