"use client";

import dynamic from "next/dynamic";
import { ProgressSkeleton } from "./ProgressView";

/**
 * ProgressGate reads onboarding status + Dexie (IndexedDB), neither of
 * which exist during Next's server render. `ssr: false` skips that pass
 * entirely so it only ever mounts in the browser — same pattern as
 * DashboardEntry/OnboardingEntry/PracticeEntry.
 */
const ProgressGate = dynamic(() => import("./ProgressGate"), {
  ssr: false,
  loading: ProgressSkeleton,
});

export function ProgressEntry() {
  return <ProgressGate />;
}
