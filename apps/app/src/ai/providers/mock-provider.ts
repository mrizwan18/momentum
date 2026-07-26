import "server-only";

import { VOCAL_METRIC_KEYS, type VocalMetrics } from "@momentum/types";
import type {
  AiProvider,
  GenerateAssessmentInput,
  GenerateCoachReplyInput,
  GenerateDashboardInsightInput,
  GenerateProgressInsightsInput,
  GenerateRecommendationInput,
  GenerateSessionInsightInput,
  GenerateWeeklySummaryInput,
} from "../types";
import { hashString, mulberry32, pick, scoreInRange } from "./deterministic";

const STRENGTHS_POOL = [
  "Warm, expressive tone",
  "Steady rhythm sense",
  "Confident delivery",
  "Clear pronunciation",
  "Good energy throughout",
  "Natural sense of phrasing",
] as const;

const AREAS_POOL = [
  "Pitch stability on sustained notes",
  "Breath control on longer phrases",
  "Consistency across the full range",
  "Timing on faster passages",
  "Projection in the lower register",
] as const;

function buildMetrics(random: () => number, base: number): VocalMetrics {
  const metrics = {} as VocalMetrics;
  for (const key of VOCAL_METRIC_KEYS) {
    metrics[key] = scoreInRange(random, base, 20);
  }
  return metrics;
}

