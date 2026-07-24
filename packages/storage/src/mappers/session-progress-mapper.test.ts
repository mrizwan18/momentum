import { describe, expect, it } from "vitest";
import type { PracticeSessionRecord } from "@momentum/types";
import { toSessionWithProgressDTO } from "./session-progress-mapper";

function session(
  overrides: Partial<PracticeSessionRecord> = {},
): PracticeSessionRecord {
  return {
    id: "session-1",
    status: "in_progress",
    skillId: null,
    planId: null,
    exerciseIds: ["breathing", "warmup", "song", "reflection"],
    currentStepIndex: 1,
    elapsedSeconds: 60,
    voiceCondition: null,
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("toSessionWithProgressDTO", () => {
  it("computes progress as a percentage of steps completed", () => {
    const dto = toSessionWithProgressDTO(session());
    expect(dto.totalSteps).toBe(4);
    expect(dto.completedSteps).toBe(1);
    expect(dto.progressPercent).toBe(25);
    expect(dto.isComplete).toBe(false);
  });

  it("reports 0% for a session with no exercises", () => {
    const dto = toSessionWithProgressDTO(
      session({ exerciseIds: [], currentStepIndex: 0 }),
    );
    expect(dto.progressPercent).toBe(0);
  });

  it("caps completedSteps at totalSteps", () => {
    const dto = toSessionWithProgressDTO(
      session({ exerciseIds: ["breathing"], currentStepIndex: 5 }),
    );
    expect(dto.completedSteps).toBe(1);
    expect(dto.progressPercent).toBe(100);
  });

  it("reports isComplete once the session status is completed", () => {
    const dto = toSessionWithProgressDTO(
      session({
        status: "completed",
        currentStepIndex: 4,
        completedAt: Date.now(),
      }),
    );
    expect(dto.isComplete).toBe(true);
    expect(dto.progressPercent).toBe(100);
  });
});
