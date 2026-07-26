import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultAiGateway } from "@/ai/gateway";
import { AiAudioPartSchema, AiUserContextSchema } from "@/ai/schemas";
import { respondWithGatewayResult } from "../shared";

const BodySchema = z.object({
  context: AiUserContextSchema,
  session: z.object({
    sessionId: z.string().min(1),
    elapsedSeconds: z.number().nonnegative(),
    exercisesCompleted: z.number().int().nonnegative(),
    dailyScore: z.number().nullable(),
  }),
  /** Every recording the user opted to have analyzed for this session. */
  audio: z.array(AiAudioPartSchema).optional(),
});

/**
 * Sprint 9 "Practice Session AI" — opt-in only (the client never calls this
 * automatically on session completion; the user must tap "Analyze with AI").
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

  return respondWithGatewayResult(() =>
    getDefaultAiGateway().generateSessionSummary(
      {
        context: parsed.data.context,
        session: parsed.data.session,
        audio: parsed.data.audio,
      },
      parsed.data.session.sessionId,
    ),
  );
}
