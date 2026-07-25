import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { toUtcDateOnly } from "@/lib/push/scheduler";

const listSubscribers = vi.fn();
const recordNotification = vi.fn();
const deleteSubscriber = vi.fn();
vi.mock("@/lib/push/store", () => ({
  getPushStore: () => ({
    listSubscribers,
    recordNotification,
    deleteSubscriber,
  }),
}));

const sendPush = vi.fn();
vi.mock("@/lib/push/web-push-client", () => ({
  sendPush: (...args: unknown[]) => sendPush(...args),
}));

const { GET } = await import("./route");

function makeRequest(authHeader?: string) {
  return new NextRequest("http://localhost/api/push/send-daily", {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function subscriber(deviceId: string, overrides: Record<string, unknown> = {}) {
  return {
    deviceId,
    subscription: {
      endpoint: `https://push.example.com/${deviceId}`,
      expirationTime: null,
      keys: { p256dh: "p", auth: "a" },
    },
    createdAt: 0,
    updatedAt: 0,
    currentStreak: 0,
    lastPracticedDate: null,
    lastSentAt: null,
    recentTemplateKeys: [],
    ...overrides,
  };
}

describe("GET /api/push/send-daily", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: "s3cret" };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 500 when CRON_SECRET isn't configured", async () => {
    delete process.env.CRON_SECRET;
    const response = await GET(makeRequest("Bearer whatever"));
    expect(response.status).toBe(500);
    expect(listSubscribers).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong bearer token", async () => {
    const response = await GET(makeRequest("Bearer wrong"));
    expect(response.status).toBe(401);
    expect(listSubscribers).not.toHaveBeenCalled();
  });

  it("rejects a request with no authorization header", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
  });

  it("sends to due subscribers, skips others, and prunes expired subscriptions", async () => {
    const today = toUtcDateOnly(Date.now());
    listSubscribers.mockResolvedValue([
      subscriber("due-and-sent", { lastPracticedDate: null }),
      subscriber("already-practiced-today", { lastPracticedDate: today }),
      subscriber("due-but-expired", { lastPracticedDate: null }),
      subscriber("due-but-transient-error", { lastPracticedDate: null }),
    ]);
    sendPush.mockImplementation(async (subscription: { endpoint: string }) => {
      if (subscription.endpoint.endsWith("due-and-sent")) return { ok: true };
      if (subscription.endpoint.endsWith("due-but-expired"))
        return { ok: false, expired: true, error: "gone" };
      return { ok: false, expired: false, error: "server error" };
    });

    const response = await GET(makeRequest("Bearer s3cret"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ total: 4, sent: 1, pruned: 1, skipped: 2 });
    expect(recordNotification).toHaveBeenCalledTimes(1);
    expect(recordNotification).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: "due-and-sent" }),
    );
    expect(deleteSubscriber).toHaveBeenCalledWith("due-but-expired");
    expect(deleteSubscriber).toHaveBeenCalledTimes(1);
  });
});
