"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  chartColor,
} from "@momentum/ui";
import type { StreakHistoryPoint } from "../lib/streak-history";

export interface StreakHistoryCardProps {
  points: StreakHistoryPoint[];
}

export function StreakHistoryCard({ points }: StreakHistoryCardProps) {
  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Streak History</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{ height: "140px" }}
          role="img"
          aria-label="Streak length over the last 30 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                interval={6}
                tickFormatter={(value: string) =>
                  value.slice(5).replace("-", "/")
                }
                tick={{ fill: "hsl(var(--palette-text-muted))", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [
                  `${value} ${value === 1 ? "day" : "days"}`,
                  "Streak",
                ]}
              />
              <Line
                type="stepAfter"
                dataKey="streakLength"
                stroke={chartColor.active}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
