import { describe, expect, it } from "vitest";
import { computeCompletionRate } from "./completion-rate";
import type { PracticeSessionRecord } from "@momentum/types";

function session(status: "completed" | "abandoned"): PracticeSessionRecord {
  return {
    id: `${status}-${Math.random()}`,
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
    updatedAt: 0,
    completedAt: status === "completed" ? 0 : null,
  };
}

describe("computeCompletionRate", () => {
  it("returns a 0 rate with no sessions", () => {
    expect(computeCompletionRate([])).toEqual({
      completed: 0,
      abandoned: 0,
      total: 0,
      rate: 0,
    });
  });

  it("computes the completed/(completed+abandoned) rate", () => {
    const sessions = [
      session("completed"),
      session("completed"),
      session("abandoned"),
    ];
    expect(computeCompletionRate(sessions)).toEqual({
      completed: 2,
      abandoned: 1,
      total: 3,
      rate: 2 / 3,
    });
  });

  it("is 100% when every session completed", () => {
    const sessions = [session("completed"), session("completed")];
    expect(computeCompletionRate(sessions).rate).toBe(1);
  });
});
