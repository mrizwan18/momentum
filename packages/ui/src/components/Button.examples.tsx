import { Button } from "./Button";
import { Cluster, Stack } from "./Stack";
import { Text } from "./Typography";

export default function ButtonExamples() {
  return (
    <Stack gap="md">
      <Cluster gap="sm">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Cluster>

      <Stack gap="xs">
        <Text tone="muted">Loading</Text>
        <Cluster gap="sm">
          <Button loading>Continue Practice</Button>
        </Cluster>
      </Stack>

      <Stack gap="xs">
        <Text tone="muted">Disabled</Text>
        <Cluster gap="sm">
          <Button disabled>Continue Practice</Button>
        </Cluster>
      </Stack>

      <Stack gap="xs">
        <Text tone="muted">Icon size (44&times;44 minimum touch target)</Text>
        <Cluster gap="sm">
          <Button size="icon" aria-label="Favorite">
            ♥
          </Button>
        </Cluster>
      </Stack>

      <Stack gap="xs">
        <Text tone="muted">Responsive — full width on small screens</Text>
        <Button className="w-full sm:w-auto">Continue Practice</Button>
      </Stack>
    </Stack>
  );
}
