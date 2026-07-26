"use client";

import * as React from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import type { ExerciseDifficulty, ExerciseRecord } from "@momentum/types";
import {
  Button,
  Card,
  CardContent,
  Cluster,
  Heading,
  IconCircle,
  ProgressRing,
  Stack,
  Text,
  triggerHaptic,
} from "@momentum/ui";
import { CATEGORY_ICONS } from "@/lib/exercise-category-labels";
import { formatDuration } from "@/lib/format-duration";
import { RecordPanel } from "@/features/recording";
import { useExerciseTimer } from "../hooks/use-exercise-timer";

const DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export interface ExerciseCardProps {
  exercise: ExerciseRecord;
  isSessionPaused: boolean;
  /** Disables Skip while a completion is already being persisted, to prevent duplicate submissions. */
  isBusy?: boolean;
  onSkip: (durationSeconds: number) => void;
  /** Toggles the session-level pause/resume — relocated here from PracticeHeader per docs/design/references/practice.png's exercise-level action row. */
  onPauseToggle: () => void;
  /** Reports the live elapsed seconds up so the parent's Finish/Mark-complete action (now in a page-level bottom bar) can use the same value this card's own timer tracks. */
  onElapsedChange?: (elapsedSeconds: number) => void;
  /** The active PracticeSession a recorded take associates with. */
  sessionId: string;
}

/**
 * The current exercise, per docs/design/references/practice.png: an icon
 * chip + title/description/difficulty row with a trailing per-exercise
 * completion ring, then the Pause/Record/Skip action row. The timer
 * auto-starts as soon as this exercise becomes current (Law: fast session
 * start, zero confusion) and tracks the session-level pause rather than
 * exposing its own separate pause control.
 */
export function ExerciseCard({
  exercise,
  isSessionPaused,
  isBusy = false,
  onSkip,
  onPauseToggle,
  onElapsedChange,
  sessionId,
}: ExerciseCardProps) {
  const isTimed = exercise.targetDurationSeconds > 0;
  const timer = useExerciseTimer({
    mode: isTimed ? "countdown" : "stopwatch",
    targetDurationSeconds: exercise.targetDurationSeconds,
    onTick: onElapsedChange,
  });
  const { start, pause, resume } = timer;

  React.useEffect(() => {
    if (!isSessionPaused) {
      start();
    }
    // Runs once per mount (a fresh ExerciseCard instance per exercise, via `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isSessionPaused) {
      pause();
    } else {
      resume();
    }
  }, [isSessionPaused, pause, resume]);

  const CategoryIcon = CATEGORY_ICONS[exercise.category];
  const percentElapsed = isTimed
    ? Math.min(
        100,
        Math.round(
          (timer.elapsedSeconds / exercise.targetDurationSeconds) * 100,
        ),
      )
    : 0;

  return (
    <Card elevation={isSessionPaused ? "flat" : "hero"}>
      <CardContent>
        <Stack gap="lg">
          <div className="flex items-start justify-between gap-4">
            <Cluster gap="sm" className="items-start">
              <IconCircle
                icon={
                  <CategoryIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-primary"
                  />
                }
                size={48}
                tint="blue"
              />
              <Stack gap="xs">
                <Heading as="h3" size="md">
                  {exercise.title}
                </Heading>
                <Text tone="muted" size="sm">
                  {exercise.description}
                </Text>
                <Text
                  as="span"
                  tone="muted"
                  size="sm"
                  className="w-fit rounded-full bg-surface-raised px-2.5 py-1"
                >
                  {DIFFICULTY_LABELS[exercise.difficulty]}
                </Text>
              </Stack>
            </Cluster>
            {isTimed ? (
              <ProgressRing
                value={percentElapsed}
                label="Exercise progress"
                size={84}
                strokeWidth={8}
                className="shrink-0"
              >
                <Stack gap="none" className="items-center">
                  <Text
                    as="span"
                    size="lg"
                    className="font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {percentElapsed}%
                  </Text>
                  <Text as="span" tone="muted" size="sm">
                    Completed
                  </Text>
                </Stack>
              </ProgressRing>
            ) : (
              <Text
                as="span"
                className="shrink-0 text-2xl font-semibold tabular-nums"
                aria-live="polite"
              >
                {formatDuration(timer.remainingSeconds)}
              </Text>
            )}
          </div>

          <Cluster gap="md" className="items-center justify-center">
            <Stack gap="xs" className="items-center">
              <Button
                variant="secondary"
                size="icon"
                aria-label={
                  isSessionPaused ? "Resume practice" : "Pause practice"
                }
                onClick={() => {
                  triggerHaptic("tap");
                  onPauseToggle();
                }}
              >
                {isSessionPaused ? (
                  <Play aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Pause aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
              <Text tone="muted" size="sm">
                {isSessionPaused ? "Resume" : "Pause"}
              </Text>
            </Stack>

            <div className="flex-1">
              <RecordPanel sessionId={sessionId} exerciseId={exercise.id} />
            </div>

            <Stack gap="xs" className="items-center">
              <Button
                variant="secondary"
                size="icon"
                aria-label="Skip exercise"
                disabled={isBusy}
                onClick={() => {
                  triggerHaptic("tap");
                  onSkip(timer.elapsedSeconds);
                }}
              >
                <SkipForward aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Text tone="muted" size="sm">
                Skip
              </Text>
            </Stack>
          </Cluster>
        </Stack>
      </CardContent>
    </Card>
  );
}
