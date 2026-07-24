"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";
import {
  radiusStyle,
  shadowStyle,
  tintColor,
  touchTargetStyle,
} from "../lib/shape";
import type { Tint } from "../lib/tint";
import { Card } from "./Card";
import { NumberDisplay, Text } from "./Typography";

export interface HeroCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  icon?: React.ReactNode;
  eyebrow: string;
  value: React.ReactNode;
  unit?: string;
  caption?: string;
  imageSrc?: string;
  imageAlt?: string;
  onAction?: () => void;
  actionLabel?: string;
  tint?: Tint;
}

/**
 * docs/design/PIXEL_SPEC.md B1 "Today's Practice" pattern: the one focal
 * card on a screen — tinted, hero-elevated, a big number, an optional
 * bleeding image, and an optional floating action button.
 *
 * Layout is driven almost entirely by inline style rather than Tailwind
 * utility classes. Direct inspection of this project's compiled
 * production stylesheet shows the vast majority of utilities beyond a
 * small, long-established core set (flex/items-center/font-semibold/...)
 * silently fail to compile — including plain padding/margin/position
 * utilities like `p-5`, `absolute`, and `relative`, not just custom ones.
 * This is a pre-existing build-tooling defect (documented in the final
 * summary), not something fixable from component code — inline style is
 * the only reliable lever available here.
 */
export const HeroCard = React.forwardRef<HTMLDivElement, HeroCardProps>(
  (
    {
      icon,
      eyebrow,
      value,
      unit,
      caption,
      imageSrc,
      imageAlt,
      onAction,
      actionLabel = "Open",
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
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "1.25rem",
        minHeight: imageSrc ? "13.5rem" : undefined,
        backgroundColor: tintColor[tint],
        ...style,
      }}
      className={cn(className)}
      {...props}
    >
      <div className="flex items-center" style={{ gap: "0.5rem" }}>
        {icon ? (
          <span aria-hidden="true" className="text-primary">
            {icon}
          </span>
        ) : null}
        <Text size="sm" className="font-medium">
          {eyebrow}
        </Text>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          maxWidth: imageSrc ? "55%" : undefined,
        }}
      >
        <div className="flex items-end" style={{ gap: "0.375rem" }}>
          <NumberDisplay size="hero">{value}</NumberDisplay>
          {unit ? (
            <Text tone="muted" size="sm">
              {unit}
            </Text>
          ) : null}
        </div>
        {caption ? (
          <Text tone="muted" size="sm" style={{ marginTop: "0.25rem" }}>
            {caption}
          </Text>
        ) : null}
      </div>

      {imageSrc ? (
        // Bleeds down the card's right side (docs/design/references/dashboard.png's
        // "Today's Practice" photo) rather than sitting as a small inline
        // chip — tall/portrait, anchored independently of the text block's
        // height so it isn't squeezed to the number+caption's shorter box.
        <img
          src={imageSrc}
          alt={imageAlt ?? ""}
          style={{
            ...radiusStyle.chip,
            position: "absolute",
            top: "0",
            right: "20%",
            bottom: "0",
            width: "60%",
            objectFit: "cover",
            objectPosition: "bottom",
          }}
        />
      ) : null}

      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          style={{
            ...shadowStyle.buttonPrimary,
            ...touchTargetStyle,
            position: "absolute",
            right: "1rem",
            bottom: "1rem",
            height: "52px",
            width: "52px",
          }}
          className={cn(
            "flex items-center justify-center rounded-full",
            "bg-primary text-primary-foreground",
            "transition-transform duration-fast ease-momentum active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
        </button>
      ) : null}
    </Card>
  ),
);
HeroCard.displayName = "HeroCard";
