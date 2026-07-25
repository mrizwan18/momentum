import type {
  ExerciseAttemptRecord,
  ExerciseCategory,
  ExerciseRecord,
} from "@momentum/types";

export interface ExerciseDistributionEntry {
  category: ExerciseCategory;
  count: number;
  totalDurationSeconds: number;
  percent: number;
}

/** Groups every exercise attempt (across all sessions) by its exercise's category. */
export function computeExerciseDistribution(
  attempts: ExerciseAttemptRecord[],
  exercises: ExerciseRecord[],
): ExerciseDistributionEntry[] {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const byCategory = new Map<
    ExerciseCategory,
    { count: number; totalDurationSeconds: number }
  >();
  let matchedCount = 0;

  for (const attempt of attempts) {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) continue;
    matchedCount += 1;
    const bucket = byCategory.get(exercise.category) ?? {
      count: 0,
      totalDurationSeconds: 0,
    };
    bucket.count += 1;
    bucket.totalDurationSeconds += attempt.durationSeconds;
    byCategory.set(exercise.category, bucket);
  }

  return Array.from(byCategory.entries())
    .map(([category, { count, totalDurationSeconds }]) => ({
      category,
      count,
      totalDurationSeconds,
      percent: matchedCount > 0 ? count / matchedCount : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
