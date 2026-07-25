import type {
  PracticeSessionRecord,
  PracticeSessionStatus,
  SessionSummaryRecord,
} from "@momentum/types";
import { toDateOnly } from "@/lib/date";

export interface HistoryEntry {
  sessionId: string;
  date: string;
  completedAt: number | null;
  status: PracticeSessionStatus;
  durationSeconds: number;
  exercisesCompleted: number;
  dailyScore: number | null;
  xpEarned: number | null;
}

/**
 * `sessions` must already be filtered to terminal (completed + abandoned)
 * sessions. Returns newest first, capped at `limit` — history is a recent-
 * activity feed, not a full archive browser.
 */
export function buildHistory(
  sessions: PracticeSessionRecord[],
  summaries: SessionSummaryRecord[],
  completedAttemptCountsBySession: Map<string, number>,
  limit = 20,
): HistoryEntry[] {
  const summaryBySession = new Map(
    summaries.map((summary) => [summary.sessionId, summary]),
  );

  return sessions
    .map((session) => {
      const summary = summaryBySession.get(session.id);
      return {
        sessionId: session.id,
        date: toDateOnly(new Date(session.completedAt ?? session.updatedAt)),
        completedAt: session.completedAt,
        status: session.status,
        durationSeconds: session.elapsedSeconds,
        exercisesCompleted:
          completedAttemptCountsBySession.get(session.id) ?? 0,
        dailyScore: summary?.overallScore ?? null,
        xpEarned: summary?.xpEarned ?? null,
      };
    })
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, limit);
}
