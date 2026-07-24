"use client";

import * as React from "react";
import {
  Heading,
  MomentumMark,
  OnboardingBackdrop,
  ProgressBar,
  Text,
  useReducedMotion,
} from "@momentum/ui";

export interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_DURATION_MS = 2200;
const REDUCED_MOTION_DURATION_MS = 200;
const TICK_MS = 40;

/** Screen 01: brand mark, wordmark, and an auto-advancing progress bar. */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const duration = prefersReducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : SPLASH_DURATION_MS;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, onComplete]);

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 px-6"
      style={{ minHeight: "100dvh" }}
    >
      <OnboardingBackdrop />
      <MomentumMark size={56} />
      <div className="flex flex-col items-center gap-2">
        <Heading as="h1" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
          Momentum
        </Heading>
        <Text tone="muted">Your voice, your progress.</Text>
      </div>
      <div style={{ position: "absolute", bottom: "64px", width: "130px" }}>
        <ProgressBar value={progress} label="Loading" />
      </div>
    </div>
  );
}
