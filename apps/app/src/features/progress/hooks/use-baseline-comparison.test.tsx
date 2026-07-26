import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useBaselineComparison } from "./use-baseline-comparison";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const metrics = {
  pitchAccuracy: 80,
  pitchStability: 80,
  rhythm: 80,
  breathControl: 80,
  toneQuality: 80,
  consistency: 80,
  vocalRange: 80,
  confidence: 80,
  timing: 80,
  voiceClarity: 80,
  pronunciation: 80,
  energy: 80,
};

describe("useBaselineComparison", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-baseline-comparison-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("stays null with no baseline", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useBaselineComparison(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(result.current.comparison).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays null when a baseline exists but no session insight has been generated yet", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
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

    const { result } = renderHook(() => useBaselineComparison(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(result.current.comparison).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("computes real numbers and fetches an AI narration once both exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              data: { summary: "Solid progress." },
              provider: "mock",
            }),
            { status: 200 },
          ),
        ),
    );
    await storage.baselineAssessments.create({
      recordingId: "recording-1",
      overallScore: 70,
      metrics: { ...metrics, pitchAccuracy: 60 },
      strengths: ["Tone"],
      areasToImprove: ["Pitch"],
      recommendedDailyPractice: "Scales",
      recommendedDurationMinutes: 15,
      suggestedSkillLevel: "beginner",
      difficulty: "easy",
      motivationalSummary: "Great start!",
      provider: "mock",
    });
    await storage.aiSessionInsights.create({
      sessionId: "session-1",
      whatImproved: ["Pitch"],
      whatDeclined: [],
      bestMoment: "Great run",
      biggestOpportunity: "Breathing",
      tomorrowsGoal: "Keep it up",
      encouragingSentence: "Nice work!",
      metricsSnapshot: metrics,
      provider: "mock",
    });

    const { result } = renderHook(() => useBaselineComparison(), { wrapper });

    await waitFor(() => expect(result.current.comparison).not.toBeNull());
    expect(result.current.comparison?.pitchImprovement).toBeGreaterThan(0);
    await waitFor(() => expect(result.current.aiStatus).toBe("ready"));
    expect(result.current.aiSummary).toBe("Solid progress.");
  });

  it("keeps the deterministic numbers even when the AI narration request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
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

    const { result } = renderHook(() => useBaselineComparison(), { wrapper });

    await waitFor(() => expect(result.current.comparison).not.toBeNull());
    await waitFor(() => expect(result.current.aiStatus).toBe("unavailable"));
    expect(result.current.aiSummary).toBeNull();
  });
});
