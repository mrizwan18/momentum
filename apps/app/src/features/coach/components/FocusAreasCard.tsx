"use client";

import { Mic } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, Text } from "@momentum/ui";
import type { FocusAreaEntry } from "../hooks/use-coach-data";

export interface FocusAreasCardProps {
  areas: FocusAreaEntry[];
}

/** docs/design/references/coach.png "Focus Areas" list + Performance Radar — real per-metric percentages. */
export function FocusAreasCard({ areas }: FocusAreasCardProps) {
  return (
    <Card elevation="raised">
      <CardHeader>
        <CardTitle as="h2">Focus Areas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {areas.map((area) => (
            <div
              key={area.label}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Mic
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-primary"
                />
                <Text size="sm">{area.label}</Text>
              </div>
              <Text size="sm" className="font-semibold">
                {area.value}%
              </Text>
            </div>
          ))}
        </div>

        <div
          style={{ height: "220px" }}
          role="img"
          aria-label={`Performance radar: ${areas.map((area) => `${area.label} ${area.value}%`).join(", ")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={areas.map((area) => ({
                subject: area.label,
                value: area.value,
              }))}
            >
              <PolarGrid stroke="hsl(var(--palette-border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "hsl(var(--palette-text-muted))", fontSize: 11 }}
              />
              <Radar
                dataKey="value"
                stroke="hsl(var(--palette-primary))"
                fill="hsl(var(--palette-primary))"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
