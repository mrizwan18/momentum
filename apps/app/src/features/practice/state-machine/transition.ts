import type { PracticeMachineEvent, PracticeMachineState } from "./types";

/**
 * Pure reducer: (state, event) -> state. Invalid transitions for the
 * current state are no-ops (return the same state) rather than throwing —
 * docs/engineering/state-machines.md's "no hidden transitions" principle
 * means an unexpected event should be ignored visibly, not corrupt state.
 */
export function transition(
  state: PracticeMachineState,
  event: PracticeMachineEvent,
): PracticeMachineState {
  switch (state.status) {
    case "idle": {
      if (event.type === "SESSION_FOUND") {
        return event.session.status === "paused"
          ? { status: "paused", session: event.session }
          : { status: "interrupted", session: event.session };
      }
      if (event.type === "NO_SESSION_FOUND") {
        return state;
      }
      if (event.type === "START") {
        return { status: "preparing" };
      }
      return state;
    }

    case "interrupted": {
      if (event.type === "RESUME_INTERRUPTED") {
        return state.session.status === "paused"
          ? { status: "paused", session: state.session }
          : { status: "practicing", session: state.session };
      }
      if (event.type === "DISCARD_INTERRUPTED") {
        return { status: "cancelled" };
      }
      return state;
    }

    case "preparing": {
      if (event.type === "BEGIN") {
        return { status: "practicing", session: event.session };
      }
      if (event.type === "BACK_TO_IDLE") {
        return { status: "idle" };
      }
      return state;
    }

    case "practicing": {
      if (event.type === "ADVANCE") {
        return { status: "practicing", session: event.session };
      }
      if (event.type === "FINISH") {
        return {
          status: "completed",
          session: event.session,
          summary: event.summary,
        };
      }
      if (event.type === "PAUSE") {
        return { status: "paused", session: state.session };
      }
      if (event.type === "CANCEL") {
        return { status: "cancelled" };
      }
      return state;
    }

    case "paused": {
      if (event.type === "RESUME") {
        return { status: "practicing", session: state.session };
      }
      if (event.type === "CANCEL") {
        return { status: "cancelled" };
      }
      return state;
    }

    case "completed": {
      if (event.type === "RESET") {
        return { status: "idle" };
      }
      return state;
    }

    case "cancelled": {
      if (event.type === "RESET") {
        return { status: "idle" };
      }
      return state;
    }

    default: {
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}
