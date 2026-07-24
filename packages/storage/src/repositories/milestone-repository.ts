import {
  MilestoneSchema,
  type MilestoneRecord,
  type MilestoneType,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";

export interface MilestoneRepository {
  /** Only inserts when the catalog is empty — thresholds are seeded, not user-created. */
  seed(milestones: MilestoneRecord[]): Promise<void>;
  listByType(type: MilestoneType): Promise<MilestoneRecord[]>;
  /**
   * Marks every not-yet-achieved milestone of `type` whose threshold has
   * been reached, returning the ones newly crossed by this call.
   */
  evaluateThreshold(
    type: MilestoneType,
    currentValue: number,
  ): Promise<MilestoneRecord[]>;
}

export function createMilestoneRepository(
  db: MomentumDatabase,
): MilestoneRepository {
  return {
    async seed(milestones) {
      await db.transaction("rw", db.milestones, async () => {
        const count = await db.milestones.count();
        if (count === 0) {
          await db.milestones.bulkAdd(milestones);
        }
      });
    },

    async listByType(type) {
      const milestones = await db.milestones
        .where("type")
        .equals(type)
        .toArray();
      return milestones.sort((a, b) => a.threshold - b.threshold);
    },

    async evaluateThreshold(type, currentValue) {
      return db.transaction("rw", db.milestones, async () => {
        const candidates = await db.milestones
          .where("type")
          .equals(type)
          .and(
            (milestone) =>
              !milestone.achieved && milestone.threshold <= currentValue,
          )
          .toArray();

        const now = Date.now();
        const newlyAchieved: MilestoneRecord[] = [];
        for (const candidate of candidates) {
          const updated = parseOrThrow(MilestoneSchema, "Milestone", {
            ...candidate,
            achieved: true,
            achievedAt: now,
          });
          await db.milestones.put(updated);
          newlyAchieved.push(updated);
        }
        return newlyAchieved;
      });
    },
  };
}
