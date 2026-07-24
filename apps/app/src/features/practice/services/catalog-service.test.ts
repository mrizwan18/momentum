import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { ensurePracticeCatalog } from "./catalog-service";

describe("ensurePracticeCatalog", () => {
  let storage: MomentumStorage;

  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-catalog-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("seeds the Riyaaz catalog when the skill table is empty", async () => {
    await expect(storage.skills.list()).resolves.toHaveLength(0);

    const catalog = await ensurePracticeCatalog(storage);

    expect(catalog).not.toBeNull();
    expect(catalog?.skill.slug).toBe("riyaaz");
    expect(catalog?.exercises.length).toBeGreaterThan(0);
    expect(catalog?.plan.isRecoveryPlan).toBe(false);
  });

  it("returns exercises sorted by their curriculum order", async () => {
    const catalog = await ensurePracticeCatalog(storage);

    expect(catalog?.exercises.map((exercise) => exercise.category)).toEqual([
      "breathing",
      "warmup",
      "scales",
      "alankars",
      "song",
      "recording",
      "reflection",
    ]);
  });

  it("does not duplicate content when called more than once", async () => {
    await ensurePracticeCatalog(storage);
    await ensurePracticeCatalog(storage);

    await expect(storage.skills.list()).resolves.toHaveLength(1);
    const skill = await storage.skills.getBySlug("riyaaz");
    await expect(
      storage.exercises.listBySkill(skill!.id),
    ).resolves.toHaveLength(7);
  });

  it("fetches the existing catalog without reseeding when already populated", async () => {
    const first = await ensurePracticeCatalog(storage);
    const second = await ensurePracticeCatalog(storage);

    expect(second?.skill.id).toBe(first?.skill.id);
    expect(second?.plan.id).toBe(first?.plan.id);
  });
});
