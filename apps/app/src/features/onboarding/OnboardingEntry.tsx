"use client";

import dynamic from "next/dynamic";

/**
 * Same ssr:false pattern as DashboardEntry/PracticeEntry — this flow is
 * entirely interactive (timers, step state, forms), no server render needed.
 */
const OnboardingView = dynamic(
  () => import("./OnboardingView").then((mod) => mod.OnboardingView),
  { ssr: false },
);

export function OnboardingEntry() {
  return <OnboardingView />;
}
