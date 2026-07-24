"use client";

import { ArrowRight } from "lucide-react";
import { cn, ProgressDots, shadowStyle } from "@momentum/ui";

export interface OnboardingFooterProps {
  dotsCount: number;
  activeIndex: number;
  onNext: () => void;
  nextLabel?: string;
}

/**
 * The floating white bar shared by screens 02/03/04: progress dots on the
 * left, a circular primary "next" FAB on the right.
 */
export function OnboardingFooter({
  dotsCount,
  activeIndex,
  onNext,
  nextLabel = "Continue",
}: OnboardingFooterProps) {
  return (
    <div
      style={{ borderRadius: "1.75rem", ...shadowStyle.hero }}
      className="flex items-center justify-between bg-surface p-4"
    >
      <ProgressDots
        count={dotsCount}
        activeIndex={activeIndex}
        label="Onboarding step"
      />
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        style={{ height: "56px", width: "56px", ...shadowStyle.buttonPrimary }}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground",
          "transition-transform duration-fast ease-momentum active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
