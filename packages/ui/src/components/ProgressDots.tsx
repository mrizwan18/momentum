import * as React from "react";
import { cn } from "../lib/cn";

export interface ProgressDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  /** 0-based. */
  activeIndex: number;
  /** Accessible name prefix — e.g. "Onboarding step". */
  label?: string;
}

/**
 * A carousel step indicator — discrete dots, not a continuous fill (see
 * `ProgressBar` for that case). The active dot is `--palette-primary`;
 * every other dot is `--palette-border`.
 */
export const ProgressDots = React.forwardRef<HTMLDivElement, ProgressDotsProps>(
  ({ count, activeIndex, label = "Progress", className, ...props }, ref) => (
    <div
      ref={ref}
      role="img"
      aria-label={`${label}: step ${activeIndex + 1} of ${count}`}
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          style={{
            height: "8px",
            width: "8px",
            borderRadius: "999px",
            backgroundColor:
              index === activeIndex
                ? "hsl(var(--palette-primary))"
                : "hsl(var(--palette-border))",
          }}
        />
      ))}
    </div>
  ),
);
ProgressDots.displayName = "ProgressDots";
