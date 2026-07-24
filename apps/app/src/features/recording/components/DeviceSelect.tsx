import { Mic } from "lucide-react";
import { Label } from "@momentum/ui";
import type { AudioInputDevice } from "../services/audio-recorder-service";

export interface DeviceSelectProps {
  devices: AudioInputDevice[];
  selectedDeviceId: string | null;
  onChange: (deviceId: string) => void;
}

/** Mic picker shown once permission is granted — hidden entirely when there's only one input. */
export function DeviceSelect({
  devices,
  selectedDeviceId,
  onChange,
}: DeviceSelectProps) {
  if (devices.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Mic aria-hidden="true" className="h-4 w-4 text-foreground-muted" />
      <Label htmlFor="recording-device-select" className="sr-only">
        Microphone
      </Label>
      <select
        id="recording-device-select"
        value={selectedDeviceId ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-touch flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
}
