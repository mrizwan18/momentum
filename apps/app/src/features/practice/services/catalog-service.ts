import type { MomentumStorage } from "@momentum/storage";
import { seedRiyaazSkillPack } from "@momentum/storage/seed";
import type {
  ExerciseRecord,
  PracticePlanRecord,
  SkillRecord,
} from "@momentum/types";

export interface PracticeCatalog {
  skill: SkillRecord;
  plan: PracticePlanRecord;
  exercises: ExerciseRecord[];
}

/**
 * Ensures the Riyaaz catalog (skill/exercises/plan) exists, seeding it on
 * first use. Every seed() call only inserts when its table is empty, so
 * calling this on every Practice mount is safe and idempotent. Returns
 * null if no usable plan exists even after seeding — an honest empty
 * state for the UI rather than a crash.
 */
export async function ensurePracticeCatalog(
  storage: MomentumStorage,
): Promise<PracticeCatalog | null> {
  let skill = await storage.skills.getBySlug("riyaaz");
  if (!skill) {
    await seedRiyaazSkillPack(storage);
    skill = await storage.skills.getBySlug("riyaaz");
  }
  if (!skill) {
    return null;
  }

  const [plans, exercises] = await Promise.all([
    storage.practicePlans.listBySkill(skill.id),
    storage.exercises.listBySkill(skill.id),
  ]);

  const plan = plans.find((candidate) => !candidate.isRecoveryPlan) ?? plans[0];
  if (!plan || exercises.length === 0) {
    return null;
  }

  return { skill, plan, exercises };
}
