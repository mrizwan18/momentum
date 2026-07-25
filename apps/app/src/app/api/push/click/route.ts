import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getPushStore } from "@/lib/push/store";

const BodySchema = z.object({ notificationId: z.string().min(1) });

/** Marks a notification as clicked/read — called by the service worker's `notificationclick` handler. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  await getPushStore().markNotificationClicked(parsed.data.notificationId);
  return NextResponse.json({ ok: true });
}
