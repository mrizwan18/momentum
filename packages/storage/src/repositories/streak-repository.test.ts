import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createStreakRepository } from "./streak-repository";

describe("streak repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-streak-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before any practice has been recorded", async () => {
    const repo = createStreakRepository(db);
    await expect(repo.get(null)).resolves.toBeUndefined();
  });

  it("starts a streak of one on the first recorded day", async () => {
    const repo = createStreakRepository(db);
    const streak = await repo.recordPracticeDay(null, "2026-07-17");
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });

  it("increments the streak for consecutive days", async () => {
    const repo = createStreakRepository(db);
    await repo.recordPracticeDay(null, "2026-07-16");
    const streak = await repo.recordPracticeDay(null, "2026-07-17");
    expect(streak.current).toBe(2);
    expect(streak.longest).toBe(2);
  });

  it("is idempotent for a second session on the same day", async () => {
    const repo = createStreakRepository(db);
    await repo.recordPracticeDay(null, "2026-07-17");
    const streak = await repo.recordPracticeDay(null, "2026-07-17");
    expect(streak.current).toBe(1);
  });

  it("resets current but preserves longest after a gap", async () => {
    const repo = createStreakRepository(db);
    await repo.recordPracticeDay(null, "2026-07-10");
    await repo.recordPracticeDay(null, "2026-07-11");
    await repo.recordPracticeDay(null, "2026-07-12");
    const streak = await repo.recordPracticeDay(null, "2026-07-20");

    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(3);
  });

  it("tracks streaks per skill independently", async () => {
    const repo = createStreakRepository(db);
    await repo.recordPracticeDay("skill-a", "2026-07-17");
    await repo.recordPracticeDay("skill-b", "2026-07-17");
    await repo.recordPracticeDay("skill-b", "2026-07-18");

    const a = await repo.get("skill-a");
    const b = await repo.get("skill-b");
    expect(a?.current).toBe(1);
    expect(b?.current).toBe(2);
  });
});
