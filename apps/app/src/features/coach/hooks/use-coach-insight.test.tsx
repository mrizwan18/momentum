import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useCoachInsight } from "./use-coach-insight";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const coachReplyResponseData = {
  message: "You're just getting started. Try a short breathing exercise today.",
  suggestedExercises: ["Try a short breathing exercise today."],
};

describe("useCoachInsight", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-coach-insight-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("fetches a real insight and recommendations from the Gateway", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ data: coachReplyResponseData, provider: "mock" }),
            { status: 200 },
          ),
        ),
    );

    const { result } = renderHook(() => useCoachInsight(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.message).toBe(coachReplyResponseData.message);
    expect(result.current.suggestedExercises).toEqual(
      coachReplyResponseData.suggestedExercises,
    );
  });

  it("falls back to the deterministic coach when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { result } = renderHook(() => useCoachInsight(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("fallback"));
    expect(result.current.message).toBeTruthy();
    expect(result.current.suggestedExercises).toHaveLength(1);
  });
});
