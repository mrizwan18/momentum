import { describe, expect, it } from "vitest";
import {
  calculateCategoryScore,
  calculateDailyScore,
  calculateGrowthScore,
  calculateMomentumDelta,
  calculateSessionXp,
  isQualifyingSession,
} from "./scoring";

describe("calculateCategoryScore", () => {
  it("returns a ratio of attempted vs target duration, capped at 100", () => {
    expect(calculateCategoryScore(60, 120)).toBe(50);
    expect(calculateCategoryScore(120, 120)).toBe(100);
    expect(calculateCategoryScore(180, 120)).toBe(100);
  });

  it("treats a zero-target exercise as fully done once attempted", () => {
    expect(calculateCategoryScore(30, 0)).toBe(100);
    expect(calculateCategoryScore(0, 0)).toBe(0);
  });

  it("never returns a negative score", () => {
    expect(calculateCategoryScore(0, 120)).toBe(0);
  });
});

describe("calculateDailyScore", () => {
  it("matches the worked example from docs/engineering/scoring-engine.md", () => {
    const score = calculateDailyScore([
      { category: "breathing", score: 100 },
      { category: "warmup", score: 90 },
      { category: "scales", score: 80 },
      { category: "alankars", score: 70 },
      { category: "song", score: 85 },
      { category: "recording", score: 100 },
      { category: "reflection", score: 100 },
    ]);
    // 100*.15 + 90*.10 + 80*.20 + 70*.20 + 85*.20 + 100*.10 + 100*.05 = 86
    // (the doc's own "Daily Score ≈ 87" is explicitly approximate)
    expect(score).toBe(86);
  });

  it("treats a category missing from the session as contributing 0", () => {
    const score = calculateDailyScore([{ category: "breathing", score: 100 }]);
    expect(score).toBe(15); // only breathing's weighted share
  });

  it("clamps out-of-range scores into 0-100", () => {
    const score = calculateDailyScore([{ category: "breathing", score: 150 }]);
    expect(score).toBe(15);
  });

  it("returns 0 for an empty session", () => {
    expect(calculateDailyScore([])).toBe(0);
  });
});

describe("calculateSessionXp", () => {
  it("awards the base 100 XP with no bonuses", () => {
    expect(
      calculateSessionXp({ hasRecording: false, hasReflection: false }),
    ).toBe(100);
  });

  it("adds the recording bonus", () => {
    expect(
      calculateSessionXp({ hasRecording: true, hasReflection: false }),
    ).toBe(120);
  });

  it("adds the reflection bonus", () => {
    expect(
      calculateSessionXp({ hasRecording: false, hasReflection: true }),
    ).toBe(115);
  });

  it("stacks both bonuses", () => {
    expect(
      calculateSessionXp({ hasRecording: true, hasReflection: true }),
    ).toBe(135);
  });
});

describe("isQualifyingSession", () => {
  it("qualifies a session of 10 minutes or more", () => {
    expect(
      isQualifyingSession({ durationSeconds: 600, recoveryMode: false }),
    ).toBe(true);
    expect(
      isQualifyingSession({ durationSeconds: 599, recoveryMode: false }),
    ).toBe(false);
  });

  it("qualifies any recovery session regardless of duration", () => {
    expect(
      isQualifyingSession({ durationSeconds: 30, recoveryMode: true }),
    ).toBe(true);
  });
});

describe("calculateMomentumDelta", () => {
  it("returns 0 when nothing qualifies", () => {
    expect(
      calculateMomentumDelta({
        qualifyingSessionCompleted: false,
        allExercisesCompleted: false,
        recoveryCompleted: false,
        reflectionCompleted: false,
      }),
    ).toBe(0);
  });

  it("sums every qualifying bonus", () => {
    expect(
      calculateMomentumDelta({
        qualifyingSessionCompleted: true,
        allExercisesCompleted: true,
        recoveryCompleted: true,
        reflectionCompleted: true,
      }),
    ).toBe(15);
  });
});

describe("calculateGrowthScore", () => {
  it("scales a 0-1 consistency ratio to 0-100", () => {
    expect(calculateGrowthScore(0)).toBe(0);
    expect(calculateGrowthScore(0.5)).toBe(50);
    expect(calculateGrowthScore(1)).toBe(100);
  });

  it("clamps out-of-range ratios", () => {
    expect(calculateGrowthScore(-0.5)).toBe(0);
    expect(calculateGrowthScore(1.5)).toBe(100);
  });
});
