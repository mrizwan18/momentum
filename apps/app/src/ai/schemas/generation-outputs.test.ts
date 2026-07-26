import { describe, expect, it } from "vitest";
import {
  BaselineAssessmentGenerationSchema,
  CoachReplyGenerationSchema,
  DashboardInsightGenerationSchema,
  ProgressInsightGenerationSchema,
  RecommendationGenerationSchema,
  SessionInsightGenerationSchema,
  WeeklySummaryGenerationSchema,
} from "./generation-outputs";

const metrics = {
  pitchAccuracy: 70,
  pitchStability: 70,
  rhythm: 70,
  breathControl: 70,
  toneQuality: 70,
  consistency: 70,
  vocalRange: 70,
  confidence: 70,
  timing: 70,
  voiceClarity: 70,
  pronunciation: 70,
  energy: 70,
};

describe("BaselineAssessmentGenerationSchema", () => {
  it("accepts a valid assessment", () => {
    const result = BaselineAssessmentGenerationSchema.safeParse({
      overallScore: 72,
      metrics,
      strengths: ["Good tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a metric score out of range", () => {
    const result = BaselineAssessmentGenerationSchema.safeParse({
      overallScore: 72,
      metrics: { ...metrics, pitchAccuracy: 150 },
      strengths: ["Good tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid skill level", () => {
    const result = BaselineAssessmentGenerationSchema.safeParse({
      overallScore: 72,
      metrics,
      strengths: ["Good tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "expert",
      difficulty: "easy",
      motivationalSummary: "Great start!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty strengths array", () => {
    const result = BaselineAssessmentGenerationSchema.safeParse({
      overallScore: 72,
      metrics,
      strengths: [],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
    });
    expect(result.success).toBe(false);
  });
});

describe("SessionInsightGenerationSchema", () => {
  it("accepts a valid session insight", () => {
    const result = SessionInsightGenerationSchema.safeParse({
      whatImproved: ["Rhythm"],
      whatDeclined: [],
      bestMoment: "The song",
      biggestOpportunity: "Breathing",
      tomorrowsGoal: "Focus on breath",
      encouragingSentence: "Nice job!",
      metricsSnapshot: metrics,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing metricsSnapshot", () => {
    const result = SessionInsightGenerationSchema.safeParse({
      whatImproved: [],
      whatDeclined: [],
      bestMoment: "x",
      biggestOpportunity: "x",
      tomorrowsGoal: "x",
      encouragingSentence: "x",
    });
    expect(result.success).toBe(false);
  });
});

describe("DashboardInsightGenerationSchema", () => {
  it("accepts recoveryAdvice as null", () => {
    const result = DashboardInsightGenerationSchema.safeParse({
      todaysFocus: "Breath",
      dailyInsight: "x",
      motivationalMessage: "x",
      practiceRecommendation: "x",
      estimatedImprovementPercent: null,
      suggestedSessionLengthMinutes: 15,
      recoveryAdvice: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("CoachReplyGenerationSchema", () => {
  it("accepts suggestedExercises as null", () => {
    const result = CoachReplyGenerationSchema.safeParse({
      message: "Keep going",
      suggestedExercises: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = CoachReplyGenerationSchema.safeParse({
      message: "",
      suggestedExercises: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("RecommendationGenerationSchema", () => {
  it("rejects an unknown category", () => {
    const result = RecommendationGenerationSchema.safeParse({
      title: "x",
      reason: "x",
      category: "not_a_real_category",
      priority: 1,
      expectedDurationSeconds: 300,
      xpReward: 50,
      completionCriteria: "x",
    });
    expect(result.success).toBe(false);
  });
});

describe("WeeklySummaryGenerationSchema", () => {
  it("accepts a valid weekly summary", () => {
    const result = WeeklySummaryGenerationSchema.safeParse({
      headline: "Great week",
      sessionsCompleted: 4,
      practiceMinutes: 60,
      strongestHabit: "Consistency",
      improvementArea: "Pitch",
      recommendedFocus: "Breathing",
      comparedToPreviousWeek: "Better than last week",
    });
    expect(result.success).toBe(true);
  });
});

describe("ProgressInsightGenerationSchema", () => {
  it("rejects an invalid trend value", () => {
    const result = ProgressInsightGenerationSchema.safeParse({
      progressPercent: 10,
      pitchImprovement: 5,
      rhythmImprovement: 5,
      confidenceImprovement: 5,
      consistencyImprovement: 5,
      rangeImprovement: 5,
      trend: "skyrocketing",
      summary: "x",
    });
    expect(result.success).toBe(false);
  });
});
