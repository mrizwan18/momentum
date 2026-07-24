import { z } from "zod";

/** docs/features/practice.md Exercise Queue default order. */
export const EXERCISE_CATEGORIES = [
  "breathing",
  "warmup",
  "scales",
  "alankars",
  "song",
  "recording",
  "reflection",
] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EXERCISE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type ExerciseDifficulty = (typeof EXERCISE_DIFFICULTIES)[number];

/** Catalog/content entity — defines an exercise a skill can include in a plan. */
export const ExerciseSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  category: z.enum(EXERCISE_CATEGORIES),
  title: z.string().min(1),
  description: z.string(),
  targetDurationSeconds: z.number().int().min(0),
  difficulty: z.enum(EXERCISE_DIFFICULTIES),
  order: z.number().int().min(0),
});

export type ExerciseRecord = z.infer<typeof ExerciseSchema>;
