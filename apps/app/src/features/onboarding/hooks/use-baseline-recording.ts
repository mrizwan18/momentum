"use client";

import * as React from "react";
import {
  createLevelMeter,
  createRecorder,
  requestMicrophoneAccess,
  stopStream,
  type LevelMeter,
  type RecorderController,
} from "@/features/recording";

export type BaselineRecordingStatus =
  | "idle"
  | "requesting-permission"
  | "permission-denied"
  | "recording"
  | "stopped";

const MAX_DURATION_MS = 15_000;
const LEVEL_BAR_COUNT = 40;
const ELAPSED_TICK_MS = 200;

export interface UseBaselineRecordingResult {
  status: BaselineRecordingStatus;
  /** Live elapsed time in ms — real, ticks only while actually recording. */
  elapsedMs: number;
  /** Live audio levels (0-1 per bar) — real captured data, matches Waveform's "never fabricated" contract. */
  levels: number[];
  blob: Blob | null;
  durationMs: number;
  /** Requests mic permission and immediately starts recording. Resolves false on denial. */
  requestAndStart: () => Promise<boolean>;
  /** Resolves with the finished take directly (not just via state) so a caller can act on it before the next render. */
  stop: () => Promise<{ blob: Blob; durationMs: number } | null>;
  /** Stops (if recording) and drops everything captured so far, back to idle. */
  discard: () => void;
}

/**
 * The onboarding "capture your baseline voice" flow's own recording hook —
 * reuses the Recording feature's browser-audio service layer
 * (`@/features/recording`'s `requestMicrophoneAccess`/`createRecorder`/
 * `createLevelMeter`) rather than duplicating MediaRecorder handling, but
 * is deliberately simpler than `useRecordingSession`: no countdown, no
 * pause/resume, no device picker, no repository save — just permission ->
 * record (auto-stopping at 15s) -> stop -> a Blob for the caller to persist.
 */
export function useBaselineRecording(): UseBaselineRecordingResult {
  const [status, setStatus] = React.useState<BaselineRecordingStatus>("idle");
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [levels, setLevels] = React.useState<number[]>(
    new Array(LEVEL_BAR_COUNT).fill(0),
  );
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [durationMs, setDurationMs] = React.useState(0);

  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<RecorderController | null>(null);
  const levelMeterRef = React.useRef<LevelMeter | null>(null);
  const elapsedIntervalRef = React.useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const elapsedMsRef = React.useRef(0);
  const autoStopTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearTimers = React.useCallback(() => {
    if (elapsedIntervalRef.current !== null) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current !== null) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    levelMeterRef.current?.stop();
    levelMeterRef.current = null;
  }, []);

  const releaseStream = React.useCallback(() => {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      clearTimers();
      releaseStream();
    };
  }, [clearTimers, releaseStream]);

  const stop = React.useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return null;
    clearTimers();
    recorderRef.current = null;
    const { blob: recordedBlob } = await recorder.stop();
    releaseStream();
    const finishedDurationMs = elapsedMsRef.current;
    setBlob(recordedBlob);
    setDurationMs(finishedDurationMs);
    setStatus("stopped");
    return { blob: recordedBlob, durationMs: finishedDurationMs };
  }, [clearTimers, releaseStream]);

  const requestAndStart = React.useCallback(async () => {
    setStatus("requesting-permission");
    const result = await requestMicrophoneAccess();
    if (!result.granted) {
      setStatus("permission-denied");
      return false;
    }

    streamRef.current = result.stream;
    elapsedMsRef.current = 0;
    setElapsedMs(0);
    setBlob(null);
    setDurationMs(0);

    recorderRef.current = createRecorder(result.stream, {
      onError: () => {
        clearTimers();
        releaseStream();
        recorderRef.current = null;
        setStatus("permission-denied");
      },
    });
    recorderRef.current.start();
    levelMeterRef.current = createLevelMeter(result.stream, setLevels, {
      barCount: LEVEL_BAR_COUNT,
    });
    elapsedIntervalRef.current = setInterval(() => {
      elapsedMsRef.current += ELAPSED_TICK_MS;
      setElapsedMs(elapsedMsRef.current);
    }, ELAPSED_TICK_MS);
    autoStopTimeoutRef.current = setTimeout(() => {
      stop();
    }, MAX_DURATION_MS);

    setStatus("recording");
    return true;
  }, [clearTimers, releaseStream, stop]);

  const discard = React.useCallback(() => {
    clearTimers();
    if (recorderRef.current) {
      recorderRef.current.stop().catch(() => {});
      recorderRef.current = null;
    }
    releaseStream();
    setBlob(null);
    setDurationMs(0);
    setStatus("idle");
  }, [clearTimers, releaseStream]);

  return {
    status,
    elapsedMs,
    levels,
    blob,
    durationMs,
    requestAndStart,
    stop,
    discard,
  };
}
