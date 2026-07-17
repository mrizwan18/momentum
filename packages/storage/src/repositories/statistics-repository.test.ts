import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createStatisticsRepository } from "./statistics-repository";

describe("statistics repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-statistics-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("creates an entry for a new date", async () => {
    const repo = createStatisticsRepository(db);
    const entry = await repo.upsertForDate({
      date: "2026-07-17",
      practiceMinutes: 10,
      sessionsCompleted: 1,
    });

    expect(entry.practiceMinutes).toBe(10);
    expect(entry.sessionsCompleted).toBe(1);
  });

  it("accumulates practice minutes for the same date", async () => {
    const repo = createStatisticsRepository(db);
    await repo.upsertForDate({
      date: "2026-07-17",
      practiceMinutes: 10,
      sessionsCompleted: 1,
    });
    const second = await repo.upsertForDate({
      date: "2026-07-17",
      practiceMinutes: 5,
      sessionsCompleted: 1,
    });

    expect(second.practiceMinutes).toBe(15);
    expect(second.sessionsCompleted).toBe(2);
    expect(await db.statistics.count()).toBe(1);
  });

  it("preserves the last known growth score when not provided", async () => {
    const repo = createStatisticsRepository(db);
    await repo.upsertForDate({
      date: "2026-07-17",
      practiceMinutes: 10,
      sessionsCompleted: 1,
      growthScore: 42,
    });
    const second = await repo.upsertForDate({
      date: "2026-07-17",
      practiceMinutes: 5,
      sessionsCompleted: 1,
    });

    expect(second.growthScore).toBe(42);
  });
});
