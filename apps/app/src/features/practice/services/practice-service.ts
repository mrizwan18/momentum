import type { MomentumStorage } from "@momentum/storage";
import type {
  ExerciseAttemptStatus,
  ExerciseDifficulty,
  PracticePlanRecord,
  PracticeSessionRecord,
  VoiceCondition,
} from "@momentum/types";
import {
  buildSessionSummary,
  type SessionSummaryView,
} from "@/features/summary";
import { toDateOnly } from "@/lib/date";
import { syncPushEngagement } from "@/lib/push/sync-engagement-client";

export interface StartSessionParams {
  skillId: string;
  plan: PracticePlanRecord;
  voiceCondition?: VoiceCondition | null;
  recoveryMode?: boolean;
}

/** Looks for a session left `in_progress` or `paused` from a prior visit. */
export async function findResumableSession(
  storage: MomentumStorage,
): Promise<PracticeSessionRecord | undefined> {
  return storage.sessions.getActive();
}

export async function startSession(
  storage: MomentumStorage,
  params: StartSessionParams,
): Promise<PracticeSessionRecord> {
  return storage.sessions.start(params.plan.exerciseIds, {
    skillId: params.skillId,
    planId: params.plan.id,
    voiceCondition: params.voiceCondition ?? null,
    recoveryMode: params.recoveryMode ?? false,
  });
}

export async function pauseSession(
  storage: MomentumStorage,
  sessionId: string,
): Promise<PracticeSessionRecord> {
  return storage.sessions.pause(sessionId);
}

export async function resumeSession(
  storage: MomentumStorage,
  sessionId: string,
): Promise<PracticeSessionRecord> {
  return storage.sessions.resume(sessionId);
}

export async function cancelSession(
  storage: MomentumStorage,
  sessionId: string,
): Promise<PracticeSessionRecord> {
  return storage.sessions.abandon(sessionId);
}

export interface AutosaveInput {
  elapsedSeconds?: number;
  draftNotes?: string | null;
}

/** Called on a timer/interval while Practicing — never touches currentStepIndex. */
export async function autosaveProgress(
  storage: MomentumStorage,
  sessionId: string,
  patch: AutosaveInput,
): Promise<PracticeSessionRecord> {
  return storage.sessions.updateProgress(sessionId, patch);
}

export interface CompleteExerciseInput {
  exerciseId: string;
  status: ExerciseAttemptStatus;
  durationSeconds: number;
  difficultyRating?: ExerciseDifficulty | null;
  notes?: string | null;
  reflectionComplete?: boolean;
}

export interface AdvanceResult {
  session: PracticeSessionRecord;
  isFinalExercise: boolean;
}

/**
 * Records a durable ExerciseAttempt for the exercise just finished/skipped,
 * then advances the session's queue position and clears the per-exercise
 * draft notes (they've been promoted onto the attempt via `notes`).
 * Returns `isFinalExercise: true` when the queue is exhausted so the
 * caller can dispatch FINISH instead of ADVANCE.
 */
export async function completeCurrentExercise(
  storage: MomentumStorage,
  session: PracticeSessionRecord,
  input: CompleteExerciseInput,
): Promise<AdvanceResult> {
  await storage.exerciseAttempts.record({
    sessionId: session.id,
    exerciseId: input.exerciseId,
    status: input.status,
    durationSeconds: input.durationSeconds,
    difficultyRating: input.difficultyRating,
    notes: input.notes,
    reflectionComplete: input.reflectionComplete,
  });

  const nextStepIndex = session.currentStepIndex + 1;
  const isFinalExercise = nextStepIndex >= session.exerciseIds.length;

  const updated = await storage.sessions.updateProgress(session.id, {
    currentStepIndex: nextStepIndex,
    draftNotes: null,
  });

  return { session: updated, isFinalExercise };
}

export interface FinishSessionResult {
  session: PracticeSessionRecord;
  summary: SessionSummaryView;
}

/**
 * Completes the session, then immediately builds and persists its Session
 * Summary (docs/engineering/scoring-engine.md) — XP, daily score, streak,
 * and statistics all get written exactly once, right here, since this is
 * the one point in the app a session transitions to `completed`.
 */
export async function finishSession(
  storage: MomentumStorage,
  session: PracticeSessionRecord,
): Promise<FinishSessionResult> {
  const completed = await storage.sessions.complete(session.id);
  const summary = await buildSessionSummary(storage, completed);
  syncPushEngagement({
    currentStreak: summary.streak.current,
    lastPracticedDate: toDateOnly(new Date()),
  });
  return { session: completed, summary };
}
