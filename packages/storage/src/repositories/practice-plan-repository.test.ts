import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createPracticePlanRepository } from "./practice-plan-repository";
import { createPracticePlan } from "../factories/practice-plan-factory";

describe("practice plan repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-plan-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("lists plans for a skill", async () => {
    const repo = createPracticePlanRepository(db);
    const plan = createPracticePlan({
      skillId: "skill-1",
      title: "Daily",
      exerciseIds: ["breathing"],
      targetDurationSeconds: 600,
    });
    await repo.seed([plan]);

    const list = await repo.listBySkill("skill-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(plan.id);
  });

  it("finds the recovery plan for a skill", async () => {
    const repo = createPracticePlanRepository(db);
    const normal = createPracticePlan({
      skillId: "skill-1",
      title: "Daily",
      exerciseIds: ["breathing", "song"],
      targetDurationSeconds: 600,
    });
    const recovery = createPracticePlan({
      skillId: "skill-1",
      title: "Recovery",
      exerciseIds: ["breathing"],
      targetDurationSeconds: 300,
      isRecoveryPlan: true,
    });
    await repo.seed([normal, recovery]);

    const found = await repo.getRecoveryPlan("skill-1");
    expect(found?.id).toBe(recovery.id);
  });

  it("returns undefined when there is no recovery plan", async () => {
    const repo = createPracticePlanRepository(db);
    await repo.seed([
      createPracticePlan({
        skillId: "skill-1",
        title: "Daily",
        exerciseIds: ["breathing"],
        targetDurationSeconds: 600,
      }),
    ]);

    await expect(repo.getRecoveryPlan("skill-1")).resolves.toBeUndefined();
  });
});
