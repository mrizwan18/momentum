import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  installMediaRecorderMock,
  uninstallMediaRecorderMock,
  type MediaRecorderMockHandle,
} from "@test-utils/media-recorder-mock";
import { useBaselineRecording } from "./use-baseline-recording";

let mock: MediaRecorderMockHandle;

describe("useBaselineRecording", () => {
  beforeEach(() => {
    mock = installMediaRecorderMock();
  });

  afterEach(() => {
    vi.useRealTimers();
    uninstallMediaRecorderMock();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useBaselineRecording());
    expect(result.current.status).toBe("idle");
    expect(result.current.blob).toBeNull();
  });

  it("requests permission and starts recording", async () => {
    const { result } = renderHook(() => useBaselineRecording());

    let started = false;
    await act(async () => {
      started = await result.current.requestAndStart();
    });

    expect(started).toBe(true);
    expect(result.current.status).toBe("recording");
  });

  it("surfaces permission-denied without starting", async () => {
    mock.failNextGetUserMedia("NotAllowedError");
    const { result } = renderHook(() => useBaselineRecording());

    let started = true;
    await act(async () => {
      started = await result.current.requestAndStart();
    });

    expect(started).toBe(false);
    expect(result.current.status).toBe("permission-denied");
  });

  it("stops recording and produces a blob", async () => {
    const { result } = renderHook(() => useBaselineRecording());

    await act(async () => {
      await result.current.requestAndStart();
    });
    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.status).toBe("stopped");
    expect(result.current.blob).toBeInstanceOf(Blob);
  });

  it("auto-stops at the 15 second cap", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBaselineRecording());

    await act(async () => {
      await result.current.requestAndStart();
    });
    expect(result.current.status).toBe("recording");

    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    vi.useRealTimers();
    await waitFor(() => expect(result.current.status).toBe("stopped"));
  });

  it("discards a take without leaving a blob", async () => {
    const { result } = renderHook(() => useBaselineRecording());

    await act(async () => {
      await result.current.requestAndStart();
    });
    act(() => {
      result.current.discard();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.blob).toBeNull();
  });
});
