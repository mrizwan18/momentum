"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * True when the user has requested reduced motion. framer-motion's own
 * hook already reads `prefers-reduced-motion` and stays SSR-safe; this
 * wrapper just gives the design system a stable, local import path.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
