"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useOnboardingStatus,
  usePendingBaselineAssessment,
} from "@/features/onboarding";
import { usePendingSessionInsights } from "@/features/summary";
import { DashboardSkeleton, DashboardView } from "./DashboardView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via DashboardEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 * Also catches up any baseline assessment or session insight left queued
 * from an offline completion (Sprint 9 "Offline Behavior") — a no-op
 * otherwise.
 */
export default function DashboardGate() {
  const router = useRouter();
  const status = useOnboardingStatus();
  usePendingBaselineAssessment();
  usePendingSessionInsights();

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
