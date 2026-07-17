import { afterEach, describe, expect, it } from "vitest";
import { useActiveSessionStore } from "./active-session-store";

describe("active session store", () => {
  afterEach(() => {
    useActiveSessionStore.setState({ activeSessionId: null });
    localStorage.clear();
  });

  it("defaults to no active session", () => {
    expect(useActiveSessionStore.getState().activeSessionId).toBeNull();
  });

  it("stores and persists the active session id", () => {
    useActiveSessionStore.getState().setActiveSessionId("session-1");
    expect(useActiveSessionStore.getState().activeSessionId).toBe("session-1");

    const stored = JSON.parse(
      localStorage.getItem("momentum-active-session") ?? "{}",
    );
    expect(stored.state.activeSessionId).toBe("session-1");
  });

  it("clears the active session id", () => {
    useActiveSessionStore.getState().setActiveSessionId("session-1");
    useActiveSessionStore.getState().setActiveSessionId(null);
    expect(useActiveSessionStore.getState().activeSessionId).toBeNull();
  });
});
