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
 * Real OpenAI Chat Completions integration (JSON mode). Correctly coded
 * against OpenAI's documented API contract, but not verifiable end-to-end
 * in this sandbox (no OPENAI_API_KEY, no outbound network) — the Gateway
 * validates whatever comes back against the same Zod schemas either way,
 * so an unexpected shape fails safely rather than corrupting stored data.
 */
async function chatJson(prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiUnavailableError("OPENAI_API_KEY is not configured");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });
  } catch (error) {
    throw new AiUnavailableError(
      `OpenAI request failed to send: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new AiUnavailableError(
      `OpenAI request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new AiUnavailableError("OpenAI response missing message content");
  }
  return extractJson(content);
}

export function createOpenAiProvider(): AiProvider {
  return {
    name: "openai",
    async generateAssessment(input) {
      return (await chatJson(buildAssessmentPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateAssessment"]>
      >;
    },
    async generateSessionSummary(input) {
      return (await chatJson(buildSessionSummaryPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateSessionSummary"]>
      >;
    },
    async generateDashboardInsight(input) {
      return (await chatJson(buildDashboardInsightPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateDashboardInsight"]>
      >;
    },
    async generateCoachReply(input) {
      return (await chatJson(buildCoachPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateCoachReply"]>
      >;
    },
    async generateProgressInsights(input) {
      return (await chatJson(buildProgressComparisonPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateProgressInsights"]>
      >;
    },
    async generateRecommendation(input) {
      return (await chatJson(buildRecommendationPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateRecommendation"]>
      >;
    },
    async generateWeeklySummary(input) {
      return (await chatJson(buildWeeklyReportPrompt(input))) as Awaited<
        ReturnType<AiProvider["generateWeeklySummary"]>
      >;
    },
  };
}
