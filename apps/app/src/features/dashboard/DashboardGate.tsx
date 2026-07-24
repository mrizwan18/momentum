"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/features/onboarding";
import { DashboardSkeleton, DashboardView } from "./DashboardView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via DashboardEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 */
export default function DashboardGate() {
  const router = useRouter();
  const status = useOnboardingStatus();

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
