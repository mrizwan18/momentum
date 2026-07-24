import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import {
  calculateCategoryScore,
  calculateDailyScore,
  calculateSessionXp,
  type CategoryCompletion,
} from "@momentum/engine";
import type { ExerciseCategory, PracticeSessionRecord } from "@momentum/types";
import {
  ensurePracticeCatalog,
  type PracticeCatalog,
} from "@/features/practice/services/catalog-service";
import { startSession } from "@/features/practice/services/practice-service";
import { buildSessionSummary } from "./summary-service";

async function completeAllExercises(
  storage: MomentumStorage,
  catalog: PracticeCatalog,
  session: PracticeSessionRecord,
  options: {
    durationSeconds?: number;
    reflectionComplete?: boolean;
    notes?: string;
  } = {},
): Promise<PracticeSessionRecord> {
  const durationSeconds = options.durationSeconds ?? 120;
  for (const exerciseId of session.exerciseIds) {
    await storage.exerciseAttempts.record({
      sessionId: session.id,
      exerciseId,
      status: "completed",
      durationSeconds,
      reflectionComplete: options.reflectionComplete ?? false,
      notes: options.notes ?? null,
    });
  }
  // Mirrors the real session-level timer (ActivePracticeScreen's per-second
  // autosaveProgress) that a live practicing session would have written.
  await storage.sessions.updateProgress(session.id, {
    elapsedSeconds: durationSeconds * session.exerciseIds.length,
  });
  return storage.sessions.complete(session.id);
}

function expectedDailyScore(
  catalog: PracticeCatalog,
  durationSeconds: number,
): number {
  const byCategory = new Map<
    ExerciseCategory,
    { attempted: number; target: number }
  >();
  for (const exerciseId of catalog.plan.exerciseIds) {
    const exercise = catalog.exercises.find(
      (candidate) => candidate.id === exerciseId,
    )!;
    const bucket = byCategory.get(exercise.category) ?? {
      attempted: 0,
      target: 0,
    };
    bucket.attempted += durationSeconds;
    bucket.target += exercise.targetDurationSeconds;
    byCategory.set(exercise.category, bucket);
  }
  const completions: CategoryCompletion[] = Array.from(
    byCategory.entries(),
  ).map(([category, { attempted, target }]) => ({
    category,
    score: calculateCategoryScore(attempted, target),
  }));
  return calculateDailyScore(completions);
}

describe("summary-service", () => {
  let storage: MomentumStorage;
  let catalog: PracticeCatalog;

  beforeEach(async () => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-summary-service-${Math.random()}`),
    );
    catalog = (await ensurePracticeCatalog(storage))!;
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("computes duration, exercise counts, XP, and daily score for a first session", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      durationSeconds: 120,
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.durationSeconds).toBe(session.elapsedSeconds);
    expect(summary.totalExercises).toBe(catalog.plan.exerciseIds.length);
    expect(summary.exercisesCompleted).toBe(catalog.plan.exerciseIds.length);
    expect(summary.exercisesSkipped).toBe(0);
    expect(summary.xpEarned).toBe(
      calculateSessionXp({ hasRecording: false, hasReflection: false }),
    );
    expect(summary.dailyScore).toBe(expectedDailyScore(catalog, 120));
    expect(summary.recordingCount).toBe(0);
    expect(summary.notes).toEqual([]);
  });

  it("awards the recording and reflection XP bonuses", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      reflectionComplete: true,
    });
    await storage.recordings.create({
      sessionId: session.id,
      blob: new Blob(["fake-audio"], { type: "audio/webm" }),
      mimeType: "audio/webm",
      durationMs: 5000,
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.recordingCount).toBe(1);
    expect(summary.xpEarned).toBe(
      calculateSessionXp({ hasRecording: true, hasReflection: true }),
    );
  });

  it("collects per-exercise notes", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      notes: "felt strong today",
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.notes.length).toBe(catalog.plan.exerciseIds.length);
    expect(summary.notes[0].note).toBe("felt strong today");
    expect(summary.notes[0].exerciseTitle).toBeTruthy();
  });

  it("does not extend the streak for a short, non-recovery session", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      durationSeconds: 30,
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.streak.qualifying).toBe(false);
    expect(summary.streak.extended).toBe(false);
    expect(summary.streak.current).toBe(0);
  });

  it("extends the streak for a qualifying (>=10 minute) session", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      durationSeconds: 600,
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.streak.qualifying).toBe(true);
    expect(summary.streak.extended).toBe(true);
    expect(summary.streak.current).toBe(1);
  });

  it("writes exactly one statistics row for the day", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      durationSeconds: 600,
    });

    await buildSessionSummary(storage, session);

    const stats = await storage.statistics.list();
    expect(stats).toHaveLength(1);
    expect(stats[0].sessionsCompleted).toBe(1);
    expect(stats[0].practiceMinutes).toBeGreaterThan(0);
  });

  it("persists a session summary row with a real coach message", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started);

    const summary = await buildSessionSummary(storage, session);
    const persisted = await storage.sessionSummaries.getBySession(session.id);

    expect(persisted?.xpEarned).toBe(summary.xpEarned);
    expect(persisted?.overallScore).toBe(summary.dailyScore);
    expect(persisted?.coachMessage).toBe(summary.motivationalMessage);
  });

  it("flags a personal best only once a longer/better session follows a first one", async () => {
    const first = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const firstSession = await completeAllExercises(storage, catalog, first, {
      durationSeconds: 60,
    });
    const firstSummary = await buildSessionSummary(storage, firstSession);
    expect(firstSummary.personalBests.isLongestSession).toBe(false);

    const second = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const secondSession = await completeAllExercises(storage, catalog, second, {
      durationSeconds: 600,
    });
    const secondSummary = await buildSessionSummary(storage, secondSession);

    expect(secondSummary.personalBests.isLongestSession).toBe(true);
  });

  it("reports practice consistency across the trailing week, including today", async () => {
    const started = await startSession(storage, {
      skillId: catalog.skill.id,
      plan: catalog.plan,
    });
    const session = await completeAllExercises(storage, catalog, started, {
      durationSeconds: 600,
    });

    const summary = await buildSessionSummary(storage, session);

    expect(summary.consistency.totalDays).toBe(7);
    expect(summary.consistency.daysPracticed).toBeGreaterThanOrEqual(1);
  });
});