function averageMetrics(metrics: VocalMetrics): number {
  const values = VOCAL_METRIC_KEYS.map((key) => metrics[key]);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Deterministic, offline-safe, zero-network provider — the only provider
 * guaranteed to run in every environment (dev, tests, and as the Gateway's
 * automatic fallback when a real provider is unavailable). Every output is
 * derived from the real fields on `context`/`input` via a seeded PRNG, never
 * `Math.random()` — same input always produces the same output.
 */
export function createMockProvider(): AiProvider {
  return {
    name: "mock",

    async generateAssessment({
      context,
      recordingDurationMs,
    }: GenerateAssessmentInput) {
      const random = mulberry32(
        hashString(
          `assessment:${context.profile.displayName ?? "user"}:${recordingDurationMs}`,
        ),
      );
      const metrics = buildMetrics(random, 55);
      const overallScore = averageMetrics(metrics);
      const name = context.profile.displayName
        ? `, ${context.profile.displayName}`
        : "";

      return {
        overallScore,
        metrics,
        strengths: [
          pick(STRENGTHS_POOL, random),
          pick(STRENGTHS_POOL, random),
        ].filter((value, index, all) => all.indexOf(value) === index),
        areasToImprove: [pick(AREAS_POOL, random)],
        recommendedDailyPractice:
          "Start with 5 minutes of breathing exercises, then 10 minutes of scales.",
        recommendedDurationMinutes: overallScore >= 70 ? 20 : 15,
        suggestedSkillLevel: overallScore >= 75 ? "intermediate" : "beginner",
        difficulty: overallScore >= 75 ? "medium" : "easy",
        motivationalSummary: `You're off to a solid start${name} — ${overallScore}/100 on your very first recording. Every session from here builds on this baseline.`,
      };
    },

    async generateSessionSummary({
      context,
      session,
    }: GenerateSessionInsightInput) {
      const random = mulberry32(hashString(`session:${session.sessionId}`));
      const metrics = buildMetrics(
        random,
        context.baseline?.overallScore ?? 55,
      );
      const minutes = Math.round(session.elapsedSeconds / 60);

      return {
        whatImproved:
          session.dailyScore && session.dailyScore >= 70
            ? ["Overall consistency"]
            : ["Showing up today"],
        whatDeclined: [],
        bestMoment:
          session.exercisesCompleted > 0
            ? `Completing ${session.exercisesCompleted} exercise${session.exercisesCompleted === 1 ? "" : "s"} in one sitting`
            : "Starting the session at all",
        biggestOpportunity: pick(AREAS_POOL, random),
        tomorrowsGoal:
          "Focus on one breathing exercise before you start singing.",
        encouragingSentence: `${minutes} minute${minutes === 1 ? "" : "s"} of practice is ${minutes} minutes closer to your goal.`,
        metricsSnapshot: metrics,
      };
    },

    async generateDashboardInsight({ context }: GenerateDashboardInsightInput) {
      const random = mulberry32(
        hashString(
          `dashboard:${context.streak.current}:${context.statistics.last30Days.length}`,
        ),
      );
      const practicedRecently = context.streak.lastPracticeDate !== null;
      const streakPart =
        context.streak.current > 0
          ? `You're on a ${context.streak.current}-day streak.`
          : practicedRecently
            ? "Your streak reset, but every day is a fresh start."
            : "Ready for your first session?";

      return {
        todaysFocus: pick(AREAS_POOL, random),
        dailyInsight: streakPart,
        motivationalMessage:
          "Consistency beats intensity — a short session today still counts.",
        practiceRecommendation:
          "10 minutes of scales followed by your current song.",
        estimatedImprovementPercent:
          context.statistics.last30Days.length > 0
            ? scoreInRange(random, 3, 8)
            : null,
        suggestedSessionLengthMinutes: 15,
        recoveryAdvice:
          context.streak.current === 0 && practicedRecently
            ? "Welcome back — a short practice today is enough to rebuild momentum."
            : null,
      };
    },

    async generateCoachReply({ context, message }: GenerateCoachReplyInput) {
      const random = mulberry32(
        hashString(`coach:${message}:${context.coachHistory.length}`),
      );
      const observation =
        context.streak.current > 0
          ? `You've practiced ${context.streak.current} day${context.streak.current === 1 ? "" : "s"} in a row.`
          : "You're just getting started, which is the hardest part.";

      return {
        message: `${observation} On "${message}" — try focusing on ${pick(AREAS_POOL, random).toLowerCase()}. Small, consistent adjustments compound quickly.`,
        suggestedExercises: [pick(AREAS_POOL, random)],
      };
    },

    async generateProgressInsights({
      comparison,
    }: GenerateProgressInsightsInput) {
      const direction =
        comparison.trend === "improving"
          ? "You're trending upward"
          : comparison.trend === "declining"
            ? "Your recent sessions have dipped a little"
            : "You're holding steady";

      return {
        ...comparison,
        summary: `${direction} compared to your baseline — ${comparison.progressPercent >= 0 ? "+" : ""}${comparison.progressPercent}% overall.`,
      };
    },

    async generateRecommendation({ context }: GenerateRecommendationInput) {
      const random = mulberry32(
        hashString(`recommendation:${context.streak.current}`),
      );
      const dueForRecovery =
        context.streak.current === 0 &&
        context.streak.lastPracticeDate !== null;

      return {
        title: dueForRecovery
          ? "Ease back in with a short session"
          : "Practice your current focus area",
        reason: dueForRecovery
          ? "You've missed a few days — a short, low-pressure session rebuilds momentum fastest."
          : pick(AREAS_POOL, random),
        category: dueForRecovery ? "recovery" : "weakest_habit",
        priority: 1,
        expectedDurationSeconds: dueForRecovery ? 300 : 600,
        xpReward: 50,
        completionCriteria: "Complete at least one exercise",
      };
    },

    async generateWeeklySummary({ context }: GenerateWeeklySummaryInput) {
      const sessionsCompleted = context.recentSessions.length;
      const practiceMinutes = context.statistics.last30Days
        .slice(-7)
        .reduce((sum, day) => sum + day.practiceMinutes, 0);

      return {
        headline:
          sessionsCompleted > 0
            ? `${sessionsCompleted} session${sessionsCompleted === 1 ? "" : "s"} this week`
            : "A quiet week — let's change that",
        sessionsCompleted,
        practiceMinutes,
        strongestHabit:
          context.streak.current > 0
            ? "Daily consistency"
            : "Willingness to start over",
        improvementArea: "Pitch stability on longer phrases",
        recommendedFocus: "Breathing exercises before each session",
        comparedToPreviousWeek:
          practiceMinutes > 0
            ? "Keep the same pace next week."
            : "Aim for at least 3 sessions next week.",
      };
    },
  };
}
