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

const DISMISS_STORAGE_KEY = "momentum-install-prompt-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  const dismissedAt = raw ? Number(raw) : NaN;
  return (
    Number.isFinite(dismissedAt) &&
    Date.now() - dismissedAt < DISMISS_COOLDOWN_MS
  );
}

/**
 * A single floating card — never a blocking modal — that appears only once
 * the browser actually offers an install (a real `beforeinstallprompt`,
 * never fabricated) and disappears for good once installed. Dismissing it
 * snoozes for a week rather than hiding it forever, so it stays
 * "eye-catching but not annoying" without nagging on every visit.
 */
export function InstallPwaPrompt() {
  const { status, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = React.useState(() =>
    wasRecentlyDismissed(),
  );

  if (status !== "available" || dismissed) {
    return null;
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
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
