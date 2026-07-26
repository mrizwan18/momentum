import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { usePendingSessionInsights } from "./use-pending-session-insights";

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

function stubOnLine(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

async function seedCompletedSession(storage: MomentumStorage) {
  const session = await storage.sessions.start(["breathing"]);
  await storage.exerciseAttempts.record({
    sessionId: session.id,
    exerciseId: "breathing",
    status: "completed",
    durationSeconds: 60,
  });
  await storage.sessions.complete(session.id);
  await storage.sessionSummaries.create({
    sessionId: session.id,
    xpEarned: 50,
    overallScore: 75,
  });
  return session;
}

describe("usePendingSessionInsights", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(
        `test-pending-session-insights-hook-${Math.random()}`,
      ),
    );
    stubOnLine(true);
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    stubOnLine(true);
    await storage.db.delete();
  });

  it("does nothing when there are no completed sessions", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => usePendingSessionInsights(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing while offline even if a session is pending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    stubOnLine(false);
    await seedCompletedSession(storage);

    renderHook(() => usePendingSessionInsights(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing when every completed session already has an insight", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const session = await seedCompletedSession(storage);
    await storage.aiSessionInsights.create({
      sessionId: session.id,
      ...insightResponseData,
      provider: "mock",
    });

    renderHook(() => usePendingSessionInsights(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("generates an insight for a completed session missing one, when online", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: insightResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const session = await seedCompletedSession(storage);

    renderHook(() => usePendingSessionInsights(), { wrapper });

    await waitFor(async () => {
      expect(
        await storage.aiSessionInsights.getBySession(session.id),
      ).toMatchObject({ bestMoment: "The final scale run" });
    });
  });

  it("retries when the device comes back online, and only once per transition", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ data: insightResponseData, provider: "mock" }),
        {
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    stubOnLine(false);
    const session = await seedCompletedSession(storage);

    renderHook(() => usePendingSessionInsights(), { wrapper });
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(fetchMock).not.toHaveBeenCalled();

    stubOnLine(true);
    window.dispatchEvent(new Event("online"));

    await waitFor(async () => {
      expect(
        await storage.aiSessionInsights.getBySession(session.id),
      ).toBeTruthy();
    });
    const callsAfterFirstOnline = fetchMock.mock.calls.length;

    window.dispatchEvent(new Event("online"));
    await new Promise((resolve) => setTimeout(resolve, 30));
    // Everything pending was already covered, so a second "online" event
    // must not fire any additional requests.
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirstOnline);
  });
});
