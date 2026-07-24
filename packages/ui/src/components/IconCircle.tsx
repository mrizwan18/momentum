import * as React from "react";
import { cn } from "../lib/cn";
import { tintColor } from "../lib/shape";
import type { Tint } from "../lib/tint";

export interface IconCircleProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: React.ReactNode;
  /** Diameter in px. */
  size?: number;
  tint?: Tint | "surface";
}

/**
 * A circular icon chip — the repeated "icon in a tinted circle" shape used
 * across the AI Coach card row, the form's back button, and Splash/"know
 * you"'s brand-mark badge. Decorative by default (`aria-hidden`); pass
 * `aria-label`/`role` via props when the icon itself is meaningful.
 */
export const IconCircle = React.forwardRef<HTMLSpanElement, IconCircleProps>(
  ({ icon, size = 44, tint = "surface", className, style, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      style={{
        height: `${size}px`,
        width: `${size}px`,
        backgroundColor:
          tint === "surface" ? "hsl(var(--palette-surface))" : tintColor[tint],
        ...style,
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {icon}
    </span>
  ),
);
IconCircle.displayName = "IconCircle";
