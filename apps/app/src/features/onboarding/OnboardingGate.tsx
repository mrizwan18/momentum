"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "./hooks/use-onboarding-status";
import { OnboardingView } from "./OnboardingView";

/**
 * Holds the actual onboarding-status/storage hooks — only ever mounted
 * client-side via OnboardingEntry's `ssr: false` import, since useStorage()
 * throws when there's no <StorageProvider> (i.e. during server render).
 */
export default function OnboardingGate() {
  const router = useRouter();
  const status = useOnboardingStatus();

  React.useEffect(() => {
    if (status === "completed") {
      router.replace("/");
    }
  }, [status, router]);

  if (status !== "needs-onboarding") {
    return null;
  }
  return <OnboardingView />;
}
