import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useSessionInsight } from "./use-session-insight";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const insightResponseData = {
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

describe("useSessionInsight", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-session-insight-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("starts idle with no insight", () => {
    const { result } = renderHook(() => useSessionInsight(), { wrapper });
    expect(result.current.status).toBe("idle");
    expect(result.current.insight).toBeNull();
  });

  it("stores and surfaces a real insight on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ data: insightResponseData, provider: "mock" }),
          {
            status: 200,
          },
        ),
      ),
    );
    const { result } = renderHook(() => useSessionInsight(), { wrapper });

    await act(async () => {
      await result.current.run({
        sessionId: "session-1",
        elapsedSeconds: 600,
        exercisesCompleted: 5,
        dailyScore: 80,
      });
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.insight?.bestMoment).toBe("The final scale run");
    expect(
      await storage.aiSessionInsights.getBySession("session-1"),
    ).toMatchObject({ bestMoment: "The final scale run" });
  });

  it("resolves to pending-offline without throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { result } = renderHook(() => useSessionInsight(), { wrapper });

    await act(async () => {
      await result.current.run({
        sessionId: "session-1",
        elapsedSeconds: 600,
        exercisesCompleted: 5,
        dailyScore: 80,
      });
    });

    expect(result.current.status).toBe("pending-offline");
    expect(result.current.insight).toBeNull();
  });

  it("does not start a second request while one is already in flight", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: insightResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useSessionInsight(), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.run({
          sessionId: "session-1",
          elapsedSeconds: 600,
          exercisesCompleted: 5,
          dailyScore: 80,
        }),
        result.current.run({
          sessionId: "session-1",
          elapsedSeconds: 600,
          exercisesCompleted: 5,
          dailyScore: 80,
        }),
      ]);
    });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("allows a later run for a different session once the prior one settles", async () => {
    // A fresh Response per call — Response bodies can only be read once,
    // and this test genuinely calls fetch (and .json()) twice.
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Response(
          JSON.stringify({ data: insightResponseData, provider: "mock" }),
          {
            status: 200,
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useSessionInsight(), { wrapper });

    await act(async () => {
      await result.current.run({
        sessionId: "session-1",
        elapsedSeconds: 600,
        exercisesCompleted: 5,
        dailyScore: 80,
      });
    });
    await act(async () => {
      await result.current.run({
        sessionId: "session-2",
        elapsedSeconds: 400,
        exercisesCompleted: 3,
        dailyScore: 70,
      });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      await storage.aiSessionInsights.getBySession("session-2"),
    ).toBeTruthy();
  });
});
