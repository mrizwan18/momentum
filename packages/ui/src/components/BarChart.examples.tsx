import { BarChart } from "./BarChart";
import { Stack } from "./Stack";
import { Text } from "./Typography";

export default function BarChartExamples() {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text tone="muted" size="sm">
          Streak (one peak day)
        </Text>
        <BarChart
          label="Practice minutes, current streak"
          data={[
            { label: "M", value: 22 },
            { label: "T", value: 30 },
            { label: "W", value: 18 },
            { label: "T", value: 26 },
            { label: "F", value: 24 },
            { label: "S", value: 5, active: true },
            { label: "S", value: 12 },
          ]}
        />
      </Stack>
      <Stack gap="xs">
        <Text tone="muted" size="sm">
          Weekly overview (two peak days)
        </Text>
        <BarChart
          label="Practice minutes this week"
          data={[
            { label: "M", value: 45 },
            { label: "T", value: 30 },
            { label: "W", value: 78, active: true },
            { label: "T", value: 50 },
            { label: "F", value: 35 },
            { label: "S", value: 70, active: true },
            { label: "S", value: 20 },
          ]}
        />
      </Stack>
    </Stack>
  );
}
