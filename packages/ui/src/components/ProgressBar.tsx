"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface ProgressBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 0-100. */
  value: number;
  /** Accessible name — e.g. "Session progress". */
  label: string;
  /** Muted, inert rendering for when the value isn't currently meaningful. */
  disabled?: boolean;
}

/**
 * A linear progress indicator that eases toward its new value instead of
 * hard-cutting (docs/design/component-system.md: "animated from previous
 * value"). Used for continuous, in-flow progress (a session, a queue) —
 * see ProgressRing for a discrete/decorative circular readout.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, label, disabled = false, className, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));
    const prefersReducedMotion = useReducedMotion();

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-disabled={disabled || undefined}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-surface-raised",
          className,
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            disabled ? "bg-foreground-muted" : "bg-primary",
          )}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
