import "server-only";

import { Redis } from "@upstash/redis";

export interface AiResponseCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * In-memory fallback — used automatically when no Upstash Redis credentials
 * are configured (local dev, tests). Not persistent across serverless cold
 * starts; mirrors src/lib/push/store.ts's same fallback pattern.
 */
export function createMemoryResponseCache(): AiResponseCache {
  const entries = new Map<string, MemoryEntry>();
  return {
    async get<T>(key: string) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        entries.delete(key);
        return null;
      }
      return entry.value as T;
    },
    async set<T>(key: string, value: T, ttlSeconds: number) {
      entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
  };
}

export function createRedisResponseCache(redis: Redis): AiResponseCache {
  return {
    async get<T>(key: string) {
      return await redis.get<T>(key);
    },
    async set<T>(key: string, value: T, ttlSeconds: number) {
      await redis.set(key, value, { ex: ttlSeconds });
    },
  };
}

let memoryCacheSingleton: AiResponseCache | null = null;

/** Same env-var convention as src/lib/push/store.ts's getPushStore(). */
export function getAiResponseCache(): AiResponseCache {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return createRedisResponseCache(new Redis({ url, token }));
  }
  memoryCacheSingleton ??= createMemoryResponseCache();
  return memoryCacheSingleton;
}

/** Deterministic key for a given operation + logical identity (recordingId, sessionId, date, ...). */
export function buildCacheKey(operation: string, identity: string): string {
  return `ai:cache:${operation}:${identity}`;
}
