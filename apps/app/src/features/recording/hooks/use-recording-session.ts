"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";
import {
  createLevelMeter,
  createRecorder,
  listInputDevices,
  requestMicrophoneAccess,
  stopStream,
  type AudioInputDevice,
  type LevelMeter,
  type RecorderController,
} from "../services/audio-recorder-service";
import { saveRecording } from "../services/recording-persistence-service";
import { transition } from "../state-machine/transition";
import {
  initialRecordingMachineState,
  type RecordingMachineState,
} from "../state-machine/types";

const COUNTDOWN_START_SECONDS = 3;
const ELAPSED_TICK_MS = 200;
const LEVEL_BAR_COUNT = 32;

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export interface UseRecordingSessionOptions {
  /** The active PracticeSession a saved recording should associate with. */
  sessionId: string;
  /** Which exercise is currently active — saved recordings are tagged with it so AI audio analysis can label each take with real exercise context. */
  exerciseId: string | null;
}

export interface UseRecordingSessionResult {
  machine: RecordingMachineState;
  devices: AudioInputDevice[];
  selectedDeviceId: string | null;
  /** Live elapsed time in ms — ticks while "recording", frozen while "paused". */
  elapsedMs: number;
  /** Live audio levels (0-1 per bar) — real captured data, only meaningful while "recording"/"paused". */
  levels: number[];
  /** Counts down from 3 to 1 while "countdown"; 0 once finished. */
  countdownValue: number;
  actionError: string | null;
  dismissActionError: () => void;
  isBusy: boolean;
  requestPermission: () => Promise<void>;
  selectDevice: (deviceId: string) => Promise<void>;
  startCountdown: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  discard: () => void;
  rename: (title: string) => void;
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Orchestrates the Recording experience (docs/engineering/state-machines.md
 * Recording State Machine): acquires the microphone, drives the recording
 * state machine, and persists the final take via the repository pattern.
 * Same "hook owns state, service calls are the only thing that touch
 * Dexie/the browser API" split as usePracticeSession.
 */
export function useRecordingSession(
  options: UseRecordingSessionOptions,
): UseRecordingSessionResult {
  const storage = useStorage();
  const { sessionId, exerciseId } = options;

  const [machine, dispatch] = React.useReducer(
    transition,
    initialRecordingMachineState,
  );
  const [devices, setDevices] = React.useState<AudioInputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(
    null,
  );
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [levels, setLevels] = React.useState<number[]>(
    new Array(LEVEL_BAR_COUNT).fill(0),
  );
  const [countdownValue, setCountdownValue] = React.useState(
    COUNTDOWN_START_SECONDS,
  );
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<RecorderController | null>(null);
  const levelMeterRef = React.useRef<LevelMeter | null>(null);
  const elapsedMsRef = React.useRef(0);
  const elapsedIntervalRef = React.useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const countdownIntervalRef = React.useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const takeCounterRef = React.useRef(0);

  const busyRef = React.useRef(0);
  const actionQueueRef = React.useRef<Promise<void>>(Promise.resolve());

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

  const dismissActionError = React.useCallback(() => setActionError(null), []);

  const stopElapsedTicking = React.useCallback(() => {
    if (elapsedIntervalRef.current !== null) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  const startElapsedTicking = React.useCallback(() => {
    stopElapsedTicking();
    elapsedIntervalRef.current = setInterval(() => {
      elapsedMsRef.current += ELAPSED_TICK_MS;
      setElapsedMs(elapsedMsRef.current);
    }, ELAPSED_TICK_MS);
  }, [stopElapsedTicking]);

  const stopLevelMeter = React.useCallback(() => {
    levelMeterRef.current?.stop();
    levelMeterRef.current = null;
  }, []);

  const releaseStream = React.useCallback(() => {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  // Release the microphone and every timer on unmount — recording never
  // keeps the mic hot after the component using it goes away.
  React.useEffect(() => {
    return () => {
      stopElapsedTicking();
      stopLevelMeter();
      releaseStream();
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [releaseStream, stopElapsedTicking, stopLevelMeter]);

  const requestPermission = React.useCallback(async () => {
    dispatch({ type: "REQUEST_PERMISSION" });
    const result = await requestMicrophoneAccess(selectedDeviceId ?? undefined);
    if (!result.granted) {
      if (result.reason === "no-device") {
        dispatch({ type: "NO_DEVICE_FOUND" });
      } else {
        dispatch({ type: "PERMISSION_DENIED" });
      }
      return;
    }
    streamRef.current = result.stream;
    const inputDevices = await listInputDevices();
    setDevices(inputDevices);
    setSelectedDeviceId(
      (current) => current ?? inputDevices[0]?.deviceId ?? null,
    );
    dispatch({ type: "PERMISSION_GRANTED" });
  }, [selectedDeviceId]);

  const selectDevice = React.useCallback(
    async (deviceId: string) => {
      if (machine.status !== "ready") return;
      const result = await requestMicrophoneAccess(deviceId);
      if (!result.granted) {
        setActionError(
          "Couldn't switch microphones. The previous one is still active.",
        );
        return;
      }
      releaseStream();
      streamRef.current = result.stream;
      setSelectedDeviceId(deviceId);
    },
    [machine.status, releaseStream],
  );

  const startCountdown = React.useCallback(() => {
    if (machine.status !== "ready" || !streamRef.current) return;
    dispatch({ type: "START_COUNTDOWN" });
    setCountdownValue(COUNTDOWN_START_SECONDS);

    let remaining = COUNTDOWN_START_SECONDS;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdownValue(Math.max(0, remaining));
      if (remaining <= 0) {
        if (countdownIntervalRef.current !== null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        const stream = streamRef.current;
        if (!stream) return;
        elapsedMsRef.current = 0;
        setElapsedMs(0);
        recorderRef.current = createRecorder(stream, {
          onError: (error) => {
            stopElapsedTicking();
            stopLevelMeter();
            dispatch({
              type: "RECORDER_ERROR",
              message: toErrorMessage(error),
            });
          },
        });
        recorderRef.current.start();
        levelMeterRef.current = createLevelMeter(stream, setLevels, {
          barCount: LEVEL_BAR_COUNT,
        });
        startElapsedTicking();
        dispatch({ type: "COUNTDOWN_FINISHED" });
      }
    }, 1000);
  }, [machine.status, startElapsedTicking, stopElapsedTicking, stopLevelMeter]);

  const pause = React.useCallback(() => {
    if (machine.status !== "recording") return;
    recorderRef.current?.pause();
    stopElapsedTicking();
    dispatch({ type: "PAUSE" });
  }, [machine.status, stopElapsedTicking]);

  const resume = React.useCallback(() => {
    if (machine.status !== "paused") return;
    recorderRef.current?.resume();
    startElapsedTicking();
    dispatch({ type: "RESUME" });
  }, [machine.status, startElapsedTicking]);

  const stop = React.useCallback(async () => {
    if (machine.status !== "recording" && machine.status !== "paused") return;
    stopElapsedTicking();
    stopLevelMeter();
    const recorder = recorderRef.current;
    if (!recorder) return;
    const { blob, mimeType } = await recorder.stop();
    recorderRef.current = null;
    releaseStream();
    takeCounterRef.current += 1;
    dispatch({
      type: "STOP",
      blob,
      durationMs: elapsedMsRef.current,
      title: `Take ${takeCounterRef.current}`,
    });
    // mimeType is captured on the blob itself; nothing else needs it here.
    void mimeType;
  }, [machine.status, releaseStream, stopElapsedTicking, stopLevelMeter]);

  const discard = React.useCallback(() => {
    if (
      machine.status !== "countdown" &&
      machine.status !== "recording" &&
      machine.status !== "paused" &&
      machine.status !== "reviewing"
    ) {
      return;
    }
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    stopElapsedTicking();
    stopLevelMeter();
    if (recorderRef.current) {
      recorderRef.current.stop().catch(() => {});
      recorderRef.current = null;
    }
    releaseStream();
    dispatch({ type: "DISCARD" });
  }, [machine.status, releaseStream, stopElapsedTicking, stopLevelMeter]);

  const rename = React.useCallback(
    (title: string) => {
      if (machine.status !== "reviewing") return;
      dispatch({ type: "RENAME", title });
    },
    [machine.status],
  );

  const save = React.useCallback(async () => {
    if (machine.status !== "reviewing" && machine.status !== "error") return;
    if (machine.status === "error" && machine.blob === null) return;
    const { blob, durationMs, title } =
      machine.status === "reviewing"
        ? machine
        : {
            blob: machine.blob as Blob,
            durationMs: machine.durationMs as number,
            title: machine.title,
          };

    await runUserAction(async () => {
      dispatch({ type: "SAVE" });
      try {
        const recording = await saveRecording(storage, {
          sessionId,
          exerciseId,
          blob,
          mimeType: blob.type,
          durationMs,
          title,
        });
        dispatch({ type: "SAVE_SUCCESS", recording });
      } catch (error) {
        dispatch({ type: "SAVE_ERROR", message: toErrorMessage(error) });
      }
    });
  }, [machine, runUserAction, sessionId, exerciseId, storage]);

  const reset = React.useCallback(async () => {
    if (machine.status !== "saved" && machine.status !== "error") return;
    dispatch({ type: "RESET" });
    // Permission was already granted this session — silently re-acquire the
    // stream for the next take rather than making the user wait on "ready".
    const result = await requestMicrophoneAccess(selectedDeviceId ?? undefined);
    if (result.granted) {
      streamRef.current = result.stream;
    } else {
      dispatch({ type: "REQUEST_PERMISSION" });
      dispatch(
        result.reason === "no-device"
          ? { type: "NO_DEVICE_FOUND" }
          : { type: "PERMISSION_DENIED" },
      );
    }
  }, [machine.status, selectedDeviceId]);

  return {
    machine,
    devices,
    selectedDeviceId,
    elapsedMs,
    levels,
    countdownValue,
    actionError,
    dismissActionError,
    isBusy,
    requestPermission,
    selectDevice,
    startCountdown,
    pause,
    resume,
    stop,
    discard,
    rename,
    save,
    reset,
  };
}
