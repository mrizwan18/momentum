"use client";

import type { VoiceCondition } from "@momentum/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Crossfade,
} from "@momentum/ui";
import type { PracticeCatalog } from "../services/catalog-service";
import { formatDuration } from "@/lib/format-duration";
import { VoiceConditionInline } from "./VoiceConditionInline";

export interface PracticeStartCardProps {
  catalog: PracticeCatalog;
  isPreparing: boolean;
  isBusy: boolean;
  onStart: () => void;
  onSelectVoiceCondition: (voiceCondition: VoiceCondition) => void;
  onCancelPreparing: () => void;
}

/**
 * The Idle screen's one focal element. "Preparing" isn't a separate modal
 * screen here — the same hero card crossfades its action area from the
 * Start button into the inline voice-condition choice, so choosing how
 * your voice feels never leaves the card you were already looking at.
 */
export function PracticeStartCard({
  catalog,
  isPreparing,
  isBusy,
  onStart,
  onSelectVoiceCondition,
  onCancelPreparing,
}: PracticeStartCardProps) {
  return (
    <Card elevation="hero">
      <CardHeader>
        <CardTitle>{catalog.plan.title}</CardTitle>
        <CardDescription>{catalog.plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm text-foreground-muted">
          {catalog.plan.exerciseIds.length} exercises ·{" "}
          {formatDuration(catalog.plan.targetDurationSeconds)}
        </p>
        <Crossfade activeKey={isPreparing ? "preparing" : "idle"}>
          {isPreparing ? (
            <VoiceConditionInline
              onSelect={onSelectVoiceCondition}
              onCancel={onCancelPreparing}
              loading={isBusy}
            />
          ) : (
            <Button
              className="h-14 w-full text-base font-semibold"
              onClick={onStart}
            >
              Start Practice
            </Button>
          )}
        </Crossfade>
      </CardContent>
    </Card>
  );
}
