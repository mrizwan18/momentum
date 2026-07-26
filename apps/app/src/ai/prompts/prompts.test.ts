import { describe, expect, it } from "vitest";
import type { AiUserContext } from "../schemas/ai-user-context";
import { buildSessionSummaryPrompt } from "./session-summary";
import { buildDashboardInsightPrompt } from "./dashboard-insight";
import { buildRecommendationPrompt } from "./recommendation";
import { buildWeeklyReportPrompt } from "./weekly-report";
import { buildProgressComparisonPrompt } from "./progress-comparison";

function emptyContext(overrides: Partial<AiUserContext> = {}): AiUserContext {
  return {
    profile: {
      displayName: null,
      age: null,
      activeSkillId: null,
      onboardingCompletedAt: null,
    },
    streak: { current: 0, longest: 0, lastPracticeDate: null },
    statistics: { last30Days: [] },
    recentSessions: [],
    recentRecordings: [],
    achievements: [],
    goals: [],
    coachHistory: [],
    recommendations: [],
    exerciseDistribution: [],
    baseline: null,
    ...overrides,
  };
}

describe("buildSessionSummaryPrompt", () => {
  it("embeds the real session numbers, never fabricated ones", () => {
    const prompt = buildSessionSummaryPrompt({
      context: emptyContext(),
      session: {
        sessionId: "session-1",
        elapsedSeconds: 600,
        exercisesCompleted: 4,
        dailyScore: 82,
      },
    });
    expect(prompt).toContain("10 minutes");
    expect(prompt).toContain("4 exercise(s) completed");
    expect(prompt).toContain("daily score 82/100");
    expect(prompt).toContain("ONLY valid JSON");
  });

  it("omits a daily score clause when there isn't one yet", () => {
    const prompt = buildSessionSummaryPrompt({
      context: emptyContext(),
      session: {
        sessionId: "s1",
        elapsedSeconds: 60,
        exercisesCompleted: 1,
        dailyScore: null,
      },
    });
    expect(prompt).not.toContain("daily score");
  });

  it("says no audio is attached when the user hasn't opted in to analysis", () => {
    const prompt = buildSessionSummaryPrompt({
      context: emptyContext(),
      session: {
        sessionId: "s1",
        elapsedSeconds: 60,
        exercisesCompleted: 1,
        dailyScore: null,
      },
    });
    expect(prompt).toContain("No audio is attached");
  });

  it("labels every recording by its exercise and notes truncation, when audio is attached", () => {
    const prompt = buildSessionSummaryPrompt({
      context: emptyContext(),
      session: {
        sessionId: "s1",
        elapsedSeconds: 600,
        exercisesCompleted: 2,
        dailyScore: 80,
      },
      audio: [
        {
          base64: "a",
          format: "wav",
          durationSeconds: 30,
          truncated: false,
          exerciseLabel: "Alaap — Pitch Accuracy",
        },
        {
          base64: "b",
          format: "wav",
          durationSeconds: 60,
          truncated: true,
          exerciseLabel: "Taan — Rhythm",
        },
      ],
    });
    expect(prompt).toContain("2 real recording(s)");
    expect(prompt).toContain("Recording 1 — Exercise: Alaap — Pitch Accuracy");
    expect(prompt).toContain("Recording 2 — Exercise: Taan — Rhythm");
    expect(prompt).toContain("audio truncated to the first minute");
    expect(prompt).toContain("ONE cohesive session summary");
  });
});

describe("buildDashboardInsightPrompt", () => {
  it("includes the tone guidance and JSON-only instruction", () => {
    const prompt = buildDashboardInsightPrompt({ context: emptyContext() });
    expect(prompt).toContain("ONLY valid JSON");
    expect(prompt).toContain("todaysFocus");
  });

  it("reflects the user's real display name via describeContext", () => {
    const prompt = buildDashboardInsightPrompt({
      context: emptyContext({
        profile: {
          displayName: "Riyaaz",
          age: null,
          activeSkillId: null,
          onboardingCompletedAt: null,
        },
      }),
    });
    expect(prompt).toContain("Riyaaz");
  });
});

describe("buildRecommendationPrompt", () => {
  it("asks for exactly one recommendation with a valid category enum", () => {
    const prompt = buildRecommendationPrompt({ context: emptyContext() });
    expect(prompt).toContain("exactly ONE");
    expect(prompt).toContain("weakest_habit");
  });
});

describe("buildWeeklyReportPrompt", () => {
  it("asks for every docs/features/coach.md Weekly Report field", () => {
    const prompt = buildWeeklyReportPrompt({ context: emptyContext() });
    expect(prompt).toContain("strongestHabit");
    expect(prompt).toContain("improvementArea");
    expect(prompt).toContain("recommendedFocus");
    expect(prompt).toContain("comparedToPreviousWeek");
  });
});

describe("buildProgressComparisonPrompt", () => {
  it("embeds the already-computed numbers verbatim and instructs the model not to change them", () => {
    const prompt = buildProgressComparisonPrompt({
      context: emptyContext(),
      comparison: {
        progressPercent: 15,
        pitchImprovement: 10,
        rhythmImprovement: -5,
        confidenceImprovement: 0,
        consistencyImprovement: 8,
        rangeImprovement: 3,
        trend: "improving",
      },
    });
    expect(prompt).toContain("do not change them");
    expect(prompt).toContain("Overall progress: 15%");
    expect(prompt).toContain("Pitch improvement: 10%");
    expect(prompt).toContain('"trend": "improving"');
  });
});
