import { z } from "zod";
import { EXERCISE_DIFFICULTIES } from "./exercise";

export const EXERCISE_ATTEMPT_STATUSES = ["completed", "skipped"] as const;
export type ExerciseAttemptStatus = (typeof EXERCISE_ATTEMPT_STATUSES)[number];

/**
 * docs/features/practice.md Scoring Hooks: duration, completion, difficulty,
 * skipped, notes, recording present, reflection complete — one row per
 * exercise a user actually attempted within a session (as opposed to
 * PracticeSessionRecord.exerciseIds, which is just the planned queue).
 */
export const ExerciseAttemptSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  status: z.enum(EXERCISE_ATTEMPT_STATUSES),
  durationSeconds: z.number().min(0),
  difficultyRating: z.enum(EXERCISE_DIFFICULTIES).nullable(),
  notes: z.string().nullable(),
  recordingId: z.string().nullable(),
  reflectionComplete: z.boolean(),
  createdAt: z.number(),
});

export type ExerciseAttemptRecord = z.infer<typeof ExerciseAttemptSchema>;
