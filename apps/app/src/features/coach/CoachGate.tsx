"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/features/onboarding";
import { CoachSkeleton, CoachView } from "./CoachView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via CoachEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 * Mirrors DashboardGate/ProgressGate's same onboarding-completion protection.
 */
export default function CoachGate() {
  const router = useRouter();
  const status = useOnboardingStatus();

  React.useEffect(() => {
    if (status === "needs-onboarding") {
      router.replace("/onboarding");
    }
  }, [status, router]);

  if (status !== "completed") {
    return <CoachSkeleton />;
  }
  return <CoachView />;
}
