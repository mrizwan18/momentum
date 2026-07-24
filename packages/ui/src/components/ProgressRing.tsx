"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface ProgressRingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 0-100. Omit to render an indeterminate/loading spinner. */
  value?: number;
  size?: number;
  strokeWidth?: number;
  /** Accessible name — e.g. "Today's score". */
  label?: string;
  /** Muted, inert rendering for when the value isn't currently meaningful. */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * docs/design/component-system.md: "Animated from previous value. Never
 * restart from zero unless first render." Framer Motion's `animate` prop
 * already tweens from whatever the ring currently shows, so re-renders with
 * a new `value` never reset to zero — only the very first mount does,
 * driven by `initial`.
 *
 * Position/display/stroke-color are inline style rather than Tailwind
 * utilities (`relative`, `inline-flex`, `absolute`, `inset-0`,
 * `stroke-border`, `stroke-primary` all silently fail to compile in this
 * project's production build — see Button.tsx's comment for the full
 * story).
 */
export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      size = 100,
      strokeWidth = 9,
      label = "Progress",
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const indeterminate = value === undefined;
    const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));
    const prefersReducedMotion = useReducedMotion();

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clamped / 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
        aria-disabled={disabled || undefined}
        className={cn(className)}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
        }}
        {...props}
      >
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          initial={{ rotate: -90 }}
          animate={
            indeterminate && !prefersReducedMotion ? { rotate: 270 } : undefined
          }
          transition={
            indeterminate
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : undefined
          }
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke="hsl(var(--palette-border))"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={
              disabled
                ? "hsl(var(--palette-text-muted))"
                : "hsl(var(--palette-primary))"
            }
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: indeterminate ? circumference * 0.75 : offset,
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              ease: [0, 0, 0.2, 1],
            }}
          />
        </motion.svg>
        {children ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);
ProgressRing.displayName = "ProgressRing";
