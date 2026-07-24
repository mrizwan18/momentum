"use client";

import {
  Card,
  CardContent,
  NumberDisplay,
  Text,
  cn,
  triggerHaptic,
} from "@momentum/ui";
import { formatDuration } from "@/lib/format-duration";

export interface SessionStatusCardProps {
  elapsedSeconds: number;
  isPaused: boolean;
  onToggle: () => void;
}

/**
 * docs/design/references/practice.md "Current Session" card: status + the
 * session-level elapsed timer, relocated out of PracticeHeader. Tapping the
 * card toggles the same session pause/resume PracticeHeader used to expose.
 */
export function SessionStatusCard({
  elapsedSeconds,
  isPaused,
  onToggle,
}: SessionStatusCardProps) {
  return (
    <Card>
      <CardContent>
        <button
          type="button"
          onClick={() => {
            triggerHaptic("tap");
            onToggle();
          }}
          aria-label={isPaused ? "Resume practice" : "Pause practice"}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                isPaused ? "bg-foreground-muted" : "animate-pulse bg-success",
              )}
            />
            <span className="flex flex-col">
              <Text as="span" size="sm" className="font-semibold">
                Current Session
              </Text>
              <Text
                as="span"
                tone="muted"
                size="sm"
                className={cn(!isPaused && "text-success")}
              >
                {isPaused ? "Paused" : "In Progress"}
              </Text>
            </span>
          </span>
          <span className="flex flex-col items-end">
            <NumberDisplay size="md" aria-live="polite">
              {formatDuration(elapsedSeconds)}
            </NumberDisplay>
            <Text as="span" tone="muted" size="sm">
              Elapsed Time
            </Text>
          </span>
        </button>
      </CardContent>
    </Card>
  );
}
