import * as React from "react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * A single decorative loading block. Purely visual — announce loading state
 * once per group via <SkeletonGroup>, not once per block.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-raised", className)}
      {...props}
    />
  );
}

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/**
 * Wraps one or more <Skeleton> blocks and announces a single "Loading"
 * status to assistive tech (docs/design/design-language.md: skeletons over
 * spinners).
 */
export function SkeletonGroup({
  label = "Loading",
  children,
  ...props
}: SkeletonGroupProps) {
  return (
    <div role="status" aria-live="polite" {...props}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </div>
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

/** A composed block of skeleton text lines, the last one shorter. */
export function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export interface SkeletonCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

/** A circular skeleton block, e.g. for an avatar or icon placeholder. */
export function SkeletonCircle({
  size = 40,
  className,
  style,
  ...props
}: SkeletonCircleProps) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}
