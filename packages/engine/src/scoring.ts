import type { ExerciseCategory } from "@momentum/types";

/**
 * docs/engineering/scoring-engine.md Daily Score weights. The doc's
 * "Technique" category maps onto this app's `alankars` exercise category —
 * every other name matches `ExerciseCategory` directly. Weights sum to 1.00.
 */
const CATEGORY_WEIGHTS: Record<ExerciseCategory, number> = {
  breathing: 0.15,
  warmup: 0.1,
  scales: 0.2,
  alankars: 0.2,
  song: 0.2,
  recording: 0.1,
  reflection: 0.05,
};

/** A single category's 0-100 completion ratio for one session, before weighting. */
export interface CategoryCompletion {
  category: ExerciseCategory;
  score: number;
}

/**
 * How much of an exercise's target duration was actually practiced, 0-100.
 * An exercise with no target duration (e.g. an open-ended Reflection) counts
 * as fully done once attempted at all.
 */
export function calculateCategoryScore(
  attemptedSeconds: number,
  targetDurationSeconds: number,
): number {
  if (targetDurationSeconds <= 0) {
    return attemptedSeconds > 0 ? 100 : 0;
  }
  const ratio = attemptedSeconds / targetDurationSeconds;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

/**
 * docs/engineering/scoring-engine.md Daily Score: weighted average across
 * categories, 0-100. A category with no entry (not part of this session)
 * contributes 0, per the formula's fixed weights.
 */
export function calculateDailyScore(completions: CategoryCompletion[]): number {
  const scoreByCategory = new Map(
    completions.map((completion) => [completion.category, completion.score]),
  );
  let total = 0;
  for (const category of Object.keys(CATEGORY_WEIGHTS) as ExerciseCategory[]) {
    const score = Math.min(
      100,
      Math.max(0, scoreByCategory.get(category) ?? 0),
    );
    total += score * CATEGORY_WEIGHTS[category];
  }
  return Math.round(total);
}

const SESSION_XP_BASE = 100;
const RECORDING_XP_BONUS = 20;
const REFLECTION_XP_BONUS = 15;

export interface SessionXpInput {
  hasRecording: boolean;
  hasReflection: boolean;
}

/**
 * docs/engineering/scoring-engine.md XP System: Base 100 + bonuses. Side
 * Quest/Weekly Assessment/Chapter Completion bonuses are omitted — those
 * concepts (and their triggering data) don't exist anywhere in the app yet.
 */
export function calculateSessionXp({
  hasRecording,
  hasReflection,
}: SessionXpInput): number {
  let xp = SESSION_XP_BASE;
  if (hasRecording) xp += RECORDING_XP_BONUS;
  if (hasReflection) xp += REFLECTION_XP_BONUS;
  return xp;
}

const QUALIFYING_SESSION_MIN_SECONDS = 10 * 60;

export interface QualifyingSessionInput {
  durationSeconds: number;
  recoveryMode: boolean;
}

/** docs/engineering/scoring-engine.md Streak Rules: a qualifying session is >=10 minutes OR a recovery session. */
export function isQualifyingSession({
  durationSeconds,
  recoveryMode,
}: QualifyingSessionInput): boolean {
  return durationSeconds >= QUALIFYING_SESSION_MIN_SECONDS || recoveryMode;
}

export interface MomentumDeltaInput {
  qualifyingSessionCompleted: boolean;
  allExercisesCompleted: boolean;
  recoveryCompleted: boolean;
  reflectionCompleted: boolean;
}

const MOMENTUM_PRACTICE_BONUS = 5;
const MOMENTUM_ALL_EXERCISES_BONUS = 3;
const MOMENTUM_RECOVERY_BONUS = 5;
const MOMENTUM_REFLECTION_BONUS = 2;

/**
 * docs/engineering/scoring-engine.md Momentum Score: only the increase side
 * is computable from a single just-completed session — the decrease side
 * ("consecutive missed days") is a rolling, cross-session concern owned by
 * whatever reads Momentum over time, not a single session's delta. Point
 * values are this implementation's own assumption: the doc specifies
 * direction, not magnitude.
 */
export function calculateMomentumDelta(input: MomentumDeltaInput): number {
  let delta = 0;
  if (input.qualifyingSessionCompleted) delta += MOMENTUM_PRACTICE_BONUS;
  if (input.allExercisesCompleted) delta += MOMENTUM_ALL_EXERCISES_BONUS;
  if (input.recoveryCompleted) delta += MOMENTUM_RECOVERY_BONUS;
  if (input.reflectionCompleted) delta += MOMENTUM_REFLECTION_BONUS;
  return delta;
}

/**
 * docs/engineering/scoring-engine.md Growth Score: "updated once per
 * completed session using a rolling average... changes slowly to avoid
 * noisy feedback." Scoped to 30-day consistency only — the doc's other
 * inputs (recording frequency, roadmap completion) are omitted since no
 * roadmap engine or reliable historical baseline for them exists yet.
 */
export function calculateGrowthScore(
  last30DaysConsistencyRatio: number,
): number {
  const clamped = Math.min(1, Math.max(0, last30DaysConsistencyRatio));
  return Math.round(clamped * 100);
}
