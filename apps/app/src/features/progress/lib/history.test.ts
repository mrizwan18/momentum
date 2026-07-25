import { describe, expect, it } from "vitest";
import { buildHistory } from "./history";
import type {
  PracticeSessionRecord,
  SessionSummaryRecord,
} from "@momentum/types";

function session(
  id: string,
  status: "completed" | "abandoned",
  completedAt: number | null,
): PracticeSessionRecord {
  return {
    id,
    status,
    skillId: null,
    planId: null,
    exerciseIds: [],
    currentStepIndex: 0,
    elapsedSeconds: 300,
    voiceCondition: null,
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: completedAt ?? 100,
    completedAt,
  };
}

function summary(
  sessionId: string,
  overallScore: number,
  xpEarned: number,
): SessionSummaryRecord {
  return {
    id: `sum-${sessionId}`,
    sessionId,
    overallScore,
    xpEarned,
    momentumDelta: null,
    achievementIds: [],
    coachMessage: null,
    tomorrowRecommendationId: null,
    createdAt: 0,
  };
}

describe("buildHistory", () => {
  it("returns an empty list with no sessions", () => {
    expect(buildHistory([], [], new Map())).toEqual([]);
  });

  it("joins sessions with their summary and attempt counts, newest first", () => {
    const sessions = [
      session("a", "completed", 1000),
      session("b", "completed", 3000),
      session("c", "abandoned", 2000),
    ];
    const summaries = [summary("a", 70, 100), summary("b", 90, 120)];
    const counts = new Map([
      ["a", 5],
      ["b", 8],
    ]);

    const history = buildHistory(sessions, summaries, counts);

    expect(history.map((h) => h.sessionId)).toEqual(["b", "c", "a"]);
    expect(history[0]).toMatchObject({
      sessionId: "b",
      status: "completed",
      dailyScore: 90,
      xpEarned: 120,
      exercisesCompleted: 8,
    });
    expect(history[1]).toMatchObject({
      sessionId: "c",
      status: "abandoned",
      dailyScore: null,
      xpEarned: null,
      exercisesCompleted: 0,
    });
  });

  it("caps results at the given limit", () => {
    const sessions = Array.from({ length: 25 }, (_, i) =>
      session(`s-${i}`, "completed", i * 1000),
    );
    const history = buildHistory(sessions, [], new Map(), 20);
    expect(history).toHaveLength(20);
    expect(history[0].sessionId).toBe("s-24");
  });
});
