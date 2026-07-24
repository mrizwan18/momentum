import { describe, expect, it } from "vitest";
import { PracticeSessionSchema } from "./session";
import { RecordingSchema } from "./recording";
import { ExerciseAttemptSchema } from "./exercise-attempt";
import { StreakSchema } from "./streak";
import { MilestoneSchema } from "./milestone";
import { DailyGoalSchema } from "./daily-goal";
import { AchievementSchema } from "./achievement";
import { SkillSchema } from "./skill";
import { SettingsSchema, SETTINGS_SINGLETON_ID } from "./settings";

describe("PracticeSessionSchema", () => {
  const valid = {
    id: "session-1",
    status: "in_progress",
    skillId: null,
    planId: null,
    exerciseIds: ["breathing"],
    currentStepIndex: 0,
    elapsedSeconds: 0,
    voiceCondition: null,
    recoveryMode: false,
    draftNotes: null,
    startedAt: 0,
    updatedAt: 0,
    completedAt: null,
  };

  it("accepts a valid session", () => {
    expect(PracticeSessionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = PracticeSessionSchema.safeParse({
      ...valid,
      status: "sleeping",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative currentStepIndex", () => {
    const result = PracticeSessionSchema.safeParse({
      ...valid,
      currentStepIndex: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid voiceCondition", () => {
    const result = PracticeSessionSchema.safeParse({
      ...valid,
      voiceCondition: "excellent",
    });
    expect(result.success).toBe(false);
  });
});

describe("RecordingSchema", () => {
  const base = {
    id: "rec-1",
    sessionId: null,
    exerciseAttemptId: null,
    createdAt: 0,
    durationMs: 1000,
    mimeType: "audio/webm",
    favorite: false,
    title: null,
    notes: null,
  };

  it("accepts a real Blob", () => {
    const result = RecordingSchema.safeParse({
      ...base,
      blob: new Blob(["audio"], { type: "audio/webm" }),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-Blob value", () => {
    const result = RecordingSchema.safeParse({ ...base, blob: "not-a-blob" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative duration", () => {
    const result = RecordingSchema.safeParse({
      ...base,
      durationMs: -1,
      blob: new Blob(),
    });
    expect(result.success).toBe(false);
  });
});

describe("ExerciseAttemptSchema", () => {
  it("rejects an unknown status", () => {
    const result = ExerciseAttemptSchema.safeParse({
      id: "attempt-1",
      sessionId: "session-1",
      exerciseId: "breathing",
      status: "in_progress",
      durationSeconds: 30,
      difficultyRating: null,
      notes: null,
      recordingId: null,
      reflectionComplete: false,
      createdAt: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("StreakSchema", () => {
  it("rejects a negative streak count", () => {
    const result = StreakSchema.safeParse({
      id: "global",
      skillId: null,
      current: -1,
      longest: 0,
      lastPracticeDate: null,
      updatedAt: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("MilestoneSchema", () => {
  it("rejects an unknown milestone type", () => {
    const result = MilestoneSchema.safeParse({
      id: "m1",
      type: "unknown",
      threshold: 7,
      achieved: false,
      achievedAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("DailyGoalSchema", () => {
  it("accepts a valid daily goal", () => {
    const result = DailyGoalSchema.safeParse({
      id: "2026-07-17",
      date: "2026-07-17",
      requiredExerciseIds: ["breathing", "song"],
      targetDurationSeconds: 600,
      xpReward: 100,
      completed: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("AchievementSchema", () => {
  it("rejects an unknown status", () => {
    const result = AchievementSchema.safeParse({
      id: "a1",
      key: "first_recording",
      title: "First Recording",
      description: "",
      status: "pending",
      unlockedAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("SkillSchema", () => {
  it("rejects an empty slug", () => {
    const result = SkillSchema.safeParse({
      id: "skill-1",
      slug: "",
      name: "Riyaaz",
      category: "vocals",
      description: "",
      isActive: true,
      createdAt: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("SettingsSchema", () => {
  it("rejects any id other than the singleton", () => {
    const result = SettingsSchema.safeParse({
      id: "not-app",
      theme: "dark",
      createdAt: 0,
      updatedAt: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts the singleton id", () => {
    const result = SettingsSchema.safeParse({
      id: SETTINGS_SINGLETON_ID,
      theme: "dark",
      createdAt: 0,
      updatedAt: 0,
    });
    expect(result.success).toBe(true);
  });
});
