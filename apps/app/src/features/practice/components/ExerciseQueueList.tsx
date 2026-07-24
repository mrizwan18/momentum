import { Activity, CheckCircle2, Lock } from "lucide-react";
import type { ExerciseRecord } from "@momentum/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
  cn,
} from "@momentum/ui";

export interface ExerciseQueueListProps {
  exercises: ExerciseRecord[];
  currentIndex: number;
}

/** Whole-minute label for a target duration, e.g. "5 min" — real data, rounded for display only. */
function toMinuteLabel(targetDurationSeconds: number): string {
  return `${Math.max(1, Math.round(targetDurationSeconds / 60))} min`;
}

/**
 * docs/design/references/practice.md "Session Progress" card: a segmented
 * progress bar (one segment per exercise, filled through the current step)
 * above a read-only queue list — done exercises check off, the current one
 * is highlighted, upcoming ones show a lock and their target duration.
 */
export function ExerciseQueueList({
  exercises,
  currentIndex,
}: ExerciseQueueListProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle as="h3">Session Progress</CardTitle>
        <Text tone="muted" size="sm">
          {Math.min(currentIndex + 1, exercises.length)} / {exercises.length}{" "}
          Exercises
        </Text>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex gap-1" aria-hidden="true">
          {exercises.map((exercise, index) => (
            <span
              key={exercise.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                index <= currentIndex ? "bg-primary" : "bg-surface-raised",
              )}
            />
          ))}
        </div>
        <ol className="flex flex-col gap-1" aria-label="Exercise queue">
          {exercises.map((exercise, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <li
                key={exercise.id}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5",
                  isCurrent && "bg-surface-raised",
                )}
              >
                {isComplete ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-success"
                  />
                ) : isCurrent ? (
                  <Activity
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                ) : (
                  <Lock
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-foreground-muted"
                  />
                )}
                <Text
                  size="sm"
                  tone={isComplete || isCurrent ? "default" : "muted"}
                  className={cn("flex-1", isComplete && "line-through")}
                >
                  {exercise.title}
                </Text>
                <Text tone="muted" size="sm">
                  {toMinuteLabel(exercise.targetDurationSeconds)}
                </Text>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
