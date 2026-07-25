"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  chartColor,
  Cluster,
  NumberDisplay,
  radiusStyle,
  Text,
} from "@momentum/ui";
import type { DailySeriesPoint } from "../lib/date-series";
import type { Trend } from "../lib/trend";
import { formatDuration } from "@/lib/format-duration";

export interface WeeklyGraphCardProps {
  weekly: DailySeriesPoint[];
  trend: Trend;
}

/** docs/design/references/stats.png "Practice Overview" card, rebuilt with Recharts. */
export function WeeklyGraphCard({ weekly, trend }: WeeklyGraphCardProps) {
  const totalMinutes = weekly.reduce((sum, day) => sum + day.minutes, 0);
  const bestDay = weekly.reduce(
    (best, day) => (day.minutes > best.minutes ? day : best),
    weekly[0],
  );

  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">This Week</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Cluster gap="md" className="items-end justify-between">
          <div className="flex flex-col gap-1">
            <NumberDisplay size="hero">{totalMinutes}</NumberDisplay>
            <Text tone="muted" size="sm">
              minutes practiced
            </Text>
          </div>
          {bestDay && bestDay.minutes > 0 ? (
            <div
              style={radiusStyle.chip}
              className="flex flex-col items-end gap-1 bg-surface-raised px-3 py-2"
            >
              <Text tone="muted" size="sm">
                Best day
              </Text>
              <Text size="sm" className="font-semibold">
                {formatDuration(bestDay.minutes * 60)}
              </Text>
            </div>
          ) : null}
        </Cluster>

        <div
          style={{ height: "160px" }}
          role="img"
          aria-label="Practice minutes by day this week"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekly}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--palette-text-muted))", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} min`, "Practiced"]}
                labelFormatter={() => ""}
              />
              <Bar dataKey="minutes" radius={[6, 6, 6, 6]} maxBarSize={24}>
                {weekly.map((day) => (
                  <Cell
                    key={day.date}
                    fill={
                      day.isToday || day === bestDay
                        ? chartColor.active
                        : chartColor.inactive
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {trend.percentChange !== null ? (
          <Text tone="muted" size="sm">
            {trend.direction === "up"
              ? `▲ ${trend.percentChange}% vs last week`
              : trend.direction === "down"
                ? `▼ ${Math.abs(trend.percentChange)}% vs last week`
                : "Same as last week"}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
