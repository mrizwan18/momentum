"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface CrossfadeProps {
  /** Changing this key triggers an exit/enter crossfade between children. */
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Crossfades between differently-keyed content in place — e.g. an Idle
 * card morphing into an inline choice, or one exercise handing off to the
 * next — instead of a hard DOM swap. `mode="wait"` lets the outgoing
 * content fully leave before the new content mounts, so differently-sized
 * content never overlaps mid-transition. Framer Motion stays owned by
 * packages/ui; feature code only ever changes `activeKey`.
 */
export function Crossfade({ activeKey, children, className }: CrossfadeProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.25;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
