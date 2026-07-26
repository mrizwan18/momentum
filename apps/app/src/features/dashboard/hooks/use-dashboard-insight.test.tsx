import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { toDateOnly } from "@/lib/date";
import { useDashboardInsight } from "./use-dashboard-insight";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const insightResponseData = {
  todaysFocus: "Breath control",
  dailyInsight: "You've been consistent this week.",
  motivationalMessage: "Keep it up!",
  practiceRecommendation: "Try the breathing exercises",
  estimatedImprovementPercent: 5,
  suggestedSessionLengthMinutes: 15,
  recoveryAdvice: null,
};

describe("useDashboardInsight", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-dashboard-insight-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("reuses today's stored insight without making a network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const today = toDateOnly(new Date());
    await storage.aiDashboardInsights.setForDate({
      date: today,
      ...insightResponseData,
      provider: "mock",
    });

    const { result } = renderHook(() => useDashboardInsight(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.insight?.todaysFocus).toBe("Breath control");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("generates and stores a fresh insight when none exists for today", async () => {
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

    const { result } = renderHook(() => useDashboardInsight(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.insight?.todaysFocus).toBe("Breath control");
    const today = toDateOnly(new Date());
    expect(await storage.aiDashboardInsights.getForDate(today)).toMatchObject({
      todaysFocus: "Breath control",
    });
  });

  it("becomes unavailable without throwing when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { result } = renderHook(() => useDashboardInsight(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("unavailable"));
    expect(result.current.insight).toBeNull();
  });
});
