import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMomentumDatabase, type MomentumDatabase } from "../db";
import { createBaselineAssessmentRepository } from "./baseline-assessment-repository";
import type { VocalMetrics } from "@momentum/types";

const metrics: VocalMetrics = {
  pitchAccuracy: 70,
  pitchStability: 68,
  rhythm: 72,
  breathControl: 65,
  toneQuality: 74,
  consistency: 71,
  vocalRange: 60,
  confidence: 66,
  timing: 69,
  voiceClarity: 73,
  pronunciation: 75,
  energy: 70,
};

describe("baseline assessment repository", () => {
  let db: MomentumDatabase;

  beforeEach(() => {
    db = createMomentumDatabase(`test-baseline-${Math.random()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("returns undefined before a baseline exists", async () => {
    const repo = createBaselineAssessmentRepository(db);
    expect(await repo.get()).toBeUndefined();
  });

  it("creates a baseline assessment", async () => {
    const repo = createBaselineAssessmentRepository(db);
    const record = await repo.create({
      recordingId: "recording-1",
      overallScore: 72,
      metrics,
      strengths: ["Strong tone"],
      areasToImprove: ["Pitch stability"],
      recommendedDailyPractice: "Breathing + scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });

    expect(record.overallScore).toBe(72);
    expect(await repo.get()).toEqual(record);
  });

  it("is idempotent — a repeat create() keeps the original (immutable)", async () => {
    const repo = createBaselineAssessmentRepository(db);
    const first = await repo.create({
      recordingId: "recording-1",
      overallScore: 72,
      metrics,
      strengths: ["Strong tone"],
      areasToImprove: ["Pitch stability"],
      recommendedDailyPractice: "Breathing + scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });

    const second = await repo.create({
      recordingId: "recording-2",
      overallScore: 99,
      metrics,
      strengths: ["Different"],
      areasToImprove: ["Different"],
      recommendedDailyPractice: "Different",
      recommendedDurationMinutes: 30,
      suggestedSkillLevel: "advanced",
      difficulty: "hard",
      motivationalSummary: "Different",
      provider: "openai",
    });

    expect(second).toEqual(first);
    expect((await repo.get())?.overallScore).toBe(72);
  });
});
