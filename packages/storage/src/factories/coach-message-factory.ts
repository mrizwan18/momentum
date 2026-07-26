import { generateId } from "@momentum/utils";
import {
  CoachMessageSchema,
  type AiProviderName,
  type CoachMessageRecord,
  type CoachMessageRole,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateCoachMessageInput {
  role: CoachMessageRole;
  message: string;
  suggestedExercises?: string[] | null;
  provider?: AiProviderName | null;
}

export function createCoachMessage(
  input: CreateCoachMessageInput,
): CoachMessageRecord {
  return parseOrThrow(CoachMessageSchema, "CoachMessage", {
    id: generateId(),
    role: input.role,
    message: input.message,
    suggestedExercises: input.suggestedExercises ?? null,
    provider: input.provider ?? null,
    createdAt: Date.now(),
  });
}
