import { Pause, Play, Square, X } from "lucide-react";
import {
  Button,
  NumberDisplay,
  ProgressRing,
  Text,
  Waveform,
} from "@momentum/ui";
import { formatDuration } from "@/lib/format-duration";

export interface RecordingControlsProps {
  status: "countdown" | "recording" | "paused";
  countdownValue: number;
  elapsedMs: number;
  levels: number[];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCancel: () => void;
}

/** Countdown, then the live record/pause/resume/stop/cancel controls. */
export function RecordingControls({
  status,
  countdownValue,
  elapsedMs,
  levels,
  onPause,
  onResume,
  onStop,
  onCancel,
}: RecordingControlsProps) {
  if (status === "countdown") {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <ProgressRing
          value={((3 - countdownValue) / 3) * 100}
          label="Recording starts in"
          size={72}
          strokeWidth={6}
        >
          <NumberDisplay size="lg">{countdownValue || ""}</NumberDisplay>
        </ProgressRing>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Cancel countdown"
          onClick={onCancel}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const isRecording = status === "recording";

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <Waveform
        levels={levels}
        label={isRecording ? "Recording in progress" : "Recording paused"}
        active={isRecording}
      />
      <Text as="span" className="font-medium tabular-nums" aria-live="polite">
        {formatDuration(elapsedMs / 1000)}
      </Text>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Cancel recording"
          onClick={onCancel}
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </Button>
        {isRecording ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Pause recording"
            onClick={onPause}
          >
            <Pause aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Resume recording"
            onClick={onResume}
          >
            <Play aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon"
          aria-label="Stop recording"
          onClick={onStop}
        >
          <Square aria-hidden="true" className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
