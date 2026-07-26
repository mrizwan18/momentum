import type { MomentumStorage } from "@momentum/storage";
import { toDateOnly } from "@/lib/date";
import type { AiUserContext } from "../schemas/ai-user-context";

const RECENT_SESSIONS_LIMIT = 10;
const RECENT_RECORDINGS_LIMIT = 5;
const COACH_HISTORY_LIMIT = 20;
const STATISTICS_WINDOW_DAYS = 30;

/**
 * Sprint 9 "AI Memory": the ONE place that assembles what every AI
 * operation is grounded in. Runs client-side (Dexie only exists in the
 * browser) — the assembled context is then POSTed to /api/ai/* routes,
 * which run it through the Gateway server-side. Features never manually
 * build this themselves.
 */
export async function assembleAiContext(
  storage: MomentumStorage,
): Promise<AiUserContext> {
  const [
    user,
    streak,
    statistics,
    terminalSessions,
    sessionSummaries,
    recordingSummaries,
    achievements,
    todaysGoal,
    coachMessages,
    latestRecommendation,
    exerciseAttempts,
    exercises,
    baseline,
  ] = await Promise.all([
    storage.users.get(),
    storage.streaks.get(null),
    storage.statistics.list(),
    storage.sessions.listTerminal(),
    storage.sessionSummaries.list(),
    storage.recordings.listSummaries(),
    storage.achievements.list(),
    storage.dailyGoals.getForDate(toDateOnly(new Date())),
    storage.coachMessages.list(COACH_HISTORY_LIMIT),
    storage.recommendations.getLatest(),
    storage.exerciseAttempts.listAll(),
    storage.exercises.listAll(),
    storage.baselineAssessments.get(),
  ]);

  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const summaryBySession = new Map(
    sessionSummaries.map((summary) => [summary.sessionId, summary]),
  );

  const recentSessions = terminalSessions
    .filter((session) => session.status === "completed")
    .slice(-RECENT_SESSIONS_LIMIT)
    .map((session) => {
      const summary = summaryBySession.get(session.id);
      return {
        sessionId: session.id,
        completedAt: session.completedAt,
        elapsedSeconds: session.elapsedSeconds,
        exercisesCompleted: exerciseAttempts.filter(
          (attempt) =>
            attempt.sessionId === session.id && attempt.status === "completed",
        ).length,
        dailyScore: summary?.overallScore ?? null,
        xpEarned: summary?.xpEarned ?? null,
      };
    });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (STATISTICS_WINDOW_DAYS - 1));
  const cutoffKey = toDateOnly(cutoff);

  const distributionByCategory = new Map<string, number>();
  for (const attempt of exerciseAttempts) {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) continue;
    distributionByCategory.set(
      exercise.category,
      (distributionByCategory.get(exercise.category) ?? 0) + 1,
    );
  }

  return {
    profile: {
      displayName: user?.displayName ?? null,
      age: user?.age ?? null,
      activeSkillId: user?.activeSkillId ?? null,
      onboardingCompletedAt: user?.onboardingCompletedAt ?? null,
    },
    streak: {
      current: streak?.current ?? 0,
      longest: streak?.longest ?? 0,
      lastPracticeDate: streak?.lastPracticeDate ?? null,
    },
    statistics: {
      last30Days: statistics
        .filter((entry) => entry.date >= cutoffKey)
        .map((entry) => ({
          date: entry.date,
          practiceMinutes: entry.practiceMinutes,
          sessionsCompleted: entry.sessionsCompleted,
        })),
    },
    recentSessions,
    recentRecordings: recordingSummaries
      .slice(0, RECENT_RECORDINGS_LIMIT)
      .map((recording) => ({
        recordingId: recording.id,
        createdAt: recording.createdAt,
        durationMs: recording.durationMs,
        title: recording.title,
      })),
    achievements: achievements
      .filter((achievement) => achievement.status === "unlocked")
      .map((achievement) => ({
        key: achievement.key,
        status: achievement.status,
        unlockedAt: achievement.unlockedAt,
      })),
    goals: todaysGoal
      ? [{ date: todaysGoal.date, completed: todaysGoal.completed }]
      : [],
    coachHistory: coachMessages.map((message) => ({
      role: message.role,
      message: message.message,
      createdAt: message.createdAt,
    })),
    recommendations: latestRecommendation
      ? [
          {
            category: latestRecommendation.category,
            title: latestRecommendation.title,
            priority: latestRecommendation.priority,
            createdAt: latestRecommendation.createdAt,
          },
        ]
      : [],
    exerciseDistribution: Array.from(distributionByCategory.entries()).map(
      ([category, count]) => ({
        category:
          category as AiUserContext["exerciseDistribution"][number]["category"],
        count,
      }),
    ),
    baseline: baseline
      ? {
          overallScore: baseline.overallScore,
          metrics: baseline.metrics,
          createdAt: baseline.createdAt,
        }
      : null,
  };
}
