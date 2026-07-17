import type { Variants } from "framer-motion";

/**
 * Mirrors the CSS custom properties in ../theme/tokens.css. Framer Motion
 * needs numeric seconds rather than CSS duration strings, so the values are
 * duplicated intentionally — keep both in sync if they ever change.
 */
export const MOTION_DURATIONS = {
  fast: 0.15,
  standard: 0.25,
  celebration: 0.5,
} as const;

export const MOTION_EASE = [0, 0, 0.2, 1] as const;

/** Fade = appearance (docs/design/design-language.md Motion Language). */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASE },
  },
};

/** Slide = navigation. */
export const slideVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASE },
  },
};

/** Scale = achievement. */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION_DURATIONS.celebration, ease: MOTION_EASE },
  },
};

/** Pulse = active recording. */
export const pulseVariants: Variants = {
  idle: { opacity: 1 },
  pulse: {
    opacity: [1, 0.6, 1],
    transition: {
      duration: MOTION_DURATIONS.standard,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
