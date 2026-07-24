import type { MomentumStorage } from "@momentum/storage";
import type { ExerciseCategory, PracticeSessionRecord } from "@momentum/types";
import {
  calculateCategoryScore,
  calculateDailyScore,
  calculateGrowthScore,
  calculateMomentumDelta,
  calculateSessionXp,
  isQualifyingSession,
  type CategoryCompletion,
} from "@momentum/engine";
import { toDateOnly } from "@/lib/date";

export interface SessionNote {
  exerciseTitle: string;
  note: string;
}

export interface PersonalBests {
  isLongestSession: boolean;
  isMostExercisesCompleted: boolean;
  isBestDailyScore: boolean;
}

export interface StreakImpact {
  qualifying: boolean;
  current: number;
  longest: number;
  extended: boolean;
}

export interface PracticeConsistency {
  daysPracticed: number;
  totalDays: number;
}

export interface SessionSummaryView {
  session: PracticeSessionRecord;
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  totalExercises: number;
  xpEarned: number;
  dailyScore: number;
  streak: StreakImpact;
  consistency: PracticeConsistency;
  recordingCount: number;
  notes: SessionNote[];
  personalBests: PersonalBests;
  motivationalMessage: string;
}

const CONSISTENCY_WINDOW_DAYS = 7;
const GROWTH_WINDOW_DAYS = 30;
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365];

function daysAgoKey(days: number, from: Date): string {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return toDateOnly(date);
}

function buildMotivationalMessage(input: {
  personalBests: PersonalBests;
  streak: StreakImpact;
  allExercisesCompleted: boolean;
  totalExercises: number;
}): string {
  const { personalBests, streak, allExercisesCompleted, totalExercises } =
    input;
  if (personalBests.isBestDailyScore) {
    return "New personal best! Your strongest session yet.";
  }
  if (streak.extended && STREAK_MILESTONES.includes(streak.current)) {
    return `🔥 ${streak.current}-day streak! That's a milestone.`;
  }
  if (streak.extended) {
    return `Streak extended to ${streak.current} days — keep it going.`;
  }
  if (allExercisesCompleted && totalExercises > 0) {
    return "Full session complete. Nice work.";
  }
  return "You showed up today. That's what builds momentum.";
}

/**
 * Builds the full Session Summary for a just-completed session
 * (docs/engineering/scoring-engine.md), and performs exactly the writes a
 * completed session should cause: one SessionSummary row, one day's
 * statistics upsert, and — only for a qualifying session — one streak
 * update. Called once, from `finishSession`: `statistics.upsertForDate` is
 * additive, so calling this a second time for the same session would
 * double-count practice minutes.
 */
