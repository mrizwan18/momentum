import { describe, expect, it } from "vitest";
import type { PracticeSessionRecord } from "@momentum/types";
import type { SessionSummaryView } from "@/features/summary";
import { transition } from "./transition";
import type { PracticeMachineState } from "./types";

function session(
  overrides: Partial<PracticeSessionRecord> = {},
): PracticeSessionRecord {
  return {
    id: "session-1",
    status: "in_progress",
    skillId: "skill-1",
    planId: "plan-1",
    exerciseIds: ["breathing", "warmup"],
    currentStepIndex: 0,
    elapsedSeconds: 0,
    voiceCondition: "normal",
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
    ...overrides,
  };
}

function summary(
  overrides: Partial<SessionSummaryView> = {},
): SessionSummaryView {
  return {
    session: session({ status: "completed" }),
    durationSeconds: 120,
    exercisesCompleted: 2,
    exercisesSkipped: 0,
    totalExercises: 2,
    xpEarned: 100,
    dailyScore: 80,
    streak: { qualifying: false, current: 0, longest: 0, extended: false },
    consistency: { daysPracticed: 1, totalDays: 7 },
    recordingCount: 0,
    notes: [],
    personalBests: {
      isLongestSession: false,
      isMostExercisesCompleted: false,
      isBestDailyScore: false,
    },
    motivationalMessage: "You showed up today. That's what builds momentum.",
    ...overrides,
  };
}

describe("practice state machine — valid transitions", () => {
  it("idle + SESSION_FOUND(in_progress) -> interrupted", () => {
    const inProgress = session({ status: "in_progress" });
    const result = transition(
      { status: "idle" },
      { type: "SESSION_FOUND", session: inProgress },
    );
    expect(result).toEqual({ status: "interrupted", session: inProgress });
  });

  it("idle + SESSION_FOUND(paused) -> paused directly (no interruption prompt)", () => {
    const paused = session({ status: "paused" });
    const result = transition(
      { status: "idle" },
      { type: "SESSION_FOUND", session: paused },
    );
    expect(result).toEqual({ status: "paused", session: paused });
  });

  it("idle + NO_SESSION_FOUND -> idle", () => {
    const result = transition({ status: "idle" }, { type: "NO_SESSION_FOUND" });
    expect(result).toEqual({ status: "idle" });
  });

  it("idle + START -> preparing", () => {
    const result = transition({ status: "idle" }, { type: "START" });
    expect(result).toEqual({ status: "preparing" });
  });

  it("interrupted + RESUME_INTERRUPTED(in_progress) -> practicing", () => {
    const inProgress = session({ status: "in_progress" });
    const result = transition(
      { status: "interrupted", session: inProgress },
      { type: "RESUME_INTERRUPTED" },
    );
    expect(result).toEqual({ status: "practicing", session: inProgress });
  });

  it("interrupted + RESUME_INTERRUPTED(paused) -> paused (defensive branch)", () => {
    const paused = session({ status: "paused" });
    const result = transition(
      { status: "interrupted", session: paused },
      { type: "RESUME_INTERRUPTED" },
    );
    expect(result).toEqual({ status: "paused", session: paused });
  });

  it("interrupted + DISCARD_INTERRUPTED -> cancelled", () => {
    const result = transition(
      { status: "interrupted", session: session() },
      { type: "DISCARD_INTERRUPTED" },
    );
    expect(result).toEqual({ status: "cancelled" });
  });

  it("preparing + BEGIN -> practicing", () => {
    const started = session();
    const result = transition(
      { status: "preparing" },
      { type: "BEGIN", session: started },
    );
    expect(result).toEqual({ status: "practicing", session: started });
  });

  it("preparing + BACK_TO_IDLE -> idle", () => {
    const result = transition(
      { status: "preparing" },
      { type: "BACK_TO_IDLE" },
    );
    expect(result).toEqual({ status: "idle" });
  });

  it("practicing + ADVANCE -> practicing with the updated session", () => {
    const before = session({ currentStepIndex: 0 });
    const after = session({ currentStepIndex: 1 });
    const result = transition(
      { status: "practicing", session: before },
      { type: "ADVANCE", session: after },
    );
    expect(result).toEqual({ status: "practicing", session: after });
  });

  it("practicing + FINISH -> completed", () => {
    const finished = session({ status: "completed", completedAt: 1000 });
    const finishedSummary = summary({ session: finished });
    const result = transition(
      { status: "practicing", session: session() },
      { type: "FINISH", session: finished, summary: finishedSummary },
    );
    expect(result).toEqual({
      status: "completed",
      session: finished,
      summary: finishedSummary,
    });
  });

  it("practicing + PAUSE -> paused", () => {
    const current = session();
    const result = transition(
      { status: "practicing", session: current },
      { type: "PAUSE" },
    );
    expect(result).toEqual({ status: "paused", session: current });
  });

  it("practicing + CANCEL -> cancelled", () => {
    const result = transition(
      { status: "practicing", session: session() },
      { type: "CANCEL" },
    );
    expect(result).toEqual({ status: "cancelled" });
  });

  it("paused + RESUME -> practicing", () => {
    const current = session({ status: "paused" });
    const result = transition(
      { status: "paused", session: current },
      { type: "RESUME" },
    );
    expect(result).toEqual({ status: "practicing", session: current });
  });

  it("paused + CANCEL -> cancelled", () => {
    const result = transition(
      { status: "paused", session: session() },
      { type: "CANCEL" },
    );
    expect(result).toEqual({ status: "cancelled" });
  });

  it("completed + RESET -> idle", () => {
    const result = transition(
      { status: "completed", session: session(), summary: summary() },
      { type: "RESET" },
    );
    expect(result).toEqual({ status: "idle" });
  });

  it("cancelled + RESET -> idle", () => {
    const result = transition({ status: "cancelled" }, { type: "RESET" });
    expect(result).toEqual({ status: "idle" });
  });
});

