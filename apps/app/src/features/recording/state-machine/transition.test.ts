import { describe, expect, it } from "vitest";
import type { RecordingRecord } from "@momentum/types";
import { transition } from "./transition";
import type { RecordingMachineState } from "./types";

function fakeBlob() {
  return new Blob(["fake-audio"], { type: "audio/webm" });
}

function fakeRecording(): RecordingRecord {
  return {
    id: "rec-1",
    sessionId: "session-1",
    exerciseAttemptId: null,
    exerciseId: null,
    createdAt: 0,
    durationMs: 5000,
    mimeType: "audio/webm",
    blob: fakeBlob(),
    favorite: false,
    title: "Take 1",
    notes: null,
  };
}

describe("recording state machine — valid transitions", () => {
  it("idle + REQUEST_PERMISSION -> requesting-permission", () => {
    expect(
      transition({ status: "idle" }, { type: "REQUEST_PERMISSION" }),
    ).toEqual({ status: "requesting-permission" });
  });

  it("requesting-permission + PERMISSION_GRANTED -> ready", () => {
    expect(
      transition(
        { status: "requesting-permission" },
        { type: "PERMISSION_GRANTED" },
      ),
    ).toEqual({ status: "ready" });
  });

  it("requesting-permission + PERMISSION_DENIED -> permission-denied", () => {
    expect(
      transition(
        { status: "requesting-permission" },
        { type: "PERMISSION_DENIED" },
      ),
    ).toEqual({ status: "permission-denied" });
  });

  it("requesting-permission + NO_DEVICE_FOUND -> no-device", () => {
    expect(
      transition(
        { status: "requesting-permission" },
        { type: "NO_DEVICE_FOUND" },
      ),
    ).toEqual({ status: "no-device" });
  });

  it("permission-denied + REQUEST_PERMISSION -> requesting-permission (retry)", () => {
    expect(
      transition(
        { status: "permission-denied" },
        { type: "REQUEST_PERMISSION" },
      ),
    ).toEqual({ status: "requesting-permission" });
  });

  it("no-device + REQUEST_PERMISSION -> requesting-permission (retry)", () => {
    expect(
      transition({ status: "no-device" }, { type: "REQUEST_PERMISSION" }),
    ).toEqual({ status: "requesting-permission" });
  });

  it("ready + START_COUNTDOWN -> countdown", () => {
    expect(
      transition({ status: "ready" }, { type: "START_COUNTDOWN" }),
    ).toEqual({ status: "countdown" });
  });

  it("countdown + COUNTDOWN_FINISHED -> recording", () => {
    expect(
      transition({ status: "countdown" }, { type: "COUNTDOWN_FINISHED" }),
    ).toEqual({ status: "recording" });
  });

  it("countdown + DISCARD -> ready", () => {
    expect(transition({ status: "countdown" }, { type: "DISCARD" })).toEqual({
      status: "ready",
    });
  });

  it("recording + PAUSE -> paused", () => {
    expect(transition({ status: "recording" }, { type: "PAUSE" })).toEqual({
      status: "paused",
    });
  });

  it("recording + STOP -> reviewing, carrying the take", () => {
    const blob = fakeBlob();
    expect(
      transition(
        { status: "recording" },
        { type: "STOP", blob, durationMs: 4200, title: "Take 1" },
      ),
    ).toEqual({ status: "reviewing", blob, durationMs: 4200, title: "Take 1" });
  });

  it("recording + RECORDER_ERROR -> error with no blob", () => {
    expect(
      transition(
        { status: "recording" },
        { type: "RECORDER_ERROR", message: "Device disconnected" },
      ),
    ).toEqual({
      status: "error",
      message: "Device disconnected",
      blob: null,
      durationMs: null,
      title: null,
    });
  });

  it("recording + DISCARD -> ready", () => {
    expect(transition({ status: "recording" }, { type: "DISCARD" })).toEqual({
      status: "ready",
    });
  });

  it("paused + RESUME -> recording", () => {
    expect(transition({ status: "paused" }, { type: "RESUME" })).toEqual({
      status: "recording",
    });
  });

  it("paused + STOP -> reviewing, carrying the take", () => {
    const blob = fakeBlob();
    expect(
      transition(
        { status: "paused" },
        { type: "STOP", blob, durationMs: 1000, title: "Take 1" },
      ),
    ).toEqual({ status: "reviewing", blob, durationMs: 1000, title: "Take 1" });
  });

  it("paused + DISCARD -> ready", () => {
    expect(transition({ status: "paused" }, { type: "DISCARD" })).toEqual({
      status: "ready",
    });
  });

  it("reviewing + RENAME -> reviewing with the new title, same blob/duration", () => {
    const blob = fakeBlob();
    const state: RecordingMachineState = {
      status: "reviewing",
      blob,
      durationMs: 2000,
      title: "Take 1",
    };
    expect(
      transition(state, { type: "RENAME", title: "My best take" }),
    ).toEqual({
      status: "reviewing",
      blob,
      durationMs: 2000,
      title: "My best take",
    });
  });

  it("reviewing + SAVE -> saving, carrying the take forward", () => {
    const blob = fakeBlob();
    const state: RecordingMachineState = {
      status: "reviewing",
      blob,
      durationMs: 2000,
      title: "Take 1",
    };
    expect(transition(state, { type: "SAVE" })).toEqual({
      status: "saving",
      blob,
      durationMs: 2000,
      title: "Take 1",
    });
  });

  it("reviewing + DISCARD -> ready (take is dropped)", () => {
    const state: RecordingMachineState = {
      status: "reviewing",
      blob: fakeBlob(),
      durationMs: 2000,
      title: "Take 1",
    };
    expect(transition(state, { type: "DISCARD" })).toEqual({ status: "ready" });
  });

  it("saving + SAVE_SUCCESS -> saved with the persisted record", () => {
    const recording = fakeRecording();
    const state: RecordingMachineState = {
      status: "saving",
      blob: fakeBlob(),
      durationMs: 2000,
      title: "Take 1",
    };
    expect(transition(state, { type: "SAVE_SUCCESS", recording })).toEqual({
      status: "saved",
      recording,
    });
  });

  it("saving + SAVE_ERROR -> error, preserving the take for retry", () => {
    const blob = fakeBlob();
    const state: RecordingMachineState = {
      status: "saving",
      blob,
      durationMs: 2000,
      title: "Take 1",
    };
    expect(
      transition(state, { type: "SAVE_ERROR", message: "Storage full" }),
    ).toEqual({
      status: "error",
      message: "Storage full",
      blob,
      durationMs: 2000,
      title: "Take 1",
    });
  });

  it("saved + RESET -> ready (record another take)", () => {
    const state: RecordingMachineState = {
      status: "saved",
      recording: fakeRecording(),
    };
    expect(transition(state, { type: "RESET" })).toEqual({ status: "ready" });
  });

  it("error (with blob) + SAVE -> saving again (retry)", () => {
    const blob = fakeBlob();
    const state: RecordingMachineState = {
      status: "error",
      message: "Storage full",
      blob,
      durationMs: 2000,
      title: "Take 1",
    };
    expect(transition(state, { type: "SAVE" })).toEqual({
      status: "saving",
      blob,
      durationMs: 2000,
      title: "Take 1",
    });
  });

  it("error (no blob) + RESET -> ready", () => {
    const state: RecordingMachineState = {
      status: "error",
      message: "Device disconnected",
      blob: null,
      durationMs: null,
      title: null,
    };
    expect(transition(state, { type: "RESET" })).toEqual({ status: "ready" });
  });
});

