import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultAiGateway } from "@/ai/gateway";
import { AiUserContextSchema } from "@/ai/schemas";
import { respondWithGatewayResult } from "../shared";

const BodySchema = z.object({
  context: AiUserContextSchema,
  date: z.string().min(1),
});

/** Sprint 9 "Dashboard AI" — cached/keyed by date so it refreshes at most once per day. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  return respondWithGatewayResult(() =>
    getDefaultAiGateway().generateDashboardInsight(
      { context: parsed.data.context },
      parsed.data.date,
    ),
  );
}
