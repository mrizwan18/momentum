import { ProgressRing } from "./ProgressRing";
import { Cluster } from "./Stack";
import { NumberDisplay } from "./Typography";

export default function ProgressRingExamples() {
  return (
    <Cluster gap="lg">
      <ProgressRing value={84} label="Today's score">
        <NumberDisplay size="md">84</NumberDisplay>
      </ProgressRing>

      <ProgressRing label="Loading score" />

      <ProgressRing value={40} label="Score unavailable offline" disabled>
        <NumberDisplay size="md">--</NumberDisplay>
      </ProgressRing>

      <ProgressRing
        value={62}
        label="Weekly momentum"
        size={56}
        strokeWidth={5}
      />
    </Cluster>
  );
}
