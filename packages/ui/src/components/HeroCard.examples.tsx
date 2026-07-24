"use client";

import { Music } from "lucide-react";
import { HeroCard } from "./HeroCard";
import { Stack } from "./Stack";

export default function HeroCardExamples() {
  return (
    <Stack gap="md" className="max-w-sm">
      <HeroCard
        icon={<Music className="h-4 w-4" />}
        eyebrow="Today's Practice"
        value={47}
        unit="minutes"
        caption="Goal: 60 min"
        onAction={() => {}}
        actionLabel="Continue practice"
      />
      <HeroCard
        eyebrow="Today's Practice"
        value={0}
        unit="minutes"
        caption="Goal: 60 min"
        tint="purple"
      />
    </Stack>
  );
}
