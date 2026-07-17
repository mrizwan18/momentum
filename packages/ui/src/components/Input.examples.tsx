import { Input } from "./Input";
import { Label } from "./Label";
import { Stack } from "./Stack";
import { Text } from "./Typography";

export default function InputExamples() {
  return (
    <Stack gap="md" className="max-w-sm">
      <Stack gap="xs">
        <Label htmlFor="ds-input-default">Song name</Label>
        <Input id="ds-input-default" placeholder="Raag Yaman" />
      </Stack>

      <Stack gap="xs">
        <Label htmlFor="ds-input-loading">Checking availability</Label>
        <Input id="ds-input-loading" loading defaultValue="Raag Yaman" />
      </Stack>

      <Stack gap="xs">
        <Label htmlFor="ds-input-disabled">Disabled</Label>
        <Input id="ds-input-disabled" disabled defaultValue="Locked field" />
      </Stack>

      <Stack gap="xs">
        <Label htmlFor="ds-input-invalid">Invalid</Label>
        <Input id="ds-input-invalid" aria-invalid defaultValue="" />
        <Text tone="muted" size="sm">
          Shown with a danger-colored border via aria-invalid.
        </Text>
      </Stack>
    </Stack>
  );
}
