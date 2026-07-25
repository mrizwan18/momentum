import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeEvent {
  data?: { json: () => unknown } | null;
  waitUntil: (promise: Promise<unknown>) => void;
}

describe("service worker push handlers", () => {
  let listeners: Record<string, (event: never) => void>;
  let showNotification: ReturnType<typeof vi.fn>;
  let matchAll: ReturnType<typeof vi.fn>;
  let openWindow: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    listeners = {};
    showNotification = vi.fn();
    matchAll = vi.fn().mockResolvedValue([]);
    openWindow = vi.fn();

    vi.stubGlobal("self", {
      addEventListener: (type: string, handler: (event: never) => void) => {
        listeners[type] = handler;
      },
      registration: { showNotification },
      clients: { matchAll, openWindow },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

    await import("./index.js");
  });

  function pushEvent(data: unknown): FakeEvent {
    return {
      data: data === null ? null : { json: () => data },
      waitUntil: vi.fn(),
    };
  }

  it("shows a notification with the push payload", async () => {
    const event = pushEvent({
      title: "Hi",
      body: "There",
      notificationId: "n1",
    });

    listeners.push(event as never);
    expect(event.waitUntil).toHaveBeenCalled();
    await (event.waitUntil as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(showNotification).toHaveBeenCalledWith(
      "Hi",
      expect.objectContaining({
        body: "There",
        data: { notificationId: "n1" },
      }),
    );
  });

  it("ignores a push event with no data", () => {
    const event = pushEvent(null);
    listeners.push(event as never);
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it("ignores malformed push JSON", () => {
    const event: FakeEvent = {
      data: {
        json: () => {
          throw new Error("bad json");
        },
      },
      waitUntil: vi.fn(),
    };
    listeners.push(event as never);
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it("ignores a push payload with no title", () => {
    const event = pushEvent({ body: "no title here" });
    listeners.push(event as never);
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  function clickEvent(notificationData: unknown) {
    return {
      notification: { close: vi.fn(), data: notificationData },
      waitUntil: vi.fn(),
    };
  }

  it("on click: closes the notification, reports the click, and focuses an existing client", async () => {
    const focus = vi.fn().mockResolvedValue(undefined);
    matchAll.mockResolvedValue([{ focus }]);
    const event = clickEvent({ notificationId: "n1" });

    listeners.notificationclick(event as never);
    expect(event.notification.close).toHaveBeenCalled();
    await (event.waitUntil as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(fetch).toHaveBeenCalledWith(
      "/api/push/click",
      expect.objectContaining({ method: "POST" }),
    );
    expect(focus).toHaveBeenCalled();
    expect(openWindow).not.toHaveBeenCalled();
  });

  it("on click: opens a new window when no existing client can be focused", async () => {
    matchAll.mockResolvedValue([]);
    const event = clickEvent({ notificationId: "n1" });

    listeners.notificationclick(event as never);
    await (event.waitUntil as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(openWindow).toHaveBeenCalledWith("/");
  });

  it("on click: still opens the app even if click-tracking fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    matchAll.mockResolvedValue([]);
    const event = clickEvent({ notificationId: "n1" });

    listeners.notificationclick(event as never);
    await (event.waitUntil as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(openWindow).toHaveBeenCalledWith("/");
  });

  it("on click: skips click-tracking entirely when there's no notificationId", async () => {
    matchAll.mockResolvedValue([]);
    const event = clickEvent(undefined);

    listeners.notificationclick(event as never);
    await (event.waitUntil as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(fetch).not.toHaveBeenCalled();
    expect(openWindow).toHaveBeenCalledWith("/");
  });
});
