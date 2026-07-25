import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createExercise,
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { toDateOnly } from "@/lib/date";
import { useProgressData } from "./use-progress-data";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

describe("useProgressData", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-progress-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("starts in the loading state and resolves to ready with empty-history defaults", async () => {
    const { result } = renderHook(() => useProgressData(), { wrapper });
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.weekly).toHaveLength(7);
    expect(result.current.data.monthly).toHaveLength(30);
    expect(result.current.data.heatmap).toHaveLength(12);
    expect(result.current.data.completionRate).toEqual({
      completed: 0,
      abandoned: 0,
      total: 0,
      rate: 0,
    });
    expect(result.current.data.exerciseDistribution).toEqual([]);
    expect(result.current.data.history).toEqual([]);
    expect(result.current.data.personalRecords.longestStreak).toBe(0);
  });

  it("reflects real sessions, attempts, and statistics written through the repository pattern", async () => {
    await storage.exercises.seed([
      createExercise({
        skillId: "riyaaz",
        category: "breathing",
        title: "Breathing",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);
    const exercises = await storage.exercises.listBySkill("riyaaz");
    const breathingId = exercises[0].id;

    const completedSession = await storage.sessions.start(["breathing"], {
      skillId: "riyaaz",
    });
    await storage.exerciseAttempts.record({
      sessionId: completedSession.id,
      exerciseId: breathingId,
      status: "completed",
      durationSeconds: 45,
    });
    const completed = await storage.sessions.complete(completedSession.id);
    await storage.sessionSummaries.create({
      sessionId: completed.id,
      xpEarned: 100,
      overallScore: 82,
      momentumDelta: 5,
      coachMessage: "Nice work",
    });

    const abandonedSession = await storage.sessions.start(["warmup"]);
    await storage.sessions.abandon(abandonedSession.id);

    await storage.statistics.upsertForDate({
      date: toDateOnly(new Date()),
      practiceMinutes: 15,
      sessionsCompleted: 1,
    });

    const { result } = renderHook(() => useProgressData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.completionRate).toEqual({
      completed: 1,
      abandoned: 1,
      total: 2,
      rate: 0.5,
    });
    expect(result.current.data.exerciseDistribution).toEqual([
      { category: "breathing", count: 1, totalDurationSeconds: 45, percent: 1 },
    ]);
    expect(result.current.data.history).toHaveLength(2);
    const completedEntry = result.current.data.history.find(
      (entry) => entry.sessionId === completed.id,
    );
    expect(completedEntry).toMatchObject({
      status: "completed",
      dailyScore: 82,
      xpEarned: 100,
      exercisesCompleted: 1,
    });
    expect(result.current.data.personalRecords.bestDailyScore).toBe(82);
  });
});
