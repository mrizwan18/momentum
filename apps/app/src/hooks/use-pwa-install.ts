"use client";

import * as React from "react";

/** Chrome/Edge/Android's non-standard install-prompt event — no official lib.dom.d.ts type exists yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type PwaInstallStatus = "unavailable" | "available" | "installed";

export interface UsePwaInstallResult {
  status: PwaInstallStatus;
  /** Shows the browser's native install prompt. No-ops (resolves "unavailable") if the browser hasn't offered one yet. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as { standalone?: boolean })
    .standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    iosStandalone === true
  );
}

/**
 * Wraps the browser's `beforeinstallprompt` flow: capture the deferred
 * event, expose whether an install is offerable, and detect "already
 * installed" (both via the `appinstalled` event and, on load, via
 * display-mode/navigator.standalone) so a caller never needs to poll.
 */
export function usePwaInstall(): UsePwaInstallResult {
  const deferredRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = React.useState<PwaInstallStatus>(() =>
    isStandalone() ? "installed" : "unavailable",
  );

  React.useEffect(() => {
    if (isStandalone()) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setStatus("available");
    }
    function handleAppInstalled() {
      deferredRef.current = null;
      setStatus("installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = React.useCallback(async () => {
    const deferred = deferredRef.current;
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferredRef.current = null;
    setStatus(outcome === "accepted" ? "installed" : "unavailable");
    return outcome;
  }, []);

  return { status, promptInstall };
}
