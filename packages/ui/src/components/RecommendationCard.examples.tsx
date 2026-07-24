"use client";

import { Music, Target } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import { Stack } from "./Stack";

export default function RecommendationCardExamples() {
  return (
    <Stack gap="sm" className="max-w-sm">
      <RecommendationCard
        icon={<Target className="h-4 w-4" />}
        tint="purple"
        onAction={() => {}}
        actionLabel="View Meend recommendation"
      >
        Practice Meend for 10 minutes daily to improve voice control.
      </RecommendationCard>
      <RecommendationCard
        icon={<Music className="h-4 w-4" />}
        tint="blue"
        onAction={() => {}}
        actionLabel="View Raag Yaman recommendation"
      >
        Try slow Taan patterns in Raag Yaman.
      </RecommendationCard>
      <RecommendationCard icon={<Target className="h-4 w-4" />} tint="purple">
        Read-only — no action for this one.
      </RecommendationCard>
    </Stack>
  );
}
