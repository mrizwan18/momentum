import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createMilestoneRepository } from "./milestone-repository";
import { createMilestone } from "../factories/milestone-factory";

describe("milestone repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-milestone-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("lists milestones for a type in threshold order", async () => {
    const repo = createMilestoneRepository(db);
    await repo.seed([
      createMilestone({ type: "streak", threshold: 30 }),
      createMilestone({ type: "streak", threshold: 7 }),
    ]);

    const list = await repo.listByType("streak");
    expect(list.map((m) => m.threshold)).toEqual([7, 30]);
  });

  it("marks milestones achieved once the threshold is crossed", async () => {
    const repo = createMilestoneRepository(db);
    await repo.seed([
      createMilestone({ type: "streak", threshold: 7 }),
      createMilestone({ type: "streak", threshold: 14 }),
    ]);

    const newlyAchieved = await repo.evaluateThreshold("streak", 10);
    expect(newlyAchieved).toHaveLength(1);
    expect(newlyAchieved[0].threshold).toBe(7);
  });

  it("does not re-achieve a milestone already crossed", async () => {
    const repo = createMilestoneRepository(db);
    await repo.seed([createMilestone({ type: "streak", threshold: 7 })]);

    await repo.evaluateThreshold("streak", 7);
    const secondPass = await repo.evaluateThreshold("streak", 10);
    expect(secondPass).toHaveLength(0);
  });

  it("does not touch milestones of a different type", async () => {
    const repo = createMilestoneRepository(db);
    await repo.seed([
      createMilestone({ type: "streak", threshold: 7 }),
      createMilestone({ type: "recordings", threshold: 7 }),
    ]);

    const newlyAchieved = await repo.evaluateThreshold("streak", 10);
    expect(newlyAchieved).toHaveLength(1);
    expect(newlyAchieved[0].type).toBe("streak");
  });
});
