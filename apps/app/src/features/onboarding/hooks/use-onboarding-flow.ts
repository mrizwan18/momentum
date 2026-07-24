"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export const ONBOARDING_STEPS = [
  "splash",
  "intro1",
  "intro2",
  "intro3",
  "intro4",
  "form",
  "captureIntro",
  "recordingReady",
  "recording",
  "uploading",
  "analyzing",
  "result",
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface UseOnboardingFlowResult {
  step: OnboardingStep;
  /** Advances to the next step; from the last step, navigates to "/" instead. */
  next: () => void;
  /** No-ops on the first step. */
  back: () => void;
  canGoBack: boolean;
}

/**
 * A simple step-index state machine — the same shape as usePracticeSession,
 * just without any persisted/async state, since onboarding here is UI-only
 * (see the sprint's "do not touch repositories/stores" constraint). The
 * captured baseline recording is owned by `useBaselineRecording` instead —
 * this hook only ever needs to know which screen is current.
 */
export function useOnboardingFlow(): UseOnboardingFlowResult {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);

  const next = React.useCallback(() => {
    setIndex((current) => {
      if (current >= ONBOARDING_STEPS.length - 1) {
        router.push("/");
        return current;
      }
      return current + 1;
    });
  }, [router]);

  const back = React.useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  return {
    step: ONBOARDING_STEPS[index],
    next,
    back,
    canGoBack: index > 0,
  };
}
