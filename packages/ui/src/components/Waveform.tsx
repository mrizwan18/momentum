"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { radiusStyle } from "../lib/shape";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface WaveformProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Relative amplitude per bar, 0-1. Real audio data — never fabricated. */
  levels: number[];
  /** How far through the waveform playback/recording has progressed, 0-1. */
  progress?: number;
  /** Accessible name. */
  label: string;
  /** Gentle idle pulse per bar — use while actively recording/playing (docs/design/design-language.md "Pulse = active recording"). */
  active?: boolean;
}

/**
 * docs/design/PIXEL_SPEC.md B2: a played/unplayed two-opacity waveform —
 * bars up to the current position are full-opacity, the rest are muted.
 * Sizing/color are inline style rather than Tailwind utilities — see
 * HeroCard's comment for why.
 */
export const Waveform = React.forwardRef<HTMLDivElement, WaveformProps>(
  (
    { levels, progress = 0, label, active = false, className, ...props },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const scrubberIndex = Math.round(clampedProgress * (levels.length - 1));

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        style={{ height: "3rem", gap: "2px" }}
        className={cn("flex items-center", className)}
        {...props}
      >
        {levels.map((level, index) => {
          const height = Math.max(0.12, Math.min(1, level));
          const played = index <= scrubberIndex;
          const shouldPulse = active && !prefersReducedMotion;

          return (
            <motion.span
              key={index}
              aria-hidden="true"
              className="shrink-0"
              style={{
                ...radiusStyle.pill,
                width: "3px",
                height: `${height * 100}%`,
                backgroundColor: played
                  ? "hsl(var(--palette-primary))"
                  : "hsl(var(--palette-primary) / 0.35)",
              }}
              animate={shouldPulse ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
              transition={
                shouldPulse
                  ? {
                      duration: 0.6 + (index % 5) * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (index % 7) * 0.05,
                    }
                  : { duration: 0 }
              }
            />
          );
        })}
      </div>
    );
  },
);
Waveform.displayName = "Waveform";
