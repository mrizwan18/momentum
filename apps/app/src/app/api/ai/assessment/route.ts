import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultAiGateway } from "@/ai/gateway";
import { AiUserContextSchema } from "@/ai/schemas";
import { respondWithGatewayResult } from "../shared";

const BodySchema = z.object({
  context: AiUserContextSchema,
  recordingId: z.string().min(1),
  recordingDurationMs: z.number().nonnegative(),
});

/** Sprint 9 "AI During Onboarding" — generates the Initial Vocal Assessment. */
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
    getDefaultAiGateway().generateAssessment(
      {
        context: parsed.data.context,
        recordingDurationMs: parsed.data.recordingDurationMs,
      },
      parsed.data.recordingId,
    ),
  );
}