describe("recording state machine — invalid transitions are no-ops", () => {
  it("idle ignores unrelated events", () => {
    const state: RecordingMachineState = { status: "idle" };
    expect(transition(state, { type: "RESET" })).toBe(state);
    expect(transition(state, { type: "PAUSE" })).toBe(state);
  });

  it("ready ignores PAUSE/RESUME/STOP", () => {
    const state: RecordingMachineState = { status: "ready" };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
    expect(transition(state, { type: "RESUME" })).toBe(state);
  });

  it("recording ignores REQUEST_PERMISSION and RESUME", () => {
    const state: RecordingMachineState = { status: "recording" };
    expect(transition(state, { type: "REQUEST_PERMISSION" })).toBe(state);
    expect(transition(state, { type: "RESUME" })).toBe(state);
  });

  it("paused ignores PAUSE and START_COUNTDOWN", () => {
    const state: RecordingMachineState = { status: "paused" };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
    expect(transition(state, { type: "START_COUNTDOWN" })).toBe(state);
  });

  it("reviewing ignores PAUSE and RESUME", () => {
    const state: RecordingMachineState = {
      status: "reviewing",
      blob: fakeBlob(),
      durationMs: 1000,
      title: "Take 1",
    };
    expect(transition(state, { type: "PAUSE" })).toBe(state);
    expect(transition(state, { type: "RESUME" })).toBe(state);
  });

  it("saving ignores DISCARD and RENAME — the take is already being persisted", () => {
    const state: RecordingMachineState = {
      status: "saving",
      blob: fakeBlob(),
      durationMs: 1000,
      title: "Take 1",
    };
    expect(transition(state, { type: "DISCARD" })).toBe(state);
    expect(transition(state, { type: "RENAME", title: "New name" })).toBe(
      state,
    );
  });

  it("saved ignores SAVE and DISCARD", () => {
    const state: RecordingMachineState = {
      status: "saved",
      recording: fakeRecording(),
    };
    expect(transition(state, { type: "SAVE" })).toBe(state);
    expect(transition(state, { type: "DISCARD" })).toBe(state);
  });

  it("error without a blob ignores SAVE (nothing to retry)", () => {
    const state: RecordingMachineState = {
      status: "error",
      message: "Device disconnected",
      blob: null,
      durationMs: null,
      title: null,
    };
    expect(transition(state, { type: "SAVE" })).toBe(state);
  });
});
