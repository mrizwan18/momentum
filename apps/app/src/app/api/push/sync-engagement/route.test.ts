import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getSubscriber = vi.fn();
const upsertSubscriber = vi.fn();
vi.mock("@/lib/push/store", () => ({
  getPushStore: () => ({ getSubscriber, upsertSubscriber }),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/push/sync-engagement", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const existingSubscription = {
  endpoint: "https://push.example.com/1",
  expirationTime: null,
  keys: { p256dh: "p", auth: "a" },
};

describe("POST /api/push/sync-engagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no-ops when the device never subscribed to push", async () => {
    getSubscriber.mockResolvedValue(null);

    const response = await POST(
      makeRequest({
        deviceId: "device-1",
        currentStreak: 4,
        lastPracticedDate: "2026-07-25",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, subscribed: false });
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("updates the subscriber's engagement snapshot when subscribed", async () => {
    getSubscriber.mockResolvedValue({
      deviceId: "device-1",
      subscription: existingSubscription,
    });

    const response = await POST(
      makeRequest({
        deviceId: "device-1",
        currentStreak: 4,
        lastPracticedDate: "2026-07-25",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, subscribed: true });
    expect(upsertSubscriber).toHaveBeenCalledWith({
      deviceId: "device-1",
      subscription: existingSubscription,
      currentStreak: 4,
      lastPracticedDate: "2026-07-25",
    });
  });

  it("rejects an invalid body", async () => {
    const response = await POST(makeRequest({ deviceId: "device-1" }));
    expect(response.status).toBe(400);
    expect(getSubscriber).not.toHaveBeenCalled();
  });
});
