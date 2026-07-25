"use client";

import { Card, CardContent, CardHeader, CardTitle, Text } from "@momentum/ui";
import type { HeatmapLevel, HeatmapWeek } from "../lib/heatmap";

export interface HeatmapCardProps {
  weeks: HeatmapWeek[];
}

const LEVEL_OPACITY: Record<HeatmapLevel, number> = {
  0: 0.12,
  1: 0.35,
  2: 0.6,
  3: 0.8,
  4: 1,
};

/**
 * A GitHub-contributions-style calendar heatmap. Recharts has no built-in
 * chart type for this shape (it's a grid, not a plotted series), so this is
 * a small hand-rolled grid using the same chart-active color at varying
 * opacity — every other visualization on this screen is real Recharts.
 */
export function HeatmapCard({ weeks }: HeatmapCardProps) {
  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Practice Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label={`Practice activity heatmap for the last ${weeks.length} weeks`}
          className="flex gap-1 overflow-x-auto pb-1"
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.minutes} min`}
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "0.2rem",
                    backgroundColor: day.isFuture
                      ? "hsl(var(--palette-border))"
                      : `hsl(var(--palette-chart-active) / ${LEVEL_OPACITY[day.level]})`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <Text tone="muted" size="sm" className="pt-2">
          Lighter = less practice, darker = more.
        </Text>
      </CardContent>
    </Card>
  );
}
