import { Reveal } from "./Reveal";
import { Card, CardContent } from "./Card";
import { Stack } from "./Stack";

export default function RevealExamples() {
  return (
    <Stack gap="md">
      <Reveal>
        <Card>
          <CardContent>Arrives immediately</CardContent>
        </Card>
      </Reveal>
      <Reveal delay={0.15}>
        <Card>
          <CardContent>Arrives 150ms later (staggered)</CardContent>
        </Card>
      </Reveal>
      <Reveal variant="scale">
        <Card>
          <CardContent>
            Scale variant — reserved for celebratory moments
          </CardContent>
        </Card>
      </Reveal>
    </Stack>
  );
}
