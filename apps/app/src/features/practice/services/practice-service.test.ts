import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import type { PracticeCatalog } from "./catalog-service";
import { ensurePracticeCatalog } from "./catalog-service";
import {
  autosaveProgress,
  cancelSession,
  completeCurrentExercise,
  findResumableSession,
  finishSession,
  pauseSession,
  resumeSession,
  startSession,
} from "./practice-service";

describe("practice-service", () => {
  let storage: MomentumStorage;
  let catalog: PracticeCatalog;

  beforeEach(async () => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-practice-service-${Math.random()}`),
    );
    catalog = (await ensurePracticeCatalog(storage))!;
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("finds no resumable session when none exists", async () => {
    await expect(findResumableSession(storage)).resolves.toBeUndefined();
  });

  it("starts a session from the plan's exercise queue", async () => {
    const session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });

    expect(session.status).toBe("in_progress");
    expect(session.exerciseIds).toEqual(catalog.plan.exerciseIds);
    expect(session.currentStepIndex).toBe(0);
    await expect(findResumableSession(storage)).resolves.toEqual(session);
  });

  it("pauses and resumes a session", async () => {
    const session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });

    const paused = await pauseSession(storage, session.id);
    expect(paused.status).toBe("paused");

    const resumed = await resumeSession(storage, session.id);
    expect(resumed.status).toBe("in_progress");
  });

  it("cancels a session by abandoning it", async () => {
    const session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });

    const cancelled = await cancelSession(storage, session.id);
    expect(cancelled.status).toBe("abandoned");
    await expect(findResumableSession(storage)).resolves.toBeUndefined();
  });

  it("autosaves elapsed time and draft notes without touching queue position", async () => {
    const session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });

    const saved = await autosaveProgress(storage, session.id, {
      elapsedSeconds: 42,
      draftNotes: "breath support felt strong today",
    });

    expect(saved.elapsedSeconds).toBe(42);
    expect(saved.draftNotes).toBe("breath support felt strong today");
    expect(saved.currentStepIndex).toBe(0);
  });

  it("advances the queue and records an attempt on exercise completion", async () => {
    const session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    await autosaveProgress(storage, session.id, {
      draftNotes: "in-progress notes",
    });

    const result = await completeCurrentExercise(storage, session, {
      exerciseId: session.exerciseIds[0],
      status: "completed",
      durationSeconds: 120,
      notes: "in-progress notes",
    });

    expect(result.isFinalExercise).toBe(false);
    expect(result.session.currentStepIndex).toBe(1);
    expect(result.session.draftNotes).toBeNull();

    const attempts = await storage.exerciseAttempts.listBySession(session.id);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].exerciseId).toBe(session.exerciseIds[0]);
    expect(attempts[0].notes).toBe("in-progress notes");
  });

  it("reports isFinalExercise once the last queued exercise is completed", async () => {
    let session = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });

    let result;
    for (let i = 0; i < session.exerciseIds.length; i += 1) {
      result = await completeCurrentExercise(storage, session, {
        exerciseId: session.exerciseIds[i],
        status: "completed",
        durationSeconds: 60,
      });
      session = result.session;
    }

    expect(result!.isFinalExercise).toBe(true);

    const { session: finished, summary } = await finishSession(
      storage,
      session,
    );
    expect(finished.status).toBe("completed");
    expect(finished.completedAt).not.toBeNull();
    expect(summary.totalExercises).toBe(session.exerciseIds.length);
  });
});
