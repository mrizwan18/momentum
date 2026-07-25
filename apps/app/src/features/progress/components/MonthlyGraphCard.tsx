"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  chartColor,
  NumberDisplay,
  Text,
} from "@momentum/ui";
import type { DailySeriesPoint } from "../lib/date-series";
import type { Trend } from "../lib/trend";

export interface MonthlyGraphCardProps {
  monthly: DailySeriesPoint[];
  trend: Trend;
}

export function MonthlyGraphCard({ monthly, trend }: MonthlyGraphCardProps) {
  const totalMinutes = monthly.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">This Month</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <NumberDisplay size="hero">{totalMinutes}</NumberDisplay>
          <Text tone="muted" size="sm">
            minutes in the last 30 days
          </Text>
        </div>

        <div
          style={{ height: "160px" }}
          role="img"
          aria-label="Practice minutes by day this month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthly}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient
                  id="monthlyMinutesFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColor.active}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColor.active}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={6}
                tick={{ fill: "hsl(var(--palette-text-muted))", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} min`, "Practiced"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ?? ""
                }
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke={chartColor.active}
                strokeWidth={2}
                fill="url(#monthlyMinutesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {trend.percentChange !== null ? (
          <Text tone="muted" size="sm">
            {trend.direction === "up"
              ? `▲ ${trend.percentChange}% vs the previous 30 days`
              : trend.direction === "down"
                ? `▼ ${Math.abs(trend.percentChange)}% vs the previous 30 days`
                : "Same as the previous 30 days"}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
