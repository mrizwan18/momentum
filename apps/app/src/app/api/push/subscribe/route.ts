import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getPushStore } from "@/lib/push/store";
import { PushSubscriptionJSONSchema } from "@/lib/push/types";

const BodySchema = z.object({
  deviceId: z.string().min(1),
  subscription: PushSubscriptionJSONSchema,
  currentStreak: z.number().int().nonnegative(),
  lastPracticedDate: z.string().nullable(),
});

/** Saves (or refreshes) a device's push subscription — called once notification permission is granted. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const record = await getPushStore().upsertSubscriber(parsed.data);
  return NextResponse.json({ deviceId: record.deviceId });
}
