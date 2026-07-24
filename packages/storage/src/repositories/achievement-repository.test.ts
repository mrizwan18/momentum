import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createAchievementRepository } from "./achievement-repository";
import { createAchievement } from "../factories/achievement-factory";

describe("achievement repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-achievement-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("seeds achievements locked by default", async () => {
    const repo = createAchievementRepository(db);
    await repo.seed([
      createAchievement({ key: "first_recording", title: "First Recording" }),
    ]);

    const [achievement] = await repo.list();
    expect(achievement.status).toBe("locked");
    expect(achievement.unlockedAt).toBeNull();
  });

  it("unlocks an achievement by key", async () => {
    const repo = createAchievementRepository(db);
    await repo.seed([
      createAchievement({ key: "first_recording", title: "First Recording" }),
    ]);

    const unlocked = await repo.unlock("first_recording");
    expect(unlocked.status).toBe("unlocked");
    expect(unlocked.unlockedAt).not.toBeNull();
  });

  it("is idempotent when unlocking an already-unlocked achievement", async () => {
    const repo = createAchievementRepository(db);
    await repo.seed([
      createAchievement({ key: "first_recording", title: "First Recording" }),
    ]);

    const first = await repo.unlock("first_recording");
    const second = await repo.unlock("first_recording");
    expect(second.unlockedAt).toBe(first.unlockedAt);
  });

  it("throws when unlocking an unknown key", async () => {
    const repo = createAchievementRepository(db);
    await expect(repo.unlock("unknown")).rejects.toThrow(/was not found/);
  });
});
