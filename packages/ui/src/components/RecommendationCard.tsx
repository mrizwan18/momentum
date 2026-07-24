"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { radiusStyle, tintColor } from "../lib/shape";
import type { Tint } from "../lib/tint";
import { Card } from "./Card";
import { Text } from "./Typography";

export interface RecommendationCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  icon: React.ReactNode;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  tint?: Tint;
}

/**
 * docs/design/PIXEL_SPEC.md B5 recommendation row: an icon chip, gray
 * body copy (the consumer can bold specific words via inline markup),
 * and a trailing chevron button — never more than one action per row.
 */
export const RecommendationCard = React.forwardRef<
  HTMLDivElement,
  RecommendationCardProps
>(
  (
    {
      icon,
      children,
      onAction,
      actionLabel = "View recommendation",
      tint = "purple",
      className,
      ...props
    },
    ref,
  ) => (
    <Card
      ref={ref}
      style={{ padding: "1rem" }}
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        style={{
          ...radiusStyle.chip,
          backgroundColor: tintColor[tint],
          height: "2.5rem",
          width: "2.5rem",
        }}
        className="flex shrink-0 items-center justify-center"
      >
        {icon}
      </span>
      <Text size="sm" tone="muted" className="flex-1">
        {children}
      </Text>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-muted",
            "transition-colors duration-fast ease-momentum hover:bg-surface-raised hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}
    </Card>
  ),
);
RecommendationCard.displayName = "RecommendationCard";
