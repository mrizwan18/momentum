import type { ExerciseAttemptRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createExerciseAttempt,
  type CreateExerciseAttemptInput,
} from "../factories/exercise-attempt-factory";

export type { CreateExerciseAttemptInput };

export interface ExerciseAttemptRepository {
  record(input: CreateExerciseAttemptInput): Promise<ExerciseAttemptRecord>;
  listBySession(sessionId: string): Promise<ExerciseAttemptRecord[]>;
  /** Every attempt ever recorded, oldest first — used for Progress's exercise distribution. */
  listAll(): Promise<ExerciseAttemptRecord[]>;
  get(id: string): Promise<ExerciseAttemptRecord | undefined>;
}

export function createExerciseAttemptRepository(
  db: MomentumDatabase,
): ExerciseAttemptRepository {
  return {
    async record(input) {
      return db.transaction("rw", db.exerciseAttempts, async () => {
        const record = createExerciseAttempt(input);
        await db.exerciseAttempts.add(record);
        return record;
      });
    },

    async listBySession(sessionId) {
      const attempts = await db.exerciseAttempts
        .where("sessionId")
        .equals(sessionId)
        .toArray();
      return attempts.sort((a, b) => a.createdAt - b.createdAt);
    },

    async listAll() {
      const attempts = await db.exerciseAttempts.toArray();
      return attempts.sort((a, b) => a.createdAt - b.createdAt);
    },

    async get(id) {
      return db.exerciseAttempts.get(id);
    },
  };
}
