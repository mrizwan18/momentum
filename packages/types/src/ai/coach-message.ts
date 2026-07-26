import { z } from "zod";
import { AI_PROVIDER_NAMES } from "./shared";

export const COACH_MESSAGE_ROLES = ["user", "coach"] as const;
export type CoachMessageRole = (typeof COACH_MESSAGE_ROLES)[number];

/** A single turn in the Coach conversation — persisted so "coach history" can feed back in as AI context (Sprint 9 "AI Memory"). */
export const CoachMessageSchema = z.object({
  id: z.string(),
  role: z.enum(COACH_MESSAGE_ROLES),
  message: z.string().min(1),
  suggestedExercises: z.array(z.string()).nullable(),
  /** null for the user's own messages — only coach replies have a generating provider. */
  provider: z.enum(AI_PROVIDER_NAMES).nullable(),
  createdAt: z.number(),
});

export type CoachMessageRecord = z.infer<typeof CoachMessageSchema>;
