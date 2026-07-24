import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installMediaRecorderMock,
  uninstallMediaRecorderMock,
  type MediaRecorderMockHandle,
} from "@test-utils/media-recorder-mock";
import {
  createLevelMeter,
  createRecorder,
  listInputDevices,
  requestMicrophoneAccess,
  stopStream,
} from "./audio-recorder-service";

describe("audio-recorder-service", () => {
  let handle: MediaRecorderMockHandle;

  beforeEach(() => {
    handle = installMediaRecorderMock();
  });

  afterEach(() => {
    uninstallMediaRecorderMock();
  });

  describe("listInputDevices", () => {
    it("returns only audioinput devices, with a fallback label", async () => {
      handle.setDevices([
        {
          deviceId: "mic-1",
          kind: "audioinput",
          label: "",
          groupId: "g1",
        } as MediaDeviceInfo,
        {
          deviceId: "cam-1",
          kind: "videoinput",
          label: "Webcam",
          groupId: "g2",
        } as MediaDeviceInfo,
      ]);
      const devices = await listInputDevices();
      expect(devices).toEqual([{ deviceId: "mic-1", label: "Microphone" }]);
    });
  });

  describe("requestMicrophoneAccess", () => {
    it("resolves granted with a stream on success", async () => {
      const result = await requestMicrophoneAccess();
      expect(result.granted).toBe(true);
      if (result.granted) {
        expect(result.stream.getAudioTracks()).toHaveLength(1);
      }
    });

    it("maps NotAllowedError to permission-denied", async () => {
      handle.failNextGetUserMedia("NotAllowedError");
      const result = await requestMicrophoneAccess();
      expect(result).toEqual({ granted: false, reason: "permission-denied" });
    });

    it("maps NotFoundError to no-device", async () => {
      handle.failNextGetUserMedia("NotFoundError");
      const result = await requestMicrophoneAccess();
      expect(result).toEqual({ granted: false, reason: "no-device" });
    });

    it("maps an unrecognized error to unknown", async () => {
      handle.failNextGetUserMedia("SomeWeirdBrowserQuirk");
      const result = await requestMicrophoneAccess();
      expect(result).toEqual({ granted: false, reason: "unknown" });
    });
  });

  describe("stopStream", () => {
    it("stops every track", async () => {
      const result = await requestMicrophoneAccess();
      if (!result.granted) throw new Error("expected granted");
      const track = result.stream.getAudioTracks()[0];
      stopStream(result.stream);
      expect(track.stop).toHaveBeenCalledOnce();
    });
  });

  describe("createRecorder", () => {
    it("produces a blob after start -> pause -> resume -> stop", async () => {
      const result = await requestMicrophoneAccess();
      if (!result.granted) throw new Error("expected granted");

      const recorder = createRecorder(result.stream);
      recorder.start();
      expect(handle.lastRecorder()?.state).toBe("recording");
      recorder.pause();
      expect(handle.lastRecorder()?.state).toBe("paused");
      recorder.resume();
      expect(handle.lastRecorder()?.state).toBe("recording");

      const { blob } = await recorder.stop();
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it("surfaces mid-capture failures via onError", async () => {
      const result = await requestMicrophoneAccess();
      if (!result.granted) throw new Error("expected granted");

      const onError = vi.fn();
      createRecorder(result.stream, { onError });
      handle.lastRecorder()?.emitError(new Error("Device disconnected"));

      expect(onError).toHaveBeenCalledOnce();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe("createLevelMeter", () => {
    it("reports real levels on an interval, and stop() halts further reports", async () => {
      vi.useFakeTimers();
      const result = await requestMicrophoneAccess();
      if (!result.granted) throw new Error("expected granted");

      const onLevels = vi.fn();
      const meter = createLevelMeter(result.stream, onLevels, {
        intervalMs: 50,
      });

      vi.advanceTimersByTime(160);
      expect(onLevels).toHaveBeenCalled();
      const firstCallCount = onLevels.mock.calls.length;
      const levels = onLevels.mock.calls[0][0];
      expect(Array.isArray(levels)).toBe(true);
      expect(levels.every((level: number) => level >= 0 && level <= 1)).toBe(
        true,
      );

      meter.stop();
      vi.advanceTimersByTime(200);
      expect(onLevels).toHaveBeenCalledTimes(firstCallCount);

      vi.useRealTimers();
    });
  });
});
