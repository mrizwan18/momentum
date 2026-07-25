import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { pickTemplate, renderTemplate } from "@/lib/push/copy-bank";
import { decideNotification } from "@/lib/push/scheduler";
import { getPushStore } from "@/lib/push/store";
import { sendPush } from "@/lib/push/web-push-client";

/**
 * The Vercel Cron entry point (see vercel.json). Vercel automatically sends
 * `Authorization: Bearer $CRON_SECRET` on cron-triggered requests once
 * `CRON_SECRET` is set as a project env var — this rejects anything else,
 * so the endpoint can't be triggered by a random request to the URL.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = getPushStore();
  const subscribers = await store.listSubscribers();
  const now = Date.now();

  let sent = 0;
  let pruned = 0;
  let skipped = 0;

  for (const subscriber of subscribers) {
    const decision = decideNotification(subscriber, now);
    if (!decision.due) {
      skipped += 1;
      continue;
    }

    const template = pickTemplate(
      decision.context,
      subscriber.recentTemplateKeys,
    );
    const rendered = renderTemplate(template, {
      streak: subscriber.currentStreak,
    });
    const notificationId = randomUUID();
    const result = await sendPush(subscriber.subscription, {
      ...rendered,
      notificationId,
    });

    if (result.ok) {
      await store.recordNotification({
        id: notificationId,
        deviceId: subscriber.deviceId,
        templateKey: template.key,
        title: rendered.title,
        body: rendered.body,
        sentAt: now,
      });
      sent += 1;
    } else if (result.expired) {
      await store.deleteSubscriber(subscriber.deviceId);
      pruned += 1;
    } else {
      skipped += 1;
    }
  }

  return NextResponse.json({
    total: subscribers.length,
    sent,
    pruned,
    skipped,
  });
}
