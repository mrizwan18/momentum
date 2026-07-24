"use client";

import * as React from "react";

/** docs/features/practice.md Timer: Countdown for timed exercises, Stopwatch for open-ended ones (e.g. Reflection). */
export type TimerMode = "countdown" | "stopwatch";

export interface UseExerciseTimerOptions {
  mode: TimerMode;
  targetDurationSeconds: number;
  /** Restores a timer mid-flight after a pause/crash recovery. */
  initialElapsedSeconds?: number;
  /** Fired every second while running — the autosave hook wires this to persistence. */
  onTick?: (elapsedSeconds: number) => void;
}

export interface UseExerciseTimerResult {
  elapsedSeconds: number;
  /** Counts down in "countdown" mode, mirrors elapsedSeconds in "stopwatch" mode. */
  remainingSeconds: number;
  isRunning: boolean;
  /** True once a countdown timer reaches zero. Always false for a stopwatch. */
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  /** Manual edit, per docs/features/practice.md Timer functions. */
  setElapsedSeconds: (seconds: number) => void;
}

export function useExerciseTimer({
  mode,
  targetDurationSeconds,
  initialElapsedSeconds = 0,
  onTick,
}: UseExerciseTimerOptions): UseExerciseTimerResult {
  const [elapsedSeconds, setElapsedSecondsState] = React.useState(
    initialElapsedSeconds,
  );
  const [isRunning, setIsRunning] = React.useState(false);

  // Tracks the same value as `elapsedSeconds` state so the tick interval can
  // read the current count without a functional state update — calling
  // `onTick` (which may itself setState in a parent) from inside a setState
  // updater trips React's "setState while rendering a different component"
  // warning, since updater functions run during the render/reconcile phase.
  const elapsedRef = React.useRef(initialElapsedSeconds);

  const onTickRef = React.useRef(onTick);
  React.useEffect(() => {
    onTickRef.current = onTick;
  });

  React.useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      const next = elapsedRef.current;
      setElapsedSecondsState(next);
      onTickRef.current?.(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = React.useCallback(() => setIsRunning(true), []);
  const pause = React.useCallback(() => setIsRunning(false), []);
  const resume = React.useCallback(() => setIsRunning(true), []);
  const reset = React.useCallback(() => {
    setIsRunning(false);
    elapsedRef.current = 0;
    setElapsedSecondsState(0);
  }, []);
  const setElapsedSeconds = React.useCallback((seconds: number) => {
    const next = Math.max(0, Math.round(seconds));
    elapsedRef.current = next;
    setElapsedSecondsState(next);
  }, []);

  const remainingSeconds =
    mode === "countdown"
      ? Math.max(0, targetDurationSeconds - elapsedSeconds)
      : elapsedSeconds;

  const isComplete =
    mode === "countdown" && targetDurationSeconds > 0 && remainingSeconds === 0;

  return {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    isComplete,
    start,
    pause,
    resume,
    reset,
    setElapsedSeconds,
  };
}
