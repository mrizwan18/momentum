import {
  UserSchema,
  USER_SINGLETON_ID,
  type UserRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export function createUser(
  input: {
    displayName?: string | null;
    age?: number | null;
    activeSkillId?: string | null;
    onboardingCompletedAt?: number | null;
  } = {},
): UserRecord {
  const now = Date.now();
  return parseOrThrow(UserSchema, "User", {
    id: USER_SINGLETON_ID,
    displayName: input.displayName ?? null,
    age: input.age ?? null,
    activeSkillId: input.activeSkillId ?? null,
    onboardingCompletedAt: input.onboardingCompletedAt ?? null,
    createdAt: now,
    updatedAt: now,
  });
}
