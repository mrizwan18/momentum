import { generateId } from "@momentum/utils";
import {
  SkillSchema,
  type SkillCategory,
  type SkillRecord,
} from "@momentum/types";
import { parseOrThrow } from "../validation";

export interface CreateSkillInput {
  slug: string;
  name: string;
  category: SkillCategory;
  description?: string;
  isActive?: boolean;
}

export function createSkill(input: CreateSkillInput): SkillRecord {
  return parseOrThrow(SkillSchema, "Skill", {
    id: generateId(),
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description ?? "",
    isActive: input.isActive ?? true,
    createdAt: Date.now(),
  });
}
