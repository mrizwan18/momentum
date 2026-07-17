import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  cn,
} from "@momentum/ui";
import type { PracticeSessionRecord } from "@momentum/types";

export interface PracticeChecklistProps {
  activeSession: PracticeSessionRecord | null;
}

const EXERCISE_LABELS: Record<string, string> = {
  breathing: "Breathing",
  warmup: "Warm-up",
  scales: "Sa Re Ga Ma",
  alankars: "Alankars",
  song: "Song",
  recording: "Recording",
  reflection: "Reflection",
};

function labelFor(exerciseId: string): string {
  return EXERCISE_LABELS[exerciseId] ?? exerciseId;
}

/** Renders the real steps of the active session — there is no checklist without one. */
export function PracticeChecklist({ activeSession }: PracticeChecklistProps) {
  if (!activeSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h2">Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No checklist yet"
            description="Start today's practice to see your checklist."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {activeSession.exerciseIds.map((exerciseId, index) => {
            const done = index < activeSession.currentStepIndex;
            return (
              <li key={exerciseId} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                    done
                      ? "border-success bg-success text-success-foreground"
                      : "border-border",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span
                  className={
                    done
                      ? "text-foreground-muted line-through"
                      : "text-foreground"
                  }
                >
                  {labelFor(exerciseId)}
                  <span className="sr-only">
                    {done ? " (completed)" : " (not completed)"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
