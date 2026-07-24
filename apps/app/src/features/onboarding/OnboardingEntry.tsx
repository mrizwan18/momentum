"use client";

import dynamic from "next/dynamic";

/**
 * Same ssr:false pattern as DashboardEntry/PracticeEntry — this flow is
 * entirely interactive (timers, step state, forms, onboarding-status via
 * Dexie), no server render needed.
 */
const OnboardingGate = dynamic(() => import("./OnboardingGate"), {
  ssr: false,
});

/** "/onboarding" redirects straight to "/" once onboarding is already finished, instead of restarting it. */
export function OnboardingEntry() {
  return <OnboardingGate />;
}
