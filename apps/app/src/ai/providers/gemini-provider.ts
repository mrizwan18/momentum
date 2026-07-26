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
 * Real Google Gemini (generateContent) integration. Correctly coded against
 * Gemini's documented API contract, not verifiable end-to-end in this
 * sandbox (no GEMINI_API_KEY, no outbound network) — see openai-provider.ts's
 * same note; the Gateway's Zod validation is what actually protects storage.
 */
async function generateJson(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiUnavailableError("GEMINI_API_KEY is not configured");
  }
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
  } catch (error) {
    throw new AiUnavailableError(
      `Gemini request failed to send: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new AiUnavailableError(
      `Gemini request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new AiUnavailableError("Gemini response missing text");
  }
  return extractJson(text);
}

export function createGeminiProvider(): AiProvider {
  return {
    name: "gemini",
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
