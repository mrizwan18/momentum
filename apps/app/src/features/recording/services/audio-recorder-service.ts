"use client";

/**
 * Thin wrapper around the browser's audio-capture APIs
 * (`navigator.mediaDevices`, `MediaRecorder`, Web Audio). No Dexie/storage
 * knowledge lives here — that's `recording-persistence-service.ts`'s job.
 */

export interface AudioInputDevice {
  deviceId: string;
  label: string;
}

/** Enumerates available microphones. Labels are only populated once permission has been granted at least once. */
export async function listInputDevices(): Promise<AudioInputDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device) => ({
      deviceId: device.deviceId,
      label: device.label || "Microphone",
    }));
}

export type MicrophoneAccessResult =
  | { granted: true; stream: MediaStream }
  | { granted: false; reason: "permission-denied" | "no-device" | "unknown" };

/** Requests mic access, optionally pinned to a specific device. Never throws — failures come back as a typed result. */
export async function requestMicrophoneAccess(
  deviceId?: string,
): Promise<MicrophoneAccessResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    });
    return { granted: true, stream };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (
      name === "NotAllowedError" ||
      name === "PermissionDeniedError" ||
      name === "SecurityError"
    ) {
      return { granted: false, reason: "permission-denied" };
    }
    if (
      name === "NotFoundError" ||
      name === "DevicesNotFoundError" ||
      name === "OverconstrainedError"
    ) {
      return { granted: false, reason: "no-device" };
    }
    return { granted: false, reason: "unknown" };
  }
}

export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

const MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return undefined;
  }
  return MIME_TYPE_CANDIDATES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

export interface RecorderController {
  start(): void;
  pause(): void;
  resume(): void;
  /** Resolves with the assembled take once the recorder has fully stopped. */
  stop(): Promise<{ blob: Blob; mimeType: string }>;
}

export interface CreateRecorderOptions {
  /** Fires on any mid-capture failure (device unplugged, track ended, etc). */
  onError?: (error: unknown) => void;
}

export function createRecorder(
  stream: MediaStream,
  options: CreateRecorderOptions = {},
): RecorderController {
  const mimeType = pickSupportedMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined,
  );
  const chunks: Blob[] = [];
  let stopResolve: ((result: { blob: Blob; mimeType: string }) => void) | null =
    null;

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: recorder.mimeType });
    stopResolve?.({ blob, mimeType: recorder.mimeType });
  };
  recorder.onerror = (event) => {
    const error = (event as unknown as { error?: unknown }).error ?? event;
    options.onError?.(error);
  };

  return {
    start() {
      recorder.start();
    },
    pause() {
      recorder.pause();
    },
    resume() {
      recorder.resume();
    },
    stop() {
      return new Promise((resolve) => {
        stopResolve = resolve;
        recorder.stop();
      });
    },
  };
}

export interface LevelMeter {
  stop(): void;
}

/**
 * Polls real audio levels from the live stream via an AnalyserNode —
 * `onLevels` is only ever called with real captured data, matching
 * `packages/ui`'s `Waveform` contract ("never fabricated").
 */
export function createLevelMeter(
  stream: MediaStream,
  onLevels: (levels: number[]) => void,
  options: { barCount?: number; intervalMs?: number } = {},
): LevelMeter {
  const barCount = options.barCount ?? 32;
  const intervalMs = options.intervalMs ?? 50;

  const AudioContextCtor =
    (globalThis as { AudioContext?: typeof AudioContext }).AudioContext ??
    (globalThis as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) {
    return { stop() {} };
  }

  const context = new AudioContextCtor();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 128;
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);
  const bucketSize = Math.max(1, Math.floor(data.length / barCount));

  const interval = setInterval(() => {
    analyser.getByteFrequencyData(data);
    const levels: number[] = [];
    for (let bar = 0; bar < barCount; bar += 1) {
      let sum = 0;
      for (let offset = 0; offset < bucketSize; offset += 1) {
        sum += data[bar * bucketSize + offset] ?? 0;
      }
      levels.push(sum / bucketSize / 255);
    }
    onLevels(levels);
  }, intervalMs);

  return {
    stop() {
      clearInterval(interval);
      source.disconnect();
      context.close().catch(() => {});
    },
  };
}
