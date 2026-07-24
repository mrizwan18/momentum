"use client";

import { useRouter } from "next/navigation";
import { Music } from "lucide-react";
import { HeroCard } from "@momentum/ui";
import type { DailyGoalRecord } from "@momentum/types";

export interface TodayPracticeCardProps {
  todayMinutes: number;
  todayGoal: DailyGoalRecord | undefined;
}

/** Shown until the user sets a custom daily goal — there's no goal-setting UI yet. */
const DEFAULT_GOAL_MINUTES = 30;

/** docs/design/PIXEL_SPEC.md B1 "Today's Practice" hero. */
export function TodayPracticeCard({
  todayMinutes,
  todayGoal,
}: TodayPracticeCardProps) {
  const router = useRouter();
  const goalMinutes = todayGoal
    ? Math.round(todayGoal.targetDurationSeconds / 60)
    : DEFAULT_GOAL_MINUTES;

  return (
    <HeroCard
      icon={<Music aria-hidden="true" className="h-4 w-4" />}
      eyebrow="Today's Practice"
      value={Math.round(todayMinutes)}
      unit="minutes"
      caption={`Goal: ${goalMinutes} min`}
      imageSrc="/images/today-practice.png"
      imageAlt=""
      onAction={() => router.push("/practice")}
      actionLabel="Go to practice"
      tint="blue"
    />
  );
}
