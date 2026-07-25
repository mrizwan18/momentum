import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePushSubscription } from "./use-push-subscription";

function mockSupportedBrowser({
  permission = "default" as NotificationPermission,
  requestPermissionResult = "granted" as NotificationPermission,
  hasExistingSubscription = false,
  subscribeResult = {
    toJSON: () => ({ endpoint: "https://push.example.com/1" }),
  },
} = {}) {
  vi.stubGlobal("Notification", {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestPermissionResult),
  });
  vi.stubGlobal("PushManager", function PushManager() {});

  const unsubscribeFn = vi.fn().mockImplementation(async () => {
    currentSubscription = null;
    return true;
  });
  let currentSubscription: unknown = hasExistingSubscription
    ? { endpoint: "https://push.example.com/1", unsubscribe: unsubscribeFn }
    : null;
  const pushManager = {
    getSubscription: vi
      .fn()
      .mockImplementation(async () => currentSubscription),
    subscribe: vi.fn().mockImplementation(async () => {
      currentSubscription = subscribeResult;
      return subscribeResult;
    }),
  };
  Object.defineProperty(navigator, "serviceWorker", {
    value: { ready: Promise.resolve({ pushManager }) },
    configurable: true,
  });

  return { pushManager, unsubscribeFn };
}

describe("usePushSubscription", () => {
  beforeEach(() => {
    window.localStorage.clear();
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  });

  it("reports 'unsupported' when the browser lacks push APIs", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe("unsupported"));
  });

  it("reports 'denied' when notification permission was already denied", async () => {
    mockSupportedBrowser({ permission: "denied" });
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe("denied"));
  });

  it("reports 'subscribed' when an active push subscription already exists", async () => {
    mockSupportedBrowser({ hasExistingSubscription: true });
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe("subscribed"));
  });

  it("stays 'default' with permission not yet decided and no subscription", async () => {
    mockSupportedBrowser();
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).not.toBe("unsupported"));
    expect(result.current.status).toBe("default");
  });

  it("subscribes: requests permission, creates a subscription, and posts it to the server", async () => {
    const { pushManager } = mockSupportedBrowser();
    const { result } = renderHook(() => usePushSubscription());

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.subscribe({
        currentStreak: 5,
        lastPracticedDate: "2026-07-24",
      });
    });

    expect(outcome).toBe(true);
    expect(result.current.status).toBe("subscribed");
    expect(pushManager.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/push/subscribe",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body).toMatchObject({
      subscription: { endpoint: "https://push.example.com/1" },
      currentStreak: 5,
      lastPracticedDate: "2026-07-24",
    });
    expect(typeof body.deviceId).toBe("string");
    expect(body.deviceId.length).toBeGreaterThan(0);
  });

  it("reuses the same deviceId across repeated subscribe calls", async () => {
    mockSupportedBrowser();
    const { result } = renderHook(() => usePushSubscription());

    await act(async () => {
      await result.current.subscribe();
    });
    const firstDeviceId = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    ).deviceId;

    await act(async () => {
      await result.current.subscribe();
    });
    const secondDeviceId = JSON.parse(
      (vi.mocked(fetch).mock.calls[1][1] as RequestInit).body as string,
    ).deviceId;

    expect(secondDeviceId).toBe(firstDeviceId);
  });

  it("does not subscribe when the user denies the permission prompt", async () => {
    const { pushManager } = mockSupportedBrowser({
      requestPermissionResult: "denied",
    });
    const { result } = renderHook(() => usePushSubscription());

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.subscribe();
    });

    expect(outcome).toBe(false);
    expect(result.current.status).toBe("denied");
    expect(pushManager.subscribe).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does nothing when the browser is unsupported and subscribe() is called", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe("unsupported"));

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.subscribe();
    });
    expect(outcome).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("warns and bails when NEXT_PUBLIC_VAPID_PUBLIC_KEY isn't configured", async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { pushManager } = mockSupportedBrowser();
    const { result } = renderHook(() => usePushSubscription());

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.subscribe();
    });

    expect(outcome).toBe(false);
    expect(pushManager.subscribe).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("unsubscribes: tears down the browser subscription and notifies the server", async () => {
    const { unsubscribeFn } = mockSupportedBrowser({
      hasExistingSubscription: true,
    });
    window.localStorage.setItem("momentum-push-device-id", "device-1");
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe("subscribed"));

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(unsubscribeFn).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/push/unsubscribe",
      expect.objectContaining({ method: "POST" }),
    );
    await waitFor(() => expect(result.current.status).toBe("default"));
  });

  it("still notifies the server on unsubscribe even with no live browser subscription", async () => {
    mockSupportedBrowser({ hasExistingSubscription: false });
    window.localStorage.setItem("momentum-push-device-id", "device-1");
    const { result } = renderHook(() => usePushSubscription());

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/push/unsubscribe",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
