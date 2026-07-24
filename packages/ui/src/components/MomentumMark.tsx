import * as React from "react";
import { cn } from "../lib/cn";

export interface MomentumMarkProps extends Omit<
  React.SVGAttributes<SVGSVGElement>,
  "viewBox"
> {
  size?: number;
}

/**
 * The brand mark used on Splash and the "Let's get to know you" screen: a
 * static 5-bar equalizer glyph. Deliberately NOT the existing `Waveform`
 * component — that one renders real audio levels ("never fabricated");
 * this is a fixed decorative logo, so it's its own tiny static SVG.
 */
export const MomentumMark = React.forwardRef<SVGSVGElement, MomentumMarkProps>(
  ({ size = 48, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Momentum"
      className={cn(className)}
      {...props}
    >
      <rect
        x="3"
        y="18"
        width="5"
        height="12"
        rx="2.5"
        fill="hsl(var(--palette-primary))"
      />
      <rect
        x="12.5"
        y="10"
        width="5"
        height="28"
        rx="2.5"
        fill="hsl(var(--palette-primary))"
      />
      <rect
        x="22"
        y="4"
        width="5"
        height="40"
        rx="2.5"
        fill="hsl(var(--palette-primary))"
      />
      <rect
        x="31.5"
        y="10"
        width="5"
        height="28"
        rx="2.5"
        fill="hsl(var(--palette-primary))"
      />
      <rect
        x="41"
        y="18"
        width="5"
        height="12"
        rx="2.5"
        fill="hsl(var(--palette-primary))"
      />
    </svg>
  ),
);
MomentumMark.displayName = "MomentumMark";
