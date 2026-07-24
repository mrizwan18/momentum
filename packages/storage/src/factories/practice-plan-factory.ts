import { generateId } from "@momentum/utils";
import { PracticePlanSchema, type PracticePlanRecord } from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreatePracticePlanInput {
  skillId: string;
  title: string;
  description?: string;
  exerciseIds: string[];
  targetDurationSeconds: number;
  isRecoveryPlan?: boolean;
}

export function createPracticePlan(
  input: CreatePracticePlanInput,
): PracticePlanRecord {
  return parseOrThrow(PracticePlanSchema, "PracticePlan", {
    id: generateId(),
    skillId: input.skillId,
    title: input.title,
    description: input.description ?? "",
    exerciseIds: input.exerciseIds,
    targetDurationSeconds: input.targetDurationSeconds,
    isRecoveryPlan: input.isRecoveryPlan ?? false,
    createdAt: Date.now(),
  });
}
