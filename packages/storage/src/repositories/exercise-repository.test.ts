import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createExerciseRepository } from "./exercise-repository";
import { createExercise } from "../factories/exercise-factory";

describe("exercise repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-exercise-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("lists exercises for a skill in order", async () => {
    const repo = createExerciseRepository(db);
    const breathing = createExercise({
      skillId: "skill-1",
      category: "breathing",
      title: "Breathing",
      targetDurationSeconds: 60,
      order: 1,
    });
    const warmup = createExercise({
      skillId: "skill-1",
      category: "warmup",
      title: "Warm-up",
      targetDurationSeconds: 120,
      order: 0,
    });
    await repo.seed([breathing, warmup]);

    const list = await repo.listBySkill("skill-1");
    expect(list.map((e) => e.id)).toEqual([warmup.id, breathing.id]);
  });

  it("does not return exercises belonging to another skill", async () => {
    const repo = createExerciseRepository(db);
    await repo.seed([
      createExercise({
        skillId: "skill-1",
        category: "breathing",
        title: "Breathing",
        targetDurationSeconds: 60,
        order: 0,
      }),
      createExercise({
        skillId: "skill-2",
        category: "breathing",
        title: "Other",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);

    const list = await repo.listBySkill("skill-1");
    expect(list).toHaveLength(1);
  });

  it("only seeds once", async () => {
    const repo = createExerciseRepository(db);
    await repo.seed([
      createExercise({
        skillId: "skill-1",
        category: "breathing",
        title: "Breathing",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);
    await repo.seed([
      createExercise({
        skillId: "skill-1",
        category: "warmup",
        title: "Warm-up",
        targetDurationSeconds: 60,
        order: 1,
      }),
    ]);

    const list = await repo.listBySkill("skill-1");
    expect(list).toHaveLength(1);
  });
});
