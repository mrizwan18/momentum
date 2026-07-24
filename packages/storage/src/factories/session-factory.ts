import { generateId } from "@momentum/utils";
import {
  PracticeSessionSchema,
  type PracticeSessionRecord,
  type VoiceCondition,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreatePracticeSessionInput {
  exerciseIds: string[];
  skillId?: string | null;
  planId?: string | null;
  voiceCondition?: VoiceCondition | null;
  recoveryMode?: boolean;
}

export function createPracticeSession(
  input: CreatePracticeSessionInput,
): PracticeSessionRecord {
  const now = Date.now();
  return parseOrThrow(PracticeSessionSchema, "PracticeSession", {
    id: generateId(),
    status: "in_progress",
    skillId: input.skillId ?? null,
    planId: input.planId ?? null,
    exerciseIds: input.exerciseIds,
    currentStepIndex: 0,
    elapsedSeconds: 0,
    voiceCondition: input.voiceCondition ?? null,
    recoveryMode: input.recoveryMode ?? false,
    draftNotes: null,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  });
}
