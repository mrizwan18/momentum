"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { chartColor, radiusStyle } from "../lib/shape";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface BarChartDatum {
  label: string;
  value: number;
  /** Highlights this bar in the active/peak color instead of the muted inactive tone. */
  active?: boolean;
}

export interface BarChartProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  data: BarChartDatum[];
  /** Accessible name for the chart as a whole. */
  label: string;
  /** Scales bar heights; defaults to the largest value in `data`. */
  maxValue?: number;
}

/**
 * docs/design/PIXEL_SPEC.md B1 (streak) / B3 (weekly overview): rounded
 * capsule bars, muted by default, with only the active/peak day(s) taking
 * the brand color — the same shape used for both screens' bar charts.
 *
 * The bar track and the label row are two separate fixed-height rows
 * (rather than one row per bar) so each bar's percentage height always
 * resolves against a definite-height ancestor instead of a flex item
 * whose own size depends on its shrink-wrapped label sibling.
 */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ data, label, maxValue, className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const max = maxValue ?? Math.max(1, ...data.map((datum) => datum.value));

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        <div
          style={{ height: "128px" }}
          className="flex items-end justify-between gap-3"
        >
          {data.map((bar, index) => {
            const heightPercent =
              bar.value <= 0
                ? 4
                : Math.max(4, Math.min(100, (bar.value / max) * 100));

            return (
              <div
                key={`${bar.label}-${index}`}
                style={{ height: "100%" }}
                className="flex flex-1 items-end justify-center"
              >
                <motion.div
                  style={{
                    width: "0.75rem",
                    ...radiusStyle.pill,
                    backgroundColor: bar.active
                      ? chartColor.active
                      : chartColor.inactive,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    delay: prefersReducedMotion ? 0 : index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-3">
          {data.map((bar, index) => (
            <span
              key={`${bar.label}-${index}`}
              className="flex-1 text-center text-xs font-medium text-foreground-muted"
            >
              {bar.label}
            </span>
          ))}
        </div>
      </div>
    );
  },
);
BarChart.displayName = "BarChart";
