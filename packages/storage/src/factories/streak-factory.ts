import { StreakSchema, type StreakRecord } from "@momentum/types";
import { parseOrThrow } from "../validation";

const GLOBAL_STREAK_ID = "global";

export function streakIdForSkill(skillId: string | null): string {
  return skillId ?? GLOBAL_STREAK_ID;
}

export function createStreak(
  input: { skillId?: string | null } = {},
): StreakRecord {
  const skillId = input.skillId ?? null;
  return parseOrThrow(StreakSchema, "Streak", {
    id: streakIdForSkill(skillId),
    skillId,
    current: 0,
    longest: 0,
    lastPracticeDate: null,
    updatedAt: Date.now(),
  });
}
