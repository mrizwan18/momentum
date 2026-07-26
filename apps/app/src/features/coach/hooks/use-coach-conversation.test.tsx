import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useCoachConversation } from "./use-coach-conversation";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

const coachReplyResponseData = {
  message: "Great question — try slow scales today.",
  suggestedExercises: ["Slow scales"],
};

describe("useCoachConversation", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-coach-conversation-hook-${Math.random()}`),
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await storage.db.delete();
  });

  it("loads existing conversation history on mount", async () => {
    await storage.coachMessages.append({ role: "user", message: "Hi" });
    const { result } = renderHook(() => useCoachConversation(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.messages).toHaveLength(1);
  });

  it("persists both the user's message and the real coach reply", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ data: coachReplyResponseData, provider: "mock" }),
            { status: 200 },
          ),
        ),
    );
    const { result } = renderHook(() => useCoachConversation(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => {
      await result.current.send("What should I practice?");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      message: "What should I practice?",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "coach",
      message: coachReplyResponseData.message,
    });
    expect(await storage.coachMessages.list()).toHaveLength(2);
  });

  it("falls back to a deterministic reply when the request fails, without losing the user's message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { result } = renderHook(() => useCoachConversation(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => {
      await result.current.send("What should I practice?");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe("coach");
    expect(result.current.messages[1].provider).toBeNull();
  });

  it("ignores an empty message", async () => {
    const { result } = renderHook(() => useCoachConversation(), { wrapper });
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => {
      await result.current.send("   ");
    });

    expect(result.current.messages).toHaveLength(0);
  });
});
