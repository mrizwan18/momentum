import { Flame } from "lucide-react";
import {
  BarChart,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import type { StreakSummary } from "../lib/streak";
import type { WeeklyByDayEntry } from "../lib/weekly-snapshot";

export interface StreakCardProps {
  streak: StreakSummary;
  weeklyByDay: WeeklyByDayEntry[];
}

export function StreakCard({ streak, weeklyByDay }: StreakCardProps) {
  return (
    <Card elevation="hero" className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0">
        <Flame aria-hidden="true" className="h-5 w-5 text-primary" />
        <CardTitle
          as="h2"
          className="text-sm font-medium text-foreground-muted"
        >
          Current Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <NumberDisplay size="hero" data-testid="streak-current">
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
        </div>
        <BarChart
          label="Practice minutes for the last 7 days"
          data={weeklyByDay.map((day) => ({
            label: day.label,
            value: day.minutes,
            active: day.isToday,
          }))}
        />
      </CardContent>
    </Card>
  );
}
