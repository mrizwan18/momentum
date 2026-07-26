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
import {
  AiUnavailableError,
  type AiAudioPart,
  type AiProvider,
} from "../types";
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
    console.log("[ai][openai] skipped: OPENAI_API_KEY is not configured");
    throw new AiUnavailableError("OPENAI_API_KEY is not configured");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // Debugging aid (Sprint 9 rollout) — logs to Vercel's function logs so
  // the actual outbound request/response is visible without depending on
  // OpenAI's own request-logging setting. Remove once the integration is
  // confirmed working end-to-end.
  console.log(
    `[ai][openai] sending request: model="${model}" promptLength=${prompt.length}`,
  );
  console.log(`[ai][openai] prompt:\n${prompt}`);

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
    console.log(
      `[ai][openai] fetch threw: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new AiUnavailableError(
      `OpenAI request failed to send: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  console.log(`[ai][openai] response status: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.log(`[ai][openai] error body: ${errorBody}`);
    throw new AiUnavailableError(
      `OpenAI request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  console.log(`[ai][openai] response content:\n${content ?? "(missing)"}`);
  if (typeof content !== "string") {
    throw new AiUnavailableError("OpenAI response missing message content");
  }
  return extractJson(content);
}

/**
 * Real audio analysis path — used only when the caller attached actual
 * recorded audio (see AiAudioPart). Uses OPENAI_AUDIO_MODEL (an
 * audio-input-capable chat model, e.g. gpt-4o-audio-preview) rather than
 * OPENAI_MODEL, since a text-only model can't accept `input_audio` content.
 * Deliberately does NOT request `response_format: json_object` — that mode's
 * compatibility with audio input isn't documented/guaranteed, so this relies
 * purely on the prompt's own "respond with ONLY valid JSON" instruction plus
 * extractJson's fence-stripping, exactly like the Gemini/Ollama providers.
 */
async function chatJsonWithAudio(
  promptText: string,
  audioParts: AiAudioPart[],
): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[ai][openai] skipped: OPENAI_API_KEY is not configured");
    throw new AiUnavailableError("OPENAI_API_KEY is not configured");
  }
  const model = process.env.OPENAI_AUDIO_MODEL ?? "gpt-4o-audio-preview";

  console.log(
    `[ai][openai] sending audio request: model="${model}" promptLength=${promptText.length} audioParts=${audioParts.length}`,
  );
  console.log(`[ai][openai] prompt:\n${promptText}`);

  const content: Array<Record<string, unknown>> = [
    { type: "text", text: promptText },
    ...audioParts.map((part) => ({
      type: "input_audio",
      input_audio: { data: part.base64, format: part.format },
    })),
  ];

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
        modalities: ["text"],
        messages: [{ role: "user", content }],
        temperature: 0.7,
      }),
    });
  } catch (error) {
    console.log(
      `[ai][openai] audio fetch threw: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new AiUnavailableError(
      `OpenAI audio request failed to send: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  console.log(`[ai][openai] audio response status: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.log(`[ai][openai] audio error body: ${errorBody}`);
    throw new AiUnavailableError(
      `OpenAI audio request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const messageContent = payload.choices?.[0]?.message?.content;
  console.log(
    `[ai][openai] audio response content:\n${messageContent ?? "(missing)"}`,
  );
  if (typeof messageContent !== "string") {
    throw new AiUnavailableError("OpenAI response missing message content");
  }
  return extractJson(messageContent);
}

export function createOpenAiProvider(): AiProvider {
  return {
    name: "openai",
    async generateAssessment(input) {
      const prompt = buildAssessmentPrompt(input);
      const raw =
        input.audio && input.audio.length > 0
          ? await chatJsonWithAudio(prompt, input.audio)
          : await chatJson(prompt);
      return raw as Awaited<ReturnType<AiProvider["generateAssessment"]>>;
    },
    async generateSessionSummary(input) {
      const prompt = buildSessionSummaryPrompt(input);
      const raw =
        input.audio && input.audio.length > 0
          ? await chatJsonWithAudio(prompt, input.audio)
          : await chatJson(prompt);
      return raw as Awaited<ReturnType<AiProvider["generateSessionSummary"]>>;
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
