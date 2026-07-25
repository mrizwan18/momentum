import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createSessionsRepository } from "./sessions-repository";

describe("sessions repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-sessions-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("starts a session in progress with zeroed progress", async () => {
    const repo = createSessionsRepository(db);
    const session = await repo.start(["breathing", "warmup"]);

    expect(session.status).toBe("in_progress");
    expect(session.currentStepIndex).toBe(0);
    expect(session.elapsedSeconds).toBe(0);
    expect(session.completedAt).toBeNull();
  });

  it("resumes an interrupted session via getActive", async () => {
    const repo = createSessionsRepository(db);
    const started = await repo.start(["breathing"]);
    await repo.updateProgress(started.id, {
      currentStepIndex: 1,
      elapsedSeconds: 42,
    });
    await repo.pause(started.id);

    const active = await repo.getActive();
    expect(active?.id).toBe(started.id);
    expect(active?.status).toBe("paused");
    expect(active?.currentStepIndex).toBe(1);
    expect(active?.elapsedSeconds).toBe(42);
  });

  it("does not surface completed or abandoned sessions as active", async () => {
    const repo = createSessionsRepository(db);
    const started = await repo.start(["breathing"]);
    await repo.complete(started.id);

    await expect(repo.getActive()).resolves.toBeUndefined();
  });

  it("throws when transitioning a session that does not exist", async () => {
    const repo = createSessionsRepository(db);
    await expect(repo.pause("missing-id")).rejects.toThrow(/was not found/);
  });

  it("lists only completed sessions, oldest first", async () => {
    const repo = createSessionsRepository(db);
    const first = await repo.start(["breathing"]);
    await repo.complete(first.id);
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = await repo.start(["warmup"]);
    await repo.complete(second.id);
    const abandoned = await repo.start(["scales"]);
    await repo.abandon(abandoned.id);

    const completed = await repo.listCompleted();
    expect(completed.map((session) => session.id)).toEqual([
      first.id,
      second.id,
    ]);
  });

  it("lists both completed and abandoned sessions, oldest first, excluding in-progress/paused", async () => {
    const repo = createSessionsRepository(db);
    const completed = await repo.start(["breathing"]);
    await repo.complete(completed.id);
    await new Promise((resolve) => setTimeout(resolve, 2));
    const abandoned = await repo.start(["warmup"]);
    await repo.abandon(abandoned.id);
    await repo.start(["scales"]); // left in_progress — must be excluded

    const terminal = await repo.listTerminal();
    expect(terminal.map((session) => session.id)).toEqual([
      completed.id,
      abandoned.id,
    ]);
  });
});
