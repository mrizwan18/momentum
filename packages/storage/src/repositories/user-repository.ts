import {
  UserSchema,
  USER_SINGLETON_ID,
  type UserRecord,
} from "@momentum/types";
import type { MomentumDatabase } from "../db";
import { parseOrThrow } from "../validation";
import { createUser } from "../factories/user-factory";

export interface UserRepository {
  get(): Promise<UserRecord | undefined>;
  setDisplayName(displayName: string | null): Promise<UserRecord>;
  setAge(age: number | null): Promise<UserRecord>;
  setActiveSkill(skillId: string | null): Promise<UserRecord>;
}

export function createUserRepository(db: MomentumDatabase): UserRepository {
  async function upsert(patch: Partial<UserRecord>): Promise<UserRecord> {
    return db.transaction("rw", db.users, async () => {
      const existing = await db.users.get(USER_SINGLETON_ID);
      const base = existing ?? createUser();
      const updated = parseOrThrow(UserSchema, "User", {
        ...base,
        ...patch,
        updatedAt: Date.now(),
      });
      await db.users.put(updated);
      return updated;
    });
  }

  return {
    async get() {
      return db.users.get(USER_SINGLETON_ID);
    },

    async setDisplayName(displayName) {
      return upsert({ displayName });
    },

    async setAge(age) {
      return upsert({ age });
    },

    async setActiveSkill(skillId) {
      return upsert({ activeSkillId: skillId });
    },
  };
}
