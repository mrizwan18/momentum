import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createExercise,
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { toDateOnly } from "@/lib/date";
import { assembleAiContext } from "./assemble-ai-context";

let storage: MomentumStorage;

describe("assembleAiContext", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-assemble-context-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("returns empty-history defaults with a brand-new database", async () => {
    const context = await assembleAiContext(storage);
    expect(context.profile.displayName).toBeNull();
    expect(context.streak.current).toBe(0);
    expect(context.recentSessions).toEqual([]);
    expect(context.baseline).toBeNull();
    expect(context.achievements).toEqual([]);
  });

  it("reflects real data written through the repository pattern", async () => {
    await storage.exercises.seed([
      createExercise({
        skillId: "riyaaz",
        category: "breathing",
        title: "Breathing",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);
    const exercises = await storage.exercises.listBySkill("riyaaz");

    const session = await storage.sessions.start(["breathing"], {
      skillId: "riyaaz",
    });
    await storage.exerciseAttempts.record({
      sessionId: session.id,
      exerciseId: exercises[0].id,
      status: "completed",
      durationSeconds: 45,
    });
    const completed = await storage.sessions.complete(session.id);
    await storage.sessionSummaries.create({
      sessionId: completed.id,
      xpEarned: 100,
      overallScore: 78,
    });
    await storage.streaks.recordPracticeDay(null, toDateOnly(new Date()));
    await storage.coachMessages.append({
      role: "user",
      message: "How am I doing?",
    });

    const context = await assembleAiContext(storage);

    expect(context.streak.current).toBe(1);
    expect(context.recentSessions).toHaveLength(1);
    expect(context.recentSessions[0]).toMatchObject({
      sessionId: completed.id,
      exercisesCompleted: 1,
      dailyScore: 78,
      xpEarned: 100,
    });
    expect(context.exerciseDistribution).toEqual([
      { category: "breathing", count: 1 },
    ]);
    expect(context.coachHistory).toEqual([
      expect.objectContaining({ role: "user", message: "How am I doing?" }),
    ]);
  });

  it("includes the baseline assessment when one exists", async () => {
    await storage.recordings.create({
      sessionId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(),
      title: "Baseline Recording",
    });
    const [recording] = await storage.recordings.list();
    await storage.baselineAssessments.create({
      recordingId: recording.id,
      overallScore: 65,
      metrics: {
        pitchAccuracy: 65,
        pitchStability: 65,
        rhythm: 65,
        breathControl: 65,
        toneQuality: 65,
        consistency: 65,
        vocalRange: 65,
        confidence: 65,
        timing: 65,
        voiceClarity: 65,
        pronunciation: 65,
        energy: 65,
      },
      strengths: ["Tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });

    const context = await assembleAiContext(storage);
    expect(context.baseline?.overallScore).toBe(65);
  });
});
