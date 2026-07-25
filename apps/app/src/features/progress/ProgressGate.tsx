"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/features/onboarding";
import { ProgressSkeleton, ProgressView } from "./ProgressView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via ProgressEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 * Mirrors DashboardGate's same onboarding-completion protection.
 */
export default function ProgressGate() {
  const router = useRouter();
  const status = useOnboardingStatus();

  React.useEffect(() => {
    if (status === "needs-onboarding") {
      router.replace("/onboarding");
    }
  }, [status, router]);

  if (status !== "completed") {
    return <ProgressSkeleton />;
  }
  return <ProgressView />;
}
