import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getPushStore } from "@/lib/push/store";

const BodySchema = z.object({
  deviceId: z.string().min(1),
  currentStreak: z.number().int().nonnegative(),
  lastPracticedDate: z.string().nullable(),
});

/**
 * Fire-and-forget engagement snapshot sent after each finished practice
 * session, so `send-daily` has fresh-enough streak/last-practiced data to
 * pick a relevant message. A no-op if this device never subscribed to
 * notifications (most sessions, most of the time) — not an error.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const store = getPushStore();
  const existing = await store.getSubscriber(parsed.data.deviceId);
  if (!existing) {
    return NextResponse.json({ ok: true, subscribed: false });
  }

  await store.upsertSubscriber({
    deviceId: existing.deviceId,
    subscription: existing.subscription,
    currentStreak: parsed.data.currentStreak,
    lastPracticedDate: parsed.data.lastPracticedDate,
  });
  return NextResponse.json({ ok: true, subscribed: true });
}
