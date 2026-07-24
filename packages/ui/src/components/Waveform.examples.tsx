import { Waveform } from "./Waveform";
import { Stack } from "./Stack";
import { Text } from "./Typography";

const levels = [
  0.3, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0.6, 0.8, 0.4, 0.2, 0.5, 0.7,
  0.9, 0.6, 0.3, 0.5, 0.8, 0.4, 0.6, 0.7, 0.3, 0.5,
];

export default function WaveformExamples() {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text tone="muted" size="sm">
          Idle, 40% played
        </Text>
        <Waveform
          label="Swar Sadhana recording"
          levels={levels}
          progress={0.4}
        />
      </Stack>
      <Stack gap="xs">
        <Text tone="muted" size="sm">
          Actively recording (pulsing)
        </Text>
        <Waveform
          label="Recording in progress"
          levels={levels}
          progress={0.65}
          active
        />
      </Stack>
    </Stack>
  );
}
