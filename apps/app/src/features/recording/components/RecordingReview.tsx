"use client";

import * as React from "react";
import { Check, Trash2 } from "lucide-react";
import { Button, Input, Label, Text } from "@momentum/ui";
import { formatDuration } from "@/lib/format-duration";

export interface RecordingReviewProps {
  blob: Blob;
  title: string;
  durationMs: number;
  isSaving: boolean;
  onRename: (title: string) => void;
  onSave: () => void;
  onDiscard: () => void;
}

/**
 * Playback uses a native `<audio controls>` element rather than the custom
 * `Waveform` component — Waveform's contract requires real captured levels,
 * and decoding a static take's PCM data into a from-scratch visualization
 * isn't worth the added complexity for this sprint. Native controls give
 * play/pause/seek/volume, fully real, for free.
 */
export function RecordingReview({
  blob,
  title,
  durationMs,
  isSaving,
  onRename,
  onSave,
  onDiscard,
}: RecordingReviewProps) {
  const url = React.useMemo(() => URL.createObjectURL(blob), [blob]);
  React.useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="flex flex-col gap-4 py-4">
      <audio controls src={url} className="w-full" />
      <Text tone="muted" size="sm">
        Duration: {formatDuration(durationMs / 1000)}
      </Text>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recording-title">Title</Label>
        <Input
          id="recording-title"
          value={title}
          onChange={(event) => onRename(event.target.value)}
          placeholder="Name this take"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={isSaving}
          onClick={onDiscard}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Discard
        </Button>
        <Button className="flex-1" loading={isSaving} onClick={onSave}>
          <Check aria-hidden="true" className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
