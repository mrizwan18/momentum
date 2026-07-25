import { describe, expect, it } from "vitest";
import { computePersonalRecords } from "./personal-records";
import type {
  PracticeSessionRecord,
  SessionSummaryRecord,
  StatisticsEntryRecord,
  StreakRecord,
} from "@momentum/types";

function session(
  elapsedSeconds: number,
  id = `s-${Math.random()}`,
): PracticeSessionRecord {
  return {
    id,
    status: "completed",
    skillId: null,
    planId: null,
    exerciseIds: [],
    currentStepIndex: 0,
    elapsedSeconds,
    voiceCondition: null,
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: 0,
    completedAt: 0,
  };
}

function summary(
  overallScore: number | null,
  sessionId = "s-1",
): SessionSummaryRecord {
  return {
    id: `sum-${Math.random()}`,
    sessionId,
    overallScore,
    xpEarned: 100,
    momentumDelta: null,
    achievementIds: [],
    coachMessage: null,
    tomorrowRecommendationId: null,
    createdAt: 0,
  };
}

function stat(date: string, practiceMinutes: number): StatisticsEntryRecord {
  return {
    id: date,
    date,
    practiceMinutes,
    sessionsCompleted: 1,
    growthScore: null,
    updatedAt: 0,
  };
}

describe("computePersonalRecords", () => {
  it("returns zeroed records with no history", () => {
    const records = computePersonalRecords({
      completedSessions: [],
      summaries: [],
      completedAttemptCountsBySession: new Map(),
      streak: undefined,
      statistics: [],
    });
    expect(records).toEqual({
      longestSessionSeconds: 0,
      bestDailyScore: null,
      mostExercisesInSession: 0,
      longestStreak: 0,
      bestPracticeDayMinutes: 0,
    });
  });

  it("finds the longest session, best score, most exercises, longest streak, and best day", () => {
    const streak: StreakRecord = {
      id: "streak-global",
      skillId: null,
      current: 5,
      longest: 12,
      lastPracticeDate: "2026-07-25",
      updatedAt: 0,
    };
    const records = computePersonalRecords({
      completedSessions: [
        session(300, "a"),
        session(900, "b"),
        session(500, "c"),
      ],
      summaries: [summary(80), summary(95), summary(null)],
      completedAttemptCountsBySession: new Map([
        ["a", 3],
        ["b", 7],
        ["c", 5],
      ]),
      streak,
      statistics: [stat("2026-07-20", 15), stat("2026-07-24", 60)],
    });

    expect(records.longestSessionSeconds).toBe(900);
    expect(records.bestDailyScore).toBe(95);
    expect(records.mostExercisesInSession).toBe(7);
    expect(records.longestStreak).toBe(12);
    expect(records.bestPracticeDayMinutes).toBe(60);
  });
});
