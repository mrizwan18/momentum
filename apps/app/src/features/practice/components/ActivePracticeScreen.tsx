"use client";

import * as React from "react";
import { Check, NotebookPen } from "lucide-react";
import type { PracticeSessionRecord } from "@momentum/types";
import {
  Button,
  Crossfade,
  ProgressBar,
  Stack,
  Text,
  triggerHaptic,
} from "@momentum/ui";
import type { PracticeCatalog } from "../services/catalog-service";
import type { CompleteExerciseInput } from "../services/practice-service";
import { useExerciseTimer } from "../hooks/use-exercise-timer";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseQueueList } from "./ExerciseQueueList";
import { NotesDialog } from "./NotesDialog";
import { PracticeHeader } from "./PracticeHeader";
import { SessionStatusCard } from "./SessionStatusCard";

export interface ActivePracticeScreenProps {
  session: PracticeSessionRecord;
  catalog: PracticeCatalog;
  isPaused: boolean;
  /** True while a completion is already being persisted — disables Skip/Finish to prevent duplicate submissions. */
  isBusy?: boolean;
  onPause: () => void;
  onResume: () => void;
  onRecordElapsed: (elapsedSeconds: number) => void;
  onSaveDraftNotes: (notes: string) => void;
  onCompleteExercise: (input: CompleteExerciseInput) => void;
  onExitRequest: () => void;
}

/**
 * Rendered by PracticeView while Practicing or Paused, keyed by session.id
 * so the session-level elapsed timer seeds once from the persisted
 * session.elapsedSeconds (crash/resume recovery) and then ticks locally,
 * autosaving every second via onRecordElapsed.
 */
export function ActivePracticeScreen({
  session,
  catalog,
  isPaused,
  isBusy = false,
  onPause,
  onResume,
  onRecordElapsed,
  onSaveDraftNotes,
  onCompleteExercise,
  onExitRequest,
}: ActivePracticeScreenProps) {
  const sessionTimer = useExerciseTimer({
    mode: "stopwatch",
    targetDurationSeconds: 0,
    initialElapsedSeconds: session.elapsedSeconds,
    onTick: onRecordElapsed,
  });
  const { start, pause, resume } = sessionTimer;

  React.useEffect(() => {
    if (!isPaused) {
      start();
    }
    // Runs once: this component remounts fresh per session via `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }
  }, [isPaused, pause, resume]);

  const [notesDraft, setNotesDraft] = React.useState(session.draftNotes ?? "");
  const [isNotesOpen, setIsNotesOpen] = React.useState(false);
  const [currentElapsedSeconds, setCurrentElapsedSeconds] = React.useState(0);
  // Resets the draft/elapsed tracking when the queue advances to a new
  // exercise. Adjusting state directly during render (rather than in an
  // effect) avoids an extra committed render — see
  // https://react.dev/learn/you-might-not-need-an-effect.
  const [notesResetKey, setNotesResetKey] = React.useState(
    session.currentStepIndex,
  );
  if (notesResetKey !== session.currentStepIndex) {
    setNotesResetKey(session.currentStepIndex);
    setNotesDraft(session.draftNotes ?? "");
    setCurrentElapsedSeconds(0);
  }

  React.useEffect(() => {
    if (notesDraft === (session.draftNotes ?? "")) return;
    const timeout = setTimeout(() => {
      onSaveDraftNotes(notesDraft);
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesDraft]);

  const exerciseById = React.useMemo(
    () => new Map(catalog.exercises.map((exercise) => [exercise.id, exercise])),
    [catalog.exercises],
  );
  const queueExercises = React.useMemo(
    () =>
      session.exerciseIds
        .map((id) => exerciseById.get(id))
        .filter(
          (exercise): exercise is NonNullable<typeof exercise> =>
            exercise !== undefined,
        ),
    [session.exerciseIds, exerciseById],
  );
  const currentExercise = queueExercises[session.currentStepIndex] ?? null;
  const queueProgress =
    queueExercises.length > 0
      ? Math.min(
          100,
          Math.round((session.currentStepIndex / queueExercises.length) * 100),
        )
      : 0;

  return (
    <>
      <Stack gap="lg" className="pb-28">
        <PracticeHeader
          subtitle={catalog.plan.title}
          onExitRequest={onExitRequest}
        />
        <SessionStatusCard
          elapsedSeconds={sessionTimer.elapsedSeconds}
          isPaused={isPaused}
          onToggle={isPaused ? onResume : onPause}
        />
        <Stack gap="xs">
          <div className="flex items-center justify-between gap-2">
            <Text size="sm" className="font-semibold">
              Current Exercise
            </Text>
            <Text tone="muted" size="sm" className="font-semibold text-primary">
              {Math.min(session.currentStepIndex + 1, queueExercises.length)} /{" "}
              {queueExercises.length}
            </Text>
          </div>
          <ProgressBar
            value={queueProgress}
            label="Session progress"
            disabled={isPaused}
          />
        </Stack>
        {currentExercise ? (
          <Crossfade activeKey={currentExercise.id}>
            <ExerciseCard
              exercise={currentExercise}
              isSessionPaused={isPaused}
              isBusy={isBusy}
              sessionId={session.id}
              onPauseToggle={isPaused ? onResume : onPause}
              onElapsedChange={setCurrentElapsedSeconds}
              onSkip={(durationSeconds) =>
                onCompleteExercise({
                  exerciseId: currentExercise.id,
                  status: "skipped",
                  durationSeconds,
                  notes: notesDraft || null,
                })
              }
            />
          </Crossfade>
        ) : null}
        <ExerciseQueueList
          exercises={queueExercises}
          currentIndex={session.currentStepIndex}
        />
      </Stack>

      {currentExercise ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl items-center gap-3 border-t border-border bg-background px-4 py-4 sm:px-6"
          style={{ boxShadow: "var(--shape-shadow-nav)" }}
        >
          <Button variant="secondary" onClick={() => setIsNotesOpen(true)}>
            <NotebookPen aria-hidden="true" className="h-4 w-4" />
            Notes
          </Button>
          <Button
            className="flex-1"
            loading={isBusy}
            onClick={() => {
              triggerHaptic("success");
              onCompleteExercise({
                exerciseId: currentExercise.id,
                status: "completed",
                durationSeconds: currentElapsedSeconds,
                notes: notesDraft || null,
              });
            }}
          >
            <Check aria-hidden="true" className="h-4 w-4" />
            Finish Exercise
          </Button>
        </div>
      ) : null}

      <NotesDialog
        open={isNotesOpen}
        onOpenChange={setIsNotesOpen}
        notes={notesDraft}
        onNotesChange={setNotesDraft}
      />
    </>
  );
}
