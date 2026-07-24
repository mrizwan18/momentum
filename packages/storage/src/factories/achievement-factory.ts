import { generateId } from "@momentum/utils";
import { AchievementSchema, type AchievementRecord } from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateAchievementInput {
  key: string;
  title: string;
  description?: string;
}

/** New achievements are always seeded locked; unlockAchievement() flips them. */
export function createAchievement(
  input: CreateAchievementInput,
): AchievementRecord {
  return parseOrThrow(AchievementSchema, "Achievement", {
    id: generateId(),
    key: input.key,
    title: input.title,
    description: input.description ?? "",
    status: "locked",
    unlockedAt: null,
  });
}
