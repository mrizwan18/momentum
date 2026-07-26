import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { encodeRecordingForAnalysis } from "@/lib/audio/encode-recording";
import { useBaselineAssessment } from "./use-baseline-assessment";

vi.mock("@/lib/audio/encode-recording", () => ({
  encodeRecordingForAnalysis: vi.fn(),
}));

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
  suggestedSkillLevel: "beginner",
  difficulty: "easy",
  motivationalSummary: "Great start!",
};

describe("useBaselineAssessment", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-baseline-assessment-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("starts idle with no assessment", () => {
    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });
    expect(result.current.status).toBe("idle");
    expect(result.current.assessment).toBeNull();
  });

  it("stores and surfaces a real assessment on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
          {
            status: 200,
          },
        ),
      ),
    );
    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });

    await act(async () => {
      await result.current.run({
        recordingId: "recording-1",
        durationMs: 15000,
      });
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.assessment?.overallScore).toBe(80);
    expect(await storage.baselineAssessments.get()).toMatchObject({
      overallScore: 80,
    });
  });

  it("resolves to pending-offline without throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });

    await act(async () => {
      await result.current.run({
        recordingId: "recording-1",
        durationMs: 15000,
      });
    });

    expect(result.current.status).toBe("pending-offline");
    expect(result.current.assessment).toBeNull();
    expect(await storage.baselineAssessments.get()).toBeUndefined();
  });

  it("resolves to pending-offline on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 })),
    );
    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });

    await act(async () => {
      await result.current.run({
        recordingId: "recording-1",
        durationMs: 15000,
      });
    });

    expect(result.current.status).toBe("pending-offline");
  });

  it("does not start a second request while one is already in flight", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.run({ recordingId: "recording-1", durationMs: 15000 }),
        result.current.run({ recordingId: "recording-1", durationMs: 15000 }),
      ]);
    });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("attaches the real encoded audio when the recording exists and encoding succeeds", async () => {
    vi.mocked(encodeRecordingForAnalysis).mockResolvedValue({
      base64: "ZmFrZQ==",
      format: "wav",
      durationSeconds: 12,
      truncated: false,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: assessmentResponseData, provider: "openai" }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const recording = await storage.recordings.create({
      sessionId: null,
      exerciseId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(["fake-audio"], { type: "audio/webm" }),
    });

    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });
    await act(async () => {
      await result.current.run({
        recordingId: recording.id,
        durationMs: 15000,
      });
    });

    expect(result.current.status).toBe("ready");
    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body.audio).toEqual([
      {
        base64: "ZmFrZQ==",
        format: "wav",
        durationSeconds: 12,
        truncated: false,
      },
    ]);
  });

  it("falls back to a context-only request when encoding fails", async () => {
    vi.mocked(encodeRecordingForAnalysis).mockResolvedValue(null);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: assessmentResponseData, provider: "mock" }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const recording = await storage.recordings.create({
      sessionId: null,
      exerciseId: null,
      durationMs: 15000,
      mimeType: "audio/webm",
      blob: new Blob(["fake-audio"], { type: "audio/webm" }),
    });

    const { result } = renderHook(() => useBaselineAssessment(), { wrapper });
    await act(async () => {
      await result.current.run({
        recordingId: recording.id,
        durationMs: 15000,
      });
    });

    expect(result.current.status).toBe("ready");
    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body.audio).toBeUndefined();
  });
});
