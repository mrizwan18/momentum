import { z } from "zod";

export const PRACTICE_SESSION_STATUSES = [
  "in_progress",
  "paused",
  "completed",
  "abandoned",
] as const;
export type PracticeSessionStatus = (typeof PRACTICE_SESSION_STATUSES)[number];

export const VOICE_CONDITIONS = [
  "fresh",
  "normal",
  "tired",
  "strained",
] as const;
export type VoiceCondition = (typeof VOICE_CONDITIONS)[number];

/**
 * docs/features/practice.md Session Lifecycle: Idle -> Prepare -> Warmup ->
 * Exercise -> Recording -> Reflection -> Summary -> Completed. Only the
 * top-level status is persisted as an enum; where the user is within an
 * in-progress session is tracked by exerciseIds + currentStepIndex.
 */
export const PracticeSessionSchema = z.object({
  id: z.string(),
  status: z.enum(PRACTICE_SESSION_STATUSES),
  /** Null for sessions created before Sprint 4 introduced skills/plans. */
  skillId: z.string().nullable(),
  planId: z.string().nullable(),
  exerciseIds: z.array(z.string()),
  currentStepIndex: z.number().int().min(0),
  elapsedSeconds: z.number().min(0),
  voiceCondition: z.enum(VOICE_CONDITIONS).nullable(),
  /** docs/features/practice.md Recovery Mode: a shortened, eased-back-in session. */
  recoveryMode: z.boolean(),
  /**
   * Notes for the exercise currently in progress, autosaved continuously
   * so they survive a crash — they're only promoted to a durable
   * ExerciseAttempt.notes once that exercise is completed or skipped.
   */
  draftNotes: z.string().nullable(),
  startedAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().nullable(),
});

export type PracticeSessionRecord = z.infer<typeof PracticeSessionSchema>;
