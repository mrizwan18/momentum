import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncPushEngagement } from "./sync-engagement-client";

describe("syncPushEngagement", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when this browser never subscribed to push", () => {
    syncPushEngagement({ currentStreak: 3, lastPracticedDate: "2026-07-25" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the engagement snapshot with the stored deviceId when subscribed", async () => {
    window.localStorage.setItem("momentum-push-device-id", "device-1");

    syncPushEngagement({ currentStreak: 3, lastPracticedDate: "2026-07-25" });
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith(
      "/api/push/sync-engagement",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          deviceId: "device-1",
          currentStreak: 3,
          lastPracticedDate: "2026-07-25",
        }),
      }),
    );
  });

  it("swallows a failed request without throwing", async () => {
    window.localStorage.setItem("momentum-push-device-id", "device-1");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    expect(() =>
      syncPushEngagement({ currentStreak: 0, lastPracticedDate: null }),
    ).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
