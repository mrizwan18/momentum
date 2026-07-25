import { describe, expect, it } from "vitest";
import { createMemoryPushStore } from "./store";
import type { PushSubscriptionJSON } from "./types";

function fakeSubscription(suffix: string): PushSubscriptionJSON {
  return {
    endpoint: `https://push.example.com/${suffix}`,
    expirationTime: null,
    keys: { p256dh: `p256dh-${suffix}`, auth: `auth-${suffix}` },
  };
}

describe("createMemoryPushStore", () => {
  it("returns null for an unknown subscriber", async () => {
    const store = createMemoryPushStore();
    expect(await store.getSubscriber("nope")).toBeNull();
  });

  it("upserts a subscriber and reads it back", async () => {
    const store = createMemoryPushStore();
    const record = await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 3,
      lastPracticedDate: "2026-07-24",
    });

    expect(record.deviceId).toBe("device-1");
    expect(record.currentStreak).toBe(3);
    expect(record.lastSentAt).toBeNull();
    expect(record.recentTemplateKeys).toEqual([]);
    expect(await store.getSubscriber("device-1")).toEqual(record);
  });

  it("preserves createdAt and history across repeat upserts", async () => {
    const store = createMemoryPushStore();
    const first = await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 1,
      lastPracticedDate: "2026-07-23",
    });
    await store.recordNotification({
      id: "notif-1",
      deviceId: "device-1",
      templateKey: "streak-at-risk-1",
      title: "t",
      body: "b",
      sentAt: Date.now(),
    });

    const second = await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 2,
      lastPracticedDate: "2026-07-24",
    });

    expect(second.createdAt).toBe(first.createdAt);
    expect(second.currentStreak).toBe(2);
    // upsert doesn't touch history fields written by recordNotification
    expect(second.lastSentAt).not.toBeNull();
    expect(second.recentTemplateKeys).toEqual(["streak-at-risk-1"]);
  });

  it("lists every subscriber", async () => {
    const store = createMemoryPushStore();
    await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 0,
      lastPracticedDate: null,
    });
    await store.upsertSubscriber({
      deviceId: "device-2",
      subscription: fakeSubscription("2"),
      currentStreak: 0,
      lastPracticedDate: null,
    });

    const all = await store.listSubscribers();
    expect(all.map((s) => s.deviceId).sort()).toEqual(["device-1", "device-2"]);
  });

  it("deletes a subscriber", async () => {
    const store = createMemoryPushStore();
    await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 0,
      lastPracticedDate: null,
    });
    await store.deleteSubscriber("device-1");
    expect(await store.getSubscriber("device-1")).toBeNull();
    expect(await store.listSubscribers()).toEqual([]);
  });

  it("records a notification and updates the subscriber's send history", async () => {
    const store = createMemoryPushStore();
    await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 0,
      lastPracticedDate: null,
    });

    const sentAt = Date.now();
    await store.recordNotification({
      id: "notif-1",
      deviceId: "device-1",
      templateKey: "comeback-1",
      title: "Come back!",
      body: "We miss you.",
      sentAt,
    });

    const subscriber = await store.getSubscriber("device-1");
    expect(subscriber?.lastSentAt).toBe(sentAt);
    expect(subscriber?.recentTemplateKeys).toEqual(["comeback-1"]);
  });

  it("caps recent template history at the configured length", async () => {
    const store = createMemoryPushStore();
    await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 0,
      lastPracticedDate: null,
    });

    for (let i = 0; i < 8; i += 1) {
      await store.recordNotification({
        id: `notif-${i}`,
        deviceId: "device-1",
        templateKey: `template-${i}`,
        title: "t",
        body: "b",
        sentAt: Date.now(),
      });
    }

    const subscriber = await store.getSubscriber("device-1");
    expect(subscriber?.recentTemplateKeys).toHaveLength(5);
    expect(subscriber?.recentTemplateKeys).toEqual([
      "template-7",
      "template-6",
      "template-5",
      "template-4",
      "template-3",
    ]);
  });

  it("is a no-op when recording a notification for an unknown subscriber", async () => {
    const store = createMemoryPushStore();
    await expect(
      store.recordNotification({
        id: "notif-1",
        deviceId: "ghost",
        templateKey: "generic-1",
        title: "t",
        body: "b",
        sentAt: Date.now(),
      }),
    ).resolves.toBeUndefined();
  });

  it("marks a notification as clicked exactly once, keeping the first timestamp", async () => {
    const store = createMemoryPushStore();
    await store.upsertSubscriber({
      deviceId: "device-1",
      subscription: fakeSubscription("1"),
      currentStreak: 0,
      lastPracticedDate: null,
    });
    await store.recordNotification({
      id: "notif-1",
      deviceId: "device-1",
      templateKey: "generic-1",
      title: "t",
      body: "b",
      sentAt: Date.now(),
    });

    expect((await store.getNotification("notif-1"))?.clickedAt).toBeNull();

    await store.markNotificationClicked("notif-1");
    const firstClick = await store.getNotification("notif-1");
    expect(firstClick?.clickedAt).not.toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 2));
    await store.markNotificationClicked("notif-1");
    const secondClick = await store.getNotification("notif-1");
    expect(secondClick?.clickedAt).toBe(firstClick?.clickedAt);
  });

  it("returns null for an unknown notification", async () => {
    const store = createMemoryPushStore();
    expect(await store.getNotification("unknown")).toBeNull();
  });

  it("is a no-op when marking an unknown notification as clicked", async () => {
    const store = createMemoryPushStore();
    await expect(
      store.markNotificationClicked("unknown"),
    ).resolves.toBeUndefined();
  });
});
