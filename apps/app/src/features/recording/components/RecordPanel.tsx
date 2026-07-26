"use client";

import { Check, Mic, MicOff } from "lucide-react";
import { Button, ErrorState, StatusState, Text } from "@momentum/ui";
import { useRecordingSession } from "../hooks/use-recording-session";
import { DeviceSelect } from "./DeviceSelect";
import { RecordingControls } from "./RecordingControls";
import { RecordingReview } from "./RecordingReview";

export interface RecordPanelProps {
  /** The active PracticeSession a saved recording associates with. */
  sessionId: string;
  /** The exercise currently being practiced — tags the saved recording so AI audio analysis can label it. */
  exerciseId: string | null;
}

/**
 * Slots into the exercise screen (docs/features/recording.md's "Practice ->
 * Record -> Review -> Save" loop, scoped to this sprint's core flow —
 * Voice Timeline/comparison/favorites/search are out of scope). Switches
 * entirely on the recording state machine's status; every action is a
 * pass-through to useRecordingSession. Renders bare (no Card of its own) —
 * it's always embedded inside ExerciseCard's own card.
 */
export function RecordPanel({ sessionId, exerciseId }: RecordPanelProps) {
  const session = useRecordingSession({ sessionId, exerciseId });
  const { machine } = session;

  return (
    <div className="flex flex-col gap-3">
      {machine.status === "idle" ? (
        <StatusState
          className="bg-transparent px-0 py-6"
          icon={<Mic className="h-8 w-8" />}
          title="Record this exercise"
          description="Capture a take to compare against future practice."
          actionLabel="Enable microphone"
          onAction={session.requestPermission}
        />
      ) : null}

      {machine.status === "requesting-permission" ? (
        <StatusState
          className="bg-transparent px-0 py-6"
          icon={<Mic className="h-8 w-8" />}
          title="Requesting microphone access…"
        />
      ) : null}

      {machine.status === "permission-denied" ? (
        <ErrorState
          title="Microphone access denied"
          description="Allow microphone access in your browser's settings, then try again."
          onAction={session.requestPermission}
        />
      ) : null}

      {machine.status === "no-device" ? (
        <ErrorState
          icon={<MicOff className="h-8 w-8" />}
          title="No microphone found"
          description="Connect a microphone, then try again."
          onAction={session.requestPermission}
        />
      ) : null}

      {machine.status === "ready" ? (
        <div className="flex flex-col gap-3">
          <DeviceSelect
            devices={session.devices}
            selectedDeviceId={session.selectedDeviceId}
            onChange={session.selectDevice}
          />
          {session.actionError ? (
            <Text tone="muted" size="sm" role="alert">
              {session.actionError}
            </Text>
          ) : null}
          <Button
            className="h-14 w-full gap-2 text-base font-semibold"
            onClick={session.startCountdown}
          >
            <Mic aria-hidden="true" className="h-5 w-5" />
            Start Recording
          </Button>
        </div>
      ) : null}

      {machine.status === "countdown" ||
      machine.status === "recording" ||
      machine.status === "paused" ? (
        <RecordingControls
          status={machine.status}
          countdownValue={session.countdownValue}
          elapsedMs={session.elapsedMs}
          levels={session.levels}
          onPause={session.pause}
          onResume={session.resume}
          onStop={session.stop}
          onCancel={session.discard}
        />
      ) : null}

      {machine.status === "reviewing" ? (
        <RecordingReview
          blob={machine.blob}
          title={machine.title}
          durationMs={machine.durationMs}
          isSaving={false}
          onRename={session.rename}
          onSave={session.save}
          onDiscard={session.discard}
        />
      ) : null}

      {machine.status === "saving" ? (
        <RecordingReview
          blob={machine.blob}
          title={machine.title}
          durationMs={machine.durationMs}
          isSaving={true}
          onRename={session.rename}
          onSave={session.save}
          onDiscard={session.discard}
        />
      ) : null}

      {machine.status === "saved" ? (
        <StatusState
          icon={<Check className="h-8 w-8" />}
          title="Recording saved"
          description={`"${machine.recording.title}" was added to this session.`}
          actionLabel="Record another take"
          onAction={session.reset}
        />
      ) : null}

      {machine.status === "error" ? (
        <ErrorState
          title="Something went wrong"
          description={machine.message}
          actionLabel={machine.blob !== null ? "Retry save" : "Try again"}
          onAction={machine.blob !== null ? session.save : session.reset}
        />
      ) : null}
    </div>
  );
}
