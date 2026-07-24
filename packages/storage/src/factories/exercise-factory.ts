import { generateId } from "@momentum/utils";
import {
  ExerciseSchema,
  type ExerciseCategory,
  type ExerciseDifficulty,
  type ExerciseRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateExerciseInput {
  skillId: string;
  category: ExerciseCategory;
  title: string;
  description?: string;
  targetDurationSeconds: number;
  difficulty?: ExerciseDifficulty;
  order: number;
}

export function createExercise(input: CreateExerciseInput): ExerciseRecord {
  return parseOrThrow(ExerciseSchema, "Exercise", {
    id: generateId(),
    skillId: input.skillId,
    category: input.category,
    title: input.title,
    description: input.description ?? "",
    targetDurationSeconds: input.targetDurationSeconds,
    difficulty: input.difficulty ?? "easy",
    order: input.order,
  });
}
