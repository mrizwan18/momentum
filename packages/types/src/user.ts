import { z } from "zod";

/**
 * Momentum has no accounts or backend (IMPLEMENT.md excludes Login/Backend
 * from scope) — this is a single local profile row, not an auth identity.
 */
export const USER_SINGLETON_ID = "local";

export const UserSchema = z.object({
  id: z.literal(USER_SINGLETON_ID),
  displayName: z.string().nullable(),
  age: z.number().int().positive().nullable(),
  activeSkillId: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserRecord = z.infer<typeof UserSchema>;
