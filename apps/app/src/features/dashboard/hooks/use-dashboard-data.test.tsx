import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { useDashboardData } from "./use-dashboard-data";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

describe("useDashboardData", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-dashboard-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
    useActiveSessionStore.setState({ activeSessionId: null });
    localStorage.clear();
  });

  it("starts in the loading state", async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper });
    expect(result.current.status).toBe("loading");
    // Let the effect's Dexie load settle before the test tears down, so its
    // setState doesn't fire after the test (and outside of act()).
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });

  it("resolves with empty-history defaults when Dexie has no data", async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.streak.current).toBe(0);
    expect(result.current.data.weekly.practiceMinutes).toBe(0);
    expect(result.current.data.roadmapChapters).toEqual([]);
    expect(result.current.data.activeSession).toBeNull();
  });

  it("reflects real statistics written through the repository pattern", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await storage.statistics.upsertForDate({
      date: today,
      practiceMinutes: 15,
      sessionsCompleted: 1,
    });

    const { result } = renderHook(() => useDashboardData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.streak.current).toBe(1);
    expect(result.current.data.weekly.practiceMinutes).toBe(15);
  });

  it("surfaces a real active session and mirrors its id into the zustand store", async () => {
    const session = await storage.sessions.start(["breathing", "warmup"]);

    const { result } = renderHook(() => useDashboardData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.activeSession?.id).toBe(session.id);
    expect(useActiveSessionStore.getState().activeSessionId).toBe(session.id);
  });

  it("surfaces real roadmap chapters", async () => {
    await storage.roadmap.seed([
      {
        id: "chapter-1",
        order: 1,
        title: "Foundations",
        status: "unlocked",
        updatedAt: Date.now(),
      },
    ]);

    const { result } = renderHook(() => useDashboardData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status !== "ready") throw new Error("unreachable");

    expect(result.current.data.roadmapChapters).toHaveLength(1);
    expect(result.current.data.roadmapChapters[0].title).toBe("Foundations");
  });
});
