import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createExerciseAttemptRepository } from "./exercise-attempt-repository";

describe("exercise attempt repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-attempt-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("records a completed attempt with scoring-hook fields", async () => {
    const repo = createExerciseAttemptRepository(db);
    const attempt = await repo.record({
      sessionId: "session-1",
      exerciseId: "breathing",
      status: "completed",
      durationSeconds: 45,
      difficultyRating: "medium",
      reflectionComplete: true,
    });

    expect(attempt.status).toBe("completed");
    expect(attempt.reflectionComplete).toBe(true);
    expect(attempt.recordingId).toBeNull();
  });

  it("records a skipped attempt", async () => {
    const repo = createExerciseAttemptRepository(db);
    const attempt = await repo.record({
      sessionId: "session-1",
      exerciseId: "song",
      status: "skipped",
      durationSeconds: 0,
    });

    expect(attempt.status).toBe("skipped");
  });

  it("lists attempts for a session in chronological order", async () => {
    const repo = createExerciseAttemptRepository(db);
    const first = await repo.record({
      sessionId: "session-1",
      exerciseId: "breathing",
      status: "completed",
      durationSeconds: 30,
    });
    const second = await repo.record({
      sessionId: "session-1",
      exerciseId: "warmup",
      status: "completed",
      durationSeconds: 60,
    });

    const list = await repo.listBySession("session-1");
    expect(list.map((a) => a.id)).toEqual([first.id, second.id]);
  });

  it("does not return attempts from another session", async () => {
    const repo = createExerciseAttemptRepository(db);
    await repo.record({
      sessionId: "session-1",
      exerciseId: "breathing",
      status: "completed",
      durationSeconds: 30,
    });
    await repo.record({
      sessionId: "session-2",
      exerciseId: "breathing",
      status: "completed",
      durationSeconds: 30,
    });

    const list = await repo.listBySession("session-1");
    expect(list).toHaveLength(1);
  });

  it("lists every attempt across all sessions, oldest first", async () => {
    const repo = createExerciseAttemptRepository(db);
    const first = await repo.record({
      sessionId: "session-1",
      exerciseId: "breathing",
      status: "completed",
      durationSeconds: 30,
    });
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = await repo.record({
      sessionId: "session-2",
      exerciseId: "warmup",
      status: "completed",
      durationSeconds: 60,
    });

    const list = await repo.listAll();
    expect(list.map((a) => a.id)).toEqual([first.id, second.id]);
  });
});
