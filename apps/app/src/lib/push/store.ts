import { Redis } from "@upstash/redis";
import {
  RECENT_TEMPLATE_HISTORY_LENGTH,
  type NotificationLogEntry,
  type PushSubscriptionJSON,
  type SubscriberRecord,
} from "./types";

export interface UpsertSubscriberInput {
  deviceId: string;
  subscription: PushSubscriptionJSON;
  currentStreak: number;
  lastPracticedDate: string | null;
}

export interface RecordNotificationInput {
  id: string;
  deviceId: string;
  templateKey: string;
  title: string;
  body: string;
  sentAt: number;
}

export interface PushStore {
  getSubscriber(deviceId: string): Promise<SubscriberRecord | null>;
  listSubscribers(): Promise<SubscriberRecord[]>;
  upsertSubscriber(input: UpsertSubscriberInput): Promise<SubscriberRecord>;
  deleteSubscriber(deviceId: string): Promise<void>;
  recordNotification(input: RecordNotificationInput): Promise<void>;
  getNotification(notificationId: string): Promise<NotificationLogEntry | null>;
  markNotificationClicked(notificationId: string): Promise<void>;
}

function nextRecentTemplateKeys(
  existing: string[],
  templateKey: string,
): string[] {
  return [templateKey, ...existing].slice(0, RECENT_TEMPLATE_HISTORY_LENGTH);
}

/**
 * In-memory fallback — used automatically when no Upstash Redis credentials
 * are configured (local dev, tests). NOT persistent across serverless cold
 * starts, so it must never be relied on in a real deployment: production
 * needs `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` set (a Redis
 * integration attached to the Vercel project) for subscriptions to survive.
 */
export function createMemoryPushStore(): PushStore {
  const subscribers = new Map<string, SubscriberRecord>();
  const notifications = new Map<string, NotificationLogEntry>();

  return {
    async getSubscriber(deviceId) {
      return subscribers.get(deviceId) ?? null;
    },
    async listSubscribers() {
      return [...subscribers.values()];
    },
    async upsertSubscriber(input) {
      const existing = subscribers.get(input.deviceId);
      const now = Date.now();
      const record: SubscriberRecord = {
        deviceId: input.deviceId,
        subscription: input.subscription,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        currentStreak: input.currentStreak,
        lastPracticedDate: input.lastPracticedDate,
        lastSentAt: existing?.lastSentAt ?? null,
        recentTemplateKeys: existing?.recentTemplateKeys ?? [],
      };
      subscribers.set(input.deviceId, record);
      return record;
    },
    async deleteSubscriber(deviceId) {
      subscribers.delete(deviceId);
    },
    async recordNotification(input) {
      notifications.set(input.id, { ...input, clickedAt: null });
      const subscriber = subscribers.get(input.deviceId);
      if (subscriber) {
        subscribers.set(input.deviceId, {
          ...subscriber,
          lastSentAt: input.sentAt,
          recentTemplateKeys: nextRecentTemplateKeys(
            subscriber.recentTemplateKeys,
            input.templateKey,
          ),
        });
      }
    },
    async getNotification(notificationId) {
      return notifications.get(notificationId) ?? null;
    },
    async markNotificationClicked(notificationId) {
      const entry = notifications.get(notificationId);
      if (entry && entry.clickedAt === null) {
        notifications.set(notificationId, {
          ...entry,
          clickedAt: Date.now(),
        });
      }
    },
  };
}

const SUBSCRIBER_SET_KEY = "push:subscribers";
const subscriberKey = (deviceId: string) => `push:subscriber:${deviceId}`;
const notificationKey = (id: string) => `push:notification:${id}`;

/** Persistent store backed by Upstash Redis — the production implementation. */
export function createRedisPushStore(redis: Redis): PushStore {
  return {
    async getSubscriber(deviceId) {
      return await redis.get<SubscriberRecord>(subscriberKey(deviceId));
    },
    async listSubscribers() {
      const deviceIds = await redis.smembers(SUBSCRIBER_SET_KEY);
      if (deviceIds.length === 0) return [];
      const records = await Promise.all(
        deviceIds.map((deviceId) =>
          redis.get<SubscriberRecord>(subscriberKey(deviceId)),
        ),
      );
      return records.filter((record): record is SubscriberRecord =>
        Boolean(record),
      );
    },
    async upsertSubscriber(input) {
      const key = subscriberKey(input.deviceId);
      const existing = await redis.get<SubscriberRecord>(key);
      const now = Date.now();
      const record: SubscriberRecord = {
        deviceId: input.deviceId,
        subscription: input.subscription,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        currentStreak: input.currentStreak,
        lastPracticedDate: input.lastPracticedDate,
        lastSentAt: existing?.lastSentAt ?? null,
        recentTemplateKeys: existing?.recentTemplateKeys ?? [],
      };
      await redis.set(key, record);
      await redis.sadd(SUBSCRIBER_SET_KEY, input.deviceId);
      return record;
    },
    async deleteSubscriber(deviceId) {
      await redis.del(subscriberKey(deviceId));
      await redis.srem(SUBSCRIBER_SET_KEY, deviceId);
    },
    async recordNotification(input) {
      const entry: NotificationLogEntry = { ...input, clickedAt: null };
      await redis.set(notificationKey(input.id), entry);
      const subscriberRecordKey = subscriberKey(input.deviceId);
      const subscriber = await redis.get<SubscriberRecord>(subscriberRecordKey);
      if (subscriber) {
        await redis.set(subscriberRecordKey, {
          ...subscriber,
          lastSentAt: input.sentAt,
          recentTemplateKeys: nextRecentTemplateKeys(
            subscriber.recentTemplateKeys,
            input.templateKey,
          ),
        });
      }
    },
    async getNotification(notificationId) {
      return await redis.get<NotificationLogEntry>(
        notificationKey(notificationId),
      );
    },
    async markNotificationClicked(notificationId) {
      const key = notificationKey(notificationId);
      const entry = await redis.get<NotificationLogEntry>(key);
      if (entry && entry.clickedAt === null) {
        await redis.set(key, { ...entry, clickedAt: Date.now() });
      }
    },
  };
}

let memoryStoreSingleton: PushStore | null = null;

/**
 * Picks Redis when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are
 * configured (attach a Redis integration to the Vercel project), otherwise
 * falls back to an in-memory store — fine for local dev/tests, but a real
 * deployment without Redis configured will silently lose subscribers on
 * every cold start, so this warns loudly outside of tests.
 */
export function getPushStore(): PushStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return createRedisPushStore(new Redis({ url, token }));
  }
  if (process.env.NODE_ENV !== "test") {
    console.warn(
      "[push] UPSTASH_REDIS_REST_URL/TOKEN not set — using a non-persistent in-memory push store. Attach a Redis integration in Vercel for real deployments.",
    );
  }
  memoryStoreSingleton ??= createMemoryPushStore();
  return memoryStoreSingleton;
}
