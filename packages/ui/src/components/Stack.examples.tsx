import { Cluster, Stack } from "./Stack";
import { Text } from "./Typography";

function Box({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm">
      {label}
    </div>
  );
}

export default function StackExamples() {
  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Text tone="muted">Stack (vertical, gap=&quot;sm&quot;)</Text>
        <Stack gap="sm">
          <Box label="First" />
          <Box label="Second" />
          <Box label="Third" />
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Text tone="muted">
          Cluster (horizontal, wraps, gap=&quot;sm&quot;)
        </Text>
        <Cluster gap="sm">
          <Box label="One" />
          <Box label="Two" />
          <Box label="Three" />
          <Box label="Four" />
        </Cluster>
      </Stack>
    </Stack>
  );
}
