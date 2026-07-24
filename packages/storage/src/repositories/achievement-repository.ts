import { AchievementSchema, type AchievementRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";

export interface AchievementRepository {
  /** Only inserts when the catalog is empty — definitions are seeded, not user-created. */
  seed(achievements: AchievementRecord[]): Promise<void>;
  list(): Promise<AchievementRecord[]>;
  getByKey(key: string): Promise<AchievementRecord | undefined>;
  unlock(key: string): Promise<AchievementRecord>;
}

export function createAchievementRepository(
  db: MomentumDatabase,
): AchievementRepository {
  return {
    async seed(achievements) {
      await db.transaction("rw", db.achievements, async () => {
        const count = await db.achievements.count();
        if (count === 0) {
          await db.achievements.bulkAdd(achievements);
        }
      });
    },

    async list() {
      return db.achievements.toArray();
    },

    async getByKey(key) {
      return db.achievements.where("key").equals(key).first();
    },

    async unlock(key) {
      return db.transaction("rw", db.achievements, async () => {
        const existing = await db.achievements.where("key").equals(key).first();
        if (!existing) {
          throw new Error(`Achievement "${key}" was not found`);
        }
        if (existing.status === "unlocked") {
          return existing;
        }
        const updated = parseOrThrow(AchievementSchema, "Achievement", {
          ...existing,
          status: "unlocked",
          unlockedAt: Date.now(),
        });
        await db.achievements.put(updated);
        return updated;
      });
    },
  };
}
