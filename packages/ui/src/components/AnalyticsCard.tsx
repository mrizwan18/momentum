"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { tintColor } from "../lib/shape";
import type { Tint } from "../lib/tint";
import { Card } from "./Card";
import { ProgressRing } from "./ProgressRing";
import { NumberDisplay, Text } from "./Typography";

export interface AnalyticsCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  caption?: string;
  /** 0-100, drives the trailing ring. Omit for an indeterminate ring. */
  progress?: number;
  /** Accessible name for the ring (distinct from the card's own `label`). */
  ringLabel: string;
  /** Center content for the ring — e.g. "25 / 30" + "Days". */
  ringContent?: React.ReactNode;
  tint?: Tint;
}

/**
 * docs/design/PIXEL_SPEC.md B4/B5 "Consistency"/"Progress"/"Consistency
 * Score" pattern: a tinted card pairing one big number with a trailing
 * progress ring reflecting the same metric. See HeroCard's comment for
 * why layout here leans on inline style rather than Tailwind utilities.
 */
export const AnalyticsCard = React.forwardRef<
  HTMLDivElement,
  AnalyticsCardProps
>(
  (
    {
      icon,
      label,
      value,
      caption,
      progress,
      ringLabel,
      ringContent,
      tint = "blue",
      className,
      style,
      ...props
    },
    ref,
  ) => (
    <Card
      ref={ref}
      elevation="hero"
      style={{ padding: "1.25rem", backgroundColor: tintColor[tint], ...style }}
      className={cn(className)}
      {...props}
    >
      <div
        className="flex items-center justify-between"
        style={{ gap: "1rem" }}
      >
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "0.5rem" }}>
            {icon ? (
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted"
                style={{ height: "2.25rem", width: "2.25rem" }}
              >
                {icon}
              </span>
            ) : null}
            <Text size="sm" style={{ fontWeight: 600 }}>
              {label}
            </Text>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <NumberDisplay size="hero">{value}</NumberDisplay>
            {caption ? (
              <Text tone="muted" size="sm" style={{ marginTop: "0.25rem" }}>
                {caption}
              </Text>
            ) : null}
          </div>
        </div>

        <ProgressRing
          value={progress}
          label={ringLabel}
          size={100}
          strokeWidth={9}
          className="shrink-0"
        >
          {ringContent}
        </ProgressRing>
      </div>
    </Card>
  ),
);
AnalyticsCard.displayName = "AnalyticsCard";
