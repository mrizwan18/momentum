import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getPushStore } from "@/lib/push/store";

const BodySchema = z.object({ deviceId: z.string().min(1) });

/** Removes a device's push subscription — called when the user disables notifications. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  await getPushStore().deleteSubscriber(parsed.data.deviceId);
  return NextResponse.json({ ok: true });
}
