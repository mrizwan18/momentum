import { ProgressBar } from "./ProgressBar";
import { Stack } from "./Stack";

export default function ProgressBarExamples() {
  return (
    <Stack gap="lg" className="w-full max-w-sm">
      <ProgressBar value={35} label="Session progress" />
      <ProgressBar value={78} label="Session progress (further along)" />
      <ProgressBar value={100} label="Session progress (complete)" />
      <ProgressBar value={40} label="Session progress (paused)" disabled />
    </Stack>
  );
}
