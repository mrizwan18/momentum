import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { usePendingBaselineAssessment } from "./use-pending-baseline-assessment";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const assessmentResponseData = {
  overallScore: 80,
  metrics: {
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
  },
  strengths: ["Good tone"],
  areasToImprove: ["Pitch"],
  recommendedDailyPractice: "Scales",
  recommendedDurationMinutes: 15,
  suggestedSkillLevel: "beginner" as const,
  difficulty: "easy" as const,
  motivationalSummary: "Great start!",
};

function stubOnLine(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("usePendingBaselineAssessment", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-pending-baseline-hook-${Math.random()}`),
    );
    stubOnLine(true);
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    stubOnLine(true);
    await storage.db.delete();
  });

  it("does nothing when a baseline already exists", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await storage.baselineAssessments.create({
      recordingId: "recording-1",
      ...assessmentResponseData,
      provider: "mock",
    });

    // Wrap the real read so the test can await its settlement directly,
    // rather than racing a fixed timeout against afterEach's db.delete().
    const originalGet = storage.baselineAssessments.get.bind(
      storage.baselineAssessments,
    );
    let settled: ReturnType<typeof originalGet> | null = null;
    vi.spyOn(storage.baselineAssessments, "get").mockImplementation(() => {
      settled = originalGet();
      return settled;
    });

    renderHook(() => usePendingBaselineAssessment(), { wrapper });

    await waitFor(() => expect(settled).not.toBeNull());
    await settled;
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing when there is no baseline recording", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const originalListSummaries = storage.recordings.listSummaries.bind(
      storage.recordings,
    );
    let settled: ReturnType<typeof originalListSummaries> | null = null;
    vi.spyOn(storage.recordings, "listSummaries").mockImplementation(() => {
      settled = originalListSummaries();
      return settled;
    });

    renderHook(() => usePendingBaselineAssessment(), { wrapper });

    await waitFor(() => expect(settled).not.toBeNull());
    await settled;
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing while offline even if a baseline recording is pending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    stubOnLine(false);
    await storage.recordings.create({
      sessionId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(["x"]),
      title: "Baseline Recording",
    });

    renderHook(() => usePendingBaselineAssessment(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("runs the assessment on mount when a baseline recording is pending and online", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const recording = await storage.recordings.create({
      sessionId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(["x"]),
      title: "Baseline Recording",
    });

    renderHook(() => usePendingBaselineAssessment(), { wrapper });

    await waitFor(async () => {
      expect(await storage.baselineAssessments.get()).toMatchObject({
        recordingId: recording.id,
        overallScore: 80,
      });
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries when the device comes back online, and only once per transition", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    stubOnLine(false);
    await storage.recordings.create({
      sessionId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(["x"]),
      title: "Baseline Recording",
    });

    renderHook(() => usePendingBaselineAssessment(), { wrapper });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();

    stubOnLine(true);
    window.dispatchEvent(new Event("online"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    window.dispatchEvent(new Event("online"));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(await storage.baselineAssessments.get()).toBeTruthy();
    // A baseline now exists, so a second "online" event must stay a no-op.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
