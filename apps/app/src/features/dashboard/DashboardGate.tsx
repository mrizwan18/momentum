"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useOnboardingStatus,
  usePendingBaselineAssessment,
} from "@/features/onboarding";
import { DashboardSkeleton, DashboardView } from "./DashboardView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via DashboardEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 * Also catches up any baseline assessment left queued from an offline
 * onboarding completion (Sprint 9 "Offline Behavior") — a no-op otherwise.
 * Practice-session AI analysis is opt-in only (see the Session Summary
 * screen's "Analyze with AI" button), so there is no equivalent background
 * catch-up for it.
 */
export default function DashboardGate() {
  const router = useRouter();
  const status = useOnboardingStatus();
  usePendingBaselineAssessment();

  React.useEffect(() => {
    if (status === "needs-onboarding") {
      router.replace("/onboarding");
    }
  }, [status, router]);

  if (status !== "completed") {
    return <DashboardSkeleton />;
  }
  return <DashboardView />;
}
