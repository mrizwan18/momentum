import "server-only";

import type { ZodType } from "zod";
import { buildCacheKey, type AiResponseCache } from "../cache/response-cache";
import { createMockProvider } from "../providers/mock-provider";
import {
  BaselineAssessmentGenerationSchema,
  CoachReplyGenerationSchema,
  DashboardInsightGenerationSchema,
  ProgressInsightGenerationSchema,
  RecommendationGenerationSchema,
  SessionInsightGenerationSchema,
  WeeklySummaryGenerationSchema,
  type BaselineAssessmentGeneration,
  type CoachReplyGeneration,
  type DashboardInsightGeneration,
  type ProgressInsightGeneration,
  type RecommendationGeneration,
  type SessionInsightGeneration,
  type WeeklySummaryGeneration,
} from "../schemas/generation-outputs";
import {
  AiUnavailableError,
  type AiOperationResult,
  type AiProvider,
  type GenerateAssessmentInput,
  type GenerateCoachReplyInput,
  type GenerateDashboardInsightInput,
  type GenerateProgressInsightsInput,
  type GenerateRecommendationInput,
  type GenerateSessionInsightInput,
  type GenerateWeeklySummaryInput,
} from "../types";

export interface AiGatewayDeps {
  provider: AiProvider;
  cache: AiResponseCache;
}

const DAY_SECONDS = 24 * 60 * 60;

interface RunOperationInput<T> {
  operation: string;
  cacheIdentity: string | null;
  cacheTtlSeconds: number;
  schema: ZodType<T>;
  call: (provider: AiProvider) => Promise<unknown>;
}

/**
 * The single entry point every feature goes through (Sprint 9: "Every AI
 * interaction must flow through AI Gateway. No feature may call OpenAI
 * directly."). Handles caching, Zod validation of the provider's raw
 * output, and graceful recovery: an invalid or failed call from the
 * configured provider falls back to the deterministic Mock provider so the
 * caller always gets a real, schema-valid response — never a crash, and
 * never silently made up on the client.
 */
export function createAiGateway({ provider, cache }: AiGatewayDeps) {
  async function runOperation<T>({
    operation,
    cacheIdentity,
    cacheTtlSeconds,
    schema,
    call,
  }: RunOperationInput<T>): Promise<AiOperationResult<T>> {
    const cacheKey = cacheIdentity
      ? buildCacheKey(operation, cacheIdentity)
      : null;

    if (cacheKey) {
      const cached = await cache.get<AiOperationResult<T>>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    async function attempt(
      candidate: AiProvider,
      fallback: boolean,
    ): Promise<AiOperationResult<T> | null> {
      try {
        const raw = await call(candidate);
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return null;
        return {
          data: parsed.data,
          provider: candidate.name,
          fallback,
          cached: false,
          generatedAt: Date.now(),
        };
      } catch {
        return null;
      }
    }

    let result = await attempt(provider, false);
    if (!result && provider.name !== "mock") {
      result = await attempt(createMockProvider(), true);
    }

    if (!result) {
      throw new AiUnavailableError(
        `${operation} failed on both the configured provider (${provider.name}) and the mock fallback`,
      );
    }

    if (cacheKey) {
      await cache.set(cacheKey, result, cacheTtlSeconds);
    }

    return result;
  }

  return {
    /** Cached by recordingId — Sprint 9: "Avoid repeated analysis of the same recording." */
    generateAssessment(
      input: GenerateAssessmentInput,
      recordingId: string,
    ): Promise<AiOperationResult<BaselineAssessmentGeneration>> {
      return runOperation({
        operation: "generateAssessment",
        cacheIdentity: recordingId,
        cacheTtlSeconds: 30 * DAY_SECONDS,
        schema: BaselineAssessmentGenerationSchema,
        call: (p) => p.generateAssessment(input),
      });
    },

    /** Cached by sessionId — a completed session's content never changes. */
    generateSessionSummary(
      input: GenerateSessionInsightInput,
      sessionId: string,
    ): Promise<AiOperationResult<SessionInsightGeneration>> {
      return runOperation({
        operation: "generateSessionSummary",
        cacheIdentity: sessionId,
        cacheTtlSeconds: 30 * DAY_SECONDS,
        schema: SessionInsightGenerationSchema,
        call: (p) => p.generateSessionSummary(input),
      });
    },

    /** Cached by date — refreshed at most once per day, never regenerated on every render. */
    generateDashboardInsight(
      input: GenerateDashboardInsightInput,
      date: string,
    ): Promise<AiOperationResult<DashboardInsightGeneration>> {
      return runOperation({
        operation: "generateDashboardInsight",
        cacheIdentity: date,
        cacheTtlSeconds: DAY_SECONDS,
        schema: DashboardInsightGenerationSchema,
        call: (p) => p.generateDashboardInsight(input),
      });
    },

    /** Never cached — every question is a fresh conversational turn. */
    generateCoachReply(
      input: GenerateCoachReplyInput,
    ): Promise<AiOperationResult<CoachReplyGeneration>> {
      return runOperation({
        operation: "generateCoachReply",
        cacheIdentity: null,
        cacheTtlSeconds: 0,
        schema: CoachReplyGenerationSchema,
        call: (p) => p.generateCoachReply(input),
      });
    },

    /** Never cached — the underlying numbers are already deterministic; only the narration is regenerated. */
    generateProgressInsights(
      input: GenerateProgressInsightsInput,
    ): Promise<AiOperationResult<ProgressInsightGeneration>> {
      return runOperation({
        operation: "generateProgressInsights",
        cacheIdentity: null,
        cacheTtlSeconds: 0,
        schema: ProgressInsightGenerationSchema,
        call: (p) => p.generateProgressInsights(input),
      });
    },

    /** Never cached — recommendations should feel timely to the user's current state. */
    generateRecommendation(
      input: GenerateRecommendationInput,
    ): Promise<AiOperationResult<RecommendationGeneration>> {
      return runOperation({
        operation: "generateRecommendation",
        cacheIdentity: null,
        cacheTtlSeconds: 0,
        schema: RecommendationGenerationSchema,
        call: (p) => p.generateRecommendation(input),
      });
    },

    /** Cached by week key — a given week's report doesn't need to be regenerated on every visit. */
    generateWeeklySummary(
      input: GenerateWeeklySummaryInput,
      weekKey: string,
    ): Promise<AiOperationResult<WeeklySummaryGeneration>> {
      return runOperation({
        operation: "generateWeeklySummary",
        cacheIdentity: weekKey,
        cacheTtlSeconds: 7 * DAY_SECONDS,
        schema: WeeklySummaryGenerationSchema,
        call: (p) => p.generateWeeklySummary(input),
      });
    },
  };
}

export type AiGateway = ReturnType<typeof createAiGateway>;
