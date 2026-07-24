"use client";

import { VOICE_CONDITIONS, type VoiceCondition } from "@momentum/types";
import { Button, Cluster, Text } from "@momentum/ui";

const VOICE_CONDITION_LABELS: Record<VoiceCondition, string> = {
  fresh: "Fresh",
  normal: "Normal",
  tired: "Tired",
  strained: "Strained",
};

export interface VoiceConditionInlineProps {
  onSelect: (voiceCondition: VoiceCondition) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * docs/features/practice.md Voice Condition — a routine, every-session
 * choice, so it expands in place on the Start card instead of interrupting
 * with a modal (a modal is reserved for consequential decisions: exiting
 * or discarding a session).
 */
export function VoiceConditionInline({
  onSelect,
  onCancel,
  loading = false,
}: VoiceConditionInlineProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Text size="sm" className="font-medium">
          How&apos;s your voice today?
        </Text>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="text-sm text-foreground-muted underline-offset-2 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      <Cluster gap="sm" className="grid grid-cols-2">
        {VOICE_CONDITIONS.map((condition) => (
          <Button
            key={condition}
            variant="secondary"
            disabled={loading}
            onClick={() => onSelect(condition)}
          >
            {VOICE_CONDITION_LABELS[condition]}
          </Button>
        ))}
      </Cluster>
    </div>
  );
}
