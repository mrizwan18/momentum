import { Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import type { StreakSummary } from "../lib/streak";

export interface StreakCardProps {
  streak: StreakSummary;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Flame aria-hidden="true" className="h-5 w-5 text-primary" />
        <CardTitle as="h2">Streak</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <NumberDisplay size="lg" data-testid="streak-current">
            {streak.current}
          </NumberDisplay>
          <Text tone="muted" size="sm">
            {streak.current === 1 ? "day" : "days"} in a row
          </Text>
        </div>
        <div className="text-right">
          <Text size="sm">Longest: {streak.longest}</Text>
          {streak.nextMilestone ? (
            <Text tone="muted" size="sm">
              {streak.daysUntilMilestone} to {streak.nextMilestone}-day
              milestone
            </Text>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
