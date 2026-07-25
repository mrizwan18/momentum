import webpush, { WebPushError } from "web-push";
import type { PushSubscriptionJSON } from "./types";

let vapidConfigured = false;

function ensureVapidConfigured(): void {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@example.com";
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY are not set — push notifications can't be sent. Generate a keypair with web-push.generateVAPIDKeys() and add it to your environment.",
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export type SendPushResult =
  { ok: true } | { ok: false; expired: boolean; error: string };

/**
 * Sends one push message, reporting whether the subscription is expired/
 * invalid (404/410) so the caller can prune it from the store instead of
 * retrying forever.
 */
export async function sendPush(
  subscription: PushSubscriptionJSON,
  payload: { title: string; body: string; notificationId: string },
): Promise<SendPushResult> {
  ensureVapidConfigured();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    if (error instanceof WebPushError) {
      const expired = error.statusCode === 404 || error.statusCode === 410;
      return { ok: false, expired, error: error.message };
    }
    return {
      ok: false,
      expired: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
