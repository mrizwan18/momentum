"use client";

import * as React from "react";
import type { VoiceCondition } from "@momentum/types";
import { useStorage } from "@/providers/storage-provider";
import { useActiveSessionStore } from "@/stores/active-session-store";
import { transition } from "../state-machine/transition";
import {
  initialPracticeMachineState,
  type PracticeMachineState,
} from "../state-machine/types";
import {
  ensurePracticeCatalog,
  type PracticeCatalog,
} from "../services/catalog-service";
import {
  autosaveProgress,
  cancelSession,
  completeCurrentExercise,
  findResumableSession,
  finishSession,
  pauseSession,
  resumeSession,
  startSession,
  type CompleteExerciseInput,
} from "../services/practice-service";

export type PracticeCatalogState = "loading" | "ready" | "empty" | "error";

export interface BeginSessionInput {
  voiceCondition: VoiceCondition;
  recoveryMode?: boolean;
}

export interface UsePracticeSessionResult {
  catalogState: PracticeCatalogState;
  catalog: PracticeCatalog | null;
  machine: PracticeMachineState;
  /** Set when the catalog/session couldn't be loaded on mount; cleared by retryLoad(). */
  loadError: string | null;
  retryLoad: () => void;
  /** Set when a persisted action (pause, complete exercise, ...) fails; the screen underneath stays intact. */
  actionError: string | null;
  dismissActionError: () => void;
  /** True while a discrete user action (begin, pause, resume, cancel, complete exercise, ...) is in flight — disable its trigger to prevent duplicate submissions. */
  isBusy: boolean;
  startPractice: () => void;
  cancelPreparing: () => void;
  beginSession: (input: BeginSessionInput) => Promise<void>;
  resumeInterrupted: () => void;
  discardInterrupted: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
  saveDraftNotes: (notes: string) => Promise<void>;
  recordElapsed: (elapsedSeconds: number) => Promise<void>;
  completeExercise: (input: CompleteExerciseInput) => Promise<void>;
  reset: () => void;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Orchestrates the Practice experience: loads the Riyaaz catalog and any
 * resumable session on mount, then drives the Practice state machine
 * (docs/engineering/state-machines.md) via the repository-backed
 * practice-service. Components stay declarative — they read `machine.status`
 * and call the actions below; every persisted transition round-trips
 * through Dexie via the repository pattern before the local state updates,
 * so the UI never gets ahead of what's actually durable.
 */
export function usePracticeSession(): UsePracticeSessionResult {
  const storage = useStorage();
  const setActiveSessionId = useActiveSessionStore(
    (state) => state.setActiveSessionId,
  );

  const [catalogState, setCatalogState] =
    React.useState<PracticeCatalogState>("loading");
  const [catalog, setCatalog] = React.useState<PracticeCatalog | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = React.useState(0);
  const [machine, dispatch] = React.useReducer(
    transition,
    initialPracticeMachineState,
  );

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setCatalogState("loading");
      setLoadError(null);
      try {
        const [loadedCatalog, activeSession] = await Promise.all([
          ensurePracticeCatalog(storage),
          findResumableSession(storage),
        ]);

        if (cancelled) return;

        setCatalog(loadedCatalog);
        setCatalogState(loadedCatalog ? "ready" : "empty");

        if (activeSession) {
          setActiveSessionId(activeSession.id);
          dispatch({ type: "SESSION_FOUND", session: activeSession });
        } else {
          dispatch({ type: "NO_SESSION_FOUND" });
        }
      } catch (error) {
        if (cancelled) return;
        setCatalogState("error");
        setLoadError(toErrorMessage(error));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [storage, setActiveSessionId, loadAttempt]);

  const retryLoad = React.useCallback(() => {
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const dismissActionError = React.useCallback(() => {
    setActionError(null);
  }, []);

  // Every persisted action (a per-second elapsed-time tick, a debounced
  // notes save, completing an exercise, pause/resume/cancel, ...) chains
  // onto this queue so they run strictly one at a time. Without it, a tick's
  // read-modify-write of the session record can race a concurrent
  // completeExercise call and have its dispatch overwrite (and appear to
  // revert) the queue-advancing state with a stale snapshot.
  const actionQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  // Tracks discrete user-initiated commits only (begin/pause/resume/cancel/
  // completeExercise/discardInterrupted) — a `ref` so a second click is
  // rejected synchronously, before React has re-rendered with a fresh
  // `machine.session`. Ticks/notes-autosave are excluded so buttons don't
  // flicker disabled once a second during ordinary practicing.
  const busyRef = React.useRef(0);
  const [isBusy, setIsBusy] = React.useState(false);

  const runAction = React.useCallback((action: () => Promise<void>) => {
    const run = actionQueueRef.current.then(async () => {
      setActionError(null);
      try {
        await action();
      } catch (error) {
        setActionError(toErrorMessage(error));
      }
    });
    actionQueueRef.current = run;
    return run;
  }, []);

  const runUserAction = React.useCallback((action: () => Promise<void>) => {
    if (busyRef.current > 0) {
      return Promise.resolve();
    }
    busyRef.current += 1;
    setIsBusy(true);
    const run = actionQueueRef.current.then(async () => {
      setActionError(null);
      try {
        await action();
      } catch (error) {
        setActionError(toErrorMessage(error));
      } finally {
        busyRef.current -= 1;
        if (busyRef.current === 0) {
          setIsBusy(false);
        }
      }
    });
    actionQueueRef.current = run;
    return run;
  }, []);

  const startPractice = React.useCallback(() => {
    if (!catalog) return;
    dispatch({ type: "START" });
  }, [catalog]);

  const cancelPreparing = React.useCallback(() => {
    dispatch({ type: "BACK_TO_IDLE" });
  }, []);

  const beginSession = React.useCallback(
    async ({ voiceCondition, recoveryMode }: BeginSessionInput) => {
      if (!catalog) return;
      await runUserAction(async () => {
        const session = await startSession(storage, {
          skillId: catalog.skill.id,
          plan: catalog.plan,
          voiceCondition,
          recoveryMode,
        });
        setActiveSessionId(session.id);
        dispatch({ type: "BEGIN", session });
      });
    },
    [storage, catalog, setActiveSessionId, runUserAction],
  );

  const resumeInterrupted = React.useCallback(() => {
    dispatch({ type: "RESUME_INTERRUPTED" });
  }, []);

  const discardInterrupted = React.useCallback(async () => {
    if (machine.status !== "interrupted") return;
    const session = machine.session;
    await runUserAction(async () => {
      await cancelSession(storage, session.id);
      setActiveSessionId(null);
      dispatch({ type: "DISCARD_INTERRUPTED" });
    });
  }, [storage, machine, setActiveSessionId, runUserAction]);

  const pause = React.useCallback(async () => {
    if (machine.status !== "practicing") return;
    const session = machine.session;
    await runUserAction(async () => {
      await pauseSession(storage, session.id);
      dispatch({ type: "PAUSE" });
    });
  }, [storage, machine, runUserAction]);

  const resume = React.useCallback(async () => {
    if (machine.status !== "paused") return;
    const session = machine.session;
    await runUserAction(async () => {
      await resumeSession(storage, session.id);
      dispatch({ type: "RESUME" });
    });
  }, [storage, machine, runUserAction]);

  const cancel = React.useCallback(async () => {
    if (machine.status !== "practicing" && machine.status !== "paused") return;
    const session = machine.session;
    await runUserAction(async () => {
      await cancelSession(storage, session.id);
      setActiveSessionId(null);
      dispatch({ type: "CANCEL" });
    });
  }, [storage, machine, setActiveSessionId, runUserAction]);

  const saveDraftNotes = React.useCallback(
    async (notes: string) => {
      if (machine.status !== "practicing") return;
      const currentSession = machine.session;
      await runAction(async () => {
        const session = await autosaveProgress(storage, currentSession.id, {
          draftNotes: notes,
        });
        dispatch({ type: "ADVANCE", session });
      });
    },
    [storage, machine, runAction],
  );

  const recordElapsed = React.useCallback(
    async (elapsedSeconds: number) => {
      if (machine.status !== "practicing") return;
      const currentSession = machine.session;
      await runAction(async () => {
        const session = await autosaveProgress(storage, currentSession.id, {
          elapsedSeconds,
        });
        dispatch({ type: "ADVANCE", session });
      });
    },
    [storage, machine, runAction],
  );

  const completeExercise = React.useCallback(
    async (input: CompleteExerciseInput) => {
      if (machine.status !== "practicing") return;
      const currentSession = machine.session;
      await runUserAction(async () => {
        const { session, isFinalExercise } = await completeCurrentExercise(
          storage,
          currentSession,
          input,
        );
        if (isFinalExercise) {
          const { session: finished, summary } = await finishSession(
            storage,
            session,
          );
          setActiveSessionId(null);
          dispatch({ type: "FINISH", session: finished, summary });
        } else {
          dispatch({ type: "ADVANCE", session });
        }
      });
    },
    [storage, machine, setActiveSessionId, runUserAction],
  );

  const reset = React.useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    catalogState,
    catalog,
    machine,
    loadError,
    retryLoad,
    actionError,
    dismissActionError,
    isBusy,
    startPractice,
    cancelPreparing,
    beginSession,
    resumeInterrupted,
    discardInterrupted,
    pause,
    resume,
    cancel,
    saveDraftNotes,
    recordElapsed,
    completeExercise,
    reset,
  };
}