export async function buildSessionSummary(
  storage: MomentumStorage,
  session: PracticeSessionRecord,
): Promise<SessionSummaryView> {
  const today = new Date();
  const todayKey = toDateOnly(today);

  const [
    attempts,
    recordings,
    exercises,
    pastSessions,
    pastSummaries,
    statistics,
  ] = await Promise.all([
    storage.exerciseAttempts.listBySession(session.id),
    storage.recordings.listBySession(session.id),
    session.skillId
      ? storage.exercises.listBySkill(session.skillId)
      : Promise.resolve([]),
    storage.sessions.listCompleted(),
    storage.sessionSummaries.list(),
    storage.statistics.list(),
  ]);

  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );

  const exercisesCompleted = attempts.filter(
    (attempt) => attempt.status === "completed",
  ).length;
  const exercisesSkipped = attempts.filter(
    (attempt) => attempt.status === "skipped",
  ).length;
  const totalExercises = attempts.length;
  const hasRecording = recordings.length > 0;
  const hasReflection = attempts.some((attempt) => attempt.reflectionComplete);
  const allExercisesCompleted = totalExercises > 0 && exercisesSkipped === 0;

  // Daily Score: one completion ratio per category actually attempted this session.
  const durationByCategory = new Map<
    ExerciseCategory,
    { attempted: number; target: number }
  >();
  for (const attempt of attempts) {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) continue;
    const bucket = durationByCategory.get(exercise.category) ?? {
      attempted: 0,
      target: 0,
    };
    bucket.attempted += attempt.durationSeconds;
    bucket.target += exercise.targetDurationSeconds;
    durationByCategory.set(exercise.category, bucket);
  }
  const categoryCompletions: CategoryCompletion[] = Array.from(
    durationByCategory.entries(),
  ).map(([category, { attempted, target }]) => ({
    category,
    score: calculateCategoryScore(attempted, target),
  }));
  const dailyScore = calculateDailyScore(categoryCompletions);

  const xpEarned = calculateSessionXp({ hasRecording, hasReflection });

  const qualifying = isQualifyingSession({
    durationSeconds: session.elapsedSeconds,
    recoveryMode: session.recoveryMode,
  });

  // Streak: only a qualifying session advances it — recordPracticeDay is
  // itself idempotent per date, so a second same-day qualifying session
  // never double-counts.
  const streakBefore = await storage.streaks.get(session.skillId);
  let streakCurrent = streakBefore?.current ?? 0;
  let streakLongest = streakBefore?.longest ?? 0;
  if (qualifying) {
    const updatedStreak = await storage.streaks.recordPracticeDay(
      session.skillId,
      todayKey,
    );
    streakCurrent = updatedStreak.current;
    streakLongest = updatedStreak.longest;
  }
  const streak: StreakImpact = {
    qualifying,
    current: streakCurrent,
    longest: streakLongest,
    extended: qualifying && streakCurrent > (streakBefore?.current ?? 0),
  };

  const momentumDelta = calculateMomentumDelta({
    qualifyingSessionCompleted: qualifying,
    allExercisesCompleted,
    recoveryCompleted: session.recoveryMode,
    reflectionCompleted: hasReflection,
  });

  // Practice consistency: distinct practice days in the trailing week, from
  // the same statistics rows the Dashboard reads — plus this session's own
  // day, which is about to be written below.
  const consistencyWindowStart = daysAgoKey(CONSISTENCY_WINDOW_DAYS - 1, today);
  const practiceDatesInWindow = new Set(
    statistics
      .filter(
        (entry) =>
          entry.date >= consistencyWindowStart &&
          entry.date <= todayKey &&
          (entry.practiceMinutes > 0 || entry.sessionsCompleted > 0),
      )
      .map((entry) => entry.date),
  );
  practiceDatesInWindow.add(todayKey);
  const consistency: PracticeConsistency = {
    daysPracticed: practiceDatesInWindow.size,
    totalDays: CONSISTENCY_WINDOW_DAYS,
  };

  // Growth score input: 30-day consistency ratio, including today.
  const growthWindowStart = daysAgoKey(GROWTH_WINDOW_DAYS - 1, today);
  const growthDates = new Set(
    statistics
      .filter(
        (entry) =>
          entry.date >= growthWindowStart &&
          entry.date <= todayKey &&
          (entry.practiceMinutes > 0 || entry.sessionsCompleted > 0),
      )
      .map((entry) => entry.date),
  );
  growthDates.add(todayKey);
  const growthScore = calculateGrowthScore(
    growthDates.size / GROWTH_WINDOW_DAYS,
  );

  // Personal bests: compare against every other completed session/summary so far.
  const otherSessions = pastSessions.filter((past) => past.id !== session.id);
  const longestPastSessionSeconds = otherSessions.reduce(
    (max, past) => Math.max(max, past.elapsedSeconds),
    0,
  );
  const bestPastScore = pastSummaries.reduce(
    (max, summary) =>
      summary.overallScore !== null ? Math.max(max, summary.overallScore) : max,
    0,
  );
  const pastAttemptCounts = await Promise.all(
    otherSessions.map((past) =>
      storage.exerciseAttempts.listBySession(past.id),
    ),
  );
  const mostPastExercises = pastAttemptCounts.reduce(
    (max, list) => Math.max(max, list.length),
    0,
  );

  const personalBests: PersonalBests = {
    isLongestSession:
      otherSessions.length > 0 &&
      session.elapsedSeconds > longestPastSessionSeconds,
    isMostExercisesCompleted:
      otherSessions.length > 0 && totalExercises > mostPastExercises,
    isBestDailyScore: pastSummaries.length > 0 && dailyScore > bestPastScore,
  };

  const notes: SessionNote[] = attempts
    .filter((attempt) => Boolean(attempt.notes))
    .map((attempt) => ({
      exerciseTitle: exerciseById.get(attempt.exerciseId)?.title ?? "Exercise",
      note: attempt.notes ?? "",
    }));

  const motivationalMessage = buildMotivationalMessage({
    personalBests,
    streak,
    allExercisesCompleted,
    totalExercises,
  });

  // Persist — exactly once per session, called from finishSession.
  await storage.statistics.upsertForDate({
    date: todayKey,
    practiceMinutes: Math.round(session.elapsedSeconds / 60),
    sessionsCompleted: 1,
    growthScore,
  });

  await storage.sessionSummaries.create({
    sessionId: session.id,
    xpEarned,
    overallScore: dailyScore,
    momentumDelta,
    coachMessage: motivationalMessage,
  });

  return {
    session,
    durationSeconds: session.elapsedSeconds,
    exercisesCompleted,
    exercisesSkipped,
    totalExercises,
    xpEarned,
    dailyScore,
    streak,
    consistency,
    recordingCount: recordings.length,
    notes,
    personalBests,
    motivationalMessage,
  };
}
