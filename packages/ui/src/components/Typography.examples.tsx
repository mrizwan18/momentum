import { Caption, Heading, NumberDisplay, Text } from "./Typography";
import { Stack } from "./Stack";

export default function TypographyExamples() {
  return (
    <Stack gap="md">
      <Heading as="h1" size="xl">
        Today&apos;s Score
      </Heading>
      <Heading as="h2" size="lg">
        Section heading
      </Heading>
      <Heading as="h3" size="md">
        Subsection heading
      </Heading>
      <Text>
        Body copy explains what is happening and why it matters, in a calm,
        confident voice.
      </Text>
      <Text tone="muted">Muted body copy for secondary information.</Text>
      <Caption>Captions reassure — small, quiet, supportive.</Caption>
      <NumberDisplay size="lg">84</NumberDisplay>
    </Stack>
  );
}
