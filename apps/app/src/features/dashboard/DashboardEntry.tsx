"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "./DashboardView";

/**
 * DashboardGate reads onboarding status + Dexie (IndexedDB), neither of
 * which exist during Next's server render. `ssr: false` skips that pass
 * entirely so it only ever mounts in the browser; the loading fallback
 * reuses the same skeleton DashboardView shows once it *is* mounted but
 * still waiting on Dexie, so there's no visual seam between the two.
 */
const DashboardGate = dynamic(() => import("./DashboardGate"), {
  ssr: false,
  loading: DashboardSkeleton,
});

/** "/" is only ever the Dashboard once onboarding is finished — otherwise it redirects to "/onboarding". */
export function DashboardEntry() {
  return <DashboardGate />;
}
