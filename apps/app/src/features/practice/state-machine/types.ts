import type { PracticeSessionRecord } from "@momentum/types";
import type { SessionSummaryView } from "@/features/summary";

/**
 * docs/engineering/state-machines.md Practice Session State Machine,
 * specialized to the 7 states this sprint implements. "Interrupted" is
 * distinct from "Paused": Paused is a deliberate user action (resuming is
 * just a click away); Interrupted means the app found a session that was
 * still `in_progress` on mount — the tab was closed/refreshed/crashed
 * without the user pausing first — and asks before resuming.
 */
export type PracticeMachineState =
  | { status: "idle" }
  | { status: "interrupted"; session: PracticeSessionRecord }
  | { status: "preparing" }
  | { status: "practicing"; session: PracticeSessionRecord }
  | { status: "paused"; session: PracticeSessionRecord }
  | {
      status: "completed";
      session: PracticeSessionRecord;
      summary: SessionSummaryView;
    }
  | { status: "cancelled" };

export type PracticeMachineStatus = PracticeMachineState["status"];

export type PracticeMachineEvent =
  | { type: "SESSION_FOUND"; session: PracticeSessionRecord }
  | { type: "NO_SESSION_FOUND" }
  | { type: "START" }
  | { type: "BACK_TO_IDLE" }
  | { type: "BEGIN"; session: PracticeSessionRecord }
  | { type: "RESUME_INTERRUPTED" }
  | { type: "DISCARD_INTERRUPTED" }
  | { type: "ADVANCE"; session: PracticeSessionRecord }
  | {
      type: "FINISH";
      session: PracticeSessionRecord;
      summary: SessionSummaryView;
    }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "CANCEL" }
  | { type: "RESET" };

export const initialPracticeMachineState: PracticeMachineState = {
  status: "idle",
};
