import { describe, expect, it, vi } from "vitest";
import { buildCacheKey, createMemoryResponseCache } from "./response-cache";

describe("createMemoryResponseCache", () => {
  it("returns null for a missing key", async () => {
    const cache = createMemoryResponseCache();
    expect(await cache.get("missing")).toBeNull();
  });

  it("stores and retrieves a value", async () => {
    const cache = createMemoryResponseCache();
    await cache.set("key-1", { hello: "world" }, 60);
    expect(await cache.get("key-1")).toEqual({ hello: "world" });
  });

  it("expires a value after its TTL", async () => {
    vi.useFakeTimers();
    const cache = createMemoryResponseCache();
    await cache.set("key-1", "value", 10);
    expect(await cache.get("key-1")).toBe("value");

    vi.advanceTimersByTime(11_000);
    expect(await cache.get("key-1")).toBeNull();
    vi.useRealTimers();
  });

  it("keeps a value alive before its TTL elapses", async () => {
    vi.useFakeTimers();
    const cache = createMemoryResponseCache();
    await cache.set("key-1", "value", 60);

    vi.advanceTimersByTime(30_000);
    expect(await cache.get("key-1")).toBe("value");
    vi.useRealTimers();
  });
});

describe("buildCacheKey", () => {
  it("namespaces by operation and identity", () => {
    expect(buildCacheKey("generateAssessment", "recording-1")).toBe(
      "ai:cache:generateAssessment:recording-1",
    );
  });
});
