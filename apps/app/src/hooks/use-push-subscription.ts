"use client";

import * as React from "react";

export type PushSubscriptionStatus =
  "unsupported" | "default" | "denied" | "subscribed";

export interface EngagementSnapshot {
  currentStreak: number;
  lastPracticedDate: string | null;
}

export interface UsePushSubscriptionResult {
  status: PushSubscriptionStatus;
  subscribe: (engagement?: EngagementSnapshot) => Promise<boolean>;
  unsubscribe: () => Promise<void>;
}

const DEVICE_ID_KEY = "momentum-push-device-id";

function getOrCreateDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/** Reads the device id without creating one — `null` means this browser never subscribed to push. */
export function getExistingPushDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_ID_KEY);
}

/** Converts a URL-safe base64 VAPID public key into the Uint8Array `pushManager.subscribe` expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Manages the browser's push-subscription lifecycle: permission, the
 * PushManager subscription itself, and syncing it (plus an engagement
 * snapshot) to the server via /api/push/subscribe.
 */
function initialStatus(): PushSubscriptionStatus {
  if (!isSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return "default";
}

export function usePushSubscription(): UsePushSubscriptionResult {
  const [status, setStatus] =
    React.useState<PushSubscriptionStatus>(initialStatus);

  React.useEffect(() => {
    if (status !== "default") return;
    let cancelled = false;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled && subscription) {
          setStatus("subscribed");
        }
      })
      .catch(() => {
        // Service worker not controlling this page yet — leave status as "default".
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const subscribe = React.useCallback(
    async (
      engagement: EngagementSnapshot = {
        currentStreak: 0,
        lastPracticedDate: null,
      },
    ) => {
      if (!isSupported()) {
        setStatus("unsupported");
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "default");
        return false;
      }

      const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!applicationServerKey) {
        console.warn(
          "[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set — can't subscribe.",
        );
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          applicationServerKey,
        ) as BufferSource,
      });

      const deviceId = getOrCreateDeviceId();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deviceId,
          subscription: subscription.toJSON(),
          ...engagement,
        }),
      });

      setStatus("subscribed");
      return true;
    },
    [],
  );

  const unsubscribe = React.useCallback(async () => {
    if (!isSupported()) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    const deviceId = window.localStorage.getItem(DEVICE_ID_KEY);
    if (deviceId) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
    }
    setStatus("default");
  }, []);

  return { status, subscribe, unsubscribe };
}
