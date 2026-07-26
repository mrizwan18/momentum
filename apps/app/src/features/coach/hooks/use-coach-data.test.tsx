import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { toDateOnly } from "@/lib/date";
import { useCoachData } from "./use-coach-data";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const metrics = {
  pitchAccuracy: 82,
  pitchStability: 80,
  rhythm: 70,
  breathControl: 78,
  toneQuality: 80,
  consistency: 88,
  vocalRange: 80,
  confidence: 80,
  timing: 80,
  voiceClarity: 80,
  pronunciation: 80,
  energy: 75,
};

describe("useCoachData", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-coach-data-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("returns null focus areas with no baseline or session insight yet", async () => {
    const { result } = renderHook(() => useCoachData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");
    expect(result.current.data.focusAreas).toBeNull();
    expect(result.current.data.consistencyScore.current).toBe(0);
  });

  it("maps 5 real metrics from the latest session insight onto Focus Areas", async () => {
    await storage.aiSessionInsights.create({
      sessionId: "session-1",
      whatImproved: [],
      whatDeclined: [],
      bestMoment: "Great run",
      biggestOpportunity: "Breathing",
      tomorrowsGoal: "Keep it up",
      encouragingSentence: "Nice work!",
      metricsSnapshot: metrics,
      provider: "mock",
    });

    const { result } = renderHook(() => useCoachData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");
    expect(result.current.data.focusAreas).toEqual([
      { label: "Pitch Accuracy", value: 82 },
      { label: "Voice Control", value: 78 },
      { label: "Rhythm", value: 70 },
      { label: "Consistency", value: 88 },
      { label: "Stamina", value: 75 },
    ]);
  });

  it("falls back to the baseline's metrics when no session insight exists yet", async () => {
    await storage.baselineAssessments.create({
      recordingId: "recording-1",
      overallScore: 70,
      metrics,
      strengths: ["Tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });

    const { result } = renderHook(() => useCoachData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");
    expect(result.current.data.focusAreas?.[0]).toEqual({
      label: "Pitch Accuracy",
      value: 82,
    });
  });

  it("computes a real consistency score from statistics", async () => {
    const today = new Date();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await storage.statistics.upsertForDate({
        date: toDateOnly(date),
        practiceMinutes: 10,
        sessionsCompleted: 1,
      });
    }

    const { result } = renderHook(() => useCoachData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");
    expect(result.current.data.consistencyScore.current).toBe(100);
  });
});
