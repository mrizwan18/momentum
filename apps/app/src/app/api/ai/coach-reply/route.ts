import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultAiGateway } from "@/ai/gateway";
import { AiUserContextSchema } from "@/ai/schemas";
import { respondWithGatewayResult } from "../shared";

const BodySchema = z.object({
  context: AiUserContextSchema,
  message: z.string().min(1),
});

/** Sprint 9 "AI Coach Screen" — conversational, never cached (see ai-gateway.ts). */
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
    getDefaultAiGateway().generateCoachReply({
      context: parsed.data.context,
      message: parsed.data.message,
    }),
  );
}
