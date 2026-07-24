import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExerciseTimer } from "./use-exercise-timer";

describe("useExerciseTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not tick until started", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "stopwatch", targetDurationSeconds: 60 }),
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("counts up once started, one tick per second", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "stopwatch", targetDurationSeconds: 60 }),
    );

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedSeconds).toBe(3);
    expect(result.current.remainingSeconds).toBe(3);
    expect(result.current.isRunning).toBe(true);
  });

  it("stops ticking while paused, then continues on resume", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "stopwatch", targetDurationSeconds: 60 }),
    );

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.elapsedSeconds).toBe(2);

    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.elapsedSeconds).toBe(2);
    expect(result.current.isRunning).toBe(false);

    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.elapsedSeconds).toBe(4);
  });

  it("counts down remainingSeconds in countdown mode and reports completion", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "countdown", targetDurationSeconds: 3 }),
    );

    act(() => result.current.start());
    expect(result.current.isComplete).toBe(false);

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isComplete).toBe(true);
  });

  it("never reports countdown completion past zero", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "countdown", targetDurationSeconds: 2 }),
    );

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10_000));

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isComplete).toBe(true);
  });

  it("resets elapsed time and stops running", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "stopwatch", targetDurationSeconds: 60 }),
    );

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.elapsedSeconds).toBe(4);

    act(() => result.current.reset());
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("supports manual edits to elapsed time", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({ mode: "stopwatch", targetDurationSeconds: 60 }),
    );

    act(() => result.current.setElapsedSeconds(30));
    expect(result.current.elapsedSeconds).toBe(30);

    act(() => result.current.setElapsedSeconds(-5));
    expect(result.current.elapsedSeconds).toBe(0);
  });

  it("restores a prior elapsed time on mount for crash recovery", () => {
    const { result } = renderHook(() =>
      useExerciseTimer({
        mode: "stopwatch",
        targetDurationSeconds: 60,
        initialElapsedSeconds: 17,
      }),
    );

    expect(result.current.elapsedSeconds).toBe(17);
  });

  it("calls onTick every second with the updated elapsed value, for autosave", () => {
    const onTick = vi.fn();
    const { result } = renderHook(() =>
      useExerciseTimer({
        mode: "stopwatch",
        targetDurationSeconds: 60,
        onTick,
      }),
    );

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));

    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenNthCalledWith(1, 1);
    expect(onTick).toHaveBeenNthCalledWith(2, 2);
    expect(onTick).toHaveBeenNthCalledWith(3, 3);
  });
});
