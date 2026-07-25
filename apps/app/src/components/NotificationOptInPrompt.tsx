"use client";

import * as React from "react";
import { Bell, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Reveal,
  Text,
  triggerHaptic,
} from "@momentum/ui";
import {
  usePushSubscription,
  type EngagementSnapshot,
} from "@/hooks/use-push-subscription";

const SESSION_DISMISS_KEY = "momentum-notification-prompt-dismissed";

function wasDismissedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
}

export interface NotificationOptInPromptProps {
  engagement: EngagementSnapshot;
}

/**
 * Shown right after finishing a session — a positive, rewarding moment to
 * ask "want a nudge to keep this going?" instead of nagging on every page
 * load. Session-scoped dismiss (sessionStorage), same cadence philosophy as
 * InstallPwaPrompt: reappears next session if still undecided, gone for
 * good once subscribed or the browser permission is permanently denied
 * (nothing more we can do there without the user changing browser settings).
 */
export function NotificationOptInPrompt({
  engagement,
}: NotificationOptInPromptProps) {
  const { status, subscribe } = usePushSubscription();
  const [dismissed, setDismissed] = React.useState(() =>
    wasDismissedThisSession(),
  );

  if (
    status === "unsupported" ||
    status === "subscribed" ||
    status === "denied" ||
    dismissed
  ) {
    return null;
  }

  function handleDismiss() {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleEnable() {
    triggerHaptic("tap");
    const granted = await subscribe(engagement);
    if (!granted) {
      handleDismiss();
    }
  }

  return (
    <Reveal delay={0.4}>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="rounded-full bg-primary/10 p-3">
            <Bell aria-hidden="true" className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <Text size="sm" style={{ fontWeight: 600 }}>
              Never lose your streak
            </Text>
            <Text tone="muted" size="sm">
              We&apos;ll send the occasional (fun, never naggy) nudge if
              you&apos;re about to miss a day.
            </Text>
          </div>
          <Button className="text-sm font-semibold" onClick={handleEnable}>
            Enable
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss notification prompt"
            onClick={handleDismiss}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  );
}
