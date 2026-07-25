import type { NotificationContext } from "./copy-bank";
import type { SubscriberRecord } from "./types";

const MIN_HOURS_BETWEEN_SENDS = 20;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export interface NotificationDecision {
  due: boolean;
  context: NotificationContext;
}

/** UTC calendar-day key — the server has no reliable per-device timezone, so this is a deliberate approximation. */
export function toUtcDateOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysSince(dateOnly: string, now: number): number {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const dateMidnightUtc = Date.UTC(year, month - 1, day);
  const nowMidnightUtc = Date.UTC(
    new Date(now).getUTCFullYear(),
    new Date(now).getUTCMonth(),
    new Date(now).getUTCDate(),
  );
  return Math.round((nowMidnightUtc - dateMidnightUtc) / MS_PER_DAY);
}

/**
 * Decides whether a subscriber is due for a nudge right now, and which
 * context best fits their situation. Pure/deterministic given `now`, so
 * it's fully unit-testable without faking the system clock.
 */
export function decideNotification(
  subscriber: SubscriberRecord,
  now: number = Date.now(),
): NotificationDecision {
  const notDue: NotificationDecision = { due: false, context: "generic" };

  if (
    subscriber.lastSentAt !== null &&
    now - subscriber.lastSentAt < MIN_HOURS_BETWEEN_SENDS * MS_PER_HOUR
  ) {
    return notDue;
  }

  if (subscriber.lastPracticedDate === toUtcDateOnly(now)) {
    return notDue;
  }

  if (subscriber.lastPracticedDate === null) {
    return { due: true, context: "generic" };
  }

  const gap = daysSince(subscriber.lastPracticedDate, now);
  if (subscriber.currentStreak > 0 && gap <= 1) {
    return { due: true, context: "streak-at-risk" };
  }
  if (gap >= 3) {
    return { due: true, context: "comeback" };
  }
  return { due: true, context: "havent-practiced-today" };
}
