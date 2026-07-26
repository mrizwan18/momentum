import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultAiGateway } from "@/ai/gateway";
import { AiUserContextSchema } from "@/ai/schemas";
import { ProgressInsightGenerationSchema } from "@/ai/schemas/generation-outputs";
import { respondWithGatewayResult } from "../shared";

const BodySchema = z.object({
  context: AiUserContextSchema,
  // Same shape as the final output minus the narrative `summary` field —
  // the client sends the already-computed numbers (baseline-comparison-
  // service.ts), the provider only narrates them.
  comparison: ProgressInsightGenerationSchema.omit({ summary: true }),
});

/** Sprint 9 "Baseline Comparison" narrative layer. */
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
    getDefaultAiGateway().generateProgressInsights({
      context: parsed.data.context,
      comparison: parsed.data.comparison,
    }),
  );
}
