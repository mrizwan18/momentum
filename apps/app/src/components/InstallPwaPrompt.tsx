"use client";

import * as React from "react";
import { Download, X } from "lucide-react";
import {
  Button,
  MomentumMark,
  Reveal,
  Text,
  shadowStyle,
  triggerHaptic,
} from "@momentum/ui";
import { usePwaInstall } from "@/hooks/use-pwa-install";

const SESSION_DISMISS_KEY = "momentum-install-prompt-dismissed";

function wasDismissedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
}

/**
 * A single floating card — never a blocking modal — that appears only once
 * the browser actually offers an install (a real `beforeinstallprompt`,
 * never fabricated) and disappears for good once installed. Dismissing it
 * only silences it for the rest of this browser session (sessionStorage,
 * not localStorage) — it comes back the next time the user opens the app,
 * so it keeps converting without nagging mid-session on every action.
 */
export function InstallPwaPrompt() {
  const { status, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = React.useState(() =>
    wasDismissedThisSession(),
  );

  if (status !== "available" || dismissed) {
    return null;
  }

  function handleDismiss() {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    triggerHaptic("tap");
    const outcome = await promptInstall();
    if (outcome === "dismissed") {
      handleDismiss();
    }
  }

  return (
    <Reveal
      variant="scale"
      style={{
        position: "fixed",
        left: "1rem",
        right: "1rem",
        bottom: "5.5rem",
        zIndex: 40,
        ...shadowStyle.hero,
      }}
      className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-surface p-4"
    >
      <MomentumMark size={36} />
      <div className="flex flex-1 flex-col gap-0.5">
        <Text size="sm" style={{ fontWeight: 600 }}>
          Install Momentum
        </Text>
        <Text tone="muted" size="sm">
          Add to your home screen for the full app experience.
        </Text>
      </div>
      <Button className="gap-1.5 text-sm font-semibold" onClick={handleInstall}>
        <Download aria-hidden="true" className="h-4 w-4" />
        Install
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Dismiss install prompt"
        onClick={handleDismiss}
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </Button>
    </Reveal>
  );
}
