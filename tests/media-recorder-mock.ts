/**
 * Test double for the browser audio-capture APIs jsdom doesn't implement:
 * `MediaRecorder`, `navigator.mediaDevices` (getUserMedia/enumerateDevices),
 * and `AudioContext`/`AnalyserNode` (for live level metering). Installed
 * per-test (not globally like blob-polyfill.ts) since only recording-related
 * tests need it.
 */
import { vi } from "vitest";

export type FakeTrack = {
  kind: "audio";
  label: string;
  stop: () => void;
  getSettings: () => { deviceId?: string };
};

export function createFakeAudioStream(deviceId?: string): MediaStream {
  const track: FakeTrack = {
    kind: "audio",
    label: "Mock Microphone",
    stop: vi.fn(),
    getSettings: () => ({ deviceId }),
  };
  return {
    getTracks: () => [track],
    getAudioTracks: () => [track],
    getVideoTracks: () => [],
  } as unknown as MediaStream;
}

export class MockMediaRecorder extends EventTarget {
  static isTypeSupportedResult = true;
  static instances: MockMediaRecorder[] = [];
  static isTypeSupported(mimeType: string): boolean {
    return MockMediaRecorder.isTypeSupportedResult;
  }

  stream: MediaStream;
  mimeType: string;
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstart: (() => void) | null = null;
  onstop: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  onerror: ((event: { error: unknown }) => void) | null = null;

  constructor(stream: MediaStream, options: { mimeType?: string } = {}) {
    super();
    this.stream = stream;
    this.mimeType = options.mimeType ?? "audio/webm";
    MockMediaRecorder.instances.push(this);
  }

  start(_timeslice?: number): void {
    this.state = "recording";
    this.onstart?.();
  }

  pause(): void {
    this.state = "paused";
    this.onpause?.();
  }

  resume(): void {
    this.state = "recording";
    this.onresume?.();
  }

  stop(): void {
    this.state = "inactive";
    const blob = new Blob(["mock-audio-data"], { type: this.mimeType });
    this.ondataavailable?.({ data: blob });
    this.onstop?.();
  }

  /** Test-only helper — simulates a mid-capture failure (device unplugged, etc). */
  emitError(error: unknown): void {
    this.onerror?.({ error });
  }
}

export class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  connect(): void {}
  disconnect(): void {}
  /** Deterministic fake levels — real levels are never fabricated in production code, but tests need repeatable data. */
  getByteFrequencyData(array: Uint8Array): void {
    for (let i = 0; i < array.length; i += 1) {
      array[i] = (i * 7) % 256;
    }
  }
}

class MockAudioContext {
  createMediaStreamSource(_stream: MediaStream) {
    return { connect: () => {}, disconnect: () => {} };
  }
  createAnalyser() {
    return new MockAnalyserNode();
  }
  close() {
    return Promise.resolve();
  }
}

export interface MediaRecorderMockHandle {
  /** Make the next (and subsequent) getUserMedia call reject with this DOMException-like name. */
  failNextGetUserMedia(
    name: "NotAllowedError" | "NotFoundError" | string,
  ): void;
  /** Clear any configured getUserMedia failure, restoring success. */
  clearGetUserMediaFailure(): void;
  /** Set the device list enumerateDevices() resolves with. */
  setDevices(devices: MediaDeviceInfo[]): void;
  /** The most recently constructed MockMediaRecorder — tests reach in to fire events. */
  lastRecorder(): MockMediaRecorder | undefined;
}

let originalMediaRecorder: typeof MediaRecorder | undefined;
let originalAudioContext: unknown;
let originalMediaDevices: MediaDevices | undefined;

export function installMediaRecorderMock(): MediaRecorderMockHandle {
  MockMediaRecorder.instances = [];
  MockMediaRecorder.isTypeSupportedResult = true;

  originalMediaRecorder = (
    globalThis as { MediaRecorder?: typeof MediaRecorder }
  ).MediaRecorder;
  originalAudioContext = (globalThis as { AudioContext?: unknown })
    .AudioContext;
  originalMediaDevices = navigator.mediaDevices;

  (globalThis as { MediaRecorder: unknown }).MediaRecorder = MockMediaRecorder;
  (globalThis as { AudioContext: unknown }).AudioContext = MockAudioContext;

  let failure: string | null = null;
  let devices: MediaDeviceInfo[] = [
    {
      deviceId: "default",
      kind: "audioinput",
      label: "Mock Microphone",
      groupId: "group-1",
    } as MediaDeviceInfo,
  ];

  const mediaDevices = {
    getUserMedia: vi.fn(async (constraints?: MediaStreamConstraints) => {
      if (failure) {
        const error = new Error(failure);
        error.name = failure;
        throw error;
      }
      const deviceId =
        typeof constraints?.audio === "object" &&
        constraints.audio.deviceId &&
        typeof constraints.audio.deviceId === "object" &&
        "exact" in constraints.audio.deviceId
          ? (constraints.audio.deviceId.exact as string)
          : undefined;
      return createFakeAudioStream(deviceId);
    }),
    enumerateDevices: vi.fn(async () => devices),
  };

  Object.defineProperty(navigator, "mediaDevices", {
    value: mediaDevices,
    configurable: true,
  });

  return {
    failNextGetUserMedia(name) {
      failure = name;
    },
    clearGetUserMediaFailure() {
      failure = null;
    },
    setDevices(next) {
      devices = next;
    },
    lastRecorder() {
      return MockMediaRecorder.instances[
        MockMediaRecorder.instances.length - 1
      ];
    },
  };
}

export function uninstallMediaRecorderMock(): void {
  if (originalMediaRecorder !== undefined) {
    (globalThis as { MediaRecorder: unknown }).MediaRecorder =
      originalMediaRecorder;
  } else {
    delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
  }

  if (originalAudioContext !== undefined) {
    (globalThis as { AudioContext: unknown }).AudioContext =
      originalAudioContext;
  } else {
    delete (globalThis as { AudioContext?: unknown }).AudioContext;
  }

  if (originalMediaDevices !== undefined) {
    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      configurable: true,
    });
  }
}
