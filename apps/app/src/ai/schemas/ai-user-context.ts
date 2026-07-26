import { z } from "zod";
import { EXERCISE_CATEGORIES } from "@momentum/types";

/**
 * Sprint 9 "AI Memory": every provider call receives the same assembled
 * context, built once client-side (src/ai/services/assemble-ai-context.ts)
 * from real Dexie data and POSTed to the relevant /api/ai/* route. Nothing
 * here is ever fabricated — a field is `null`/empty when the user genuinely
 * has no data yet (e.g. a brand-new profile), never filled with a plausible
 * guess.
 */
export const AiProfileContextSchema = z.object({
  displayName: z.string().nullable(),
  age: z.number().nullable(),
  activeSkillId: z.string().nullable(),
  onboardingCompletedAt: z.number().nullable(),
});

export const AiStreakContextSchema = z.object({
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
  lastPracticeDate: z.string().nullable(),
});

export const AiStatisticsContextSchema = z.object({
  last30Days: z.array(
    z.object({
      date: z.string(),
      practiceMinutes: z.number().nonnegative(),
      sessionsCompleted: z.number().int().nonnegative(),
    }),
  ),
});

export const AiRecentSessionContextSchema = z.object({
  sessionId: z.string(),
  completedAt: z.number().nullable(),
  elapsedSeconds: z.number().nonnegative(),
  exercisesCompleted: z.number().int().nonnegative(),
  dailyScore: z.number().nullable(),
  xpEarned: z.number().nullable(),
});

export const AiRecentRecordingContextSchema = z.object({
  recordingId: z.string(),
  createdAt: z.number(),
  durationMs: z.number().nonnegative(),
  title: z.string().nullable(),
});

export const AiAchievementContextSchema = z.object({
  key: z.string(),
  status: z.string(),
  unlockedAt: z.number().nullable(),
});

export const AiGoalContextSchema = z.object({
  date: z.string(),
  completed: z.boolean(),
});

export const AiCoachHistoryEntryContextSchema = z.object({
  role: z.enum(["user", "coach"]),
  message: z.string(),
  createdAt: z.number(),
});

export const AiRecommendationContextSchema = z.object({
  category: z.string(),
  title: z.string(),
  priority: z.number(),
  createdAt: z.number(),
});

export const AiExerciseDistributionContextSchema = z.object({
  category: z.enum(EXERCISE_CATEGORIES),
  count: z.number().int().nonnegative(),
});

export const AiBaselineContextSchema = z
  .object({
    overallScore: z.number(),
    metrics: z.record(z.string(), z.number()),
    createdAt: z.number(),
  })
  .nullable();

export const AiUserContextSchema = z.object({
  profile: AiProfileContextSchema,
  streak: AiStreakContextSchema,
  statistics: AiStatisticsContextSchema,
  recentSessions: z.array(AiRecentSessionContextSchema),
  recentRecordings: z.array(AiRecentRecordingContextSchema),
  achievements: z.array(AiAchievementContextSchema),
  goals: z.array(AiGoalContextSchema),
  coachHistory: z.array(AiCoachHistoryEntryContextSchema),
  recommendations: z.array(AiRecommendationContextSchema),
  exerciseDistribution: z.array(AiExerciseDistributionContextSchema),
  baseline: AiBaselineContextSchema,
});

export type AiUserContext = z.infer<typeof AiUserContextSchema>;
