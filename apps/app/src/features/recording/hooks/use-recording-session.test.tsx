import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import {
  installMediaRecorderMock,
  uninstallMediaRecorderMock,
  type MediaRecorderMockHandle,
} from "@test-utils/media-recorder-mock";
import { useRecordingSession } from "./use-recording-session";

let storage: MomentumStorage;
let mock: MediaRecorderMockHandle;

function wrapper({ children }: { children: React.ReactNode }) {
  return <StorageProvider value={storage}>{children}</StorageProvider>;
}

function renderSession(sessionId = "session-1") {
  return renderHook(() => useRecordingSession({ sessionId }), { wrapper });
}

/** Drives ready -> countdown -> recording, leaving fake timers installed. */
async function grantAndRecord(
  result: ReturnType<typeof renderSession>["result"],
) {
  await act(async () => {
    await result.current.requestPermission();
  });
  expect(result.current.machine.status).toBe("ready");
  act(() => {
    result.current.startCountdown();
  });
  await act(async () => {
    vi.advanceTimersByTime(3000);
  });
  expect(result.current.machine.status).toBe("recording");
}

describe("useRecordingSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage = createMomentumStorage(
      createMomentumDatabase(`test-recording-session-${Math.random()}`),
    );
    mock = installMediaRecorderMock();
  });

  afterEach(async () => {
    vi.useRealTimers();
    uninstallMediaRecorderMock();
    await storage.db.delete();
  });

  it("starts idle", () => {
    const { result } = renderSession();
    expect(result.current.machine).toEqual({ status: "idle" });
  });

  it("requests permission, reaches ready, and populates devices", async () => {
    mock.setDevices([
      {
        deviceId: "mic-1",
        kind: "audioinput",
        label: "USB Mic",
        groupId: "g1",
      } as MediaDeviceInfo,
    ]);
    const { result } = renderSession();

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.machine.status).toBe("ready");
    expect(result.current.devices).toEqual([
      { deviceId: "mic-1", label: "USB Mic" },
    ]);
    expect(result.current.selectedDeviceId).toBe("mic-1");
  });

  it("switches to a different microphone while ready", async () => {
    mock.setDevices([
      {
        deviceId: "mic-1",
        kind: "audioinput",
        label: "Built-in Mic",
        groupId: "g1",
      } as MediaDeviceInfo,
      {
        deviceId: "mic-2",
        kind: "audioinput",
        label: "USB Mic",
        groupId: "g2",
      } as MediaDeviceInfo,
    ]);
    const { result } = renderSession();
    await act(async () => {
      await result.current.requestPermission();
    });
    expect(result.current.selectedDeviceId).toBe("mic-1");

    await act(async () => {
      await result.current.selectDevice("mic-2");
    });

    expect(result.current.selectedDeviceId).toBe("mic-2");
    expect(result.current.machine.status).toBe("ready");
    expect(result.current.actionError).toBeNull();
  });

  it("surfaces an action error when switching microphones fails, without leaving ready", async () => {
    const { result } = renderSession();
    await act(async () => {
      await result.current.requestPermission();
    });

    mock.failNextGetUserMedia("NotFoundError");
    await act(async () => {
      await result.current.selectDevice("mic-2");
    });

    expect(result.current.machine.status).toBe("ready");
    expect(result.current.actionError).toBe(
      "Couldn't switch microphones. The previous one is still active.",
    );
  });

  it("surfaces permission-denied", async () => {
    mock.failNextGetUserMedia("NotAllowedError");
    const { result } = renderSession();

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.machine.status).toBe("permission-denied");
  });

  it("surfaces no-device", async () => {
    mock.failNextGetUserMedia("NotFoundError");
    const { result } = renderSession();

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.machine.status).toBe("no-device");
  });

  it("walks the full happy path and persists the take via the repository", async () => {
    const { result } = renderSession("session-42");
    await grantAndRecord(result);

    act(() => result.current.pause());
    expect(result.current.machine.status).toBe("paused");

    act(() => result.current.resume());
    expect(result.current.machine.status).toBe("recording");

    await act(async () => {
      await result.current.stop();
    });
    expect(result.current.machine.status).toBe("reviewing");

    act(() => result.current.rename("My best take"));
    if (result.current.machine.status === "reviewing") {
      expect(result.current.machine.title).toBe("My best take");
    }

    // fake-indexeddb schedules its transaction queue on real timers — switch
    // back before touching Dexie so the save's promise can actually resolve.
    vi.useRealTimers();
    await act(async () => {
      await result.current.save();
    });

    expect(result.current.machine.status).toBe("saved");
    if (result.current.machine.status === "saved") {
      expect(result.current.machine.recording.title).toBe("My best take");
      expect(result.current.machine.recording.sessionId).toBe("session-42");
    }
    await expect(
      storage.recordings.listBySession("session-42"),
    ).resolves.toHaveLength(1);
  });

  it("discarding while recording never persists a repository row", async () => {
    const { result } = renderSession();
    await grantAndRecord(result);

    act(() => result.current.discard());
    expect(result.current.machine.status).toBe("ready");
    vi.useRealTimers();
    await expect(storage.recordings.list()).resolves.toHaveLength(0);
  });

  it("discarding while reviewing never persists a repository row", async () => {
    const { result } = renderSession();
    await grantAndRecord(result);
    await act(async () => {
      await result.current.stop();
    });
    expect(result.current.machine.status).toBe("reviewing");

    act(() => result.current.discard());
    expect(result.current.machine.status).toBe("ready");
    vi.useRealTimers();
    await expect(storage.recordings.list()).resolves.toHaveLength(0);
  });

  it("preserves the blob on a save failure, and a retry succeeds", async () => {
    const { result } = renderSession();
    await grantAndRecord(result);
    await act(async () => {
      await result.current.stop();
    });

    const originalCreate = storage.recordings.create.bind(storage.recordings);
    storage.recordings.create = () => Promise.reject(new Error("Storage full"));

    vi.useRealTimers();
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.machine.status).toBe("error");
    if (result.current.machine.status === "error") {
      expect(result.current.machine.blob).not.toBeNull();
      expect(result.current.machine.message).toBe("Storage full");
    }

    storage.recordings.create = originalCreate;

    await act(async () => {
      await result.current.save();
    });
    expect(result.current.machine.status).toBe("saved");
  });

  it("surfaces a recorder error mid-capture with no blob to save", async () => {
    const { result } = renderSession();
    await grantAndRecord(result);

    act(() => {
      mock.lastRecorder()?.emitError(new Error("Device disconnected"));
    });

    expect(result.current.machine.status).toBe("error");
    if (result.current.machine.status === "error") {
      expect(result.current.machine.blob).toBeNull();
      expect(result.current.machine.message).toBe("Device disconnected");
    }
  });
});
