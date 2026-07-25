import { getExistingPushDeviceId } from "@/hooks/use-push-subscription";
import type { EngagementSnapshot } from "@/hooks/use-push-subscription";

/**
 * Best-effort, fire-and-forget engagement sync — called after every
 * finished practice session so the server has fresh-enough streak/last-
 * practiced data to pick a relevant nudge. A no-op if this browser never
 * subscribed to push, and never throws (a failed sync must never affect
 * the practice flow itself — offline-first, sync is a nice-to-have).
 */
export function syncPushEngagement(engagement: EngagementSnapshot): void {
  const deviceId = getExistingPushDeviceId();
  if (!deviceId) return;

  fetch("/api/push/sync-engagement", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceId, ...engagement }),
  }).catch(() => {
    // Best-effort — offline or the request failing shouldn't surface anywhere.
  });
}
