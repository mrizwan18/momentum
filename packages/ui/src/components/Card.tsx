"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { SkeletonText } from "./Skeleton";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Replaces children with skeleton placeholders while content loads. */
  loading?: boolean;
  /** Visually and functionally locks the card (e.g. a locked roadmap chapter). */
  disabled?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, loading = false, disabled = false, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "rounded-xl border border-border bg-surface text-foreground shadow-sm",
        "transition-opacity duration-standard ease-momentum",
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