describe("practice state machine — invalid transitions are no-ops", () => {
  it("idle ignores PAUSE", () => {
    const state: PracticeMachineState = { status: "idle" };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
  });

  it("idle ignores RESUME_INTERRUPTED", () => {
    const state: PracticeMachineState = { status: "idle" };
    expect(transition(state, { type: "RESUME_INTERRUPTED" })).toBe(state);
  });

  it("interrupted ignores ADVANCE", () => {
    const state: PracticeMachineState = {
      status: "interrupted",
      session: session(),
    };
    expect(transition(state, { type: "ADVANCE", session: session() })).toBe(
      state,
    );
  });

  it("preparing ignores PAUSE", () => {
    const state: PracticeMachineState = { status: "preparing" };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
  });

  it("practicing ignores BEGIN", () => {
    const state: PracticeMachineState = {
      status: "practicing",
      session: session(),
    };
    expect(transition(state, { type: "BEGIN", session: session() })).toBe(
      state,
    );
  });

  it("practicing ignores RESUME (only paused sessions resume)", () => {
    const state: PracticeMachineState = {
      status: "practicing",
      session: session(),
    };
    expect(transition(state, { type: "RESUME" })).toBe(state);
  });

  it("paused ignores BEGIN", () => {
    const state: PracticeMachineState = {
      status: "paused",
      session: session(),
    };
    expect(transition(state, { type: "BEGIN", session: session() })).toBe(
      state,
    );
  });

  it("paused ignores ADVANCE", () => {
    const state: PracticeMachineState = {
      status: "paused",
      session: session(),
    };
    expect(transition(state, { type: "ADVANCE", session: session() })).toBe(
      state,
    );
  });

  it("completed ignores PAUSE — a finished session cannot be re-paused", () => {
    const state: PracticeMachineState = {
      status: "completed",
      session: session(),
      summary: summary(),
    };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
  });

  it("cancelled ignores CANCEL — cannot cancel twice", () => {
    const state: PracticeMachineState = { status: "cancelled" };
    expect(transition(state, { type: "CANCEL" })).toBe(state);
  });

  it("cancelled ignores SESSION_FOUND", () => {
    const state: PracticeMachineState = { status: "cancelled" };
    expect(
      transition(state, { type: "SESSION_FOUND", session: session() }),
    ).toBe(state);
  });
});
