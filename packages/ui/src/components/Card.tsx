"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { radiusStyle, shadowStyle } from "../lib/shape";
import { SkeletonText } from "./Skeleton";

/**
 * docs/design/PIXEL_SPEC.md A2/A6: cards are borderless — separation from
 * the page comes from shadow + surface tone, never a hairline border.
 *
 * Radius/shadow are applied via inline style (backed by the same CSS
 * custom properties as everything else) rather than Tailwind utility
 * classes — `rounded-card`/`shadow-card`/`shadow-hero` don't reliably
 * compile in this project's production build (see lib/shape.ts).
 * `rounded-hero` itself does compile, but its shadow doesn't, so "hero"
 * still needs an inline style for the shadow half.
 */
type CardElevation = "flat" | "raised" | "hero";

const elevationClassName: Record<CardElevation, string> = {
  flat: "bg-surface",
  raised: "bg-surface",
  hero: "rounded-hero bg-surface",
};

const elevationInlineStyle: Record<CardElevation, React.CSSProperties> = {
  flat: { borderRadius: radiusStyle.card.borderRadius },
  raised: {
    borderRadius: radiusStyle.card.borderRadius,
    boxShadow: shadowStyle.card.boxShadow,
  },
  hero: { boxShadow: shadowStyle.hero.boxShadow },
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Replaces children with skeleton placeholders while content loads. */
  loading?: boolean;
  /** Visually and functionally locks the card (e.g. a locked roadmap chapter). */
  disabled?: boolean;
  /** Visual weight — "hero" is reserved for the single focal element per screen. */
  elevation?: CardElevation;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      style,
      loading = false,
      disabled = false,
      elevation = "raised",
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      style={{ ...elevationInlineStyle[elevation], ...style }}
      className={cn(
        "text-foreground",
        elevationClassName[elevation],
        "transition-[opacity,box-shadow,border-color] duration-standard ease-momentum",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <div className="p-6">
          <SkeletonText lines={3} />
        </div>
      ) : (
        children
      )}
    </div>
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Defaults to h3 — pass "h2" when a card is a top-level page section. */
  as?: "h2" | "h3" | "h4";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as = "h3", className, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        className={cn("text-lg leading-none font-semibold", className)}
        {...props}
      />
    );
  },
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
