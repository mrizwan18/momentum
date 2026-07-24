import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createRecommendationRepository } from "./recommendation-repository";

describe("recommendation repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-recommendation-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before any recommendation exists", async () => {
    const repo = createRecommendationRepository(db);
    await expect(repo.getLatest()).resolves.toBeUndefined();
  });

  it("returns the most recently created recommendation", async () => {
    const repo = createRecommendationRepository(db);
    await repo.create({
      title: "Recovery session",
      reason: "You missed 3 days",
      category: "recovery",
      priority: 1,
      expectedDurationSeconds: 600,
      completionCriteria: "Complete a recovery session",
    });
    const second = await repo.create({
      title: "Record today's song",
      reason: "You haven't recorded in 9 days",
      category: "recording_reminder",
      priority: 2,
      expectedDurationSeconds: 300,
      completionCriteria: "Make one recording",
    });

    const latest = await repo.getLatest();
    expect(latest?.id).toBe(second.id);
  });
});
