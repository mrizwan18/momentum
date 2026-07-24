import { z } from "zod";

/** docs/foundation/manifesto.md: current + future Skill Packs. */
export const SKILL_CATEGORIES = [
  "vocals",
  "guitar",
  "piano",
  "coding",
  "language",
  "fitness",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SkillSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(SKILL_CATEGORIES),
  description: z.string(),
  isActive: z.boolean(),
  createdAt: z.number(),
});

export type SkillRecord = z.infer<typeof SkillSchema>;
