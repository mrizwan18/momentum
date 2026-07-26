import { z } from "zod";

/** Request-body validation for a real recording attached to an assessment/session-summary call — mirrors AiAudioPart (src/ai/types). */
export const AiAudioPartSchema = z.object({
  base64: z.string().min(1),
  format: z.literal("wav"),
  durationSeconds: z.number().nonnegative(),
  truncated: z.boolean(),
  exerciseLabel: z.string().nullable().optional(),
});
