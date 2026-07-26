"use client";

import dynamic from "next/dynamic";
import { CoachSkeleton } from "./CoachView";

/**
 * CoachGate reads onboarding status + Dexie (IndexedDB), neither of which
 * exist during Next's server render. `ssr: false` skips that pass entirely
 * so it only ever mounts in the browser — same pattern as
 * DashboardEntry/ProgressEntry/OnboardingEntry/PracticeEntry.
 */
const CoachGate = dynamic(() => import("./CoachGate"), {
  ssr: false,
  loading: CoachSkeleton,
});

export function CoachEntry() {
  return <CoachGate />;
}
