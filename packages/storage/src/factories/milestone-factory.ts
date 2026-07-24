import { generateId } from "@momentum/utils";
import {
  MilestoneSchema,
  type MilestoneRecord,
  type MilestoneType,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateMilestoneInput {
  type: MilestoneType;
  threshold: number;
}

export function createMilestone(input: CreateMilestoneInput): MilestoneRecord {
  return parseOrThrow(MilestoneSchema, "Milestone", {
    id: generateId(),
    type: input.type,
    threshold: input.threshold,
    achieved: false,
    achievedAt: null,
  });
}
