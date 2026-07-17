import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RoadmapChapterRecord } from "@momentum/types";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createRoadmapRepository } from "./roadmap-repository";

function chapter(
  overrides: Partial<RoadmapChapterRecord> = {},
): RoadmapChapterRecord {
  return {
    id: "chapter-1",
    order: 1,
    title: "Foundations",
    status: "unlocked",
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("roadmap repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-roadmap-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("seeds chapters only when the table is empty", async () => {
    const repo = createRoadmapRepository(db);
    await repo.seed([chapter()]);
    await repo.seed([chapter({ id: "chapter-2", order: 2, title: "Second" })]);

    const chapters = await repo.list();
    expect(chapters).toHaveLength(1);
    expect(chapters[0].id).toBe("chapter-1");
  });

  it("lists chapters ordered by their sequence", async () => {
    const repo = createRoadmapRepository(db);
    await repo.seed([
      chapter({ id: "chapter-2", order: 2, title: "Second" }),
      chapter({ id: "chapter-1", order: 1, title: "First" }),
    ]);

    const chapters = await repo.list();
    expect(chapters.map((c) => c.id)).toEqual(["chapter-1", "chapter-2"]);
  });

  it("never regresses a completed chapter", async () => {
    const repo = createRoadmapRepository(db);
    await repo.seed([chapter({ status: "completed" })]);

    const result = await repo.setStatus("chapter-1", "in_progress");
    expect(result.status).toBe("completed");
  });

  it("throws when updating a chapter that does not exist", async () => {
    const repo = createRoadmapRepository(db);
    await expect(repo.setStatus("missing", "unlocked")).rejects.toThrow(
      /was not found/,
    );
  });
});
