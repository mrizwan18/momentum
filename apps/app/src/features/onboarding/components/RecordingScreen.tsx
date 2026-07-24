"use client";

import { ArrowLeft, Square } from "lucide-react";
import { Heading, Reveal, Text, Waveform, shadowStyle } from "@momentum/ui";

export interface RecordingScreenProps {
  onCancel: () => void;
  onStop: () => void;
  elapsedMs: number;
  levels: number[];
}

/** mm:ss with a zero-padded minute, matching 09_recording.png's "00:12" — formatDuration's "0:12" is one digit short. */
function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Screen 09: live capture — timer, real waveform, and a stop button that doubles the back button as cancel. */
export function RecordingScreen({
  onCancel,
  onStop,
  elapsedMs,
  levels,
}: RecordingScreenProps) {
  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel recording"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          Recording…
        </Heading>
        <Text tone="muted">Sing for 10–15 seconds</Text>
      </Reveal>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <Text
          as="span"
          className="font-semibold tabular-nums"
          style={{ fontSize: "2.5rem" }}
          aria-live="polite"
        >
          {formatTimer(elapsedMs)}
        </Text>

        <Waveform
          levels={levels}
          label="Recording in progress"
          active
          className="w-full"
        />

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStop}
            aria-label="Tap to stop"
            style={{
              height: "96px",
              width: "96px",
              ...shadowStyle.buttonPrimary,
              backgroundColor: "hsl(var(--palette-primary) / 0.15)",
            }}
            className="flex items-center justify-center rounded-full transition-transform duration-fast ease-momentum focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
          >
            <span
              style={{ height: "72px", width: "72px" }}
              className="flex items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Square
                aria-hidden="true"
                className="h-6 w-6"
                fill="currentColor"
              />
            </span>
          </button>
          <Text tone="muted" size="sm">
            Tap to stop
          </Text>
        </div>
      </div>
    </div>
  );
}
