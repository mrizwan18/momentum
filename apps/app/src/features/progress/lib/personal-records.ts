import type {
  PracticeSessionRecord,
  SessionSummaryRecord,
  StatisticsEntryRecord,
  StreakRecord,
} from "@momentum/types";

export interface PersonalRecords {
  longestSessionSeconds: number;
  bestDailyScore: number | null;
  mostExercisesInSession: number;
  longestStreak: number;
  bestPracticeDayMinutes: number;
}

export interface PersonalRecordsInput {
  /** Completed sessions only — an abandoned session shouldn't set a "longest session" record. */
  completedSessions: PracticeSessionRecord[];
  summaries: SessionSummaryRecord[];
  /** sessionId -> number of completed exercise attempts in that session. */
  completedAttemptCountsBySession: Map<string, number>;
  streak: StreakRecord | undefined;
  statistics: StatisticsEntryRecord[];
}

export function computePersonalRecords(
  input: PersonalRecordsInput,
): PersonalRecords {
  const longestSessionSeconds = input.completedSessions.reduce(
    (max, session) => Math.max(max, session.elapsedSeconds),
    0,
  );

  const bestDailyScore = input.summaries.reduce<number | null>(
    (max, summary) =>
      summary.overallScore !== null
        ? Math.max(max ?? 0, summary.overallScore)
        : max,
    null,
  );

  const mostExercisesInSession = Math.max(
    0,
    ...Array.from(input.completedAttemptCountsBySession.values()),
  );

  const bestPracticeDayMinutes = input.statistics.reduce(
    (max, entry) => Math.max(max, entry.practiceMinutes),
    0,
  );

  return {
    longestSessionSeconds,
    bestDailyScore,
    mostExercisesInSession,
    longestStreak: input.streak?.longest ?? 0,
    bestPracticeDayMinutes,
  };
}
