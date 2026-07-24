import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { usePracticeSession } from "./use-practice-session";

let storage: MomentumStorage;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

async function renderReady() {
  const view = renderHook(() => usePracticeSession(), { wrapper });
  await waitFor(() => expect(view.result.current.catalogState).toBe("ready"));
  return view;
}

describe("usePracticeSession", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-practice-session-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
    useActiveSessionStore.setState({ activeSessionId: null });
    localStorage.clear();
  });

  it("starts loading, then seeds and loads the catalog with no session in progress", async () => {
    const { result } = renderHook(() => usePracticeSession(), { wrapper });
    expect(result.current.catalogState).toBe("loading");
    expect(result.current.machine).toEqual({ status: "idle" });

    await waitFor(() => expect(result.current.catalogState).toBe("ready"));
    expect(result.current.catalog?.skill.slug).toBe("riyaaz");
    expect(result.current.machine).toEqual({ status: "idle" });
  });

  it("finds an in-progress session on mount and surfaces it as interrupted", async () => {
    const session = await storage.sessions.start(["breathing", "warmup"]);

    const { result } = await renderReady();

    expect(result.current.machine).toEqual({
      status: "interrupted",
      session,
    });
    expect(useActiveSessionStore.getState().activeSessionId).toBe(session.id);
  });

  it("finds a paused session on mount and goes straight to paused (no recovery prompt)", async () => {
    const session = await storage.sessions.start(["breathing"]);
    await storage.sessions.pause(session.id);

    const { result } = await renderReady();

    expect(result.current.machine.status).toBe("paused");
  });

  it("resumes an interrupted session without a further Dexie write", async () => {
    const session = await storage.sessions.start(["breathing"]);
    const { result } = await renderReady();

    act(() => result.current.resumeInterrupted());

    expect(result.current.machine).toEqual({
      status: "practicing",
      session,
    });
  });

  it("discards an interrupted session by abandoning it", async () => {
    await storage.sessions.start(["breathing"]);
    const { result } = await renderReady();

    await act(async () => {
      await result.current.discardInterrupted();
    });

    expect(result.current.machine).toEqual({ status: "cancelled" });
    expect(useActiveSessionStore.getState().activeSessionId).toBeNull();
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();
  });

  it("walks the full happy path: start -> begin -> pause -> resume -> complete every exercise -> finish", async () => {
    const { result } = await renderReady();

    act(() => result.current.startPractice());
    expect(result.current.machine).toEqual({ status: "preparing" });

    await act(async () => {
      await result.current.beginSession({ voiceCondition: "normal" });
    });
    expect(result.current.machine.status).toBe("practicing");
    const exerciseIds =
      result.current.machine.status === "practicing"
        ? result.current.machine.session.exerciseIds
        : [];
    expect(exerciseIds.length).toBeGreaterThan(0);
    expect(useActiveSessionStore.getState().activeSessionId).not.toBeNull();

    await act(async () => {
      await result.current.pause();
    });
    expect(result.current.machine.status).toBe("paused");

    await act(async () => {
      await result.current.resume();
    });
    expect(result.current.machine.status).toBe("practicing");

    await act(async () => {
      await result.current.saveDraftNotes("felt good");
    });
    expect(
      result.current.machine.status === "practicing"
        ? result.current.machine.session.draftNotes
        : null,
    ).toBe("felt good");

    await act(async () => {
      await result.current.recordElapsed(30);
    });
    expect(
      result.current.machine.status === "practicing"
        ? result.current.machine.session.elapsedSeconds
        : null,
    ).toBe(30);

    for (let i = 0; i < exerciseIds.length; i += 1) {
      await act(async () => {
        await result.current.completeExercise({
          exerciseId: exerciseIds[i],
          status: "completed",
          durationSeconds: 60,
        });
      });
    }

    expect(result.current.machine.status).toBe("completed");
    expect(useActiveSessionStore.getState().activeSessionId).toBeNull();
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();

    const attempts = await storage.exerciseAttempts.listBySession(
      result.current.machine.status === "completed"
        ? result.current.machine.session.id
        : "",
    );
    expect(attempts).toHaveLength(exerciseIds.length);

    act(() => result.current.reset());
    expect(result.current.machine).toEqual({ status: "idle" });
  });

  it("cancels a practicing session", async () => {
    const { result } = await renderReady();

    act(() => result.current.startPractice());
    await act(async () => {
      await result.current.beginSession({ voiceCondition: "tired" });
    });

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.machine).toEqual({ status: "cancelled" });
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();
  });

  it("returns to idle from the preparing screen without starting a session", async () => {
    const { result } = await renderReady();

    act(() => result.current.startPractice());
    expect(result.current.machine.status).toBe("preparing");

    act(() => result.current.cancelPreparing());
    expect(result.current.machine).toEqual({ status: "idle" });
    await expect(storage.sessions.getActive()).resolves.toBeUndefined();
  });

  it("surfaces a loadError and recovers via retryLoad", async () => {
    const originalGetBySlug = storage.skills.getBySlug;
    storage.skills.getBySlug = () =>
      Promise.reject(new Error("Dexie is unavailable"));

    const { result } = renderHook(() => usePracticeSession(), { wrapper });
    await waitFor(() => expect(result.current.catalogState).toBe("error"));
    expect(result.current.loadError).toBe("Dexie is unavailable");

    storage.skills.getBySlug = originalGetBySlug;
    act(() => result.current.retryLoad());

    await waitFor(() => expect(result.current.catalogState).toBe("ready"));
    expect(result.current.loadError).toBeNull();
  });

  it("surfaces an actionError without disturbing the current machine state", async () => {
    const { result } = await renderReady();

    act(() => result.current.startPractice());
    await act(async () => {
      await result.current.beginSession({ voiceCondition: "normal" });
    });
    expect(result.current.machine.status).toBe("practicing");

    const originalPause = storage.sessions.pause;
    storage.sessions.pause = () => Promise.reject(new Error("save failed"));

    await act(async () => {
      await result.current.pause();
    });

    expect(result.current.actionError).toBe("save failed");
    expect(result.current.machine.status).toBe("practicing");

    storage.sessions.pause = originalPause;
    act(() => result.current.dismissActionError());
    expect(result.current.actionError).toBeNull();
  });
});
