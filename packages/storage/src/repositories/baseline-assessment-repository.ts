import type { BaselineAssessmentRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createBaselineAssessment,
  type CreateBaselineAssessmentInput,
} from "../factories/baseline-assessment-factory";

export type { CreateBaselineAssessmentInput };

export interface BaselineAssessmentRepository {
  get(): Promise<BaselineAssessmentRecord | undefined>;
  /** Idempotent — a baseline is immutable, so a repeat call returns the existing row untouched rather than overwriting it. */
  create(
    input: CreateBaselineAssessmentInput,
  ): Promise<BaselineAssessmentRecord>;
}

export function createBaselineAssessmentRepository(
  db: MomentumDatabase,
): BaselineAssessmentRepository {
  return {
    async get() {
      return db.baselineAssessments.toCollection().first();
    },

    async create(input) {
      return db.transaction("rw", db.baselineAssessments, async () => {
        const existing = await db.baselineAssessments.toCollection().first();
        if (existing) return existing;
        const record = createBaselineAssessment(input);
        await db.baselineAssessments.add(record);
        return record;
      });
    },
  };
}
