import type { RecordingMachineEvent, RecordingMachineState } from "./types";

/**
 * Pure reducer: (state, event) -> state. Invalid transitions for the
 * current state are no-ops (return the same state) rather than throwing —
 * docs/engineering/state-machines.md's "no hidden transitions" principle
 * means an unexpected event should be ignored visibly, not corrupt state.
 */
export function transition(
  state: RecordingMachineState,
  event: RecordingMachineEvent,
): RecordingMachineState {
  switch (state.status) {
    case "idle": {
      if (event.type === "REQUEST_PERMISSION") {
        return { status: "requesting-permission" };
      }
      return state;
    }

    case "requesting-permission": {
      if (event.type === "PERMISSION_GRANTED") {
        return { status: "ready" };
      }
      if (event.type === "PERMISSION_DENIED") {
        return { status: "permission-denied" };
      }
      if (event.type === "NO_DEVICE_FOUND") {
        return { status: "no-device" };
      }
      return state;
    }

    case "permission-denied": {
      if (event.type === "REQUEST_PERMISSION") {
        return { status: "requesting-permission" };
      }
      return state;
    }

    case "no-device": {
      if (event.type === "REQUEST_PERMISSION") {
        return { status: "requesting-permission" };
      }
      return state;
    }

    case "ready": {
      if (event.type === "START_COUNTDOWN") {
        return { status: "countdown" };
      }
      return state;
    }

    case "countdown": {
      if (event.type === "COUNTDOWN_FINISHED") {
        return { status: "recording" };
      }
      if (event.type === "DISCARD") {
        return { status: "ready" };
      }
      return state;
    }

    case "recording": {
      if (event.type === "PAUSE") {
        return { status: "paused" };
      }
      if (event.type === "STOP") {
        return {
          status: "reviewing",
          blob: event.blob,
          durationMs: event.durationMs,
          title: event.title,
        };
      }
      if (event.type === "RECORDER_ERROR") {
        return {
          status: "error",
          message: event.message,
          blob: null,
          durationMs: null,
          title: null,
        };
      }
      if (event.type === "DISCARD") {
        return { status: "ready" };
      }
      return state;
    }

    case "paused": {
      if (event.type === "RESUME") {
        return { status: "recording" };
      }
      if (event.type === "STOP") {
        return {
          status: "reviewing",
          blob: event.blob,
          durationMs: event.durationMs,
          title: event.title,
        };
      }
      if (event.type === "DISCARD") {
        return { status: "ready" };
      }
      return state;
    }

    case "reviewing": {
      if (event.type === "RENAME") {
        return { ...state, title: event.title };
      }
      if (event.type === "SAVE") {
        return {
          status: "saving",
          blob: state.blob,
          durationMs: state.durationMs,
          title: state.title,
        };
      }
      if (event.type === "DISCARD") {
        return { status: "ready" };
      }
      return state;
    }

    case "saving": {
      if (event.type === "SAVE_SUCCESS") {
        return { status: "saved", recording: event.recording };
      }
      if (event.type === "SAVE_ERROR") {
        return {
          status: "error",
          message: event.message,
          blob: state.blob,
          durationMs: state.durationMs,
          title: state.title,
        };
      }
      return state;
    }

    case "saved": {
      if (event.type === "RESET") {
        return { status: "ready" };
      }
      return state;
    }

    case "error": {
      if (event.type === "SAVE" && state.blob !== null) {
        return {
          status: "saving",
          blob: state.blob,
          durationMs: state.durationMs as number,
          title: state.title as string,
        };
      }
      if (event.type === "RESET") {
        return { status: "ready" };
      }
      return state;
    }

    default: {
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}
