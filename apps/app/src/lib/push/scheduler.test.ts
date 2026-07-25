import { describe, expect, it } from "vitest";
import { decideNotification, toUtcDateOnly } from "./scheduler";
import type { SubscriberRecord } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 6, 25, 12, 0, 0); // 2026-07-25T12:00:00Z

function subscriber(overrides: Partial<SubscriberRecord>): SubscriberRecord {
  return {
    deviceId: "device-1",
    subscription: {
      endpoint: "https://push.example.com/1",
      expirationTime: null,
      keys: { p256dh: "p", auth: "a" },
    },
    createdAt: NOW - 30 * DAY,
    updatedAt: NOW - 30 * DAY,
    currentStreak: 0,
    lastPracticedDate: null,
    lastSentAt: null,
    recentTemplateKeys: [],
    ...overrides,
  };
}

describe("toUtcDateOnly", () => {
  it("formats a timestamp as a UTC YYYY-MM-DD key", () => {
    expect(toUtcDateOnly(NOW)).toBe("2026-07-25");
  });
});

describe("decideNotification", () => {
  it("is not due if a notification was already sent within the last 20 hours", () => {
    const decision = decideNotification(
      subscriber({
        lastSentAt: NOW - 5 * 60 * 60 * 1000,
        lastPracticedDate: "2026-07-20",
      }),
      NOW,
    );
    expect(decision.due).toBe(false);
  });

  it("is due once the 20-hour cooldown has passed", () => {
    const decision = decideNotification(
      subscriber({
        lastSentAt: NOW - 21 * 60 * 60 * 1000,
        lastPracticedDate: "2026-07-20",
      }),
      NOW,
    );
    expect(decision.due).toBe(true);
  });

  it("is not due if they've already practiced today", () => {
    const decision = decideNotification(
      subscriber({ lastPracticedDate: toUtcDateOnly(NOW) }),
      NOW,
    );
    expect(decision.due).toBe(false);
  });

  it("uses the generic context for someone who has never practiced", () => {
    const decision = decideNotification(
      subscriber({ lastPracticedDate: null }),
      NOW,
    );
    expect(decision).toEqual({ due: true, context: "generic" });
  });

  it("flags an active streak that lapses today as streak-at-risk", () => {
    const decision = decideNotification(
      subscriber({ currentStreak: 12, lastPracticedDate: "2026-07-24" }),
      NOW,
    );
    expect(decision).toEqual({ due: true, context: "streak-at-risk" });
  });

  it("does not use streak-at-risk once the streak has already broken (0)", () => {
    const decision = decideNotification(
      subscriber({ currentStreak: 0, lastPracticedDate: "2026-07-24" }),
      NOW,
    );
    expect(decision.context).toBe("havent-practiced-today");
  });

  it("uses comeback once 3+ days have passed since the last practice", () => {
    const decision = decideNotification(
      subscriber({ currentStreak: 0, lastPracticedDate: "2026-07-22" }),
      NOW,
    );
    expect(decision).toEqual({ due: true, context: "comeback" });
  });

  it("uses comeback even with a nonzero streak once 3+ days have passed", () => {
    const decision = decideNotification(
      subscriber({ currentStreak: 5, lastPracticedDate: "2026-07-20" }),
      NOW,
    );
    expect(decision).toEqual({ due: true, context: "comeback" });
  });

  it("falls back to havent-practiced-today for a 2-day gap with no streak", () => {
    const decision = decideNotification(
      subscriber({ currentStreak: 0, lastPracticedDate: "2026-07-23" }),
      NOW,
    );
    expect(decision).toEqual({ due: true, context: "havent-practiced-today" });
  });
});
