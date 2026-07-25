import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendNotification, setVapidDetails, FakeWebPushError } = vi.hoisted(
  () => {
    class FakeWebPushError extends Error {
      statusCode: number;
      headers = {};
      body = "";
      endpoint = "https://push.example.com/1";

      constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
      }
    }
    return {
      sendNotification: vi.fn(),
      setVapidDetails: vi.fn(),
      FakeWebPushError,
    };
  },
);

vi.mock("web-push", () => ({
  default: { sendNotification, setVapidDetails },
  WebPushError: FakeWebPushError,
}));

const subscription = {
  endpoint: "https://push.example.com/1",
  expirationTime: null,
  keys: { p256dh: "p256dh", auth: "auth" },
};

describe("sendPush", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws a clear error when VAPID keys aren't configured", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    vi.resetModules();
    const { sendPush } = await import("./web-push-client");

    await expect(
      sendPush(subscription, {
        title: "t",
        body: "b",
        notificationId: "notif-1",
      }),
    ).rejects.toThrow(/VAPID_PUBLIC_KEY/);
  });

  it("sends successfully and configures VAPID from env vars", async () => {
    process.env.VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    process.env.VAPID_SUBJECT = "mailto:test@example.com";
    vi.resetModules();
    const { sendPush } = await import("./web-push-client");
    sendNotification.mockResolvedValue({
      statusCode: 201,
      body: "",
      headers: {},
    });

    const result = await sendPush(subscription, {
      title: "t",
      body: "b",
      notificationId: "notif-1",
    });

    expect(result).toEqual({ ok: true });
    expect(setVapidDetails).toHaveBeenCalledWith(
      "mailto:test@example.com",
      "public-key",
      "private-key",
    );
    expect(sendNotification).toHaveBeenCalledWith(
      subscription,
      JSON.stringify({ title: "t", body: "b", notificationId: "notif-1" }),
    );
  });

  it("reports expired: true for a 410 Gone response", async () => {
    process.env.VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    vi.resetModules();
    const { sendPush } = await import("./web-push-client");
    sendNotification.mockRejectedValue(new FakeWebPushError("gone", 410));

    const result = await sendPush(subscription, {
      title: "t",
      body: "b",
      notificationId: "notif-1",
    });

    expect(result).toEqual({ ok: false, expired: true, error: "gone" });
  });

  it("reports expired: false for a non-expiry push error", async () => {
    process.env.VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    vi.resetModules();
    const { sendPush } = await import("./web-push-client");
    sendNotification.mockRejectedValue(
      new FakeWebPushError("server error", 500),
    );

    const result = await sendPush(subscription, {
      title: "t",
      body: "b",
      notificationId: "notif-1",
    });

    expect(result).toEqual({
      ok: false,
      expired: false,
      error: "server error",
    });
  });

  it("handles a non-WebPushError failure gracefully", async () => {
    process.env.VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    vi.resetModules();
    const { sendPush } = await import("./web-push-client");
    sendNotification.mockRejectedValue(new Error("network down"));

    const result = await sendPush(subscription, {
      title: "t",
      body: "b",
      notificationId: "notif-1",
    });

    expect(result).toEqual({
      ok: false,
      expired: false,
      error: "network down",
    });
  });
});
