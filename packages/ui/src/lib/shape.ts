/**
 * Inline-style fallbacks for tokens that Tailwind v4's utility generator
 * unreliably compiles in this project (confirmed via direct inspection of
 * the built stylesheet: `shadow-*`, `rounded-pill`, `rounded-chip`,
 * `rounded-card`, and every new `bg-tint-*`/`bg-chart-*` utility go
 * missing from production output even after a clean rebuild, while
 * `rounded-hero`/`rounded-control` and pre-existing colors compile fine).
 * These read the same CSS custom properties Tailwind was supposed to
 * wire up, just via `style` instead of a class, so they can't go missing.
 */
import type { Tint } from "./tint";

export const radiusStyle = {
  pill: { borderRadius: "var(--shape-radius-pill)" },
  card: { borderRadius: "var(--shape-radius-card)" },
  chip: { borderRadius: "var(--shape-radius-chip)" },
} as const;

/** `min-h-touch`/`min-w-touch` (44px WCAG touch target) are also affected. */
export const touchTargetStyle = {
  minHeight: "var(--palette-touch-target-min)",
  minWidth: "var(--palette-touch-target-min)",
} as const;

export const shadowStyle = {
  card: { boxShadow: "var(--shape-shadow-card)" },
  hero: { boxShadow: "var(--shape-shadow-hero)" },
  nav: { boxShadow: "var(--shape-shadow-nav)" },
  buttonPrimary: { boxShadow: "var(--shape-shadow-button-primary)" },
  iconChip: { boxShadow: "var(--shape-shadow-icon-chip)" },
} as const;

export const tintColor: Record<Tint, string> = {
  blue: "hsl(var(--palette-tint-blue))",
  peach: "hsl(var(--palette-tint-peach))",
  pink: "hsl(var(--palette-tint-pink))",
  green: "hsl(var(--palette-tint-green))",
  purple: "hsl(var(--palette-tint-purple))",
};

export const chartColor = {
  active: "hsl(var(--palette-chart-active))",
  inactive: "hsl(var(--palette-chart-inactive))",
  track: "hsl(var(--palette-chart-track))",
} as const;
