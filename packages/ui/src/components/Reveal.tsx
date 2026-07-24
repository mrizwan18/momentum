"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface RevealProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> {
  /** Delay before the entrance animation starts, in seconds — for staggering a sequence of Reveals. */
  delay?: number;
  /** "fade" (default) = a gentle rise, for ordinary appearance. "scale" = docs/design's "scale = achievement" language, for the one celebratory moment per flow. */
  variant?: "fade" | "scale";
}

/**
 * The one motion primitive feature code reaches for when "this element
 * should visibly arrive" instead of hard-cutting in. Framer Motion stays
 * owned entirely by packages/ui (PROJECT_RULES.md UI boundary); feature
 * code never imports framer-motion directly.
 */
export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(
  ({ delay = 0, variant = "fade", children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const initial =
      variant === "scale" ? { opacity: 0, scale: 0.85 } : { opacity: 0, y: 12 };
    const animate =
      variant === "scale" ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };

    return (
      <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
Reveal.displayName = "Reveal";
