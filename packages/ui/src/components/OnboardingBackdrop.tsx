import * as React from "react";
import { Music } from "lucide-react";
import { cn } from "../lib/cn";

export interface OnboardingBackdropProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Purely decorative backdrop for Splash and "Let's get to know you":
 * faint wavy lines + a few floating music-note glyphs in the upper area.
 * `aria-hidden` — it carries no information, screen readers should skip it.
 */
export const OnboardingBackdrop = React.forwardRef<
  HTMLDivElement,
  OnboardingBackdropProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      "pointer-events-none absolute inset-x-0 top-0 overflow-hidden",
      className,
    )}
    style={{ height: "340px" }}
    {...props}
  >
    <svg
      width="100%"
      height="180"
      viewBox="0 0 390 180"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: "140px", left: 0 }}
    >
      <path
        d="M-20 100 C 60 60, 120 140, 200 90 S 340 60, 420 110"
        stroke="hsl(var(--palette-primary) / 0.16)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M-20 120 C 60 80, 120 160, 200 110 S 340 80, 420 130"
        stroke="hsl(var(--palette-primary) / 0.1)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M-20 140 C 60 100, 120 180, 200 130 S 340 100, 420 150"
        stroke="hsl(var(--palette-primary) / 0.06)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
    <Music
      aria-hidden="true"
      className="absolute h-5 w-5"
      style={{
        top: "80px",
        left: "56px",
        color: "hsl(var(--palette-primary) / 0.3)",
      }}
    />
    <Music
      aria-hidden="true"
      className="absolute h-4 w-4"
      style={{
        top: "130px",
        left: "30px",
        color: "hsl(var(--palette-primary) / 0.22)",
      }}
    />
    <Music
      aria-hidden="true"
      className="absolute h-5 w-5"
      style={{
        top: "78px",
        right: "48px",
        color: "hsl(var(--palette-primary) / 0.3)",
      }}
    />
  </div>
));
OnboardingBackdrop.displayName = "OnboardingBackdrop";
