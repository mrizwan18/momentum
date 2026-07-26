import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createExercise,
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useSessionAudioAnalysis } from "./use-session-audio-analysis";

vi.mock("@/lib/audio/encode-recording", () => ({
  encodeRecordingForAnalysis: vi.fn().mockResolvedValue({
    base64: "ZmFrZQ==",
    format: "wav",
    durationSeconds: 20,
    truncated: false,
  }),
}));

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const sessionInput = {
  elapsedSeconds: 600,
  exercisesCompleted: 2,
  dailyScore: 80,
};

const sessionInsightResponseData = {
  whatImproved: ["Breath support"],
  whatDeclined: [],
  bestMoment: "The final scale run",
  biggestOpportunity: "Warm up longer next time",
  tomorrowsGoal: "Focus on breath control",
  encouragingSentence: "Great focus today!",
  metricsSnapshot: {
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
};

function fakeBlob() {
  return new Blob(["fake-audio"], { type: "audio/webm" });
}

describe("useSessionAudioAnalysis", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-session-audio-analysis-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("reports no-recordings when the session has none", async () => {
    const { result } = renderHook(
      () => useSessionAudioAnalysis("session-1", sessionInput),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("no-recordings"));
  });

  it("reports idle (ready to analyze) when at least one recording exists", async () => {
    await storage.recordings.create({
      sessionId: "session-1",
      exerciseId: null,
      durationMs: 20000,
      mimeType: "audio/webm",
      blob: fakeBlob(),
    });

    const { result } = renderHook(
      () => useSessionAudioAnalysis("session-1", sessionInput),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));
  });

  it("shows the existing insight directly, without a button, if already analyzed", async () => {
    await storage.aiSessionInsights.create({
      sessionId: "session-1",
      ...sessionInsightResponseData,
      provider: "openai",
    });

    const { result } = renderHook(
      () => useSessionAudioAnalysis("session-1", sessionInput),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.insight?.bestMoment).toBe("The final scale run");
  });

  it("never calls fetch on mount — only analyze() does", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await storage.recordings.create({
      sessionId: "session-1",
      exerciseId: null,
      durationMs: 20000,
      mimeType: "audio/webm",
      blob: fakeBlob(),
    });

    renderHook(() => useSessionAudioAnalysis("session-1", sessionInput), {
      wrapper,
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("labels each recording with its exercise and analyzes only on explicit call", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              data: sessionInsightResponseData,
              provider: "openai",
            }),
            { status: 200 },
          ),
        ),
    );
    await storage.exercises.seed([
      createExercise({
        skillId: "riyaaz",
        category: "scales",
        title: "Sa Re Ga Ma",
        targetDurationSeconds: 60,
        order: 0,
      }),
    ]);
    const [exercise] = await storage.exercises.listBySkill("riyaaz");
    await storage.recordings.create({
      sessionId: "session-1",
      exerciseId: exercise.id,
      durationMs: 20000,
      mimeType: "audio/webm",
      blob: fakeBlob(),
    });

    const { result } = renderHook(
      () => useSessionAudioAnalysis("session-1", sessionInput),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.insight?.bestMoment).toBe("The final scale run");
    const stored = await storage.aiSessionInsights.getBySession("session-1");
    expect(stored?.provider).toBe("openai");
  });

  it("surfaces an error and lets the user retry when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await storage.recordings.create({
      sessionId: "session-1",
      exerciseId: null,
      durationMs: 20000,
      mimeType: "audio/webm",
      blob: fakeBlob(),
    });

    const { result } = renderHook(
      () => useSessionAudioAnalysis("session-1", sessionInput),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("idle"));

    await act(async () => {
      await result.current.analyze();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBeTruthy();
  });
});
