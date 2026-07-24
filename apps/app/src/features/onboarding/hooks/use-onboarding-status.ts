"use client";

import * as React from "react";
import { useStorage } from "@/providers/storage-provider";

export type OnboardingStatus = "checking" | "needs-onboarding" | "completed";

/**
 * The single source of truth for "has this user finished onboarding" —
 * read by both the Dashboard entry (redirects to /onboarding when not
 * completed) and the Onboarding entry (redirects to / once it is), so the
 * app never shows one when the other is the right screen.
 */
export function useOnboardingStatus(): OnboardingStatus {
  const storage = useStorage();
  const [status, setStatus] = React.useState<OnboardingStatus>("checking");

  React.useEffect(() => {
    let cancelled = false;

    storage.users.get().then((user) => {
      if (cancelled) return;
      setStatus(user?.onboardingCompletedAt ? "completed" : "needs-onboarding");
    });

    return () => {
      cancelled = true;
    };
  }, [storage]);

  return status;
}
