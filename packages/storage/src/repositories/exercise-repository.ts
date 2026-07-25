import type { ExerciseRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface ExerciseRepository {
  /** Only inserts when the catalog is empty — content is seeded, not user-created. */
  seed(exercises: ExerciseRecord[]): Promise<void>;
  listBySkill(skillId: string): Promise<ExerciseRecord[]>;
  /** Every exercise across every skill — used to map exerciseId -> category for Progress's exercise distribution. */
  listAll(): Promise<ExerciseRecord[]>;
  get(id: string): Promise<ExerciseRecord | undefined>;
}

export function createExerciseRepository(
  db: MomentumDatabase,
): ExerciseRepository {
  return {
    async seed(exercises) {
      await db.transaction("rw", db.exercises, async () => {
        const count = await db.exercises.count();
        if (count === 0) {
          await db.exercises.bulkAdd(exercises);
        }
      });
    },

    async listBySkill(skillId) {
      const exercises = await db.exercises
        .where("skillId")
        .equals(skillId)
        .toArray();
      return exercises.sort((a, b) => a.order - b.order);
    },

    async listAll() {
      return db.exercises.toArray();
    },

    async get(id) {
      return db.exercises.get(id);
    },
  };
}
