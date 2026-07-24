import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createDailyGoalRepository } from "./daily-goal-repository";

describe("daily goal repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-goal-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before a goal is set for a date", async () => {
    const repo = createDailyGoalRepository(db);
    await expect(repo.getForDate("2026-07-17")).resolves.toBeUndefined();
  });

  it("sets and reads a goal for a date", async () => {
    const repo = createDailyGoalRepository(db);
    await repo.setForDate({
      date: "2026-07-17",
      requiredExerciseIds: ["breathing", "song"],
      targetDurationSeconds: 600,
      xpReward: 100,
    });

    const goal = await repo.getForDate("2026-07-17");
    expect(goal?.completed).toBe(false);
    expect(goal?.requiredExerciseIds).toEqual(["breathing", "song"]);
  });

  it("marks a goal completed", async () => {
    const repo = createDailyGoalRepository(db);
    await repo.setForDate({
      date: "2026-07-17",
      requiredExerciseIds: ["breathing"],
      targetDurationSeconds: 300,
    });

    const completed = await repo.markCompleted("2026-07-17");
    expect(completed.completed).toBe(true);
  });

  it("throws when completing a goal that was never set", async () => {
    const repo = createDailyGoalRepository(db);
    await expect(repo.markCompleted("2026-01-01")).rejects.toThrow(
      /was not found/,
    );
  });

  it("overwrites rather than duplicates when set again for the same date", async () => {
    const repo = createDailyGoalRepository(db);
    await repo.setForDate({
      date: "2026-07-17",
      requiredExerciseIds: ["breathing"],
      targetDurationSeconds: 300,
    });
    await repo.setForDate({
      date: "2026-07-17",
      requiredExerciseIds: ["breathing", "song"],
      targetDurationSeconds: 600,
    });

    expect(await db.dailyGoals.count()).toBe(1);
  });
});
