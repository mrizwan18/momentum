import { NextResponse } from "next/server";
import { AiUnavailableError } from "@/ai/types";

/** Shared response wrapper for every /api/ai/* route — a 503 for AiUnavailableError, otherwise re-thrown. */
export async function respondWithGatewayResult<T>(
  run: () => Promise<T>,
): Promise<NextResponse> {
  try {
    const result = await run();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
