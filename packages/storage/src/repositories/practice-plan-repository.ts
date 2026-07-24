import type { PracticePlanRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface PracticePlanRepository {
  /** Only inserts when the catalog is empty — content is seeded, not user-created. */
  seed(plans: PracticePlanRecord[]): Promise<void>;
  listBySkill(skillId: string): Promise<PracticePlanRecord[]>;
  get(id: string): Promise<PracticePlanRecord | undefined>;
  getRecoveryPlan(skillId: string): Promise<PracticePlanRecord | undefined>;
}

export function createPracticePlanRepository(
  db: MomentumDatabase,
): PracticePlanRepository {
  return {
    async seed(plans) {
      await db.transaction("rw", db.practicePlans, async () => {
        const count = await db.practicePlans.count();
        if (count === 0) {
          await db.practicePlans.bulkAdd(plans);
        }
      });
    },

    async listBySkill(skillId) {
      return db.practicePlans.where("skillId").equals(skillId).toArray();
    },

    async get(id) {
      return db.practicePlans.get(id);
    },

    async getRecoveryPlan(skillId) {
      return db.practicePlans
        .where("skillId")
        .equals(skillId)
        .and((plan) => plan.isRecoveryPlan)
        .first();
    },
  };
}
