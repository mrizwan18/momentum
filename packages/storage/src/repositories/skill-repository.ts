import type { SkillRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";

export interface SkillRepository {
  /** Only inserts when the catalog is empty — content is seeded, not user-created. */
  seed(skills: SkillRecord[]): Promise<void>;
  list(): Promise<SkillRecord[]>;
  get(id: string): Promise<SkillRecord | undefined>;
  getBySlug(slug: string): Promise<SkillRecord | undefined>;
}

export function createSkillRepository(db: MomentumDatabase): SkillRepository {
  return {
    async seed(skills) {
      await db.transaction("rw", db.skills, async () => {
        const count = await db.skills.count();
        if (count === 0) {
          await db.skills.bulkAdd(skills);
        }
      });
    },

    async list() {
      return db.skills.toArray();
    },

    async get(id) {
      return db.skills.get(id);
    },

    async getBySlug(slug) {
      return db.skills.where("slug").equals(slug).first();
    },
  };
}
