import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const upsertSubscriber = vi.fn();
vi.mock("@/lib/push/store", () => ({
  getPushStore: () => ({ upsertSubscriber }),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const validSubscription = {
  endpoint: "https://push.example.com/1",
  expirationTime: null,
  keys: { p256dh: "p", auth: "a" },
};

describe("POST /api/push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts a valid subscription and returns the deviceId", async () => {
    upsertSubscriber.mockResolvedValue({ deviceId: "device-1" });

    const response = await POST(
      makeRequest({
        deviceId: "device-1",
        subscription: validSubscription,
        currentStreak: 3,
        lastPracticedDate: "2026-07-24",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deviceId: "device-1" });
    expect(upsertSubscriber).toHaveBeenCalledWith({
      deviceId: "device-1",
      subscription: validSubscription,
      currentStreak: 3,
      lastPracticedDate: "2026-07-24",
    });
  });

  it("rejects a body missing required fields", async () => {
    const response = await POST(makeRequest({ deviceId: "device-1" }));
    expect(response.status).toBe(400);
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const request = new NextRequest("http://localhost/api/push/subscribe", {
      method: "POST",
      body: "not json",
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
