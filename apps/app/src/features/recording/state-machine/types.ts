import type { RecordingRecord } from "@momentum/types";

/**
 * docs/engineering/state-machines.md Recording State Machine, specialized:
 * Ready -> Recording -> Paused -> Recording -> Stopped -> Saved, with
 * failure paths for permission denied / no device / browser interruption.
 * "Stopped" isn't a distinct status here — STOP carries a default title
 * straight into "reviewing" (the take is already playable/renameable the
 * instant it lands), avoiding a transient state with no UI of its own.
 * There's likewise no separate "cancelled" terminal state: DISCARD returns
 * directly to "ready" from every state that can discard, since nothing in
 * this flow needs a dedicated "you cancelled" screen before that.
 */
export type RecordingMachineState =
  | { status: "idle" }
  | { status: "requesting-permission" }
  | { status: "permission-denied" }
  | { status: "no-device" }
  | { status: "ready" }
  | { status: "countdown" }
  | { status: "recording" }
  | { status: "paused" }
  | { status: "reviewing"; blob: Blob; durationMs: number; title: string }
  | { status: "saving"; blob: Blob; durationMs: number; title: string }
  | { status: "saved"; recording: RecordingRecord }
  | {
      status: "error";
      message: string;
      blob: Blob | null;
      durationMs: number | null;
      title: string | null;
    };

export type RecordingMachineStatus = RecordingMachineState["status"];

export type RecordingMachineEvent =
  | { type: "REQUEST_PERMISSION" }
  | { type: "PERMISSION_GRANTED" }
  | { type: "PERMISSION_DENIED" }
  | { type: "NO_DEVICE_FOUND" }
  | { type: "START_COUNTDOWN" }
  | { type: "COUNTDOWN_FINISHED" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP"; blob: Blob; durationMs: number; title: string }
  | { type: "DISCARD" }
  | { type: "RENAME"; title: string }
  | { type: "SAVE" }
  | { type: "SAVE_SUCCESS"; recording: RecordingRecord }
  | { type: "SAVE_ERROR"; message: string }
  | { type: "RECORDER_ERROR"; message: string }
  | { type: "RESET" };

export const initialRecordingMachineState: RecordingMachineState = {
  status: "idle",
};
