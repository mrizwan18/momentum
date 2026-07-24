import { generateId } from "@momentum/utils";
import {
  ExerciseAttemptSchema,
  type ExerciseAttemptRecord,
  type ExerciseAttemptStatus,
  type ExerciseDifficulty,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateExerciseAttemptInput {
  sessionId: string;
  exerciseId: string;
  status: ExerciseAttemptStatus;
  durationSeconds: number;
  difficultyRating?: ExerciseDifficulty | null;
  notes?: string | null;
  recordingId?: string | null;
  reflectionComplete?: boolean;
}

export function createExerciseAttempt(
  input: CreateExerciseAttemptInput,
): ExerciseAttemptRecord {
  return parseOrThrow(ExerciseAttemptSchema, "ExerciseAttempt", {
    id: generateId(),
    sessionId: input.sessionId,
    exerciseId: input.exerciseId,
    status: input.status,
    durationSeconds: input.durationSeconds,
    difficultyRating: input.difficultyRating ?? null,
    notes: input.notes ?? null,
    recordingId: input.recordingId ?? null,
    reflectionComplete: input.reflectionComplete ?? false,
    createdAt: Date.now(),
  });
}
