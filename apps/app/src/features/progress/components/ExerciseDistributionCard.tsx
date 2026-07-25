"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Stack,
  Text,
  tintColor,
} from "@momentum/ui";
import type { ExerciseDistributionEntry } from "../lib/exercise-distribution";

export interface ExerciseDistributionCardProps {
  distribution: ExerciseDistributionEntry[];
}

const CATEGORY_LABELS: Record<ExerciseDistributionEntry["category"], string> = {
  breathing: "Breathing",
  warmup: "Warm-up",
  scales: "Scales",
  alankars: "Alankars",
  song: "Song",
  recording: "Recording",
  reflection: "Reflection",
};

const PALETTE = [
  tintColor.blue,
  tintColor.purple,
  tintColor.green,
  tintColor.peach,
  tintColor.pink,
  "hsl(var(--palette-chart-active))",
  "hsl(var(--palette-secondary))",
];

export function ExerciseDistributionCard({
  distribution,
}: ExerciseDistributionCardProps) {
  if (distribution.length === 0) {
    return (
      <Card elevation="raised">
        <CardHeader>
          <CardTitle as="h2">Exercise Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No exercises yet"
            description="Complete a practice session to see how your time breaks down by category."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Exercise Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          style={{ height: "160px", width: "160px" }}
          role="img"
          aria-label="Exercise distribution by category"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value, _name, entry) => [
                  `${value} (${Math.round((entry.payload.percent ?? 0) * 100)}%)`,
                  CATEGORY_LABELS[
                    entry.payload
                      .category as ExerciseDistributionEntry["category"]
                  ],
                ]}
              />
              <Pie
                data={distribution}
                dataKey="count"
                nameKey="category"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {distribution.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Stack gap="xs" className="flex-1">
          {distribution.map((entry, index) => (
            <div key={entry.category} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                style={{
                  width: "0.625rem",
                  height: "0.625rem",
                  borderRadius: "999px",
                  backgroundColor: PALETTE[index % PALETTE.length],
                }}
              />
              <Text size="sm" className="flex-1">
                {CATEGORY_LABELS[entry.category]}
              </Text>
              <Text tone="muted" size="sm">
                {Math.round(entry.percent * 100)}%
              </Text>
            </div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
