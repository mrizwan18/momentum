import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createSkillRepository } from "./skill-repository";
import { createSkill } from "../factories/skill-factory";

describe("skill repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-skill-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("seeds skills only when the catalog is empty", async () => {
    const repo = createSkillRepository(db);
    const riyaaz = createSkill({
      slug: "riyaaz",
      name: "Riyaaz",
      category: "vocals",
    });
    await repo.seed([riyaaz]);
    await repo.seed([
      createSkill({ slug: "guitar", name: "Guitar", category: "guitar" }),
    ]);

    const skills = await repo.list();
    expect(skills).toHaveLength(1);
    expect(skills[0].slug).toBe("riyaaz");
  });

  it("finds a skill by slug", async () => {
    const repo = createSkillRepository(db);
    const riyaaz = createSkill({
      slug: "riyaaz",
      name: "Riyaaz",
      category: "vocals",
    });
    await repo.seed([riyaaz]);

    const found = await repo.getBySlug("riyaaz");
    expect(found?.id).toBe(riyaaz.id);
  });

  it("returns undefined for an unknown slug", async () => {
    const repo = createSkillRepository(db);
    await expect(repo.getBySlug("unknown")).resolves.toBeUndefined();
  });
});
