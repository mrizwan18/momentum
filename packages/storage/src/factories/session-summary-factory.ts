import {
  SessionSummarySchema,
  type SessionSummaryRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateSessionSummaryInput {
  sessionId: string;
  xpEarned: number;
  overallScore?: number | null;
  momentumDelta?: number | null;
  achievementIds?: string[];
  coachMessage?: string | null;
  tomorrowRecommendationId?: string | null;
}

/** One summary per session, so the summary shares the session's id. */
export function createSessionSummary(
  input: CreateSessionSummaryInput,
): SessionSummaryRecord {
  return parseOrThrow(SessionSummarySchema, "SessionSummary", {
    id: input.sessionId,
    sessionId: input.sessionId,
    overallScore: input.overallScore ?? null,
    xpEarned: input.xpEarned,
    momentumDelta: input.momentumDelta ?? null,
    achievementIds: input.achievementIds ?? [],
    coachMessage: input.coachMessage ?? null,
    tomorrowRecommendationId: input.tomorrowRecommendationId ?? null,
    createdAt: Date.now(),
  });
}
